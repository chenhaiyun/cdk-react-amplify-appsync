import { Construct } from "constructs";
import {
  Aws,
  Duration,
  RemovalPolicy,
  aws_dynamodb as ddb,
  aws_iam as iam,
  aws_lambda as lambda,
  SymlinkFollowMode,
} from "aws-cdk-lib";
import * as path from "path";
import * as appsync from "@aws-cdk/aws-appsync-alpha";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

export interface NoteProps {
  readonly graphqlApi: appsync.GraphqlApi;
}

export class NoteApiStack extends Construct {
  readonly noteTable: ddb.Table;
  constructor(scope: Construct, id: string, props: NoteProps) {
    super(scope, id);

    // Create a table to store logging appLogIngestion info
    this.noteTable = new ddb.Table(this, "AppSyncNoteTable", {
      partitionKey: {
        name: "id",
        type: ddb.AttributeType.STRING,
      },
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
      encryption: ddb.TableEncryption.DEFAULT,
      pointInTimeRecovery: true,
    });

    const noteHandler = new NodejsFunction(this, "AppSyncNoteHandler", {
      entry: path.join(__dirname, "../lambda/notes/note_function.ts"),
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "handler",
      timeout: Duration.seconds(60),
      memorySize: 1024,
      environment: {
        NOTES_TABLE: this.noteTable.tableName,
      },
      description: `${Aws.STACK_NAME} - AppSyncNote APIs Resolver`,
    });

    // set table read write permission to lambda
    this.noteTable.grantReadWriteData(noteHandler);

    // Add AppSyncNote lambda as a Datasource
    const noteLambdaDS = props.graphqlApi.addLambdaDataSource(
      "AppSyncNoteLambdaDS",
      noteHandler,
      {
        description: "Lambda Resolver Datasource",
      }
    );

    // Set resolver for releted appPipeline API methods
    noteLambdaDS.createResolver("listNotes", {
      typeName: "Query",
      fieldName: "listNotes",
      // requestMappingTemplate: appsync.MappingTemplate.fromFile(
      //   path.join(
      //     __dirname,
      //     "request.vtl"
      //   )
      // ),
      // responseMappingTemplate: appsync.MappingTemplate.fromFile(
      //   path.join(
      //     __dirname,
      //     "response.vtl"
      //   )
      // ),
    });

    // Set resolver for releted API methods
    noteLambdaDS.createResolver("getNoteById", {
      typeName: "Query",
      fieldName: "getNoteById",
    });

    // Set resolver for releted API methods
    noteLambdaDS.createResolver("createNote", {
      typeName: "Mutation",
      fieldName: "createNote",
    });
  }
}
