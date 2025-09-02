import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss']
})
export class HeroSectionComponent {
  featuredMovie = {
    title: 'SPIDER-MAN: NO WAY HOME',
    subtitle: 'L\'aventure ultime de Spider-Man',
    description: 'Pour la première fois dans l\'histoire cinématographique de Spider-Man, notre héros, sympathique et proche de nous, est démasqué et ne peut désormais plus séparer sa vie normale de ses lourdes responsabilités de super-héros.',
    duration: '2h28',
    genre: 'Action, Aventure, Science-Fiction',
    rating: '4.5',
    backgroundImage: 'assets/images/spiderman-hero-bg.jpg',
    trailerUrl: '#'
  };

  onPlayTrailer() {
    console.log('Play trailer for:', this.featuredMovie.title);
  }

  onMoreInfo() {
    console.log('More info for:', this.featuredMovie.title);
  }
}