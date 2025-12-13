import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api';
  private readonly key = 'travlr_token';

  login(email: string, password: string) {
    return this.http.post<{ token: string }>(`${this.baseUrl}/auth/login`, { email, password })
      .pipe(tap(res => localStorage.setItem(this.key, res.token)));
  }

  logout() { localStorage.removeItem(this.key); }
  get token() { return localStorage.getItem(this.key); }
  isLoggedIn() { return !!this.token; }
}
