import { v4 as uuid } from "uuid";
import AWS from "aws-sdk";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function postItem(event, context) {
  const { title, price } = JSON.parse(event.body);
  const now = new Date();

  const item = {
    id: uuid(),
    title,
    price,
    status: "OPEN",
    createdAt: now.toISOString(),
  };

  try {
    await dynamodb
      .put({
        TableName: process.env.MARKET_TABLE_NAME,
        Item: item,
      })
      .promise();
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
  return {
    statusCode: 201,
    body: JSON.stringify(item),
  };
}

export const handler = postItem;
