
# Fintime CDK Infrastructure

This project contains AWS CDK infrastructure code for deploying the Fintime frontend application. It sets up a complete hosting environment using AWS services.

## Infrastructure Components

- **S3 Bucket**: Hosts the static website files
- **CloudFront Distribution**: Provides CDN capabilities and HTTPS
- **Route53 Records**: DNS configuration for the domain
- **ACM Certificate**: SSL/TLS certificate for secure connections

## Prerequisites

- AWS CLI configured with appropriate credentials
- Node.js and npm installed
- AWS CDK CLI installed (`npm install -g aws-cdk`)

## Deployment

The application is configured to deploy to the subdomain `fintime.vberkoz.com`.

To deploy the infrastructure:

```bash
# Install dependencies
npm install

# Build the TypeScript code
npm run build

# Deploy the stack
npx cdk deploy
```

## Useful Commands

* `npm run build`   compile TypeScript to JavaScript
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the Jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template