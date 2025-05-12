import { Construct } from 'constructs';
import {
    aws_lambda_nodejs as lambda_nodejs,
    aws_lambda as lambda,
    Duration
} from 'aws-cdk-lib';

export interface ApiLambdaProps {
    tableName: string;
    codePath: string;
}

export class ApiLambda extends Construct {
    public readonly lambda: lambda_nodejs.NodejsFunction;

    constructor(scope: Construct, id: string, props: ApiLambdaProps) {
        super(scope, id);

        this.lambda = new lambda_nodejs.NodejsFunction(this, 'Function', {
            runtime: lambda.Runtime.NODEJS_22_X,
            handler: 'lambda.handler',
            code: lambda.Code.fromAsset(props.codePath),
            timeout: Duration.seconds(30),
            environment: {
                TABLE_NAME: props.tableName,
                NODE_ENV: 'stage'
            },
        });
    }
}