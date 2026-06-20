import { Navigate } from 'react-router-dom';
import loginRoutes from './pages/routes';
import { lazy } from 'react';

const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));

export default [
  ...loginRoutes,
  {
    path: 'reset-password',
    children: [{ index: true, element: ResetPasswordPage }],
  },
  { path: '*', to: 'login', element: Navigate },
];
