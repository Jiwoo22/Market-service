import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getItemsBySeller(event, context) {
  const { seller } = event.queryStringParameters;
  const now = new Date();

  const params = {
    TableName: process.env.MARKET_TABLE_NAME,
    indexName: "seller-endingAt",
    KeyConditionExpression: "#seller = :seller and #endingAt > :now",
    ExpressionAttributeValues: {
      ":seller": seller,
      ":now": now.toISOString(),
    },
    ExpressionAttributeNames: {
      "#seller": "seller",
      "#endingAt": "endingAt",
    },
  };

  try {
    const result = await dynamodb.query(params).promise();

    items = result.Items;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
  return {
    statusCode: 200,
    body: JSON.stringify(items),
  };
}

export const handler = commonMiddleware(getItemsBySeller);
