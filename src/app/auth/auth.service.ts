import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  throwError,
  tap,
  catchError,
} from 'rxjs';
import {User} from './user.interface';
import {JwtPayload} from './jwtPayload.interface';
import {jwtDecode} from 'jwt-decode';
import {CreateUserDto} from '../users/dtos/create-user.dto';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('accessToken');
    if (token) {
      this.setUserFromToken(token);
    }
  }

  login(credentials: { email: string; password: string }): Observable<{ accessToken: string; refreshToken: string }> {
    return this.http
      .post<{ accessToken: string; refreshToken: string }>(
        `${this.apiUrl}/auth/sign-in`,
        credentials
      )
      .pipe(
        tap(({accessToken, refreshToken}) => {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          this.setUserFromToken(accessToken);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.userSubject.next(null);
  }

  refreshToken(): Observable<{ accessToken: string; refreshToken: string }> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token found'));
    }

    return this.http
      .post<{ accessToken: string; refreshToken: string }>(
        `${this.apiUrl}/auth/refresh-tokens`,
        {refreshToken}
      )
      .pipe(
        tap(({accessToken, refreshToken}) => {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          this.setUserFromToken(accessToken);
        }),
        catchError((err) => {
          this.logout();
          return throwError(() => err);
        })
      );
  }

  private setUserFromToken(token: string): void {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const user: User = {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.roleUser,
        token,
      };
      this.userSubject.next(user);
    } catch (e) {
      console.error('Token decode failed', e);
      this.logout();
    }
  }

  isLoggedIn(): boolean {
    return !!this.userSubject.value;
  }

  hasRole(role: string): boolean {
    return this.userSubject.value?.role === role;
  }

  getToken(): string | null {
    return this.userSubject.value?.token ?? null;
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  updateCurrentUser(user: User): void {
    this.userSubject.next(user);
  }

  saveAccessToken(token: string): void {
    localStorage.setItem('accessToken', token);
    this.setUserFromToken(token);
  }

  register(data: CreateUserDto): Observable<any> {
    return this.http.post<{ user: User; tokens: { accessToken: string; refreshToken: string } }>(
      `${this.apiUrl}/users`,
      data
    ).pipe(
      tap(({tokens, user}) => {
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        this.setUserFromToken(tokens.accessToken);
        this.userSubject.next(user);
      }),
      catchError(err => {
        return throwError(() => err);
      })
    );
  }
}
