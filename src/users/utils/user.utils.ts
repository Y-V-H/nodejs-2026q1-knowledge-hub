import type { SafeUser } from '../interfaces/user.interface';
import type { User, Role } from '../../../generated/prisma';

export const toSafeUser = (user: User): SafeUser => {
  return {
    id: user.id,
    login: user.login,
    role: user.role.toLowerCase() as Role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};
