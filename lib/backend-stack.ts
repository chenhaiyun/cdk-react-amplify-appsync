import * as path from 'path';
import { CloudFrontToS3 } from '@aws-solutions-constructs/aws-cloudfront-s3';
import {
  Aws,
  RemovalPolicy,
  aws_s3 as s3,
  aws_cloudfront as cloudfront,
  aws_s3_deployment as s3d,
  CfnOutput,
  Expiration,
  Duration,
  aws_cognito as cognito,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as appsync from "@aws-cdk/aws-appsync-alpha";

export interface AppSyncAPIProps {
  readonly userPoolId: string;
}

export class AppsyncCdkAppStack extends Construct {
  readonly graphqlApi: appsync.GraphqlApi;
  constructor(scope: Construct, id: string, props: AppSyncAPIProps) {
    super(scope, id);

    const userPool = cognito.UserPool.fromUserPoolId(
      this,
      "apiUserPool",
      props.userPoolId
    );


    // Creates the AppSync API
    this.graphqlApi = new appsync.GraphqlApi(this, 'Api', {
      name: 'cdk-notes-appsync-api',
      schema: appsync.SchemaFile.fromAsset('backend/graphql/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool: userPool,
          },
        },
        additionalAuthorizationModes: [{
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: Expiration.after(Duration.days(365))
          }
        }],
      },
      xrayEnabled: true,
    });

    // Prints out the AppSync GraphQL endpoint to the terminal
    new CfnOutput(this, "GraphQLAPIURL", {
     value:  this.graphqlApi.graphqlUrl
    });

    // Prints out the AppSync GraphQL API key to the terminal
    new CfnOutput(this, "GraphQLAPIKey", {
      value:  this.graphqlApi.apiKey || ''
    });

    // Prints out the stack region to the terminal
    new CfnOutput(this, "StackRegion", {
      value: Aws.REGION
    });
  }
}