import {
    Duration,
    RemovalPolicy,
    Stack,
    StackProps,
} from 'aws-cdk-lib';

import { Construct } from 'constructs';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Code, Runtime } from 'aws-cdk-lib/aws-lambda';
import { CorsHttpMethod, HttpApi, HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';

export class AppBackendStack extends Stack {
    readonly api;

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        const tableName = 'fintime';

        const table = new Table(this, 'Table', {
            tableName,
            partitionKey: { name: 'PK', type: AttributeType.STRING },
            sortKey: { name: 'SK', type: AttributeType.STRING },
            billingMode: BillingMode.PAY_PER_REQUEST,
            removalPolicy: RemovalPolicy.DESTROY, // Use RETAIN for production
            maxReadRequestUnits: 1,
            maxWriteRequestUnits: 1,
        });

        const lambda: NodejsFunction = new NodejsFunction(this, 'Function', {
            runtime: Runtime.NODEJS_22_X,
            handler: 'lambda.handler',
            code: Code.fromAsset('../fintime-api'),
            timeout: Duration.seconds(30),
            environment: {
                TABLE_NAME: tableName,
                NODE_ENV: 'stage'
            },
        });
        
        const api = new HttpApi(this, 'HttpApi', {
            disableExecuteApiEndpoint: false,
            corsPreflight: {
                allowHeaders: ['*'],
                allowMethods: [CorsHttpMethod.ANY],
                allowOrigins: ['*'],
            },
        });

        api.addRoutes({
            path: '/api/{proxy+}',
            methods: [HttpMethod.ANY],
            integration: new HttpLambdaIntegration('integration', lambda),
        });

        table.grantReadWriteData(lambda);

        this.api = api;
    }
}