
# Fintime CDK Infrastructure

This project contains AWS CDK infrastructure code for deploying the Fintime application. It sets up a complete hosting environment using AWS services for both frontend and backend components.

## Architecture Overview

The infrastructure consists of two main stacks:

### Backend Stack
- **DynamoDB Table**: NoSQL database for storing application data
- **Lambda Function**: Serverless API implementation (Node.js 22.x)
- **API Gateway**: HTTP API for exposing Lambda functionality

### Frontend Stack
- **S3 Bucket**: Hosts the static website files
- **CloudFront Distribution**: Provides CDN capabilities and HTTPS
- **Route53 Records**: DNS configuration for the domain
- **ACM Certificate**: SSL/TLS certificate for secure connections

## Prerequisites

- AWS CLI configured with appropriate credentials
- Node.js and npm installed
- AWS CDK CLI installed (`npm install -g aws-cdk`)
- Frontend application built and available at `../fintime-app/dist`
- Backend code available at `../fintime-api`

## Deployment

The application is configured to deploy to the subdomain `fintime.vberkoz.com`.

To deploy the infrastructure:

```bash
# Install dependencies
npm install

# Build the TypeScript code
npm run build

# Deploy the stack
npx cdk deploy --all
```

## Configuration

The project uses environment variables for configuration:
- `CDK_DEFAULT_ACCOUNT`: AWS account ID
- `CDK_DEFAULT_REGION`: AWS region for deployment

The domain configuration is set in the FrontendStack.ts file:
- Domain: vberkoz.com
- Subdomain: fintime

## Project Structure

- `/bin`: Entry point for CDK application
- `/lib`: Stack definitions
  - `BackendStack.ts`: Backend infrastructure components
  - `FrontendStack.ts`: Frontend hosting infrastructure
- `/test`: Test files for the infrastructure

## Useful Commands

* `npm run build`   compile TypeScript to JavaScript
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the Jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template