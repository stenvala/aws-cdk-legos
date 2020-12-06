export async function lambdaHandler(event, context) {
  return {
    statusCode: 200,
    //headers: { "Content-Type": "text/plain" },ssss
    //body: "Hello there! Howdy?",
    headers: { "Content-Type": "text/json" },
    body: JSON.stringify({ msg: "Hello world!", event, context }),
  };
}
