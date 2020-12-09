import * as aws from "aws-sdk";

// Inspired by: https://github.com/aws-samples/aws-cdk-examples/tree/master/typescript/api-cors-lambda-crud-dynamodb/src
export class DynamoService {
  private readonly db: aws.DynamoDB.DocumentClient;

  private get table() {
    return process.env.TABLE_KEY;
  }

  private get key() {
    return process.env.TABLE_KEY;
  }

  constructor() {
    const db = new aws.DynamoDB.DocumentClient();
  }

  async add(path: string, data: any) {
    data[this.key] = path;
    const params = {
      TableName: this.table,
      Item: data,
    };
    return await this.db.put(params).promise();
  }

  async get(path: string) {
    const params = {
      TableName: this.table,
      Key: {
        [this.key]: path,
      },
    };
    return await this.db.get(params).promise();
  }

  async del(path: string) {
    const params = {
      TableName: this.table,
      Key: {
        [this.key]: path,
      },
    };
    return await this.db.delete(params).promise();
  }
}
