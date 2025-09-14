import {Component, OnInit, Optional, Inject} from '@angular/core';
import {FormBuilder, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';
import {AuthService} from '../auth.service';

import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {NgIf} from '@angular/common';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    NgIf,
    MatIcon,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['../auth.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  error: string | null = null;
  returnUrl: string = '/';
  isDialog: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    @Optional() public dialogRef?: MatDialogRef<LoginComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public dialogData?: any
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
    
    // Déterminer si on est en mode dialog ou page
    this.isDialog = !!this.dialogRef;
  }

  ngOnInit() {
    // Récupérer returnUrl depuis les query parameters ou les données du dialog
    this.returnUrl = this.dialogData?.returnUrl ||
                     this.route.snapshot.queryParams['returnUrl'] || '/';
    console.log('Login component - returnUrl:', this.returnUrl);
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.error = null;
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          if (this.isDialog && this.dialogRef) {
            this.dialogRef.close();
          }
          
          // Redirection selon le contexte
          if (this.returnUrl && this.returnUrl !== '/') {
            // Si on a un returnUrl, y aller directement
            console.log('Redirecting to returnUrl:', this.returnUrl);
            this.router.navigateByUrl(this.returnUrl);
          } else {
            // Sinon, redirection intelligente selon le rôle
            this.authService.redirectAfterAuth(this.router);
          }
          
          // Refresh léger pour mettre à jour la navbar (uniquement si pas de returnUrl spécifique)
          if (!this.returnUrl || this.returnUrl === '/') {
            setTimeout(() => {
              window.location.reload();
            }, 100);
          }
        },
        error: err => (this.error = err.error?.message || 'Identifiants incorrects'),
      });
    }
  }

  closeDialog(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    } else {
      // Si ce n'est pas un dialog, retourner à la page précédente
      this.router.navigate(['/']);
    }
  }
}
