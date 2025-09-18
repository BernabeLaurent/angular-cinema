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

  // Méthodes utilitaires pour les URLs d'images - EXCLUSIVEMENT backend NestJS
  getImageUrl(path: string): string {
    if (!path) return '/assets/images/no-image.svg';

    // Si c'est déjà une URL complète, la retourner
    if (path.startsWith('http')) return path;

    // TOUS les chemins utilisent maintenant le backend NestJS
    let backendUrl: string;

    if (path.startsWith('/')) {
      // Cas spécial : chemin absolu du système de fichiers depuis NestJS
      // Ex: /root/Nestjs-cinema/uploads/posters/image.jpg -> /uploads/posters/image.jpg
      if (path.includes('/uploads/')) {
        const uploadsIndex = path.indexOf('/uploads/');
        const relativePath = path.substring(uploadsIndex);
        backendUrl = `${this.apiUrl}${relativePath}`;
      } else {
        // Chemin absolu depuis la racine de l'API (ex: /uploads/posters/image.jpg)
        backendUrl = `${this.apiUrl}${path}`;
      }
    } else {
      // Chemin relatif, on assume que c'est dans le dossier uploads
      backendUrl = `${this.apiUrl}/uploads/${path}`;
    }

    console.log('🖼️ Image URL generated:', { originalPath: path, finalUrl: backendUrl });
    return backendUrl;
  }

  getPosterUrl(posterPath?: string): string {
    return this.getImageUrl(posterPath || '');
  }

  getBackdropUrl(backdropPath?: string): string {
    console.log('🎯 MoviesService.getBackdropUrl input:', backdropPath);
    const result = this.getImageUrl(backdropPath || '');
    console.log('🎯 MoviesService.getBackdropUrl output:', result);
    return result;
  }

  getProfileUrl(profilePath?: string): string {
    return this.getImageUrl(profilePath || '');
  }
}