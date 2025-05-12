import { Construct } from 'constructs';
import { aws_dynamodb as dynamodb, RemovalPolicy } from 'aws-cdk-lib';

export interface DynamoTableProps {
  tableName: string;
}

export class DynamoTable extends Construct {
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: DynamoTableProps) {
    super(scope, id);

    this.table = new dynamodb.Table(this, 'Table', {
      tableName: props.tableName,
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY, // Use RETAIN for production
      maxReadRequestUnits: 1,
      maxWriteRequestUnits: 1,
    });
  }
}