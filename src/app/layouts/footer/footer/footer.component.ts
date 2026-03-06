import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DialogModule } from "primeng/dialog";
import { ProfileComponent } from "../../profil/profil.component";
import { AuthService } from '../../auth/auth.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { HasRoleDirective } from '../../auth/has-role.directive';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, DialogModule, ProfileComponent, HasRoleDirective],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnDestroy {
  
  private authService = inject(AuthService);
  private subs: Subscription | null = null;

  displayModal: boolean = false;
  displayModalEdit: boolean = false;
  selectedUserId: string | null = null;

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  onLogout(): void {
    this.subs = this.authService.logout().subscribe({
      next: () => console.log('Déconnecté'),
      error: (err) => console.error(err)
    });
  }

  

  get isAuthenticated(): boolean {
   return this.authService.isauthenticate();
  }

  ngOnDestroy(): void {
    this.subs?.unsubscribe();
  }

}