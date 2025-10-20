import { HttpException } from "@nestjs/common";

export class UnauthorizedException extends HttpException {
  constructor(message: string = "Unauthorized access") {
    super(message, 401);
  }
}
