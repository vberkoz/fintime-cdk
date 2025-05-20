import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import {
  CfnManagedLoginBranding,
  ManagedLoginVersion,
  UserPool,
  UserPoolClient,
} from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';


interface CognitoStackProps extends StackProps {
  env: {
    account: string | undefined;
    region: string | undefined;
  };
}

export class CognitoStack extends Stack {
  public readonly userPool: UserPool;
  public readonly userPoolClient: UserPoolClient;

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
    
    this.userPool = userPool;
    this.userPoolClient = userPoolClient;
  }
}