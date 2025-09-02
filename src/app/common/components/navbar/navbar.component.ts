import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { LoginComponent } from '../../../auth/login/login.component';
import { RegisterComponent } from '../../../auth/register/register.component';
import { AuthService } from '../../../auth/auth.service';
import { UserRoleService } from '../../../services/user-role.service';
import { User } from '../../../auth/user.interface';
import { RoleUser } from '../../../users/enums/roles-users.enum';

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
    MatDialogModule,
    MatMenuModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  isUserMenuOpen = false;
  
  // Observables pour la réactivité
  isLoggedIn$: Observable<boolean>;
  currentUser$: Observable<User | null>;
  isAdmin$: Observable<boolean>;
  userInitials$: Observable<string>;

  @ViewChild('userMenuButton') userMenuButton!: ElementRef<HTMLButtonElement>;

  constructor(
    private dialog: MatDialog, 
    private authService: AuthService,
    private userRoleService: UserRoleService
  ) {
    this.isLoggedIn$ = this.userRoleService.isLoggedIn();
    this.currentUser$ = this.userRoleService.getCurrentUser();
    this.isAdmin$ = this.userRoleService.isAdmin();
    this.userInitials$ = this.userRoleService.getUserInitials();
  }

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

  logout() {
    this.authService.logout();
    this.closeUserMenu();
    window.location.reload(); // Refresh to update navbar state
  }

  getRoleDisplayName(role: RoleUser): string {
    return this.userRoleService.getRoleDisplayName(role);
  }
}
