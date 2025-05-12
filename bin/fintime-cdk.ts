#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { FrontendStack } from '../lib/FrontendStack';
import { BackendStack } from '../lib/BackendStack';

const app = new cdk.App();

// Pass the certificate from the frontend stack to the backend stack
const backendStack = new BackendStack(app, 'FintimeBackendStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  }
});

// Create the frontend stack first
const frontendStack = new FrontendStack(app, 'FintimeFrontendStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  api: backendStack.api,
});