import Axios from "axios";

// https://medium.com/@joshua.a.kahn/calling-amazon-api-gateway-authenticated-methods-with-axios-and-aws4-6eeda1aa8696

// https://cc226v1fyf.execute-api.eu-north-1.amazonaws.com/prod/
export async function lambdaHandler1(event, context) {
  console.log(
    "Info called first lambda and now forwarding the call to second lambda"
  );

  let request = {
    host: process.env.HOST,
    method: "GET",
    url: process.env.LAMBDA,
    path: "/prod",
  };

  // let request = aws4.sign();

  delete request["host"];
  delete request["path"];
  console.log(request);
  const response = await Axios((request as unknown) as any);
  console.log("called");
  console.log(response);
  const data = Object.assign({ newMsg: "Howdy" }, response.data);
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
}

// https://cc226v1fyf.execute-api.eu-north-1.amazonaws.com/prod/
export async function lambdaHandler2(event, context) {
  console.log("Info called second lambda");
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ msg: "Hello world!" }),
  };
}
