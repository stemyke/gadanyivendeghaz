import prisma from '../prisma';
import crypto from 'crypto';

export interface User {
  id?: number;
  username: string;
  password?: string;
  fullname: string;
  email: string;
  createdAt?: Date;
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export const UserModel = {
  async hasAnyUsers(): Promise<boolean> {
    try {
      const count = await prisma.user.count();
      return count > 0;
    } catch (error) {
      console.error('Failed to check for users:', error);
      return false;
    }
  },

  async findUserByUsername(username: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { username },
      });
      return user;
    } catch (error) {
      console.error('Failed to find user:', error);
      return null;
    }
  },

  async createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<boolean> {
    const hashedPassword = hashPassword(user.password!);
    try {
      await prisma.user.create({
        data: {
          username: user.username,
          password: hashedPassword,
          fullname: user.fullname,
          email: user.email,
        },
      });
      return true;
    } catch (error) {
      console.error('Failed to create user:', error);
      return false;
    }
  }
};
