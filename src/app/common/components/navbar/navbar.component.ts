import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { LoginComponent } from '../../../auth/login/login.component';
import { RegisterComponent } from '../../../auth/register/register.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatDialogModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  isLoggedIn = false;
  isUserMenuOpen = false;

  @ViewChild('userMenuButton') userMenuButton!: ElementRef<HTMLButtonElement>;

  constructor(private dialog: MatDialog) {}

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeUserMenu() {
    this.isUserMenuOpen = false;
  }

  openSearchModal() {
  }

  openLoginDialog() {
    this.dialog.open(LoginComponent, {
      width: '400px',
      panelClass: 'custom-dialog-container'
    });
  }

  openRegisterDialog() {
    this.dialog.open(RegisterComponent, {
      width: '450px',
      panelClass: 'custom-dialog-container'
    });
  }
}
