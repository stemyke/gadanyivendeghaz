'use server';

import { cookies } from 'next/headers';
import { UserModel, hashPassword } from '../../lib/models/User';
import { createSessionToken, verifySessionToken } from '../../lib/session';

const COOKIE_NAME = 'admin_session';

export async function login(prevState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { success: false, error: 'Kérjük, töltsön ki minden mezőt!' };
  }

  const user = await UserModel.findUserByUsername(username);
  if (!user) {
    return { success: false, error: 'Hibás felhasználónév vagy jelszó!' };
  }

  const inputHashed = hashPassword(password);
  if (user.password !== inputHashed) {
    return { success: false, error: 'Hibás felhasználónév vagy jelszó!' };
  }

  // Create session
  const token = createSessionToken(username);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day
  });

  return { success: true };
}

export async function register(prevState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const fullname = formData.get('fullname') as string;
  const email = formData.get('email') as string;
  const role = formData.get('role') as string;

  if (!username || !password || !fullname || !email) {
    return { success: false, error: 'Kérjük, töltsön ki minden mezőt!' };
  }

  // Check permission to register
  const hasUsers = await UserModel.hasAnyUsers();
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const loggedInUser = token ? verifySessionToken(token) : null;

  let userRole = 'super'; // default for the first user
  if (hasUsers) {
    if (!loggedInUser) {
      return { 
        success: false, 
        error: 'Regisztráció csak bejelentkezett felhasználóként lehetséges!' 
      };
    }
    const registrar = await UserModel.findUserByUsername(loggedInUser);
    if (!registrar || registrar.role !== 'super') {
      return {
        success: false,
        error: 'Csak szuperadminisztrátor regisztrálhat új felhasználót!'
      };
    }
    userRole = role === 'super' ? 'super' : 'admin';
  }

  // Check if username already exists
  const existingUser = await UserModel.findUserByUsername(username);
  if (existingUser) {
    return { success: false, error: 'Ez a felhasználónév már foglalt!' };
  }

  // Create user
  const success = await UserModel.createUser({
    username,
    password,
    fullname,
    email,
    role: userRole,
  });

  if (!success) {
    return { success: false, error: 'Hiba történt a regisztráció során. Kérjük, próbálja újra!' };
  }

  // If first user, automatically log them in
  if (!hasUsers) {
    const sessionToken = createSessionToken(username);
    cookieStore.set(COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });
  }

  return { success: true };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return { success: true };
}

export async function checkAuth(): Promise<{ isAuthenticated: boolean; username: string | null; hasAnyUsers: boolean; role: string | null }> {
  const hasAnyUsers = await UserModel.hasAnyUsers();
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  
  if (!token) {
    return { isAuthenticated: false, username: null, hasAnyUsers, role: null };
  }

  const username = verifySessionToken(token);
  if (!username) {
    return { isAuthenticated: false, username: null, hasAnyUsers, role: null };
  }

  const user = await UserModel.findUserByUsername(username);
  return {
    isAuthenticated: true,
    username,
    hasAnyUsers,
    role: user?.role || null,
  };
}

export async function changePassword(prevState: any, formData: FormData) {
  const { isAuthenticated, username } = await checkAuth();
  if (!isAuthenticated || !username) {
    return { success: false, error: 'Ehhez a művelethez be kell jelentkezni!' };
  }

  const oldPassword = formData.get('oldPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!oldPassword || !newPassword || !confirmPassword) {
    return { success: false, error: 'Kérjük, töltsön ki minden mezőt!' };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: 'A két új jelszó nem egyezik!' };
  }

  if (newPassword.length < 6) {
    return { success: false, error: 'Az új jelszónak legalább 6 karakterből kell állnia!' };
  }

  // Verify old password
  const user = await UserModel.findUserByUsername(username);
  if (!user) {
    return { success: false, error: 'A felhasználó nem található!' };
  }

  const oldHashed = hashPassword(oldPassword);
  if (user.password !== oldHashed) {
    return { success: false, error: 'A jelenlegi jelszó helytelen!' };
  }

  // Update password
  const success = await UserModel.updatePassword(username, newPassword);
  if (!success) {
    return { success: false, error: 'Nem sikerült megváltoztatni a jelszót!' };
  }

  return { success: true };
}

export async function deleteUser(userId: number) {
  const { isAuthenticated, username, role } = await checkAuth();
  if (!isAuthenticated || !username) {
    return { success: false, error: 'Ehhez a művelethez be kell jelentkezni!' };
  }

  if (role !== 'super') {
    return { success: false, error: 'Csak szuperadminisztrátor törölhet felhasználót!' };
  }

  const userToDelete = await UserModel.findUserById(userId);
  if (!userToDelete) {
    return { success: false, error: 'A felhasználó nem található!' };
  }

  if (userToDelete.username === username) {
    return { success: false, error: 'Saját magát nem törölheti!' };
  }

  const success = await UserModel.deleteUser(userId);
  if (!success) {
    return { success: false, error: 'Nem sikerült törölni a felhasználót!' };
  }

  return { success: true };
}
