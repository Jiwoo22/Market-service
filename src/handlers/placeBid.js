import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";
import { getItemById } from "./getItem";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
  const { id } = event.pathParameters;
  const { amount } = event.body;

  const item = await getItemById(id);

  // Bid identity validation
  //   if (email === item.seller) {
  //     throw new createError.Forbidden(`You cannot bid on your own auctions`);
  //   }

  //   // Avoid double bidding
  //   if (email === item.highestBid.bidder) {
  //     throw new createError.Forbidden(`You are already the highest bidder`);
  //   }

  // Auction status validation
  if (item.status !== "OPEN") {
    throw new createError.Forbidden(`You cannot bid on closed auctions!`);
  }

  // Bid amount validation
  if (amount <= item.highestBid.amount) {
    throw new createError.Forbidden(
      `Your bid must be higher than ${item.highestBid.amount}`
    );
  }

  const now = new Date();
  const endDate = new Date();
  endDate.setHours(now.getHours() + 48); // 2 days to post after first bidding

  const params = {
    TableName: process.env.MARKET_TABLE_NAME,
    Key: { id },
    UpdateExpression: "set highestBid.amount = :amount,  endingAt = :endDate",
    ExpressionAttributeValues: {
      ":amount": amount,
      ":endDate": endDate.toISOString(),
    },
    ReturnValues: "ALL_NEW",
  };

  let updatedItem;

  try {
    const result = await dynamodb.update(params).promise();
    updatedItem = result.Attributes;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedItem),
  };
}

export const handler = commonMiddleware(placeBid);
