export async function lambdaHandler(event, context) {
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/json" },
    body: JSON.stringify({
      msg: "Hello world!",
    }),
  };
}
