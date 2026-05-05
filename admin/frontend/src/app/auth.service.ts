import { HttpClient } from "@angular/common/http";
import { Injectable, computed, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, map } from "rxjs";
import { environment } from "../environments/environment";

const TOKEN_KEY = "admin_ecom_token";
const EMAIL_KEY = "admin_ecom_email";

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly base = environment.adminApiUrl.replace(/\/$/, "");

  private readonly tokenSignal = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private readonly emailSignal = signal<string | null>(localStorage.getItem(EMAIL_KEY));

  readonly token = computed(() => this.tokenSignal());
  readonly email = computed(() => this.emailSignal());

  login(email: string, password: string): Observable<{ token: string; email: string }> {
    return this.http
      .post<{ token: string; email: string }>(`${this.base}/api/auth/login`, {
        email,
        password,
      })
      .pipe(
        map((res) => {
          this.setSession(res.token, res.email);
          return res;
        })
      );
  }

  setSession(token: string | null, email: string | null): void {
    this.tokenSignal.set(token);
    this.emailSignal.set(email);
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
    if (email) localStorage.setItem(EMAIL_KEY, email);
    else localStorage.removeItem(EMAIL_KEY);
  }

  logout(): void {
    this.setSession(null, null);
    void this.router.navigateByUrl("/login");
  }

  isLoggedIn(): boolean {
    return this.tokenSignal() != null;
  }
}
