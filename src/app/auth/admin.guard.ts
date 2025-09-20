import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    const isLoggedIn = this.auth.isLoggedIn();
    const hasAdminRole = this.auth.hasRole('ADMIN');
    const hasWorkerRole = this.auth.hasRole('WORKER');
    const currentUser = this.auth.getCurrentUser();


    // Permettre l'accès aux ADMIN et WORKER
    if (isLoggedIn && (hasAdminRole || hasWorkerRole)) {
      return true;
    }
    this.router.navigate(['/']);
    return false;
  }
}
