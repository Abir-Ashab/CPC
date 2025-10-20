// src/pipes/validation.pipe.ts
import { PipeTransform, Injectable, ArgumentMetadata } from "@nestjs/common";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { ValidationException } from "../exceptions/validation.exception";

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const formattedErrors = this.formatErrors(errors);
      throw new ValidationException("Validation failed", formattedErrors);
    }

    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatErrors(errors: any[]): any {
    return errors.map((error) => {
      const constraints = error.constraints
        ? Object.values(error.constraints)
        : [];
      const children = error.children ? this.formatErrors(error.children) : [];

      return {
        field: error.property,
        errors: constraints,
        ...(children.length > 0 && { children }),
      };
    });
  }
}
