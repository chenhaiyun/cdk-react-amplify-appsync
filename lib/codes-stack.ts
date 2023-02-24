import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { PortalStack } from './portal-stack';
import { AppsyncCdkAppStack } from './backend-stack';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CodesStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const portalStack = new PortalStack(this, "WebUIStack");

    // The code that defines your stack goes here
    const backendStack = new AppsyncCdkAppStack(this, "AppSyncStack");


    // example resource
    // const queue = new sqs.Queue(this, 'CodesQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
