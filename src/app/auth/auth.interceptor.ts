// auth.interceptor.ts
import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse
} from '@angular/common/http';
import { AuthService } from './auth.service';
import {
  BehaviorSubject,
  catchError,
  filter,
  switchMap,
  take,
  throwError,
} from 'rxjs';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const AuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): any => {
  const authService = inject(AuthService);

  const token = authService.getToken();
  let authReq = req;

  if (token) {
    authReq = addTokenHeader(req, token);
  }

  return next(authReq).pipe(
    catchError((error) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !authReq.url.includes('/sign-in') &&
        !authReq.url.includes('/refresh-token')
      ) {
        return handle401Error(authReq, next, authService);
      }

      return throwError(() => error);
    })
  );
};

function addTokenHeader(req: HttpRequest<any>, token: string): HttpRequest<any> {
  return req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`),
  });
}

function handle401Error(
  request: HttpRequest<any>,
  next: HttpHandlerFn,
  authService: AuthService
) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap(({ accessToken }) => {
        isRefreshing = false;
        authService.saveAccessToken(accessToken);
        refreshTokenSubject.next(accessToken);
        return next(addTokenHeader(request, accessToken));
      }),
      catchError((err) => {
        isRefreshing = false;
        authService.logout();
        return throwError(() => err);
      })
    );
  } else {
    return refreshTokenSubject.pipe(
      filter((token) => token != null),
      take(1),
      switchMap((token) => next(addTokenHeader(request, token!)))
    );
  }
}
