import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
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
import { environment } from '../../../../environments/environment';
import { SessionsManagementDialogComponent } from '../sessions-management-dialog/sessions-management-dialog.component';
import { DateFormatService } from '../../../services/date-format.service';

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

interface SessionCinema {
  id: number;
  startTime: string;
  endTime: string;
  quality: string;
  codeLanguage: string;
  movieTheater: {
    id: number;
    theater: {
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
    };
    theaterId: number;
    numberSeats: number;
    numberSeatsDisabled: number;
    roomNumber: number;
  };
  movieTheaterId: number;
  movie: any;
  movieId: number;
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
    MatTooltipModule
  ],
  templateUrl: './movies-management.component.html',
  styleUrls: ['./movies-management.component.scss']
})
export class MoviesManagementComponent implements OnInit {
  movies: Movie[] = [];
  filteredMovies: Movie[] = [];
  sessions: Session[] = [];
  sessionsCinema: SessionCinema[] = [];
  displayedColumns: string[] = ['details', 'title', 'duration', 'releaseDate', 'sessions', 'actions'];
  loading = false;
  searchTerm = '';
  selectedTheaterId = '';
  theaters: any[] = [];

  constructor(
    private adminService: AdminService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private dateFormatService: DateFormatService
  ) {}

  ngOnInit(): void {
    this.loadMovies();
    this.loadSessions();
    this.loadTheaters();
  }

  loadMovies(): void {
    this.loading = true;
    
    this.adminService.getAllMovies().subscribe({
      next: (movies) => {
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
        // Fallback en cas d'erreur API
        this.simulateMovies();
        this.loading = false;
        this.showError('Erreur lors du chargement des films. Données de test utilisées.');
      }
    });
  }

  loadSessions(): void {
    
    this.adminService.getAllSessions().subscribe({
      next: (sessions) => {
        this.sessions = sessions;
      },
      error: (error) => {
        this.sessions = [];
      }
    });

    // Charger les sessions complètes avec cinémas
    this.loadSessionsCinema();
  }

  loadSessionsCinema(): void {
    // L'API sessions-cinemas retourne les sessions avec les informations complètes des cinémas
    this.http.get<{ data: SessionCinema[]; apiVersion: string }>(`${environment.apiUrl}/sessions-cinemas`).subscribe({
      next: (response) => {
        this.sessionsCinema = response.data;
        // Extraire les cinémas uniques des sessions
        this.extractTheatersFromSessions();
      },
      error: (error) => {
        this.sessionsCinema = [];
      }
    });
  }

  loadTheaters(): void {
    // On charge les cinémas depuis l'API
    this.adminService.getTheaters().subscribe({
      next: (theaters) => {
        this.theaters = theaters;
      },
      error: (error) => {
        // En cas d'erreur, on utilise les cinémas extraits des sessions
        this.theaters = [];
      }
    });
  }

  private extractTheatersFromSessions(): void {
    // Extraire les cinémas uniques des sessions si on n'a pas les cinémas depuis l'API
    if (this.theaters.length === 0 && this.sessionsCinema.length > 0) {
      const theaterMap = new Map();
      this.sessionsCinema.forEach(session => {
        if (session.movieTheater?.theater) {
          const theater = session.movieTheater.theater;
          theaterMap.set(theater.id, theater);
        }
      });
      this.theaters = Array.from(theaterMap.values());
    }
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
        title: 'Dune: Deuxième Partie',
        duration: 148,
        releaseDate: '2021-12-17',
        posterUrl: 'https://example.com/dune-poster.jpg',
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

    // Filtrer les données pour ne garder que les champs acceptés par l'API
    const filteredData: any = {};

    // Combiner date et heure si nécessaire
    if (sessionData.date && sessionData.startTime) {
      const date = new Date(sessionData.date);
      const [hours, minutes] = sessionData.startTime.split(':');
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      filteredData.startTime = date.toISOString();
    } else if (sessionData.startTime) {
      filteredData.startTime = sessionData.startTime;
    }

    // Ajouter les autres champs acceptés
    if (sessionData.endTime) filteredData.endTime = sessionData.endTime;
    if (sessionData.quality) filteredData.quality = sessionData.quality;
    if (sessionData.language) filteredData.codeLanguage = sessionData.language;
    if (sessionData.theaterId) filteredData.theaterId = sessionData.theaterId;
    if (sessionData.roomId) filteredData.movieTheaterId = sessionData.roomId;

    // Ajouter l'ID du film (nécessaire)
    filteredData.movieId = movieId;


    this.adminService.createSession(filteredData).subscribe({
      next: (response) => {
        this.showSuccess('Session créée avec succès');

        // Recharger les sessions ET les films pour mettre à jour les compteurs
        this.loadSessions();
        this.loadMovies();
      },
      error: (error) => {
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

  openSessionsManagementDialog(movie: Movie): void {
    const dialogRef = this.dialog.open(SessionsManagementDialogComponent, {
      width: '1000px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'sessions-management-dialog',
      data: { movie: movie }
    });

    dialogRef.afterClosed().subscribe(() => {
      // Refresh movies list to update session counts
      this.loadMovies();
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

    // Filtrer par cinéma si sélectionné
    if (this.selectedTheaterId) {
      this.filterMoviesByTheater();
      return;
    }

    // Sinon, on affiche tous les films
    this.filteredMovies = [...this.movies];
  }

  filterMoviesByTheater(): void {
    // Obtenir les IDs des films qui ont des sessions dans le cinéma sélectionné
    const movieIdsInTheater = new Set<number>();
    
    this.sessionsCinema.forEach(session => {
      if (session.movieTheater?.theater?.id === parseInt(this.selectedTheaterId)) {
        movieIdsInTheater.add(session.movieId);
      }
    });

    // Filtrer les films
    this.filteredMovies = this.movies.filter(movie => movieIdsInTheater.has(movie.id));
  }

  searchMovies(): void {
    if (!this.searchTerm.trim()) {
      this.loadMovies();
      return;
    }

    this.loading = true;

    // Appel API de recherche avec le terme exact
    this.adminService.searchMovies(this.searchTerm.trim()).subscribe({
      next: (movies) => {
        
        // Note: On n'affiche pas de message d'erreur si aucun film n'est trouvé
        // car c'est un cas normal de recherche
        
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
        this.movies = [];
        this.filteredMovies = [];
        this.loading = false;
        if (error.status === 500) {
          this.showError('Erreur serveur lors de la recherche. Veuillez réessayer plus tard.');
        } else {
          this.showError('Erreur lors de la recherche des films');
        }
      }
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedTheaterId = '';
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
    return this.dateFormatService.formatDate(date);
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