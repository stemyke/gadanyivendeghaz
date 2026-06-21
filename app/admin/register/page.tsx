import React from 'react';
import { redirect } from 'next/navigation';
import { checkAuth } from '../../actions/auth';
import RegisterFormClient from './RegisterFormClient';

export default async function RegisterPage() {
  const { isAuthenticated, hasAnyUsers, role } = await checkAuth();

  // Registration is only accessible if no users exist, or if currently logged in as a SUPER admin
  if (hasAnyUsers) {
    if (!isAuthenticated) {
      redirect('/admin/login');
    }
    if (role !== 'super') {
      redirect('/admin');
    }
  }

  return <RegisterFormClient isAuthenticated={isAuthenticated} showRoleSelect={hasAnyUsers} />;
}
