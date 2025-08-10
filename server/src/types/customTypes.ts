import { Role } from '../generated/prisma';
import { JwtPayload } from 'jsonwebtoken';

export interface CustomJwtPayload extends JwtPayload {
  id: string;
  role: Role;
  isKycComplete?: boolean;
}
