import { EnvType, TestPageType } from "./constants";

export class ErrorData {
  type: string;
  message: any;
  page: TestPageType;
  env: EnvType = "mobile";

  constructor(type: string, message: any, page: TestPageType = "common") {
    this.type = type;
    this.message = message;
    this.page = page;
  }
}
