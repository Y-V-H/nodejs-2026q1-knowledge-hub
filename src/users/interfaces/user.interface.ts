import { Role } from 'generated/prisma';

export interface User {
  id: string;
  login: string;
  password: string;
  role: Role;
  createdAt: number;
  updatedAt: number;
}

export interface SafeUser extends Omit<User, 'password'> {}
