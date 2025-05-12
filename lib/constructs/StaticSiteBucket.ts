import { Construct } from 'constructs';
import { aws_s3 as s3, RemovalPolicy } from 'aws-cdk-lib';

export class StaticSiteBucket extends Construct {
    public readonly bucket: s3.Bucket;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.bucket = new s3.Bucket(this, 'Bucket', {
            websiteIndexDocument: 'index.html',
            websiteErrorDocument: 'index.html',
            publicReadAccess: false,
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });
    }
}