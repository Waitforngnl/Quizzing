import React, { useState } from 'react';
import { LoginPage } from '../ui/LoginPage';
import { RegisterPage } from '../ui/RegisterPage';
import { ForgotPage } from '../ui/ForgotPage';
import { MainDashboard } from './MainDashboard';

export const App = () => {
  const [currentPage, setCurrentPage] = useState<'login' | 'register' | 'forgot' | 'dashboard'>('login');

  return (
    <>
      {currentPage === 'login' && (
        <LoginPage 
          onSwitch={() => setCurrentPage('register')} 
          onForgot={() => setCurrentPage('forgot')}
          onLoginSuccess={() => setCurrentPage('dashboard')} 
        />
      )}
      
      {currentPage === 'register' && (
        <RegisterPage onSwitch={() => setCurrentPage('login')} />
      )}

      {currentPage === 'forgot' && (
        <ForgotPage onSwitch={() => setCurrentPage('login')} />
      )}

      {currentPage === 'dashboard' && (
        <MainDashboard />
      )}
    </>
  );
};