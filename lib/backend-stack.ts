import * as path from 'path';
import { CloudFrontToS3 } from '@aws-solutions-constructs/aws-cloudfront-s3';
import {
  Aws,
  RemovalPolicy,
  aws_s3 as s3,
  aws_cloudfront as cloudfront,
  aws_s3_deployment as s3d,
  CfnOutput,
  aws_appsync,
  Expiration,
  Duration
} from 'aws-cdk-lib';
import { Construct } from 'constructs';


export class AppsyncCdkAppStack extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Creates the AppSync API
    const api = new aws_appsync.GraphqlApi(this, 'Api', {
      name: 'cdk-notes-appsync-api',
      schema: aws_appsync.SchemaFile.fromAsset('backend/graphql/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: aws_appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: Expiration.after(Duration.days(365))
          }
        },
      },
      xrayEnabled: true,
    });

    // Prints out the AppSync GraphQL endpoint to the terminal
    new CfnOutput(this, "GraphQLAPIURL", {
     value: api.graphqlUrl
    });

    // Prints out the AppSync GraphQL API key to the terminal
    new CfnOutput(this, "GraphQLAPIKey", {
      value: api.apiKey || ''
    });

    // Prints out the stack region to the terminal
    new CfnOutput(this, "StackRegion", {
      value: Aws.REGION
    });
  }
}