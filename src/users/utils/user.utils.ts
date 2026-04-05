import type { User, SafeUser } from '../interfaces/user.interface';

export const toSafeUser = (user: User): SafeUser => {
  const { password: _password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};
