import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';

import { AdminService } from '../../../services/admin.service';
import { SessionFormDialogComponent } from '../session-form-dialog/session-form-dialog.component';
import { MovieDetailsDialogComponent } from '../movie-details-dialog/movie-details-dialog.component';

interface Movie {
  id: number;
  title: string;
  duration?: number | null;
  releaseDate: string;
  posterUrl?: string;
  description?: string;
  director?: string;
  actors?: string[];
  rating?: string;
}

interface Session {
  id: number;
  movieId: number;
  theaterId: number;
  date: string;
  startTime: string;
  endTime: string;
  quality: 'HD' | '4K' | 'IMAX';
  price: number;
  availableSeats: number;
  totalSeats: number;
}

@Component({
  selector: 'app-movies-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatTooltipModule,
    MovieDetailsDialogComponent
  ],
  templateUrl: './movies-management.component.html',
  styleUrls: ['./movies-management.component.scss']
})
export class MoviesManagementComponent implements OnInit {
  movies: Movie[] = [];
  filteredMovies: Movie[] = [];
  sessions: Session[] = [];
  displayedColumns: string[] = ['details', 'title', 'duration', 'releaseDate', 'sessions', 'actions'];
  loading = false;
  searchTerm = '';

  constructor(
    private adminService: AdminService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadMovies();
    this.loadSessions();
  }

  loadMovies(): void {
    console.log('Loading movies from API...');
    this.loading = true;
    
    this.adminService.getAllMovies().subscribe({
      next: (movies) => {
        console.log('Movies loaded successfully:', movies);
        // Trier les films : ceux avec séances en premier
        this.movies = movies.sort((a, b) => {
          if (a.availableSessions > 0 && b.availableSessions === 0) return -1;
          if (a.availableSessions === 0 && b.availableSessions > 0) return 1;
          return b.availableSessions - a.availableSessions; // Plus de séances en premier
        });
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading movies:', error);
        // Fallback en cas d'erreur API
        this.simulateMovies();
        this.loading = false;
        this.showError('Erreur lors du chargement des films. Données de test utilisées.');
      }
    });
  }

  loadSessions(): void {
    console.log('Loading sessions from API...');
    
    this.adminService.getAllSessions().subscribe({
      next: (sessions) => {
        console.log('Sessions loaded successfully:', sessions);
        this.sessions = sessions;
      },
      error: (error) => {
        console.error('Error loading sessions:', error);
        // En cas d'erreur, on continue sans les sessions
        this.sessions = [];
      }
    });
  }

  private simulateMovies(): void {
    // Simulation temporaire - à remplacer par un vrai appel API
    this.movies = [
      {
        id: 1,
        title: 'Dune',
        duration: 155,
        releaseDate: '2021-10-22',
        posterUrl: 'https://example.com/dune-poster.jpg',
        description: 'Un voyage épique à travers les dunes d\'Arrakis...',
        director: 'Denis Villeneuve',
        actors: ['Timothée Chalamet', 'Rebecca Ferguson', 'Oscar Isaac'],
        rating: 'PG-13'
      },
      {
        id: 2,
        title: 'Spider-Man: No Way Home',
        duration: 148,
        releaseDate: '2021-12-17',
        posterUrl: 'https://example.com/spiderman-poster.jpg',
        description: 'Peter Parker affronte des ennemis du multivers...',
        director: 'Jon Watts',
        actors: ['Tom Holland', 'Zendaya', 'Benedict Cumberbatch'],
        rating: 'PG-13'
      },
      {
        id: 3,
        title: 'The Batman',
        duration: 176,
        releaseDate: '2022-03-04',
        posterUrl: 'https://example.com/batman-poster.jpg',
        description: 'Une nouvelle incarnation sombre du Chevalier Noir...',
        director: 'Matt Reeves',
        actors: ['Robert Pattinson', 'Zoë Kravitz', 'Paul Dano'],
        rating: 'PG-13'
      }
    ];
    this.applyFilters();
  }

  openSessionDialog(movie: Movie): void {
    const dialogRef = this.dialog.open(SessionFormDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      panelClass: 'session-form-dialog',
      data: { movie: movie, mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createSession(movie.id, result);
      }
    });
  }

  createSession(movieId: number, sessionData: any): void {
    console.log('Creating session for movie:', movieId, sessionData);
    
    this.adminService.createSession(sessionData).subscribe({
      next: (response) => {
        console.log('Session created successfully:', response);
        this.showSuccess('Session créée avec succès');
        this.loadSessions();
      },
      error: (error) => {
        console.error('Error creating session:', error);
        this.showError('Erreur lors de la création de la session');
      }
    });
  }

  openMovieDetailsDialog(movie: Movie): void {
    this.dialog.open(MovieDetailsDialogComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: { movie: movie }
    });
  }

  getMovieSessions(movieId: number): Session[] {
    return this.sessions.filter(s => s.movieId === movieId);
  }

  applyFilters(): void {
    // Si on a un terme de recherche, on fait un appel API
    if (this.searchTerm.trim()) {
      this.searchMovies();
      return;
    }

    // Sinon, on affiche tous les films
    this.filteredMovies = [...this.movies];
  }

  searchMovies(): void {
    if (!this.searchTerm.trim()) {
      this.loadMovies();
      return;
    }

    console.log('Searching movies with term:', this.searchTerm);
    this.loading = true;

    // Appel API de recherche avec le terme exact
    this.adminService.searchMovies(this.searchTerm.trim()).subscribe({
      next: (movies) => {
        console.log('Search results:', movies);
        // Trier les films : ceux avec séances en premier
        this.movies = movies.sort((a, b) => {
          if (a.availableSessions > 0 && b.availableSessions === 0) return -1;
          if (a.availableSessions === 0 && b.availableSessions > 0) return 1;
          return b.availableSessions - a.availableSessions;
        });
        this.filteredMovies = this.movies;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error searching movies:', error);
        this.movies = [];
        this.filteredMovies = [];
        this.loading = false;
        this.showError('Erreur lors de la recherche des films');
      }
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    // Recharger tous les films quand on efface les filtres
    this.loadMovies();
  }

  formatDuration(minutes: number | null | undefined): string {
    if (!minutes || minutes === 0) {
      return 'N/A';
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 ? `${hours}h${remainingMinutes.toString().padStart(2, '0')}` : `${minutes}min`;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}