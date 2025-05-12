import { Construct } from 'constructs';
import { aws_route53 as route53, aws_certificatemanager as acm } from 'aws-cdk-lib';

export interface SiteCertificateProps {
    domainName: string;
    hostedZone: route53.IHostedZone;
}

export class SiteCertificate extends Construct {
    public readonly certificate: acm.Certificate;

    constructor(scope: Construct, id: string, props: SiteCertificateProps) {
        super(scope, id);

        this.certificate = new acm.Certificate(this, 'Certificate', {
            domainName: props.domainName,
            subjectAlternativeNames: [`*.${props.hostedZone.zoneName}`],
            validation: acm.CertificateValidation.fromDns(props.hostedZone),
        });
    }
}