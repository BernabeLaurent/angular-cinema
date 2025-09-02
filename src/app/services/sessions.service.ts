import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
    return this.http.get<SessionCinema[]>(url);
  }

  getSessionById(sessionId: number): Observable<SessionCinema> {
    return this.http.get<SessionCinema>(`${this.apiUrl}/sessions-cinemas/${sessionId}`);
  }

  getSessionBookingInfo(sessionId: number): Observable<SessionBookingInfo> {
    return this.http.get<SessionBookingInfo>(`${this.apiUrl}/sessions-cinemas/${sessionId}/booking-info`);
  }

  createBooking(bookingData: CreateBookingDto): Observable<Booking> {
    return this.http.post<Booking>(`${this.apiUrl}/bookings`, bookingData);
  }

  getUserBookings(userId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/bookings/user/${userId}`);
  }

  getBookingById(bookingId: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/bookings/${bookingId}`);
  }

  cancelBooking(bookingId: number): Observable<Booking> {
    return this.http.patch<Booking>(`${this.apiUrl}/bookings/${bookingId}/cancel`, {});
  }

  validateBooking(bookingId: number): Observable<Booking> {
    return this.http.patch<Booking>(`${this.apiUrl}/bookings/${bookingId}/validate`, {});
  }
}