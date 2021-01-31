// This is noly for testing what is in the event and context when lambda authorizer is used in API GW
exports.handler =  async function(event, context) {
  console.log("EVENT: \n" + JSON.stringify(event, null, 2))
  console.log("CONTEXT: \n" + JSON.stringify(context, null, 2))
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/json" },
    body: JSON.stringify({ event, context }),
  };
}