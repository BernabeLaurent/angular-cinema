import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AdminOnlyGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    const isLoggedIn = this.auth.isLoggedIn();
    const hasAdminRole = this.auth.hasRole('ADMIN');
    const currentUser = this.auth.getCurrentUser();

    console.log('AdminOnlyGuard check:', {
      isLoggedIn,
      hasAdminRole,
      currentUser,
      userRole: currentUser?.role
    });

    // Permettre l'accès UNIQUEMENT aux ADMIN
    if (isLoggedIn && hasAdminRole) {
      return true;
    }

    console.log('AdminOnly access denied - redirecting to admin dashboard');
    // Rediriger vers le dashboard admin si c'est un WORKER qui essaie d'accéder
    if (isLoggedIn && this.auth.hasRole('WORKER')) {
      this.router.navigate(['/admin/dashboard']);
    } else {
      // Rediriger vers l'accueil si pas connecté ou pas de droits admin
      this.router.navigate(['/']);
    }
    return false;
  }
}