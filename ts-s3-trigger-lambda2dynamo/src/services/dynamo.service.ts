import * as aws from "aws-sdk";

export class DynamoService {
  private readonly db: aws.DynamoDB.DocumentClient;

  private get table() {
    return process.env.TABLE_NAME;
  }

  private get key() {
    return process.env.PRIMARY_KEY;
  }

  constructor() {
    this.db = new aws.DynamoDB.DocumentClient();
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
    const data = await this.db.get(params).promise();
    return data.Item;
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
