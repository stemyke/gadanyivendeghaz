import prisma from '../prisma';
import crypto from 'crypto';

export interface User {
  id?: number;
  username: string;
  password?: string;
  fullname: string;
  email: string;
  role?: string;
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
          role: user.role || 'admin',
        },
      });
      return true;
    } catch (error) {
      console.error('Failed to create user:', error);
      return false;
    }
  },

  async getUsers(): Promise<Omit<User, 'password'>[]> {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          fullname: true,
          email: true,
          role: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return users;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return [];
    }
  },

  async updatePassword(username: string, passwordPlain: string): Promise<boolean> {
    const hashedPassword = hashPassword(passwordPlain);
    try {
      await prisma.user.update({
        where: { username },
        data: { password: hashedPassword },
      });
      return true;
    } catch (error) {
      console.error('Failed to update password:', error);
      return false;
    }
  },

  async findUserById(id: number): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
      });
      return user;
    } catch (error) {
      console.error('Failed to find user by id:', error);
      return null;
    }
  },

  async deleteUser(id: number): Promise<boolean> {
    try {
      await prisma.user.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error('Failed to delete user:', error);
      return false;
    }
  }
};
