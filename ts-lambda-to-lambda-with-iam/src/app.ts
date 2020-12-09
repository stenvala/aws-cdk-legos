export async function lambdaHandler1(event, context) {
  const url = "http://phpinfo.mathcodingclub.com/";
  const options = {
    method: "get",
    headers: {
      Accept: "*/*",
    },
  };
  const response = await fetch(url, options);
  return response;
}

export async function lambdaHandler2(event, context) {
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/json" },
    body: JSON.stringify({ msg: "Hello world!", event, context }),
  };
}
