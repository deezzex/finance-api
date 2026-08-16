import { ValidationError } from "../errors/AppError.ts";
import type { ZodType } from "zod";
import type { Request, Response, NextFunction } from "express";

type ValidationSource = 'body' | 'params' | 'query';

export function validate<T>(schema: ZodType<T>, source: ValidationSource = 'body') {
    return (req: Request, res: Response, next: NextFunction) => {
      const result = schema.safeParse(req[source]);

      if(!result.success){
        return next(new ValidationError(`Invalid request ${source}`,
             result.error.flatten()));
      }

       if (source === 'query') {
        Object.defineProperty(req, 'query', {
            value: result.data,
            writable: true,
            configurable: true
        });
      } else {
        req[source] = result.data as any;
      }

      next();
    };
}
