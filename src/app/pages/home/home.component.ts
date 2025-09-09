import { Component } from '@angular/core';
import { HeroSectionComponent } from '../../components/hero-section/hero-section.component';
import { MoviesSectionComponent } from '../../components/movies-section/movies-section.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroSectionComponent, MoviesSectionComponent],
  template: `
    <app-hero-section></app-hero-section>
    <app-movies-section></app-movies-section>
  `,
  styleUrls: []
})
export class HomeComponent {}