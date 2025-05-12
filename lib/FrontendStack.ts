import * as path from 'node:path';
import {
  Stack,
  StackProps,
  aws_s3 as s3,
  aws_s3_deployment as s3Deployment,
  aws_cloudfront as cloudfront,
  aws_cloudfront_origins as origins,
  aws_apigatewayv2 as apigateway,
  aws_route53 as route53,
  aws_certificatemanager as acm,
  aws_route53_targets as targets,
  RemovalPolicy,
  Duration,
} from 'aws-cdk-lib';

import { Construct } from 'constructs';

interface CloudFrontDistributionStackProps extends StackProps {
  env: {
    account: string | undefined;
    region: string | undefined;
  };
  api: apigateway.HttpApi;
}

export class FrontendStack extends Stack {
  constructor(scope: Construct, id: string, props: CloudFrontDistributionStackProps) {
    super(scope, id, props);

    const domainName = 'vberkoz.com';
    const subdomain = 'fintime';
    const fullDomain = `${subdomain}.${domainName}`;

    // Lookup Route 53 hosted zone
    const hostedZone = route53.HostedZone.fromLookup(this, 'FintimeHostedZone', {
      domainName,
    });

    // Certificate for CloudFront
    const certificate = new acm.Certificate(this, 'FintimeCert', {
      domainName: fullDomain,
      subjectAlternativeNames: [`*.${hostedZone.zoneName}`],
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    // S3 bucket for frontend
    const siteBucket = new s3.Bucket(this, 'FintimeBucket', {
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      publicReadAccess: false,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'FintimeDistribution', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(siteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      additionalBehaviors: {
        'api/*': {
          origin: new origins.HttpOrigin(`${props.api.apiId}.execute-api.${this.region}.amazonaws.com`),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
        },
      },
      domainNames: [fullDomain],
      certificate,
      errorResponses: [
        { httpStatus: 404, responseHttpStatus: 200, responsePagePath: '/index.html', ttl: Duration.minutes(5) },
        { httpStatus: 403, responseHttpStatus: 200, responsePagePath: '/index.html', ttl: Duration.minutes(5) },
      ],
    });

    new s3Deployment.BucketDeployment(this, 'BucketDeployment', {
      sources: [
        s3Deployment.Source.asset(path.join(process.cwd(), '../fintime-app/dist')),
      ],
      destinationBucket: siteBucket,
      distributionPaths: ['/*'],
      distribution,
    });

    // DNS record for subdomain
    new route53.ARecord(this, 'FintimeAliasRecord', {
      zone: hostedZone,
      recordName: subdomain,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    });
  }
}
