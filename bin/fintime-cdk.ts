#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AppFrontendStack } from '../lib/AppFrontendStack';
import { SiteFrontendStack } from '../lib/SiteFrontendStack';
import { AppBackendStack } from '../lib/AppBackendStack';

const app = new cdk.App();

// Pass the certificate from the frontend stack to the backend stack
const appBackendStack = new AppBackendStack(app, 'FintimeAppBackendStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  }
});

// Create the frontend stack first
new AppFrontendStack(app, 'FintimeAppFrontendStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  api: appBackendStack.api,
});

// Create the frontend stack first
new SiteFrontendStack(app, 'FintimeSiteFrontendStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

app.synth();