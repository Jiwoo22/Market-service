import { v4 as uuid } from "uuid";
import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function postItem(event, context) {
  const { email } = event.requestContext.authorizer;
  const { title, price, detail } = event.body;
  const now = new Date();
  const endDate = new Date();
  endDate.setHours(now.getHours() + 72); // 3 days to post if no one bid on it

  const item = {
    id: uuid(),
    title,
    price,
    detail,
    highestBid: {
      amount: 0,
    },
    status: "OPEN",
    createdAt: now.toISOString(),
    endingAt: endDate.toISOString(),
    seller: email,
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

export const handler = commonMiddleware(postItem);
