import * as aws4 from "aws4";
import Axios from "axios";

// https://medium.com/@joshua.a.kahn/calling-amazon-api-gateway-authenticated-methods-with-axios-and-aws4-6eeda1aa8696

// https://cc226v1fyf.execute-api.eu-north-1.amazonaws.com/prod/
export async function lambdaHandler1(event, context) {
  console.log(
    "Info called first lambda and now forwarding the call to second lambda"
  );

  const unsigned = {
    host: process.env.HOST,
    method: "GET",
    url: process.env.LAMBDA,
    path: "/prod",
  };

  const signed = aws4.sign(unsigned);

  console.log(signed);
  let response;
  try {
    response = await Axios((signed as unknown) as any);
    console.log("called");
    console.log(response);
  } catch (error) {
    console.log(error);
    response = { data: error };
  }

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
