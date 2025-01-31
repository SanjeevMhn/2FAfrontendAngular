import { HttpErrorResponse, HttpHandler, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { BehaviorSubject, catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';


export const tokenInterceptor: HttpInterceptorFn = (req:HttpRequest<any>, next:HttpHandlerFn) => {
  let authService = inject(AuthService)
  if(authService.getAccessToken() !== null){
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authService.getAccessToken()}`,
      },
    });
  }

  let router = inject(Router)

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status == 401) {
        authService.logout()
        router.navigate(['/login'])
      }
      return throwError(() => err);
    })
  );
};
