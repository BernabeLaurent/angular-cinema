import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, forkJoin, of } from 'rxjs';
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

// Interfaces pour les salles (MovieTheater)
export interface TheaterRoom {
  id: number;
  theaterId: number;
  theater?: Theater;
  roomNumber: number;
  numberSeats: number;
  numberSeatsDisabled?: number;
}

export interface CreateTheaterRoomDto {
  theaterId: number;
  roomNumber: number;
  numberSeats: number;
  numberSeatsDisabled?: number;
}

export interface UpdateTheaterRoomDto {
  roomNumber?: number;
  numberSeats?: number;
  numberSeatsDisabled?: number;
}

// Interfaces pour les réservations
export interface BookingDetail {
  id: number;
  seatNumber: string;
  status: string;
  price: number;
  createDate: string;
  updateDate: string;
  bookingId: number;
}

export interface Booking {
  id: number;
  reservationDate: string;
  status: string;
  totalPrice: number;
  createDate: string;
  updateDate: string;
  user: User;
  bookingDetails?: BookingDetail[];
  sessionCinema?: {
    id: number;
    startTime: string;
    endTime: string;
    quality: string;
    codeLanguage: string;
    movie?: {
      id: number;
      title: string;
      [key: string]: any;
    };
    movieTheater?: {
      id: number;
      theaterId: number;
      roomNumber: number;
      numberSeats: number;
      theater?: {
        id: number;
        name: string;
        city: string;
        address: string;
        zipCode: number;
        codeCountry: string;
        openingTime: string;
        closingTime: string;
        phoneNumber: string;
      };
    };
  };
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
      map(response => response.data || []),
      catchError((error: any) => {
        console.error('API error in getAllBookings:', error);
        // Retourner des données de test en cas d'erreur
        return of(this.getTestBookings());
      })
    );
  }

  private getTestBookings(): Booking[] {
    return [
      {
        id: 1,
        reservationDate: new Date().toISOString(),
        status: 'PENDING',
        totalPrice: 25.00,
        createDate: new Date(Date.now() - 86400000).toISOString(), // Hier
        updateDate: new Date().toISOString(),
        user: {
          id: 1,
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean.dupont@example.com',
          role: 'CUSTOMER' as any,
          createDate: new Date().toISOString(),
          updateDate: new Date().toISOString()
        },
        sessionCinema: {
          id: 1,
          startTime: new Date(Date.now() + 86400000).toISOString(), // Demain
          endTime: new Date(Date.now() + 86400000 + 7200000).toISOString(),
          quality: 'HD',
          codeLanguage: 'fr',
          movie: {
            id: 1,
            title: 'Thunderbolts*'
          },
          movieTheater: {
            id: 1,
            theaterId: 1,
            roomNumber: 1,
            numberSeats: 150,
            theater: {
              id: 1,
              name: 'Pathé Cabinet',
              city: 'Toulon',
              address: 'quelque part',
              zipCode: 83000,
              codeCountry: 'FR',
              openingTime: '09:00',
              closingTime: '23:00',
              phoneNumber: '0494206308'
            }
          }
        }
      },
      {
        id: 2,
        reservationDate: new Date().toISOString(),
        status: 'CONFIRMED',
        totalPrice: 37.50,
        createDate: new Date(Date.now() - 172800000).toISOString(), // Avant-hier
        updateDate: new Date().toISOString(),
        user: {
          id: 2,
          firstName: 'Marie',
          lastName: 'Martin',
          email: 'marie.martin@example.com',
          role: 'CUSTOMER' as any,
          createDate: new Date().toISOString(),
          updateDate: new Date().toISOString()
        },
        sessionCinema: {
          id: 2,
          startTime: new Date(Date.now() + 172800000).toISOString(), // Après-demain
          endTime: new Date(Date.now() + 172800000 + 7200000).toISOString(),
          quality: 'IMAX',
          codeLanguage: 'fr',
          movie: {
            id: 1,
            title: 'Thunderbolts*'
          },
          movieTheater: {
            id: 2,
            theaterId: 1,
            roomNumber: 2,
            numberSeats: 200,
            theater: {
              id: 1,
              name: 'Pathé Cabinet',
              city: 'Toulon',
              address: 'quelque part',
              zipCode: 83000,
              codeCountry: 'FR',
              openingTime: '09:00',
              closingTime: '23:00',
              phoneNumber: '0494206308'
            }
          }
        }
      }
    ];
  }

  /**
   * Récupère une réservation par son ID avec ses détails
   */
  getBookingById(id: number): Observable<Booking> {
    return this.http.get<{ data: Booking; apiVersion: string }>(`${this.baseUrl}/bookings/${id}`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      map(response => response.data),
      catchError((error: any) => {
        console.error('API error in getBookingById:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Met à jour le statut d'une réservation (ADMIN uniquement)
   */
  updateBookingStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/bookings/${id}/status`, { status }, { 
      headers: this.getAuthHeaders() 
    });
  }

  /**
   * Met à jour le statut d'un booking detail (ADMIN uniquement)
   */
  updateBookingDetailStatus(bookingDetailId: number, status: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/booking-details/${bookingDetailId}/status`, { status }, { 
      headers: this.getAuthHeaders() 
    });
  }

  /**
   * Valide un booking detail spécifique (ADMIN uniquement)
   */
  validateBookingDetail(bookingDetailId: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/booking-details/${bookingDetailId}/validate`, {}, { 
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
   * Récupère tous les films disponibles avec leurs séances
   * Pour l'administration, on combine la liste de tous les films avec les sessions
   */
  getAllMovies(): Observable<any[]> {
    // Pour l'admin, on récupère tous les films ET on associe leurs sessions
    return forkJoin({
      sessions: this.getAllSessions().pipe(catchError(() => of([]))),
      // On essaie d'abord la recherche normale
      moviesWithSessions: this.http.get<{ data: any[]; apiVersion: string }>(`${this.baseUrl}/movies/search?name=&adminSearch=true`).pipe(
        catchError(() => of({ data: [], apiVersion: '1.0.0' }))
      )
    }).pipe(
      map(({ sessions, moviesWithSessions }) => {
        console.log('Raw API responses:', { sessions, moviesWithSessions });
        
        const moviesData = moviesWithSessions.data || [];
        
        // Si on a des films avec séances, on les utilise
        if (moviesData.length > 0) {
          return moviesData.map(item => ({
            ...item.movie,
            availableSessions: item.theaters?.reduce((total: number, theater: any) => {
              return total + (theater.sessions?.reduce((sessionCount: number, sessionGroup: any) => {
                return sessionCount + (sessionGroup.sessions?.length || 0);
              }, 0) || 0);
            }, 0) || 0,
            theaters: item.theaters
          }));
        }
        
        // Sinon, on extrait les films des sessions existantes
        const moviesFromSessions = new Map();
        
        sessions.forEach((session: any) => {
          if (session.movie) {
            const movieId = session.movie.id;
            if (!moviesFromSessions.has(movieId)) {
              moviesFromSessions.set(movieId, {
                ...session.movie,
                availableSessions: 0,
                theaters: []
              });
            }
            moviesFromSessions.get(movieId).availableSessions++;
          }
        });
        
        return Array.from(moviesFromSessions.values());
      }),
      catchError((error: any) => {
        console.error('API error in getAllMovies:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère un film par son ID
   */
  getMovieById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/movies/${id}`);
  }

  /**
   * Recherche des films par nom (pour l'administration)
   */
  searchMovies(searchTerm: string): Observable<any[]> {
    return this.http.get<{ data: any[]; apiVersion: string }>(`${this.baseUrl}/movies/search?name=${encodeURIComponent(searchTerm)}&adminSearch=true`).pipe(
      map(response => {
        console.log('Search API response:', response);
        
        const moviesData = response.data || [];
        
        // Si on a des résultats de recherche avec séances, on les utilise
        if (moviesData.length > 0) {
          return moviesData.map(item => ({
            ...item.movie,
            availableSessions: item.theaters?.reduce((total: number, theater: any) => {
              return total + (theater.sessions?.reduce((sessionCount: number, sessionGroup: any) => {
                return sessionCount + (sessionGroup.sessions?.length || 0);
              }, 0) || 0);
            }, 0) || 0,
            theaters: item.theaters
          }));
        }
        
        // Si pas de résultats, retourner un tableau vide
        return [];
      }),
      catchError((error: any) => {
        console.error('API error in searchMovies:', error);
        // Retourner un tableau vide en cas d'erreur pour éviter de casser l'interface
        return of([]);
      })
    );
  }

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

  // ==================== GESTION DES SESSIONS ====================

  /**
   * Récupère toutes les sessions
   */
  getAllSessions(): Observable<any[]> {
    return this.http.get<{ data: any[]; apiVersion: string }>(`${this.baseUrl}/sessions-cinemas`).pipe(
      map(response => response.data),
      catchError((error: any) => {
        console.error('API error in getAllSessions:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère les sessions d'un film spécifique
   */
  getMovieSessions(movieId: number): Observable<any[]> {
    return this.http.get<{ data: any[]; apiVersion: string }>(`${this.baseUrl}/sessions-cinemas/ByMovie/${movieId}`).pipe(
      map(response => response.data),
      catchError((error: any) => {
        console.error('API error in getMovieSessions:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Crée une nouvelle session (ADMIN uniquement)
   */
  createSession(sessionData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/sessions-cinemas/create`, sessionData, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      catchError((error: any) => {
        console.error('API error in createSession:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Met à jour une session (ADMIN uniquement)
   */
  updateSession(sessionId: number, sessionData: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/sessions-cinemas/${sessionId}`, sessionData, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      catchError((error: any) => {
        console.error('API error in updateSession:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Supprime une session (ADMIN uniquement)
   */
  deleteSession(sessionId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/sessions-cinemas/${sessionId}`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      catchError((error: any) => {
        console.error('API error in deleteSession:', error);
        return throwError(() => error);
      })
    );
  }

  // ==================== GESTION DES SALLES ====================

  /**
   * Récupère toutes les salles d'un cinéma
   */
  getTheaterRooms(theaterId: number): Observable<TheaterRoom[]> {
    return this.http.get<{ data: TheaterRoom[]; apiVersion: string }>(`${this.baseUrl}/movies-theaters/search_by_theater/${theaterId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.data),
      catchError((error: any) => {
        console.error('API error in getTheaterRooms:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère une salle par son ID
   */
  getTheaterRoomById(roomId: number): Observable<TheaterRoom> {
    return this.http.get<{ data: TheaterRoom; apiVersion: string }>(`${this.baseUrl}/movies-theaters/search/${roomId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.data),
      catchError((error: any) => {
        console.error('API error in getTheaterRoomById:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Crée une nouvelle salle
   */
  createTheaterRoom(roomData: CreateTheaterRoomDto): Observable<TheaterRoom> {
    return this.http.post<{ data: TheaterRoom; apiVersion: string }>(`${this.baseUrl}/movies-theaters/create`, roomData, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.data),
      catchError((error: any) => {
        console.error('API error in createTheaterRoom:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Met à jour une salle
   */
  updateTheaterRoom(roomId: number, roomData: UpdateTheaterRoomDto): Observable<TheaterRoom> {
    return this.http.patch<{ data: TheaterRoom; apiVersion: string }>(`${this.baseUrl}/movies-theaters/${roomId}`, roomData, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.data),
      catchError((error: any) => {
        console.error('API error in updateTheaterRoom:', error);
        return throwError(() => error);
      })
    );
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