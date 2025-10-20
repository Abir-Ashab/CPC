import { HttpException } from "@nestjs/common";

export class ValidationException extends HttpException {
  constructor(message: string = "Validation failed", error: any) {
    super(message, 422, error);
  }
}
