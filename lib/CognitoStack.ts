import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import {
  CfnManagedLoginBranding,
  ManagedLoginVersion,
  UserPool,
  UserPoolClient,
} from 'aws-cdk-lib/aws-cognito';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';


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

    const userPool = new UserPool(this, 'UserPool', {
      userPoolName: 'FintimeUserPool',
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const userPoolClient = new UserPoolClient(this, 'FintimeUserPoolClient', {
      userPool: userPool,
      authFlows: { adminUserPassword: true },
      oAuth: { callbackUrls: [`https://${subDomain}.${domainName}/`] },
    });

    const userPoolDomain = userPool.addDomain('login', {
      cognitoDomain: {
        domainPrefix: 'login-fintime',
      },
      managedLoginVersion: ManagedLoginVersion.NEWER_MANAGED_LOGIN,
    });

    new CfnManagedLoginBranding(this, 'cfnManagedLoginBranding01', {
      userPoolId: userPool.userPoolId,
      clientId: userPoolClient.userPoolClientId,
      useCognitoProvidedValues: true,
    });

    // new ARecord(this, 'ARecord', {
    //   recordName: `${loginSubDomain}.${subDomain}`,
    //   zone: hostedZone,
    //   target: RecordTarget.fromAlias(new UserPoolDomainTarget(userPoolDomain)),
    // });

    // new StringParameter(this, 'userPoolProviderUrl01', {
    //   parameterName: '/core/CognitoStack/userPool01/userPoolProviderUrl',
    //   stringValue: userPool01.userPoolProviderUrl,
    // });

    // new StringParameter(this, 'userPoolClientId01', {
    //   parameterName: '/core/CognitoStack/userPoolClient01/userPoolClientId',
    //   stringValue: userPoolClient01.userPoolClientId,
    // });

    // new CfnOutput(this, 'authority', { value: userPool01.userPoolProviderUrl });
    // new CfnOutput(this, 'client_id', { value: userPoolClient01.userPoolClientId });
  }
}