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
import { jwtDecode } from 'jwt-decode';
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

  login(credentials: { email: string; password: string }): Observable<any> {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    return this.http
      .post<{ data: { accessToken: string; refreshToken: string }; apiVersion: string }>(
        `${this.apiUrl}/auth/sign-in`,
        credentials,
        { headers }
      )
      .pipe(
        tap((response) => {
          const { accessToken, refreshToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          this.setUserFromToken(accessToken);
        }),
        catchError((error) => {
          console.error('Login error details:', error);
          return throwError(() => error);
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
      console.log('Decoded token:', decoded);
      const user: User = {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.roleUser,
        token,
      };
      console.log('Setting user:', user);
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
    return localStorage.getItem('accessToken');
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

  redirectAfterAuth(router: any): void {
    const currentUser = this.userSubject.value;
    if (currentUser) {
      if (currentUser.role === 'ADMIN') {
        router.navigate(['/admin']);
      } else {
        router.navigate(['/']);
      }
    }
  }

  // Méthode pour forcer la réinitialisation de l'utilisateur depuis localStorage
  forceInitFromToken(): void {
    const token = localStorage.getItem('accessToken');
    console.log('Force init from token:', token ? 'Token found' : 'No token');
    if (token) {
      this.setUserFromToken(token);
    }
  }

  register(data: CreateUserDto): Observable<any> {
    return this.http.post<{ data: any; apiVersion: string }>(
      `${this.apiUrl}/users`,
      data
    ).pipe(
      tap((response) => {
        const { accessToken, refreshToken } = response.data.token;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        this.setUserFromToken(accessToken);
        this.userSubject.next(response.data);
      }),
      catchError(err => {
        return throwError(() => err);
      })
    );
  }
}
