import { Component, Inject } from '@angular/core';
import { DateFormatService } from '../../../services/date-format.service';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-movie-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './movie-details-dialog.component.html',
  styleUrls: ['./movie-details-dialog.component.scss']
})
export class MovieDetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<MovieDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { movie: any },
    private dateFormatService: DateFormatService
  ) {}

  onClose(): void {
    this.dialogRef.close();
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

  getImageUrl(path: string): string {
    if (!path) return '';
    // Si l'URL commence par http ou https, c'est une URL externe (ex: TMDb)
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    // Sinon, construire l'URL complète pour accéder aux images via le backend
    return `http://127.0.0.1:3001${path.replace('/root/nestjs-cinema', '')}`;
  }
}