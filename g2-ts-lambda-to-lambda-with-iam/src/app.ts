import Axios from "axios";
import { aws4Interceptor } from "aws4-axios";

export async function lambdaHandler1(event, context) {
  console.log(
    "Info called first lambda and soon forwarding the call to second lambda"
  );

  const client = Axios.create();

  const interceptor = aws4Interceptor({
    region: process.env.AWS_REGION,
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
  const data = Object.assign({ firstLambdaMessage: "Howdy" }, response.data);
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
}

export async function lambdaHandler2(event, context) {
  console.log("Info called second lambda");
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secondLambdaMessage: "Hello world!" }),
  };
}
