#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AppFrontendStack } from '../lib/AppFrontendStack';
import { SiteFrontendStack } from '../lib/SiteFrontendStack';
import { AppBackendStack } from '../lib/AppBackendStack';
import { CognitoStack } from '../lib/CognitoStack';

const app = new cdk.App();

const cognitoStack = new CognitoStack(app, 'CognitoStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  }
});
// new CognitoStack(app, 'CognitoStack', {
//   env: {
//     account: process.env.CDK_DEFAULT_ACCOUNT,
//     region: process.env.CDK_DEFAULT_REGION,
//   },
//   domainName: 'fintime.com',
//   subDomain: 'app.fintime',
//   loginSubDomain: 'login',
//   frontend: {
//     VITE_COGNITO_AUTHORITY: process.env.VITE_COGNITO_AUTHORITY || '',
//     VITE_COGNITO_CLIENT_ID: process.env.VITE_COGNITO_CLIENT_ID || '',
//     // VITE_COGNITO_AUTHORITY: process.env.VITE_COGNITO_AUTHORITY || 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_JKLmC0DZe',
//     // VITE_COGNITO_CLIENT_ID: process.env.VITE_COGNITO_CLIENT_ID || '6lmvsi2sncou70huiqt893hndq',
//   },
// });

const appBackendStack = new AppBackendStack(app, 'AppBackendStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  cognitoStack
});

// Add dependency to ensure CognitoStack is created before AppBackendStack
appBackendStack.addDependency(cognitoStack);

new AppFrontendStack(app, 'AppFrontendStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  api: appBackendStack.api,
});

new SiteFrontendStack(app, 'SiteFrontendStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

app.synth();