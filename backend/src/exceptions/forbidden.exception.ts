import { HttpException } from "@nestjs/common";

export class ForbiddenException extends HttpException {
  constructor(message: string = "Access forbidden") {
    super(message, 403);
  }
}
