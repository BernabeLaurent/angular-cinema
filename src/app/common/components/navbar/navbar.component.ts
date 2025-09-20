import { Component, ViewChild, ElementRef, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { Subscription, fromEvent } from 'rxjs';

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
export class NavbarComponent implements OnDestroy {
  isUserMenuOpen = false;
  isMobileMenuOpen = false;
  
  // Observables pour la réactivité
  isLoggedIn$: Observable<boolean>;
  currentUser$: Observable<User | null>;
  isAdmin$: Observable<boolean>;
  isWorker$: Observable<boolean>;
  canAccessAdmin$: Observable<boolean>;
  userInitials$: Observable<string>;

  @ViewChild('userMenuButton') userMenuButton!: ElementRef<HTMLButtonElement>;

  private keydownSubscription: Subscription = new Subscription();

  constructor(
    private dialog: MatDialog, 
    private overlay: Overlay,
    private router: Router,
    private authService: AuthService,
    private userRoleService: UserRoleService
  ) {
    this.isLoggedIn$ = this.userRoleService.isLoggedIn();
    this.currentUser$ = this.userRoleService.getCurrentUser();
    this.isAdmin$ = this.userRoleService.isAdmin();
    this.isWorker$ = this.userRoleService.isWorker();
    this.canAccessAdmin$ = this.userRoleService.canAccessAdmin();
    this.userInitials$ = this.userRoleService.getUserInitials();

    // Gestion des touches pour la navigation clavier
    this.setupKeyboardNavigation();
  }

  ngOnDestroy() {
    this.keydownSubscription.unsubscribe();
  }

  private setupKeyboardNavigation() {
    this.keydownSubscription = fromEvent<KeyboardEvent>(document, 'keydown')
      .subscribe(event => {
        if (this.isUserMenuOpen || this.isMobileMenuOpen) {
          this.handleMenuKeydown(event);
        }
      });
  }

  private handleMenuKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.closeAllMenus();
        break;
      case 'Tab':
        // Allow natural tab navigation but close menus when tabbing away
        if (!event.shiftKey) {
          // Closing menus when Tab is pressed (focus moves away)
          setTimeout(() => this.closeAllMenus(), 100);
        }
        break;
    }
  }

  private closeAllMenus() {
    this.closeUserMenu();
    this.closeMobileMenu();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    // Fermer les menus si on clique en dehors
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-container') && !target.closest('.mobile-menu')) {
      this.closeAllMenus();
    }
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    // Update aria-expanded attribute
    if (this.userMenuButton) {
      this.userMenuButton.nativeElement.setAttribute('aria-expanded', this.isUserMenuOpen.toString());
    }
  }

  closeUserMenu() {
    this.isUserMenuOpen = false;
    // Update aria-expanded attribute
    if (this.userMenuButton) {
      this.userMenuButton.nativeElement.setAttribute('aria-expanded', 'false');
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    // Fermer le menu utilisateur si ouvert
    if (this.isMobileMenuOpen) {
      this.closeUserMenu();
    }
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
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
      panelClass: 'login-dialog-positioned',
      hasBackdrop: true,
      backdropClass: 'custom-backdrop',
      disableClose: false
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
    this.closeUserMenu();
    this.authService.logout();
    // Redirection immédiate vers l'accueil
    this.router.navigate(['/'], { replaceUrl: true }).then(() => {
      // Recharger la page pour s'assurer que tous les états sont nettoyés
      window.location.reload();
    });
  }

  getRoleDisplayName(role: RoleUser): string {
    return this.userRoleService.getRoleDisplayName(role);
  }
}
