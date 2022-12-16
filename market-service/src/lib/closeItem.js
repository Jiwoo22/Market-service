import AWS from "aws-sdk";

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function closeItem(item) {
  const params = {
    TableName: process.env.MARKET_TABLE_NAME,
    Key: { id: item.id },
    UpdateExpression: "set #status = :status",
    ExpressionAttributeValues: {
      ":status": "SOLD",
    },
    ExpressionAttributeNames: {
      "#status": "status",
    },
  };

  const result = await dynamodb.update(params).promise();
  return result;
}
