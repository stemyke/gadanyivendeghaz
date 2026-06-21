import React from 'react';
import { redirect } from 'next/navigation';
import { checkAuth } from '../../actions/auth';
import RegisterFormClient from './RegisterFormClient';

export default async function RegisterPage() {
  const { isAuthenticated, hasAnyUsers } = await checkAuth();

  // Registration is only accessible if no users exist, or if currently logged in
  if (hasAnyUsers && !isAuthenticated) {
    redirect('/admin/login');
  }

  return <RegisterFormClient isAuthenticated={isAuthenticated} />;
}
