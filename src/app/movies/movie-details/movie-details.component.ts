import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MoviesService } from '../../services/movies.service';
import { AuthService } from '../../auth/auth.service';
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
    <div class="movie-details-container" *ngIf="movie">
      <!-- Hero Section avec backdrop -->
      <div class="movie-hero" [style.background-image]="'url(' + getBackdropUrl() + ')'">
        <div class="hero-overlay">
          <div class="hero-content">
            <div class="movie-poster">
              <img [src]="getPosterUrl()" [alt]="movie.title" class="poster-image">
            </div>
            <div class="movie-info">
              <h1 class="movie-title">{{ movie.title }}</h1>
              <p class="original-title" *ngIf="movie.originalTitle && movie.originalTitle !== movie.title">
                Titre original : {{ movie.originalTitle }}
              </p>
              <div class="movie-meta">
                <mat-chip-listbox>
                  <mat-chip *ngIf="movie.runtime">{{ movie.runtime }}min</mat-chip>
                  <mat-chip *ngIf="movie.releaseDate">{{ formatYear(movie.releaseDate) }}</mat-chip>
                  <mat-chip *ngIf="movie.originalLanguage">{{ movie.originalLanguage.toUpperCase() }}</mat-chip>
                  <mat-chip *ngIf="movie.minimumAge" class="age-rating">{{ movie.minimumAge }}+</mat-chip>
                </mat-chip-listbox>
              </div>
              <div class="ratings" *ngIf="movie.averageRating || movie.averageRatingExterne">
                <div class="rating-item" *ngIf="movie.averageRating">
                  <mat-icon>star</mat-icon>
                  <span>{{ movie.averageRating }}/10</span>
                  <small>Note utilisateurs</small>
                </div>
                <div class="rating-item" *ngIf="movie.averageRatingExterne">
                  <mat-icon>movie</mat-icon>
                  <span>{{ movie.averageRatingExterne }}/10</span>
                  <small>TMDb</small>
                </div>
              </div>
              <p class="tagline" *ngIf="movie.tagline">{{ movie.tagline }}</p>
              <div class="action-buttons">
                <button mat-raised-button color="primary" (click)="bookMovie()">
                  <mat-icon>event_seat</mat-icon>
                  Réserver des places
                </button>
                <button mat-button (click)="toggleFavorite()" *ngIf="isLoggedIn">
                  <mat-icon>{{ movie.isFavorite ? 'favorite' : 'favorite_border' }}</mat-icon>
                  {{ movie.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Synopsis -->
      <mat-card class="synopsis-card" *ngIf="movie.description">
        <mat-card-header>
          <mat-card-title>Synopsis</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p class="synopsis">{{ movie.description }}</p>
          <p class="original-synopsis" *ngIf="movie.originalDescription && movie.originalDescription !== movie.description">
            <strong>Synopsis original :</strong><br>
            {{ movie.originalDescription }}
          </p>
        </mat-card-content>
      </mat-card>

      <!-- Casting -->
      <mat-card class="cast-card" *ngIf="movie.cast && movie.cast.length > 0">
        <mat-card-header>
          <mat-card-title>Distribution</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="cast-grid">
            <div *ngFor="let actor of getMainCast()" class="cast-member" (click)="showActorDetails(actor)">
              <div class="actor-photo">
                <img [src]="getActorPhotoUrl(actor)" [alt]="actor.name" class="actor-image">
                <div class="actor-overlay" *ngIf="!actor.profilePath">
                  <mat-icon>person</mat-icon>
                </div>
              </div>
              <div class="actor-info">
                <h4 class="actor-name">{{ actor.name }}</h4>
                <p class="character-name" *ngIf="actor.character">{{ actor.character }}</p>
              </div>
            </div>
          </div>
          <button mat-button *ngIf="movie.cast.length > 12" (click)="showFullCast()">
            Voir toute la distribution ({{ movie.cast.length }} membres)
          </button>
        </mat-card-content>
      </mat-card>

      <!-- Avis utilisateurs -->
      <mat-card class="reviews-card">
        <mat-card-header>
          <mat-card-title>Avis des spectateurs</mat-card-title>
          <button mat-icon-button (click)="loadReviews()" *ngIf="!reviewsLoaded">
            <mat-icon>refresh</mat-icon>
          </button>
        </mat-card-header>
        <mat-card-content>
          <div *ngIf="!reviewsLoaded" class="reviews-placeholder">
            <p>Cliquez pour charger les avis</p>
          </div>
          <div *ngIf="reviewsLoaded && reviews.length === 0" class="no-reviews">
            <p>Aucun avis pour le moment. Soyez le premier à donner votre opinion !</p>
          </div>
          <div *ngIf="reviewsLoaded && reviews.length > 0" class="reviews-list">
            <div *ngFor="let review of reviews.slice(0, 3)" class="review-item">
              <div class="review-header">
                <span class="reviewer-name">{{ review.user?.email || 'Utilisateur' }}</span>
                <div class="review-rating">
                  <mat-icon>star</mat-icon>
                  <span>{{ review.rating }}/10</span>
                </div>
              </div>
              <p class="review-comment">{{ review.comment }}</p>
              <small class="review-date">{{ formatDate(review.createDate) }}</small>
            </div>
          </div>
          <div class="review-actions" *ngIf="isLoggedIn">
            <button mat-raised-button color="accent" (click)="writeReview()">
              <mat-icon>rate_review</mat-icon>
              Écrire un avis
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>

    <div class="loading" *ngIf="loading">
      <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      <p>Chargement des détails du film...</p>
    </div>

    <div class="error" *ngIf="error">
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
    .movie-details-container {
      min-height: 100vh;
    }

    .movie-hero {
      height: 70vh;
      background-size: cover;
      background-position: center;
      position: relative;
      display: flex;
      align-items: center;
    }

    .hero-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        45deg,
        rgba(0, 0, 0, 0.8) 0%,
        rgba(0, 0, 0, 0.6) 50%,
        rgba(0, 0, 0, 0.4) 100%
      );
      display: flex;
      align-items: center;
    }

    .hero-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      display: flex;
      gap: 40px;
      color: white;
    }

    .movie-poster {
      flex-shrink: 0;
    }

    .poster-image {
      width: 300px;
      height: 450px;
      object-fit: cover;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    }

    .movie-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .movie-title {
      font-size: 3rem;
      font-weight: bold;
      margin: 0;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    }

    .original-title {
      font-style: italic;
      opacity: 0.8;
      margin: 0;
    }

    .movie-meta mat-chip {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }

    .age-rating {
      background: #f44336 !important;
    }

    .ratings {
      display: flex;
      gap: 30px;
    }

    .rating-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .rating-item mat-icon {
      color: #ffc107;
    }

    .rating-item span {
      font-size: 18px;
      font-weight: bold;
    }

    .rating-item small {
      opacity: 0.7;
      margin-left: 5px;
    }

    .tagline {
      font-size: 1.2rem;
      font-style: italic;
      opacity: 0.9;
      margin: 10px 0;
    }

    .action-buttons {
      display: flex;
      gap: 15px;
      margin-top: 20px;
    }

    .synopsis-card, .cast-card, .reviews-card {
      margin: 20px;
      max-width: 1200px;
      margin-left: auto;
      margin-right: auto;
    }

    .synopsis {
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 15px;
    }

    .original-synopsis {
      font-style: italic;
      opacity: 0.8;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #eee;
    }

    .cast-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }

    .cast-member {
      text-align: center;
      cursor: pointer;
      transition: transform 0.3s;
    }

    .cast-member:hover {
      transform: translateY(-5px);
    }

    .actor-photo {
      position: relative;
      margin-bottom: 10px;
    }

    .actor-image {
      width: 120px;
      height: 180px;
      object-fit: cover;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .actor-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: #f5f5f5;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .actor-overlay mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #ccc;
    }

    .actor-info {
      padding: 0 5px;
    }

    .actor-name {
      font-size: 14px;
      font-weight: bold;
      margin: 5px 0;
      color: #333;
    }

    .character-name {
      font-size: 12px;
      color: #666;
      margin: 0;
    }

    .reviews-placeholder, .no-reviews {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .reviews-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .review-item {
      padding: 15px;
      border: 1px solid #eee;
      border-radius: 8px;
      background: #fafafa;
    }

    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .reviewer-name {
      font-weight: bold;
      color: #333;
    }

    .review-rating {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .review-rating mat-icon {
      color: #ffc107;
      font-size: 18px;
    }

    .review-comment {
      margin: 10px 0;
      line-height: 1.5;
    }

    .review-date {
      color: #666;
      font-size: 12px;
    }

    .review-actions {
      margin-top: 20px;
      text-align: center;
    }

    .loading, .error {
      padding: 40px;
      text-align: center;
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

    @media (max-width: 768px) {
      .hero-content {
        flex-direction: column;
        text-align: center;
      }
      
      .poster-image {
        width: 200px;
        height: 300px;
      }
      
      .movie-title {
        font-size: 2rem;
      }
      
      .cast-grid {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 15px;
      }
      
      .actor-image {
        width: 100px;
        height: 150px;
      }
    }
  `]
})
export class MovieDetailsComponent implements OnInit {
  movie: Movie | null = null;
  movieId: number | null = null;
  reviews: any[] = [];
  reviewsLoaded = false;
  loading = true;
  error: string | null = null;
  isLoggedIn = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private moviesService: MoviesService,
    private authService: AuthService,
    private dialog: MatDialog
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
    return this.moviesService.getPosterUrl(this.movie?.posterPath || this.movie?.poster);
  }

  getBackdropUrl(): string {
    return this.moviesService.getBackdropUrl(this.movie?.backdropPath);
  }

  getActorPhotoUrl(actor: Cast): string {
    return this.moviesService.getProfileUrl(actor.profilePath);
  }

  getMainCast(): Cast[] {
    if (!this.movie?.cast) return [];
    return this.movie.cast
      .filter(actor => !actor.adult)
      .sort((a, b) => a.order - b.order)
      .slice(0, 12);
  }

  formatYear(dateString: string): string {
    return new Date(dateString).getFullYear().toString();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  bookMovie() {
    this.router.navigate(['/booking'], { queryParams: { movieId: this.movieId } });
  }

  toggleFavorite() {
    if (!this.movie) return;
    // TODO: Implémenter la logique de favoris
    this.movie.isFavorite = !this.movie.isFavorite;
  }

  showActorDetails(actor: Cast) {
    // TODO: Implémenter la modale de détails de l'acteur
    console.log('Détails de l\'acteur:', actor);
  }

  showFullCast() {
    // TODO: Implémenter la modale avec tout le casting
    console.log('Afficher tout le casting');
  }

  writeReview() {
    // TODO: Implémenter la modale d'écriture d'avis
    console.log('Écrire un avis');
  }

  retry() {
    this.loadMovieDetails();
  }

  goBack() {
    this.router.navigate(['/booking']);
  }
}