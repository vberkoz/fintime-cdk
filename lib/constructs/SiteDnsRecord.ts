import { Construct } from 'constructs';
import {
    aws_route53 as route53,
    aws_route53_targets as targets,
    aws_cloudfront as cloudfront
} from 'aws-cdk-lib';

export interface SiteDnsRecordProps {
    zone: route53.IHostedZone;
    recordName: string;
    distribution: cloudfront.Distribution;
}

export class SiteDnsRecord extends Construct {
    constructor(scope: Construct, id: string, props: SiteDnsRecordProps) {
        super(scope, id);

        new route53.ARecord(this, 'AliasRecord', {
            zone: props.zone,
            recordName: props.recordName,
            target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(props.distribution)),
        });
    }
}