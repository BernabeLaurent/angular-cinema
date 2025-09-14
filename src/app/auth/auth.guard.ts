import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from './auth.service';
import { LoginComponent } from './login/login.component';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (this.auth.isLoggedIn()) {
      return true;
    }

    // Ouvrir le dialog de connexion centré
    const dialogRef = this.dialog.open(LoginComponent, {
      width: '400px',
      panelClass: 'login-dialog-positioned',
      hasBackdrop: true,
      backdropClass: 'custom-backdrop',
      disableClose: false,
      data: {
        returnUrl: route.url.join('/')
      }
    });

    // Après fermeture du dialog, vérifier si l'utilisateur est maintenant connecté
    dialogRef.afterClosed().subscribe(() => {
      if (this.auth.isLoggedIn()) {
        // Rediriger vers la route originale
        this.router.navigateByUrl('/' + route.url.join('/'));
      }
    });

    return false;
  }
}
