import {
    Stack,
    StackProps,
} from 'aws-cdk-lib';

import { Construct } from 'constructs';
import { DynamoTable } from './constructs/DynamoTable';
import { ApiLambda } from './constructs/ApiLambda';
import { HttpApi } from './constructs/HttpApi';

export class AppBackendStack extends Stack {
    readonly api;

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        // Create DynamoDB table
        const tableConstruct = new DynamoTable(this, 'FintimeTable', {
            tableName: 'fintime',
        });

        // Create Lambda function
        const lambdaConstruct = new ApiLambda(this, 'FintimeFunction', {
            tableName: tableConstruct.table.tableName,
            codePath: '../fintime-api',
        });

        // Create API Gateway
        const apiConstruct = new HttpApi(this, 'FintimeHttpApi', {
            lambdaFunction: lambdaConstruct.lambda,
        });

        // Grant Lambda function read/write permissions to the DynamoDB table
        tableConstruct.table.grantReadWriteData(lambdaConstruct.lambda);

        // Export the API
        this.api = apiConstruct.api;
    }
}