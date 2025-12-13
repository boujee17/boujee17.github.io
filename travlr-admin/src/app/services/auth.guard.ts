import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

// This guard stops users from accessing admin routes unless logged in
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // If user has a JWT token, allow route
  if (auth.isLoggedIn()) return true;

  // Otherwise redirect to login page
  router.navigate(['/login']);
  return false;
};
