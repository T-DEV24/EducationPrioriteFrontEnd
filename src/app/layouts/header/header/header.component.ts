import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  
  
  mobileMenuOpen = false;
  private subs: Subscription | null = null;
  private authService = inject(AuthService);
  items = [
        { label: 'ACCUEIL', routerLink: '/child/dasboard' },
        { label: 'RUBRIQUES', routerLink: '/child/rubrique' },
        { label: 'JOURNAL PDF', routerLink: '/child/journal' },
        { label: 'CONTACT', routerLink: '/child/contact' }
  ];

  ngOnInit(): void {

    if (this.authService.hasRole('ADMIN', 'SUPER_ADMIN')) {
       this.items = [
        { label: 'ACCUEIL', routerLink: '/child/dasboard' },
        { label: 'RUBRIQUES', routerLink: '/child/rubrique' },
        { label: 'JOURNAL PDF', routerLink: '/child/journal' },
        { label: 'UTILISATEUR', routerLink: '/child/utilisateur' },
        { label: 'CONTACT', routerLink: '/child/contact' }
      ];
    }
    
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
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