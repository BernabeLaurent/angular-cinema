import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../auth/user.interface';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { RegionsIso } from '../common/enums/regions-iso.enum';

export interface UpdateUserProfileDto {
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  zipCode?: number;
  codeCountry?: RegionsIso;
  phoneNumber?: string;
  hasDisability?: boolean;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private readonly apiUrl = environment.apiUrl;
  private userProfileSubject = new BehaviorSubject<User | null>(null);
  public userProfile$ = this.userProfileSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Initialiser avec l'utilisateur courant
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userProfileSubject.next(currentUser);
    }
  }

  /**
   * Récupère le profil complet de l'utilisateur connecté
   */
  getCurrentUserProfile(): Observable<User> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Aucun utilisateur connecté');
    }

    return this.http.get<User>(`${this.apiUrl}/users/${currentUser.id}`).pipe(
      tap(user => {
        // Conserver le token de l'utilisateur courant
        user.token = currentUser.token;
        this.userProfileSubject.next(user);
      })
    );
  }

  /**
   * Met à jour le profil de l'utilisateur
   */
  updateProfile(profileData: UpdateUserProfileDto): Observable<User> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Aucun utilisateur connecté');
    }

    return this.http.patch<User>(`${this.apiUrl}/users/${currentUser.id}`, profileData).pipe(
      tap(updatedUser => {
        // Conserver le token de l'utilisateur courant
        updatedUser.token = currentUser.token;
        this.userProfileSubject.next(updatedUser);
        
        // Mettre à jour l'utilisateur dans le service d'authentification
        this.authService.updateCurrentUser(updatedUser);
      })
    );
  }

  /**
   * Change le mot de passe de l'utilisateur
   */
  changePassword(passwordData: ChangePasswordDto): Observable<any> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Aucun utilisateur connecté');
    }

    return this.http.patch(`${this.apiUrl}/users/${currentUser.id}/change-password`, {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
  }

  /**
   * Vérifie la disponibilité d'un email
   */
  checkEmailAvailability(email: string): Observable<{ available: boolean }> {
    return this.http.get<{ available: boolean }>(`${this.apiUrl}/users/check-email/${encodeURIComponent(email)}`);
  }

  /**
   * Supprime le compte utilisateur
   */
  deleteAccount(): Observable<any> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Aucun utilisateur connecté');
    }

    return this.http.delete(`${this.apiUrl}/users/${currentUser.id}`).pipe(
      tap(() => {
        // Déconnecter l'utilisateur après la suppression
        this.authService.logout();
      })
    );
  }

  /**
   * Récupère l'historique des réservations de l'utilisateur avec détails
   */
  getUserBookingsHistory(): Observable<any[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Aucun utilisateur connecté');
    }

    return this.http.get<any[]>(`${this.apiUrl}/bookings/user/${currentUser.id}`);
  }

  /**
   * Méthodes utilitaires
   */
  getFullName(user?: User | null): string {
    if (!user) return '';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Utilisateur';
  }

  getInitials(user?: User | null): string {
    if (!user) return '';
    
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    
    return user.email?.charAt(0).toUpperCase() || 'U';
  }

  formatAddress(user?: User | null): string {
    if (!user) return '';
    
    const parts = [];
    if (user.address) parts.push(user.address);
    if (user.zipCode && user.city) {
      parts.push(`${user.zipCode} ${user.city}`);
    } else if (user.city) {
      parts.push(user.city);
    }
    if (user.codeCountry) {
      parts.push(user.codeCountry);
    }
    
    return parts.join(', ');
  }

  getCountryDisplayName(countryCode?: RegionsIso): string {
    const countries = {
      [RegionsIso.FRANCE]: 'France',
      [RegionsIso.USA]: 'États-Unis'
    };
    
    return countryCode ? countries[countryCode] || countryCode : '';
  }
}