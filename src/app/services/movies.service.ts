import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movie } from '../models/session.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MoviesService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getMovieById(movieId: number): Observable<Movie> {
    return this.http.get<Movie>(`${this.apiUrl}/movies/search/${movieId}`);
  }

  searchMovies(query?: string, city?: string, theaterId?: number): Observable<any> {
    let url = `${this.apiUrl}/movies/search`;
    const params = [];
    if (query) params.push(`q=${encodeURIComponent(query)}`);
    if (city) params.push(`city=${encodeURIComponent(city)}`);
    if (theaterId) params.push(`theaterId=${theaterId}`);
    if (params.length) url += `?${params.join('&')}`;
    return this.http.get<any>(url);
  }

  getMovieReviews(movieId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/movies/reviews/${movieId}`);
  }

  createMovieReview(reviewData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/movies/create-review`, reviewData);
  }

  // Méthodes utilitaires pour les URLs d'images
  getImageUrl(path: string, size: string = 'w500'): string {
    if (!path) return '/assets/images/no-image.jpg';
    if (path.startsWith('http')) return path;
    
    // Si c'est un chemin TMDB (commence par /), utiliser TMDB
    if (path.startsWith('/') && path.length > 10) {
      return `https://image.tmdb.org/t/p/${size}${path}`;
    }
    
    // Sinon, utiliser le backend NestJS
    const backendUrl = path.startsWith('/') 
      ? `${this.apiUrl}${path}`  // Chemin absolu depuis la racine
      : `${this.apiUrl}/uploads/${path}`;  // Chemin relatif vers uploads
    
    return backendUrl;
  }

  getPosterUrl(posterPath?: string): string {
    return this.getImageUrl(posterPath || '', 'w500');
  }

  getBackdropUrl(backdropPath?: string): string {
    return this.getImageUrl(backdropPath || '', 'w1280');
  }

  getProfileUrl(profilePath?: string): string {
    return this.getImageUrl(profilePath || '', 'w185');
  }
}