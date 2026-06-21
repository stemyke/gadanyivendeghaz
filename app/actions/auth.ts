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

  if (!username || !password || !fullname || !email) {
    return { success: false, error: 'Kérjük, töltsön ki minden mezőt!' };
  }

  // Check permission to register
  const hasUsers = await UserModel.hasAnyUsers();
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const loggedInUser = token ? verifySessionToken(token) : null;

  // Registration is only allowed if:
  // 1. There are no users at all (initial setup).
  // 2. Or the current client is already logged in as an admin.
  if (hasUsers && !loggedInUser) {
    return { 
      success: false, 
      error: 'Regisztráció csak bejelentkezett felhasználóként vagy első felhasználó létrehozásakor lehetséges!' 
    };
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

export async function checkAuth(): Promise<{ isAuthenticated: boolean; username: string | null; hasAnyUsers: boolean }> {
  const hasAnyUsers = await UserModel.hasAnyUsers();
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  
  if (!token) {
    return { isAuthenticated: false, username: null, hasAnyUsers };
  }

  const username = verifySessionToken(token);
  return {
    isAuthenticated: !!username,
    username,
    hasAnyUsers,
  };
}
