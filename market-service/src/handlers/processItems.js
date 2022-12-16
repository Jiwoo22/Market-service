import createError from "http-errors";
import { getEndedItems } from "../lib/getEndedItems";
import { closeItem } from "../lib/closeItem";

async function processItems(event, context) {
  try {
    const itemToClose = await getEndedItems();
    const closePromises = itemToClose.map((item) => closeItem(item));
    await Promise.all(closePromises);

    return { closed: closePromises.length };
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
}
export const handler = processItems;
