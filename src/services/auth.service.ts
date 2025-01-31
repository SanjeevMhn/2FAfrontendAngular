import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() {}
  http = inject(HttpClient);
  router = inject(Router);

  setAccessToken(token: string) {
    localStorage.setItem('ACCESS_TOKEN', JSON.stringify(token));
  }

  getAccessToken(): string | null {
    let accessToken = localStorage.getItem('ACCESS_TOKEN')
    return accessToken !== null ? JSON.parse(accessToken) : null;
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('ACCESS_TOKEN') !== null;
  }

  getUserDetails():Observable<any>{
    const url = 'http://localhost:8000/auth/me'
    return this.http.get(url)
  }

  logout() {
    localStorage.removeItem('ACCESS_TOKEN');
    localStorage.removeItem('userDetails');
    this.router.navigate(['/login']);
  }

  login(formData: any): Observable<any> {
    const url = 'http://localhost:8000/auth/login';
    return this.http.post(url, formData);
  }

  register(formData: any): Observable<any>{
    const url = 'http://localhost:8000/auth/register';
    return this.http.post(url, formData);
  }

  verifyPassword(formData: any): Observable<any>{
    const url = 'http://localhost:8000/auth/verify-password';
    return this.http.post(url, formData)
  }

  enable2FA(): Observable<any>{
    const url = 'http://localhost:8000/auth/enable-2fa'
    return this.http.post(url, {}) 
  }

  disable2FA(): Observable<any>{
    const url = 'http://localhost:8000/auth/disable-2fa'
    return this.http.post(url,{})
  }
}
