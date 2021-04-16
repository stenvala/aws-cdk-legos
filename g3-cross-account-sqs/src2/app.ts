export async function lambdaHandler(event, context) {
  console.log("Info called lambda via SQS with event");
  console.log(event);
  return true;
}
