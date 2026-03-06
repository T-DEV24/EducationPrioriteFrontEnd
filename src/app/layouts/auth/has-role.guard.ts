import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';

export const hasRoleGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.hasRole('ADMIN', 'SUPER_ADMIN')) {
      router.navigate(['/login']);
      return false;
  } 

  return true;
};
