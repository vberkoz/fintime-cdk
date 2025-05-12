import { Construct } from 'constructs';
import {
    aws_apigatewayv2 as apigateway,
    aws_apigatewayv2_integrations as apigateway_integrations,
    aws_lambda as lambda
} from 'aws-cdk-lib';

export interface HttpApiProps {
    lambdaFunction: lambda.Function;
}

export class HttpApi extends Construct {
    public readonly api: apigateway.HttpApi;

    constructor(scope: Construct, id: string, props: HttpApiProps) {
        super(scope, id);

        this.api = new apigateway.HttpApi(this, 'HttpApi', {
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
            integration: new apigateway_integrations.HttpLambdaIntegration('integration', props.lambdaFunction),
        });
    }
}