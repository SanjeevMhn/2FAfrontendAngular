import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const loginRedirectGuard: CanActivateFn = (route, state) => {
  let authService = inject(AuthService);
  let router = inject(Router)
  if(authService.isLoggedIn()){
    router.navigate(['home']);
    return false;
  }
  return true;
};
