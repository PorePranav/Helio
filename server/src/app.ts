import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import globalErrorHandler from './controllers/error.controller';
import AppError from './utils/AppError';

import adminAuthRoutes from './routers/authRoutes/adminAuth.routes';
import userAuthRoutes from './routers/authRoutes/userAuth.routes';
import adminRoutes from './routers/admin.routes';
import kycRoutes from './routers/kyc.routes';
import eventRoutes from './routers/event.routes';
import formRoutes from './routers/form.routes';

const app = express();
app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/auth/admin', adminAuthRoutes);
app.use('/api/v1/auth', userAuthRoutes);
app.use('/api/v1/kyc', kycRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/forms', formRoutes);

app.all('/{*splat}', (req: Request, res: Response, next: NextFunction) => {
  return next(
    new AppError(`Can't find ${req.originalUrl} on this server!`, 404)
  );
});

app.use(globalErrorHandler);

export default app;
