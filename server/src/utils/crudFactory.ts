import { Request, Response, NextFunction } from 'express';
import catchAsync from './catchAsync';
import prisma from './prisma';
import AppError from './AppError';

interface CrudConfig {
  modelName: string;
  fieldName?: string;
  selectFields?: Record<string, boolean>;
  transformInput?: (input: any) => any;
}

export const createCrudFactory = (config: CrudConfig) => {
  const { modelName, fieldName, selectFields, transformInput } = config;
  const defaultSelectFields =
    selectFields ||
    (fieldName ? { id: true, [fieldName]: true } : { id: true });

  const getAll = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const records = await (prisma as any)[modelName].findMany({
        where: { deletedAt: null },
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
        where: { id: recordId, deletedAt: null },
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
      let inputData: any;

      if (fieldName) {
        const fieldValue = req.body[fieldName];
        inputData = {
          [fieldName]: transformInput
            ? transformInput(fieldValue)
            : fieldValue?.toLowerCase?.() || fieldValue,
        };
      } else {
        inputData = transformInput ? transformInput(req.body) : req.body;
      }

      const newRecord = await (prisma as any)[modelName].create({
        data: inputData,
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
      let inputData: any;

      if (fieldName) {
        const fieldValue = req.body[fieldName];
        inputData = {
          [fieldName]: transformInput
            ? transformInput(fieldValue)
            : fieldValue?.toLowerCase?.() || fieldValue,
        };
      } else {
        inputData = transformInput ? transformInput(req.body) : req.body;
      }

      const updatedRecord = await (prisma as any)[modelName].update({
        where: { id: recordId },
        data: inputData,
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

      await (prisma as any)[modelName].update({
        where: { id: recordId },
        data: { deletedAt: new Date() },
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
