import {Component, OnInit, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatDialogRef} from '@angular/material/dialog';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatCardModule} from '@angular/material/card';
import {Router} from '@angular/router';
import {Subject, combineLatest} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {Movie, SessionCinema} from '../../../models/session.model';
import {SessionsService} from '../../../services/sessions.service';
import {MoviesService} from '../../../services/movies.service';

@Component({
  selector: 'app-search-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule
  ],
  templateUrl: './search-modal.component.html',
  styleUrls: ['./search-modal.component.scss']
})
export class SearchModalComponent implements OnInit, OnDestroy {
  searchQuery = '';
  isLoading = false;
  availableMovies: Movie[] = [];
  filteredMovies: Movie[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private dialogRef: MatDialogRef<SearchModalComponent>,
    private sessionsService: SessionsService,
    private moviesService: MoviesService,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.loadAvailableMovies();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAvailableMovies() {
    this.isLoading = true;

    // Récupérer toutes les séances de la semaine
    this.sessionsService.getSessionsByWeek()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (sessions: SessionCinema[]) => {
          // Extraire les films uniques des séances
          const uniqueMovieIds = [...new Set(sessions.map(session => session.movieId))];

          // Pour chaque film unique, récupérer les détails
          const movieRequests = uniqueMovieIds.map(id =>
            this.moviesService.getMovieById(id)
          );

          if (movieRequests.length > 0) {
            combineLatest(movieRequests)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (movies: any[]) => {
                  // Extraire les données des films depuis la structure API {data: Movie}
                  this.availableMovies = movies.map(movieWrapper => movieWrapper.data || movieWrapper);
                  this.filteredMovies = this.availableMovies;
                  this.isLoading = false;
                  console.log('Films disponibles pour recherche:', this.availableMovies.length);
                },
                error: (error) => {
                  console.error('Erreur lors du chargement des films:', error);
                  this.isLoading = false;
                }
              });
          } else {
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('Erreur lors du chargement des séances:', error);
          this.isLoading = false;
        }
      });
  }

  onSearchChange() {
    console.log('Recherche:', this.searchQuery);
    console.log('Films disponibles:', this.availableMovies.length);
    
    if (!this.searchQuery.trim()) {
      this.filteredMovies = this.availableMovies;
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredMovies = this.availableMovies.filter(movie =>
      movie.title?.toLowerCase().includes(query) ||
      movie.originalTitle?.toLowerCase().includes(query) ||
      movie.description?.toLowerCase().includes(query)
    );
    
    console.log('Films filtrés:', this.filteredMovies.length);
  }

  selectMovie(movie: Movie) {
    this.dialogRef.close();
    this.router.navigate(['/movies', movie.id]);
  }

  closeModal() {
    this.dialogRef.close();
  }

  getPosterUrl(movie: Movie): string {
    return this.moviesService.getPosterUrl(movie.posterPath);
  }

  getMovieYear(movie: Movie): string {
    if (movie.releaseDate) {
      return new Date(movie.releaseDate).getFullYear().toString();
    }
    return '';
  }

  getRatingStars(rating?: number): string {
    if (!rating) return '';
    const stars = Math.round(rating / 2); // Convert from 10 to 5 star scale
    return '★'.repeat(stars) + '☆'.repeat(5 - stars);
  }
}
