import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { Observable } from 'rxjs';

import { LoginComponent } from '../../../auth/login/login.component';
import { RegisterComponent } from '../../../auth/register/register.component';
import { SearchModalComponent } from '../search-modal/search-modal.component';
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
    private overlay: Overlay,
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
    this.dialog.open(SearchModalComponent, {
      width: '90vw',
      maxWidth: '900px',
      maxHeight: '90vh',
      panelClass: 'search-modal-dialog'
    });
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
      maxHeight: '90vh',
      panelClass: 'register-dialog-container',
      hasBackdrop: true,
      disableClose: false,
      autoFocus: false,
      scrollStrategy: this.overlay.scrollStrategies.block()
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
