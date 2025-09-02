import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { RoleUser } from '../users/enums/roles-users.enum';

@Injectable({
  providedIn: 'root'
})
export class UserRoleService {

  constructor(private authService: AuthService) { }

  isLoggedIn(): Observable<boolean> {
    return this.authService.user$.pipe(
      map(user => !!user)
    );
  }

  getCurrentUser(): Observable<any> {
    return this.authService.user$;
  }

  isAdmin(): Observable<boolean> {
    return this.authService.user$.pipe(
      map(user => user?.role === RoleUser.ADMIN)
    );
  }

  isCustomer(): Observable<boolean> {
    return this.authService.user$.pipe(
      map(user => user?.role === RoleUser.CUSTOMER)
    );
  }

  isWorker(): Observable<boolean> {
    return this.authService.user$.pipe(
      map(user => user?.role === RoleUser.WORKER)
    );
  }

  hasRole(role: RoleUser): Observable<boolean> {
    return this.authService.user$.pipe(
      map(user => user?.role === role)
    );
  }

  canAccessAdmin(): Observable<boolean> {
    return this.authService.user$.pipe(
      map(user => user?.role === RoleUser.ADMIN || user?.role === RoleUser.WORKER)
    );
  }

  getUserInitials(): Observable<string> {
    return this.authService.user$.pipe(
      map(user => {
        if (!user?.email) return 'U';
        const parts = user.email.split('@')[0].split('.');
        if (parts.length >= 2) {
          return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return user.email[0].toUpperCase();
      })
    );
  }

  getRoleDisplayName(role: RoleUser): string {
    switch (role) {
      case RoleUser.ADMIN:
        return 'Administrateur';
      case RoleUser.WORKER:
        return 'Employé';
      case RoleUser.CUSTOMER:
        return 'Client';
      default:
        return 'Utilisateur';
    }
  }
}