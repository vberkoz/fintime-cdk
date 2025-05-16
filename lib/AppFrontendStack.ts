import { ViewerProtocolPolicy, OriginRequestPolicy, AllowedMethods, Distribution, CachePolicy } from 'aws-cdk-lib/aws-cloudfront';
import { CertificateValidation, Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { HttpOrigin, S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { RemovalPolicy, StackProps, Duration, Stack } from 'aws-cdk-lib';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { HttpApi } from 'aws-cdk-lib/aws-apigatewayv2';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import * as path from 'node:path';

interface CloudFrontDistributionStackProps extends StackProps {
    env: {
        account: string | undefined;
        region: string | undefined;
    };
    api: HttpApi;
}

export class AppFrontendStack extends Stack {
    constructor(scope: Construct, id: string, props: CloudFrontDistributionStackProps) {
        super(scope, id, props);

        const domainName = 'vberkoz.com';
        const subdomain = 'app.fintime';
        const fullDomain = `${subdomain}.${domainName}`;

        const hostedZone = HostedZone.fromLookup(this, 'HostedZone', {
            domainName,
        });

        const certificate = new Certificate(this, 'Certificate', {
            domainName: fullDomain,
            subjectAlternativeNames: [`*.${hostedZone.zoneName}`],
            validation: CertificateValidation.fromDns(hostedZone),
        });

        const bucket = new Bucket(this, 'Bucket', {
            websiteIndexDocument: 'index.html',
            websiteErrorDocument: 'index.html',
            publicReadAccess: false,
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });

        const distribution = new Distribution(this, 'Distribution', {
            defaultRootObject: 'index.html',
            defaultBehavior: {
                origin: S3BucketOrigin.withOriginAccessControl(bucket),
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            },
            additionalBehaviors: {
                'api/*': {
                    origin: new HttpOrigin(`${props.api.apiId}.execute-api.${this.region}.amazonaws.com`),
                    viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                    allowedMethods: AllowedMethods.ALLOW_ALL,
                    cachePolicy: CachePolicy.CACHING_DISABLED,
                    originRequestPolicy: OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
                },
            },
            domainNames: [fullDomain],
            certificate: certificate,
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

        new BucketDeployment(this, 'BucketDeployment', {
            sources: [
                Source.asset(path.join(process.cwd(), '../fintime-app/dist')),
            ],
            destinationBucket: bucket,
            distributionPaths: ['/*'],
            distribution,
        });

        new ARecord(this, 'AliasRecord', {
            zone: hostedZone,
            recordName: subdomain,
            target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
        });
    }
}
