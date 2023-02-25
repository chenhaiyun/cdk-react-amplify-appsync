import {
  aws_cognito as cognito,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';


export class CognitoCdkAppStack extends Construct {
  readonly cognitoUserPool: cognito.UserPool;
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Config the userPool
    this.cognitoUserPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: 'NotesSampleUserPool',
      selfSignUpEnabled: true,
      autoVerify: { email: true },
      standardAttributes: { email: { required: true } },
    })

    // 2.b. Configure the client
    const client = this.cognitoUserPool.addClient('customer-app-client-web', {
      preventUserExistenceErrors: true,
    })

  }
}