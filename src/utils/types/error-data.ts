export class ErrorData {
  type: string;
  message: any;
  page?: "index" | "login" | "signup" = "index";

  constructor(type: string, message: any, page?: "login" | "signup") {
    this.type = type;
    this.message = message;
    this.page = page;
  }
}
