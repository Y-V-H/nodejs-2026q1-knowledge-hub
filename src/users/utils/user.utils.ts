import type { User, SafeUser } from '../interfaces/user.interface';
// import type { User } from '../../../generated/prisma';

export const toSafeUser = (user: User): SafeUser => {
  const { password: _password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};
