import {
    Stack,
    StackProps,
    aws_lambda_nodejs as lambda_nodejs,
    aws_lambda as lambda,
    aws_apigatewayv2 as apigateway,
    aws_apigatewayv2_integrations as apigateway_integrations,
    aws_dynamodb as dynamodb,
    RemovalPolicy,
    Duration,
} from 'aws-cdk-lib';

import { Construct } from 'constructs';

export class BackendStack extends Stack {
    readonly api: apigateway.HttpApi;

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        // DynamoDB table
        const table = new dynamodb.Table(this, 'FintimeTable', {
            tableName: 'fintime',
            partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: RemovalPolicy.DESTROY, // Use RETAIN for production
            maxReadRequestUnits: 1,
            maxWriteRequestUnits: 1,
        });

        // Lambda function
        const apiLambda = new lambda_nodejs.NodejsFunction(this, 'FintimeFunction', {
            runtime: lambda.Runtime.NODEJS_22_X,
            handler: 'lambda.handler',
            code: lambda.Code.fromAsset('../fintime-api'),
            timeout: Duration.seconds(30),
            environment: {
                TABLE_NAME: table.tableName,
                NODE_ENV: 'stage'
            },
        });

        // API Gateway REST API
        this.api = new apigateway.HttpApi(this, 'FintimeHttpApi', {
            disableExecuteApiEndpoint: false,
            corsPreflight: {
                allowHeaders: ['*'],
                allowMethods: [apigateway.CorsHttpMethod.ANY],
                allowOrigins: ['*'],
            },
        });

        this.api.addRoutes({
            path: '/api/{proxy+}',
            methods: [apigateway.HttpMethod.ANY],
            integration: new apigateway_integrations.HttpLambdaIntegration('integration', apiLambda),
        });

        // Grant Lambda function read/write permissions to the DynamoDB table
        table.grantReadWriteData(apiLambda);
    }
}