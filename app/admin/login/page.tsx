import React from 'react';
import { redirect } from 'next/navigation';
import { checkAuth } from '../../actions/auth';
import LoginFormClient from './LoginFormClient';

export default async function LoginPage() {
  const { isAuthenticated, hasAnyUsers } = await checkAuth();
  
  if (isAuthenticated) {
    redirect('/admin');
  }

  return <LoginFormClient hasAnyUsers={hasAnyUsers} />;
}
