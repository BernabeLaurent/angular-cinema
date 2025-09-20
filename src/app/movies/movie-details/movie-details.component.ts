import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MoviesService } from '../../services/movies.service';
import { AuthService } from '../../auth/auth.service';
import { DateFormatService } from '../../services/date-format.service';
import { Movie, Cast } from '../../models/session.model';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <!-- Page détails du film - AVEC VRAIES DONNÉES -->
    <div style="max-width: 1200px; margin: 0 auto; padding: 100px 20px 40px 20px; min-height: 100vh; background: white;">
      <!-- Header avec bouton fermer -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
        <h1 style="font-size: 2rem; font-weight: bold; margin: 0; color: #333;">
          Détails du film
        </h1>
        <button mat-icon-button (click)="goBack()" class="close-btn" title="Fermer">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="movie-header">
        <div class="movie-poster">
          <img [src]="getMoviePosterSafely()" [alt]="movie?.data?.title || 'Film'"
               class="poster-image">
        </div>
        <div class="movie-info">
          <h1 class="movie-title">
            {{ movie?.data?.title || 'Chargement...' }}
          </h1>
          <p *ngIf="movie?.data?.originalTitle && movie.data.originalTitle !== movie.data.title"
             class="original-title">
            {{ movie.data.originalTitle }}
          </p>
          <div class="movie-meta">
            <span *ngIf="movie?.data?.runtime">{{ movie.data.runtime }}min</span>
            <span *ngIf="movie?.data?.releaseDate"> • Sorti en {{ formatYear(movie.data.releaseDate) }}</span>
            <span *ngIf="movie?.data?.originalLanguage"> • {{ movie.data.originalLanguage.toUpperCase() }}</span>
          </div>
          <p *ngIf="movie?.data?.description"
             class="movie-description">
            {{ movie.data.description }}
          </p>
          <div class="action-section">
            <button mat-raised-button color="primary"
                    class="reserve-btn"
                    (click)="bookMovie()">
              <mat-icon>event_seat</mat-icon>
              RÉSERVER
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="loading-state" *ngIf="loading">
      <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      <p>Chargement des détails du film...</p>
    </div>

    <div class="error-state" *ngIf="error">
      <mat-card>
        <mat-card-content>
          <div class="error-content">
            <mat-icon color="warn">error</mat-icon>
            <h3>Erreur de chargement</h3>
            <p>{{ error }}</p>
            <button mat-button (click)="retry()">Réessayer</button>
            <button mat-button (click)="goBack()">Retour</button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .movie-details-simple {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      min-height: 100vh;
    }

    .movie-header {
      display: flex;
      gap: 40px;
      margin-bottom: 40px;
    }

    .movie-poster {
      flex-shrink: 0;
    }

    .poster-image {
      width: 300px;
      height: 450px;
      object-fit: cover;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    }

    .movie-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .movie-title {
      font-size: 3rem;
      font-weight: bold;
      margin: 0;
      color: #333;
      line-height: 1.2;
    }

    .original-title {
      font-style: italic;
      opacity: 0.7;
      margin: 0;
      font-size: 1.2rem;
      color: #666;
    }

    .movie-meta {
      font-size: 1.1rem;
      color: #666;
      font-weight: 500;
    }

    .movie-description {
      font-size: 1.1rem;
      line-height: 1.6;
      color: #555;
      margin: 20px 0;
      max-width: 600px;
    }

    .action-section {
      margin-top: 30px;
    }

    .reserve-btn {
      padding: 12px 30px;
      font-size: 1.1rem;
      font-weight: bold;
      height: 50px;
    }

    .loading-state, .error-state {
      padding: 40px;
      text-align: center;
      max-width: 600px;
      margin: 0 auto;
    }

    .error-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
    }

    .error-content mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    .close-btn {
      background-color: #f5f5f5;
      border-radius: 50%;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .close-btn:hover {
      background-color: #e0e0e0;
      transform: scale(1.05);
    }

    .close-btn mat-icon {
      color: #666;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    @media (max-width: 768px) {
      .movie-details-simple {
        padding: 80px 16px 20px 16px;
      }

      .movie-header {
        flex-direction: column;
        text-align: center;
        gap: 24px;
        align-items: center;
      }

      .movie-poster {
        width: 100%;
        display: flex;
        justify-content: center;
      }

      .poster-image {
        width: 280px;
        height: 420px;
        margin: 0 auto;
      }

      .movie-info {
        width: 100%;
        text-align: center;
        gap: 16px;
      }

      .movie-title {
        font-size: 2.2rem;
        text-align: center;
      }

      .original-title {
        text-align: center;
      }

      .movie-meta {
        text-align: center;
        font-size: 1rem;
      }

      .movie-description {
        text-align: left;
        max-width: 100%;
        font-size: 1rem;
        line-height: 1.5;
      }

      .action-section {
        margin-top: 24px;
        text-align: center;
      }

      .reserve-btn {
        width: 100%;
        max-width: 300px;
        padding: 14px 24px;
        font-size: 1rem;
        height: 48px;
      }
    }

    @media (max-width: 480px) {
      .movie-details-simple {
        padding: 70px 12px 20px 12px;
      }

      .poster-image {
        width: 240px;
        height: 360px;
      }

      .movie-title {
        font-size: 1.8rem;
      }

      .movie-description {
        font-size: 0.95rem;
      }

      .reserve-btn {
        font-size: 0.9rem;
        height: 44px;
      }
    }
  `]
})
export class MovieDetailsComponent implements OnInit {
  movie: any = null;
  movieId: number | null = null;
  reviews: any[] = [];
  reviewsLoaded = false;
  loading = true;
  error: string | null = null;
  isLoggedIn = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private moviesService: MoviesService,
    private authService: AuthService,
    private dialog: MatDialog,
    private dateFormatService: DateFormatService
  ) {}

  ngOnInit() {
    this.movieId = Number(this.route.snapshot.paramMap.get('id'));
    this.isLoggedIn = this.authService.isLoggedIn();
    
    if (this.movieId) {
      this.loadMovieDetails();
    } else {
      this.error = 'ID de film invalide';
      this.loading = false;
    }
  }

  loadMovieDetails() {
    if (!this.movieId) return;

    this.loading = true;
    this.error = null;

    this.moviesService.getMovieById(this.movieId).subscribe({
      next: (movie) => {
        this.movie = movie;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des détails du film:', error);
        this.error = 'Impossible de charger les détails du film';
        this.loading = false;
      }
    });
  }

  loadReviews() {
    if (!this.movieId || this.reviewsLoaded) return;

    this.moviesService.getMovieReviews(this.movieId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.reviewsLoaded = true;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des avis:', error);
        this.reviewsLoaded = true; // Pour éviter les tentatives répétées
      }
    });
  }

  getPosterUrl(): string {
    return this.moviesService.getPosterUrl(this.movie?.data?.posterPath || this.movie?.data?.poster);
  }

  getMoviePosterSafely(): string {
    if (!this.movie?.data) {
      return 'assets/images/placeholder-movie.svg';
    }
    return this.getPosterUrl();
  }

  getBackdropUrl(): string {
    return this.moviesService.getBackdropUrl(this.movie?.data?.backdropPath);
  }

  getActorPhotoUrl(actor: any): string {
    return this.moviesService.getProfileUrl(actor.profilePath);
  }

  getMainCast(): any[] {
    if (!this.movie?.data?.cast) return [];
    return this.movie.data.cast
      .filter((actor: any) => !actor.adult)
      .sort((a: any, b: any) => a.order - b.order)
      .slice(0, 12);
  }

  formatYear(dateString: string): string {
    return new Date(dateString).getFullYear().toString();
  }

  formatDate(dateString: string): string {
    return this.dateFormatService.formatDate(dateString);
  }

  bookMovie() {
    this.router.navigate(['/booking'], { queryParams: { movieId: this.movieId } });
  }

  toggleFavorite() {
    if (!this.movie?.data) return;
    // TODO: Implémenter la logique de favoris
    this.movie.data.isFavorite = !this.movie.data.isFavorite;
  }

  showActorDetails(actor: any) {
    // TODO: Implémenter la modale de détails de l'acteur
  }

  showFullCast() {
    // TODO: Implémenter la modale avec tout le casting
  }

  writeReview() {
    // TODO: Implémenter la modale d'écriture d'avis
  }

  retry() {
    this.loadMovieDetails();
  }

  goBack() {
    // Essayer d'utiliser l'historique du navigateur en premier
    if (window.history.length > 1) {
      this.location.back();
    } else {
      // Fallback si pas d'historique : aller à la page d'accueil
      this.router.navigate(['/']);
    }
  }
}