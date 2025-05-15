import { Construct } from 'constructs';
import {
    aws_s3 as s3,
    aws_cloudfront as cloudfront,
    aws_cloudfront_origins as origins,
    aws_certificatemanager as acm,
    aws_apigatewayv2 as apigateway,
    Duration,
} from 'aws-cdk-lib';

export interface AppDistributionProps {
    appBucket: s3.Bucket;
    certificate: acm.Certificate;
    domainName: string;
    api: apigateway.HttpApi;
    region: string;
}

export class AppDistribution extends Construct {
    public readonly distribution: cloudfront.Distribution;

    constructor(scope: Construct, id: string, props: AppDistributionProps) {
        super(scope, id);

        this.distribution = new cloudfront.Distribution(this, 'Distribution', {
            defaultRootObject: 'index.html',
            defaultBehavior: {
                origin: origins.S3BucketOrigin.withOriginAccessControl(props.appBucket),
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            },
            additionalBehaviors: {
                'api/*': {
                    origin: new origins.HttpOrigin(`${props.api.apiId}.execute-api.${props.region}.amazonaws.com`),
                    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                    allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
                    cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
                    originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
                },
            },
            domainNames: [props.domainName],
            certificate: props.certificate,
            errorResponses: [
                {
                    httpStatus: 404,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                    ttl: Duration.minutes(5)
                },
                {
                    httpStatus: 403,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                    ttl: Duration.minutes(5)
                },
            ],
        });
    }
}