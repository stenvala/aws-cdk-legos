import { PostRequest } from "../models/request.models";

export class IntegratorService {
  constructor() {}

  async getHelloWorld() {
    return await this.fromPromise({
      msg: "Hello there!",
    });
  }

  async postHelloWorld(payload: PostRequest) {
    return await this.fromPromise({
      msg: "Receiced your message",
      yourMessage: payload.msg,
    });
  }

  private async fromPromise(data: any) {
    return Promise.resolve(data);
  }
}
