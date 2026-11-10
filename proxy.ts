import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  // Exclude API routes, Next.js assets and public image files from authentication.
  matcher: [
    '/((?!api|_next/static|_next/image|.*\\.png$|.*\\.svg$).*)',
  ],
};
