import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateFormatService {
  
  /**
   * Formate une date au format DD/MM/yyyy
   */
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Date invalide';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  }

  /**
   * Formate une date et heure au format DD/MM/yyyy HH:mm
   */
  formatDateTime(dateTimeString: string): string {
    if (!dateTimeString) return 'N/A';
    
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return 'Date invalide';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  /**
   * Formate une date pour l'affichage complet (ex: "Mercredi 11 septembre 2025")
   */
  formatFullDate(dateString: string): string {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Date invalide';
    
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  /**
   * Formate seulement l'heure au format HH:mm
   */
  formatTime(dateTimeString: string): string {
    if (!dateTimeString) return 'N/A';
    
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return 'Heure invalide';
    
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes}`;
  }
}