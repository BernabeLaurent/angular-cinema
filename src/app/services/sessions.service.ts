import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SessionCinema, Booking, CreateBookingDto, SessionBookingInfo, MovieWithSessions } from '../models/session.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SessionsService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getSessionsByMovieAndTheater(movieId: number, theaterId?: number): Observable<MovieWithSessions[]> {
    let url = `${this.apiUrl}/sessions-cinemas/search?movieId=${movieId}`;
    if (theaterId) {
      url += `&theaterId=${theaterId}`;
    }
    return this.http.get<MovieWithSessions[]>(url);
  }

  getSessionsByWeek(theaterId?: number, startDate?: string): Observable<SessionCinema[]> {
    let url = `${this.apiUrl}/sessions-cinemas`;
    const params = [];
    if (theaterId) params.push(`theaterId=${theaterId}`);
    if (startDate) params.push(`startDate=${startDate}`);
    if (params.length) url += `?${params.join('&')}`;
    
    return this.http.get<any>(url).pipe(
      map((response: any) => {
        console.log('Réponse brute API sessions:', response);
        let sessions: SessionCinema[] = [];
        
        // Si la réponse a un format avec 'data', on l'extrait
        if (response && typeof response === 'object' && 'data' in response) {
          sessions = response.data;
        } else if (Array.isArray(response)) {
          sessions = response;
        }
        
        // CORRECTIF : Filtrer manuellement par theaterId car l'API ne le fait pas correctement
        if (theaterId && sessions.length > 0) {
          sessions = sessions.filter(session => 
            session.movieTheater?.theater?.id === theaterId ||
            session.movieTheater?.theaterId === theaterId
          );
          console.log(`Sessions filtrées pour le cinéma ${theaterId}:`, sessions);
        }
        
        return sessions;
      }),
      catchError((error: any) => {
        console.error('Erreur API getSessionsByWeek:', error);
        return throwError(() => error);
      })
    );
  }

  getSessionById(sessionId: number): Observable<SessionCinema> {
    return this.http.get<SessionCinema>(`${this.apiUrl}/sessions-cinemas/${sessionId}`);
  }

  getSessionBookingInfo(sessionId: number): Observable<SessionBookingInfo> {
    return this.http.get<any>(`${this.apiUrl}/sessions-cinemas/${sessionId}`).pipe(
      map((response: any) => {
        console.log('Session booking info response:', response);
        const session = response.data || response;
        
        // Transformer la session en SessionBookingInfo
        // Récupérer le nombre de sièges depuis movieTheater.numberSeats
        const totalSeats = session.movieTheater?.numberSeats || session.totalSeats || 100;
        const numAvailableSeats = session.availableSeats || (totalSeats - 15); // Par défaut 85% des places disponibles
        const occupiedSeats = session.occupiedSeats || [];
        
        console.log('🎫 Session booking info:', {
          sessionId: session.id,
          movieTheaterSeats: session.movieTheater?.numberSeats,
          calculatedTotalSeats: totalSeats,
          availableSeats: numAvailableSeats,
          occupiedSeats: occupiedSeats.length,
          theaterInfo: session.movieTheater
        });
        
        // Générer la liste des sièges disponibles (tous les sièges moins les occupés)
        const availableSeats: number[] = [];
        for (let i = 1; i <= totalSeats; i++) {
          if (!occupiedSeats.includes(i)) {
            availableSeats.push(i);
          }
        }
        
        const bookingInfo: SessionBookingInfo = {
          sessionCinema: session,
          totalSeats: totalSeats,
          availableSeats: availableSeats,
          occupiedSeats: occupiedSeats,
          pricePerSeat: session.price || 12.50 // Prix par défaut
        };
        
        return bookingInfo;
      }),
      catchError((error: any) => {
        console.error('Erreur API getSessionBookingInfo:', error);
        return throwError(() => error);
      })
    );
  }

  createBooking(bookingData: CreateBookingDto): Observable<Booking> {
    return this.http.post<Booking>(`${this.apiUrl}/bookings`, bookingData);
  }

  getUserBookings(userId: number): Observable<Booking[]> {
    return this.http.get<any>(`${this.apiUrl}/bookings/user/${userId}`).pipe(
      map((response: any) => {
        console.log('User bookings response:', response);
        let bookings: Booking[] = [];

        // Si la réponse a un format avec 'data', on l'extrait
        if (response && typeof response === 'object' && 'data' in response) {
          bookings = response.data;
        } else if (Array.isArray(response)) {
          bookings = response;
        } else {
          // Si la réponse n'est pas un tableau, retourner un tableau vide
          bookings = [];
        }

        // S'assurer que bookings est bien un tableau
        if (!Array.isArray(bookings)) {
          bookings = [];
        }

        return bookings;
      }),
      catchError((error: any) => {
        console.error('Erreur API getUserBookings:', error);
        return throwError(() => error);
      })
    );
  }

  getBookingById(bookingId: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/bookings/${bookingId}`);
  }

  cancelBooking(bookingId: number): Observable<Booking> {
    return this.http.patch<Booking>(`${this.apiUrl}/bookings/${bookingId}/cancel`, {});
  }

  validateBooking(bookingId: number): Observable<Booking> {
    return this.http.patch<Booking>(`${this.apiUrl}/bookings/${bookingId}/validateBooking`, {});
  }
}