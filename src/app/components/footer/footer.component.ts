import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    RouterLink
  ],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  
  socialLinks = [
    { name: 'Facebook', icon: 'share', url: '#' },
    { name: 'Twitter', icon: 'chat', url: '#' },
    { name: 'Instagram', icon: 'photo_camera', url: '#' },
    { name: 'YouTube', icon: 'play_circle_outline', url: '#' }
  ];

  quickLinks = [
    { name: 'Films à l\'affiche', route: '/movies' },
    { name: 'Mes réservations', route: '/my-bookings' }
  ];

  helpLinks = [
    { name: 'Centre d\'aide', route: '/help' },
    { name: 'Contact', route: '/contact' },
    { name: 'Conditions d\'utilisation', route: '/terms' },
    { name: 'Politique de confidentialité', route: '/privacy' }
  ];
}