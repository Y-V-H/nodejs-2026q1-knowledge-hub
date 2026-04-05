import { UserRole } from '../enum/user-role.enum';

export interface User {
  id: string;
  login: string;
  password: string;
  role: UserRole;
  createdAt: number;
  updatedAt: number;
}

export interface SafeUser extends Omit<User, 'password'> {}
