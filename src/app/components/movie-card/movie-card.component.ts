import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  onViewDetails() {
    console.log('View details for:', this.movie.title);
  }

  onBookTicket() {
    console.log('Book ticket for:', this.movie.title);
  }
}