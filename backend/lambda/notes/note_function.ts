import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import { DynamoDB } from "aws-sdk";

const dynamo = new DynamoDB.DocumentClient();
const TABLE_NAME: string = process.env.NOTES_TABLE!;
export const handler = async (event: any, context: Context): Promise<any> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);
  const params = {
    TableName: TABLE_NAME,
  };
  if (event["info"]["fieldName"] === "createNote") {
    const item = event["arguments"]["note"];
    console.log(item);
    await saveItem(item);
    return item;
  }
};

async function saveItem(item: any) {
  const params: DynamoDB.DocumentClient.PutItemInput = {
    TableName: TABLE_NAME,
    Item: item,
  };
  return dynamo
    .put(params)
    .promise()
    .then(() => {
      return item;
    });
}
