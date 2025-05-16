import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import {
  CfnManagedLoginBranding,
  ManagedLoginVersion,
  UserPool,
  UserPoolClient,
} from 'aws-cdk-lib/aws-cognito';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { aws_route53 as route53, aws_certificatemanager as acm } from 'aws-cdk-lib';
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';


interface CognitoStackProps extends StackProps {
  env: {
    account: string | undefined;
    region: string | undefined;
  };
}

export class CognitoStack extends Stack {
  constructor(scope: Construct, id: string, props: CognitoStackProps) {
    super(scope, id, props);

    const domainName = 'vberkoz.com';
    const subDomain = 'app.fintime';
    const loginSubDomain = 'login';

    // const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
    //   domainName
    // });

    // const certificate = new Certificate(this, 'Certificate', {
    //   validation: CertificateValidation.fromDns(hostedZone),
    //   domainName: hostedZone.zoneName,
    //   subjectAlternativeNames: [`*.${domainName}`],
    // });

    const preSignUpLambda01 = new Function(this, 'preSignUpLambda01', {
      runtime: Runtime.PYTHON_3_13,
      handler: 'index.lambda_handler',
      code: Code.fromInline('def lambda_handler(event, context): event["response"]["autoConfirmUser"] = True; return event'),
    });

    const userPool = new UserPool(this, 'UserPool', {
      userPoolName: 'FintimeUserPool',
      lambdaTriggers: { preSignUp: preSignUpLambda01 },
      selfSignUpEnabled: true,
      passwordPolicy: {
        minLength: 6,
        requireDigits: false,
        requireLowercase: false,
        requireSymbols: false,
        requireUppercase: false,
      },
    });

    new UserPoolClient(this, 'FintimeUserPoolClient', {
      userPool: userPool,
      authFlows: { adminUserPassword: true },
      oAuth: { callbackUrls: [`https://${subDomain}.${domainName}/`, 'http://localhost:5173/'] },
    });

    // Use a Cognito-provided domain instead of a custom domain
    // const userPoolDomain01 = userPool01.addDomain('login01', {
    //   cognitoDomain: {
    //     domainPrefix: `login-fintime-${domainName}`,
    //     certificate,
    //   },
    //   managedLoginVersion: ManagedLoginVersion.NEWER_MANAGED_LOGIN,
    // });

    // new CfnManagedLoginBranding(this, 'cfnManagedLoginBranding01', {
    //   clientId: userPoolClient01.userPoolClientId,
    //   userPoolId: userPool01.userPoolId,
    //   useCognitoProvidedValues: true,
    // });

    // No need for ARecord with Cognito-provided domain
    // We'll output the domain URL instead

    // new StringParameter(this, 'userPoolProviderUrl01', {
    //   parameterName: '/core/CognitoStack/userPool01/userPoolProviderUrl',
    //   stringValue: userPool01.userPoolProviderUrl,
    // });

    // new StringParameter(this, 'userPoolClientId01', {
    //   parameterName: '/core/CognitoStack/userPoolClient01/userPoolClientId',
    //   stringValue: userPoolClient01.userPoolClientId,
    // });

    // new StringParameter(this, 'userPoolDomainUrl01', {
    //   parameterName: '/core/CognitoStack/userPoolDomain01/url',
    //   stringValue: userPoolDomain01.baseUrl(),
    // });

    // new CfnOutput(this, 'authority', { value: userPool01.userPoolProviderUrl });
    // new CfnOutput(this, 'client_id', { value: userPoolClient01.userPoolClientId });
    // new CfnOutput(this, 'domain_url', { value: userPoolDomain01.baseUrl() });
  }
}