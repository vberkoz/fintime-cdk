import { Construct } from 'constructs';
import { aws_route53 as route53 } from 'aws-cdk-lib';

export interface HostedZoneProps {
    domainName: string;
}

export class HostedZone extends Construct {
    public readonly hostedZone: route53.IHostedZone;

    constructor(scope: Construct, id: string, props: HostedZoneProps) {
        super(scope, id);

        this.hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
            domainName: props.domainName,
        });
    }
}