import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface Movie {
  id: number;
  title: string;
  poster: string;
  genre: string;
  duration: string;
  rating: number;
  releaseDate: string;
  description?: string;
}

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.scss']
})
export class MovieCardComponent {
  @Input() movie!: Movie;
  private imageState: 'loading' | 'loaded' | 'error' = 'loading';

  constructor(private router: Router) {}

  onViewDetails() {
    this.router.navigate(['/movies', this.movie.id]);
  }

  onBookTicket() {
    this.router.navigate(['/booking'], { queryParams: { movieId: this.movie.id } });
  }

  onImageError(event: any) {
    // Éviter les erreurs multiples ou après un chargement réussi
    if (this.imageState === 'loaded' || this.imageState === 'error') {
      console.log(`🔄 Ignoring error event for ${this.movie.title} (state: ${this.imageState})`);
      return;
    }
    
    this.imageState = 'error';
    console.error('❌ Image failed to load for:', this.movie.title);
    console.error('Failed URL:', event.target.src);
    
    // Ne pas remplacer si c'est déjà un placeholder SVG
    if (event.target.src.startsWith('data:image/svg+xml')) {
      console.log('🔄 Already using placeholder, skipping replacement');
      return;
    }
    
    // Attendre un peu avant de remplacer pour éviter les conflits
    setTimeout(() => {
      if (this.imageState === 'error') {
        const svgContent = `<svg width="300" height="450" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#333"/>
          <text x="150" y="225" text-anchor="middle" fill="#888" font-family="Arial, sans-serif" font-size="16">
            IMAGE NON TROUVÉE
          </text>
        </svg>`;
        event.target.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
      }
    }, 100);
  }

  onImageLoad(event: any) {
    this.imageState = 'loaded';
    console.log('✅ Image loaded successfully for:', this.movie.title);
    console.log('Loaded URL:', event.target.src);
  }
}