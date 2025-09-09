import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { User } from '../auth/user.interface';

// Interfaces pour les cinémas
export interface Theater {
  id: number;
  name: string;
  zipCode: number;
  city: string;
  address: string;
  codeCountry: string;
  openingTime: string;
  closingTime: string;
  phoneNumber: string;
  createDate: string;
  updateDate: string;
  moviesTheaters: any[];
}

export interface CreateTheaterDto {
  name: string;
  codeCountry: string;
  address: string;
  city: string;
  zipCode: number;
  phoneNumber: string;
  openingTime: string;
  closingTime: string;
}

export interface UpdateTheaterDto {
  name?: string;
  codeCountry?: string;
  address?: string;
  city?: string;
  zipCode?: number;
  phoneNumber?: string;
  openingTime?: string;
  closingTime?: string;
}

// Interfaces pour les réservations
export interface Booking {
  id: number;
  reservationDate: string;
  status: string;
  totalPrice: number;
  createDate: string;
  updateDate: string;
  user: User;
  // autres champs selon votre modèle
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ==================== GESTION DES UTILISATEURS ====================

  /**
   * Récupère tous les utilisateurs (ADMIN uniquement)
   */
  getAllUsers(): Observable<User[]> {
    const token = this.authService.getToken();
    console.log('Making API call to get users with token:', token ? 'Token present' : 'No token');
    
    return this.http.get<{ data: User[]; apiVersion: string }>(`${this.baseUrl}/users`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      map(response => {
        console.log('API response received:', response);
        return response.data;
      }),
      catchError((error: any) => {
        console.error('API error in getAllUsers:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère un utilisateur par son ID
   */
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/users/${id}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  /**
   * Crée un nouvel utilisateur
   */
  createUser(userData: CreateUserDto): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/users`, userData, { 
      headers: this.getAuthHeaders() 
    });
  }

  /**
   * Met à jour un utilisateur
   */
  updateUser(id: number, userData: Partial<CreateUserDto>): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/users/${id}`, userData, { 
      headers: this.getAuthHeaders() 
    });
  }

  /**
   * Supprime un utilisateur (ADMIN uniquement)
   */
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/users/${id}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  /**
   * Vérifie la disponibilité d'un email
   */
  checkEmailAvailability(email: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/check-email/${email}`);
  }

  // ==================== GESTION DES CINÉMAS ====================

  /**
   * Récupère tous les cinémas
   */
  getTheaters(): Observable<Theater[]> {
    return this.http.get<{ data: Theater[]; apiVersion: string }>(`${this.baseUrl}/theaters`).pipe(
      map(response => response.data),
      catchError((error: any) => {
        console.error('API error in getTheaters:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère un cinéma par son ID
   */
  getTheaterById(id: number): Observable<Theater> {
    return this.http.get<Theater>(`${this.baseUrl}/theaters/${id}`);
  }

  /**
   * Crée un nouveau cinéma (ADMIN uniquement)
   */
  createTheater(theaterData: CreateTheaterDto): Observable<Theater> {
    return this.http.post<Theater>(`${this.baseUrl}/theaters`, theaterData, { 
      headers: this.getAuthHeaders() 
    });
  }

  /**
   * Met à jour un cinéma (ADMIN uniquement)
   */
  updateTheater(id: number, theaterData: UpdateTheaterDto): Observable<Theater> {
    return this.http.patch<Theater>(`${this.baseUrl}/theaters/${id}`, theaterData, { 
      headers: this.getAuthHeaders() 
    });
  }

  /**
   * Supprime un cinéma (ADMIN uniquement)
   * Note: L'API utilise un query parameter au lieu d'un path parameter
   */
  deleteTheater(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/theaters?id=${id}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  // ==================== GESTION DES RÉSERVATIONS ====================

  /**
   * Récupère toutes les réservations (ADMIN uniquement)
   */
  getAllBookings(): Observable<Booking[]> {
    return this.http.get<{ data: Booking[]; apiVersion: string }>(`${this.baseUrl}/bookings`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Récupère une réservation par son ID
   */
  getBookingById(id: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.baseUrl}/bookings/${id}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  /**
   * Valide une réservation (ADMIN uniquement)
   */
  validateBooking(id: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/bookings/${id}/validateBooking`, {}, { 
      headers: this.getAuthHeaders() 
    });
  }

  /**
   * Valide un ticket avec token (ADMIN uniquement)
   */
  validateBookingWithToken(token: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/bookings/validate-booking-detail?token=${token}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  /**
   * Récupère les réservations d'un utilisateur
   */
  getUserBookings(userId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/bookings/user/${userId}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  // ==================== GESTION DES FILMS ====================

  /**
   * Recherche des films externes (ADMIN uniquement)
   */
  searchExternalMovies(query: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/movies/external/search?q=${query}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  /**
   * Récupère les détails d'un film externe (ADMIN uniquement)
   */
  getExternalMovieDetails(movieId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/movies/external/${movieId}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  /**
   * Récupère le casting d'un film externe (ADMIN uniquement)
   */
  getExternalMovieCast(movieId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/movies/external/getCast/${movieId}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  /**
   * Récupère les prochaines sorties (ADMIN uniquement)
   */
  getUpcomingMovies(): Observable<any> {
    return this.http.get(`${this.baseUrl}/movies/external/search/upcoming`, { 
      headers: this.getAuthHeaders() 
    });
  }

  /**
   * Met à jour un film (ADMIN uniquement)
   */
  updateMovie(movieId: number, movieData: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/movies/${movieId}`, movieData, { 
      headers: this.getAuthHeaders() 
    });
  }

  /**
   * Valide une review (ADMIN uniquement)
   */
  validateReview(reviewId: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/movies/reviews/${reviewId}/validate`, {}, { 
      headers: this.getAuthHeaders() 
    });
  }

  // ==================== STATISTIQUES ====================

  /**
   * Récupère les statistiques générales (à implémenter côté API si nécessaire)
   */
  getGeneralStats(): Observable<any> {
    // Peut être implémenté plus tard si l'API propose un endpoint de stats
    return this.http.get(`${this.baseUrl}/admin/stats`, { 
      headers: this.getAuthHeaders() 
    });
  }
}