import * as path from 'node:path';
import {
    Stack,
    StackProps,
    aws_s3_deployment as s3Deployment,
} from 'aws-cdk-lib';

import { Construct } from 'constructs';
import { HostedZone } from './constructs/HostedZone';
import { SiteCertificate } from './constructs/SiteCertificate';
import { StaticSiteBucket } from './constructs/StaticSiteBucket';
import { SiteDistribution } from './constructs/SiteDistribution';
import { SiteDnsRecord } from './constructs/SiteDnsRecord';

interface CloudFrontDistributionStackProps extends StackProps {
    env: {
        account: string | undefined;
        region: string | undefined;
    };
}

export class SiteFrontendStack extends Stack {
    constructor(scope: Construct, id: string, props: CloudFrontDistributionStackProps) {
        super(scope, id, props);

        const domainName = 'vberkoz.com';
        const subdomain = 'fintime';
        const fullDomain = `${subdomain}.${domainName}`;

        // Create hosted zone
        const hostedZoneConstruct = new HostedZone(this, 'FintimeHostedZone', {
            domainName,
        });

        // Create certificate
        const certificateConstruct = new SiteCertificate(this, 'FintimeCert', {
            domainName: fullDomain,
            hostedZone: hostedZoneConstruct.hostedZone,
        });

        // Create S3 bucket
        const siteBucketConstruct = new StaticSiteBucket(this, 'FintimeBucket');

        // Create CloudFront distribution
        const distributionConstruct = new SiteDistribution(this, 'FintimeDistribution', {
            siteBucket: siteBucketConstruct.bucket,
            certificate: certificateConstruct.certificate,
            domainName: fullDomain,
            region: this.region,
        });

        // Deploy site content
        new s3Deployment.BucketDeployment(this, 'BucketDeployment', {
            sources: [
                s3Deployment.Source.asset(path.join(process.cwd(), '../fintime-astro/dist')),
            ],
            destinationBucket: siteBucketConstruct.bucket,
            distributionPaths: ['/*'],
            distribution: distributionConstruct.distribution,
        });

        // Create DNS record
        new SiteDnsRecord(this, 'FintimeAliasRecord', {
            zone: hostedZoneConstruct.hostedZone,
            recordName: subdomain,
            distribution: distributionConstruct.distribution,
        });
    }
}
