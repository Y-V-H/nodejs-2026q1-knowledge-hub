import { Role } from 'generated/prisma';

export interface User {
  id: string;
  login: string;
  password: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface SafeUser extends Omit<User, 'password'> {}
