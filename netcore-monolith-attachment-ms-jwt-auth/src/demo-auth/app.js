// This is noly for testing what is in the context and event when lambda authorizer is used
exports.handler =  async function(event, context) {
  console.log("CONTEXT: \n" + JSON.stringify(context, null, 2))
  console.log("EVENT: \n" + JSON.stringify(event, null, 2))
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/json" },
    body: JSON.stringify({ event, context }),
  };
}