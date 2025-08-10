import { NextFunction, Request, Response } from 'express';
import { z, ZodObject } from 'zod';

import catchAsync from './catchAsync';
import AppError from './AppError';

export const filterObj = (obj: any, ...allowedFields: string[]) => {
  const newObj: any = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
export const validateBody = <T extends ZodObject>(schema: T) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const bodyData =
      typeof req.body === 'object' && req.body !== null
        ? Object.fromEntries(
            Object.entries(req.body).map(([key, value]) => [
              key,
              typeof value === 'string' ? value.trim() : value,
            ])
          )
        : req.body;

    const result = schema.safeParse(bodyData);

    if (!result.success) {
      const errorMessage = result.error.issues
        .map((issue) => issue.message)
        .join(', ');
      return next(new AppError(errorMessage, 400));
    }

    req.body = result.data as z.infer<T>;
    next();
  });
