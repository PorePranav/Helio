import { Request, Response, NextFunction } from 'express';
import catchAsync from './catchAsync';
import prisma from './prisma';
import AppError from './AppError';

interface CrudConfig {
  modelName: string;
  fieldName: string;
  selectFields?: Record<string, boolean>;
  transformInput?: (input: any) => any;
}

export const createCrudFactory = (config: CrudConfig) => {
  const { modelName, fieldName, selectFields, transformInput } = config;
  const defaultSelectFields = selectFields || { id: true, [fieldName]: true };

  const getAll = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const records = await (prisma as any)[modelName].findMany({
        orderBy: { createdAt: 'desc' },
        select: defaultSelectFields,
      });

      res.status(200).json({
        status: 'success',
        length: records.length,
        data: records,
      });
    }
  );

  const getOne = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const recordId = req.params[`${modelName}Id`];

      const record = await (prisma as any)[modelName].findUnique({
        where: { id: recordId },
        select: defaultSelectFields,
      });

      if (!record)
        return next(new AppError('No record found with this ID', 404));

      res.status(200).json({
        status: 'success',
        data: record,
      });
    }
  );

  const create = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const fieldValue = req.body[fieldName];

      const processedValue = transformInput
        ? transformInput(fieldValue)
        : fieldValue?.toLowerCase?.() || fieldValue;

      const newRecord = await (prisma as any)[modelName].create({
        data: {
          [fieldName]: processedValue,
        },
      });

      res.status(201).json({
        status: 'success',
        data: newRecord,
      });
    }
  );

  const update = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const recordId = req.params[`${modelName}Id`];
      const fieldValue = req.body[fieldName];

      const processedValue = transformInput
        ? transformInput(fieldValue)
        : fieldValue?.toLowerCase?.() || fieldValue;

      const updatedRecord = await (prisma as any)[modelName].update({
        where: { id: recordId },
        data: { [fieldName]: processedValue },
      });

      res.status(200).json({
        status: 'success',
        data: updatedRecord,
      });
    }
  );

  const deleteRecord = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const recordId = req.params[`${modelName}Id`];

      await (prisma as any)[modelName].delete({
        where: { id: recordId },
      });

      res.status(204).json({
        status: 'success',
        data: null,
      });
    }
  );

  return {
    getAll,
    getOne,
    create,
    update,
    delete: deleteRecord,
  };
};
