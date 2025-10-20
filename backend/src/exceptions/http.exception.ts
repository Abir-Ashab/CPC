import { AppException } from "./app.exception";

export class HttpException extends AppException {
  constructor(message: string, statusCode: number = 400) {
    super(message, statusCode, true);
  }
}
