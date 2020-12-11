import * as aws4 from "aws4";
import Axios from "axios";
import { aws4Interceptor } from "aws4-axios";

// https://medium.com/@joshua.a.kahn/calling-amazon-api-gateway-authenticated-methods-with-axios-and-aws4-6eeda1aa8696

// https://cc226v1fyf.execute-api.eu-north-1.amazonaws.com/prod/
export async function lambdaHandler1(event, context) {
  console.log(
    "Info called first lambda and soon forwarding the call to second lambda"
  );

  const client = Axios.create();

  const interceptor = aws4Interceptor({
    region: "eu-west-1",
    service: "execute-api",
  });

  client.interceptors.request.use(interceptor);

  let response;

  try {
    response = await client.get(process.env.LAMBDA);
  } catch (error) {
    console.log("Call failed");
    console.log(error);
    response = { data: error };
  }

  console.log("Call succeeded");
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
