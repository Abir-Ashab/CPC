// src/filters/global-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import { AppException } from "../exceptions/app.exception";

interface ErrorResponse {
  success: boolean;
  message: string;
  errorCode?: string;
  timestamp: string;
  path: string;
  details?: any;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let errorCode: string | undefined;
    let details: any;

    if (exception instanceof AppException) {
      status = exception.statusCode;
      message = exception.message;
      errorCode = this.getErrorCode(exception);
    } else if (exception instanceof Error && "getStatus" in exception) {
      // NestJS built-in exceptions
      const httpException = exception as any;
      status = httpException.getStatus();
      message = httpException.message;
      details = httpException.response;
    } else if (exception instanceof Error) {
      // Generic JavaScript errors
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = "Internal server error";
      this.logger.error(
        `Unhandled error: ${exception.message}`,
        exception.stack,
      );
    } else {
      // Unknown errors
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = "Internal server error";
      this.logger.error("Unknown error occurred", exception);
    }

    // Log operational errors
    if (status >= 500) {
      this.logger.error(
        `HTTP ${status} - ${message} - ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    const errorResponse: ErrorResponse = {
      success: false,
      message,
      errorCode,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (details) {
      errorResponse.details = details;
    }

    response.status(status).json(errorResponse);
  }

  private getErrorCode(exception: AppException): string {
    const statusCode = exception.statusCode;
    const exceptionName = exception.constructor.name
      .replace("Exception", "")
      .toUpperCase();

    return `${statusCode}_${exceptionName}`;
  }
}
