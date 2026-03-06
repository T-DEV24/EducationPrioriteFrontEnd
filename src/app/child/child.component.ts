import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../layouts/footer/footer/footer.component';
import { HeaderComponent } from '../layouts/header/header/header.component';
import { ToastModule } from "primeng/toast";
import { ConfirmDialog } from "primeng/confirmdialog";


@Component({
  selector: 'app-child',
  standalone: true, // N'oublie pas standalone si besoin
  imports: [RouterOutlet, FooterComponent, HeaderComponent, ToastModule, ConfirmDialog],
  template: `
    <div class="app-layout">
      <app-header></app-header>
      
      <main class="app-main">
        <p-toast />
        <p-confirm-dialog />
        <router-outlet></router-outlet>
      </main>

      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh; /* Toute la hauteur de l'écran au minimum */
      width: 100%;
    }

    .app-main {
      flex: 1; /* Prend tout l'espace restant entre header et footer */
      display: block; /* Important : Ne pas mettre flex center ici pour le dashboard */
      width: 100%;
      position: relative;
    }

    /* Optionnel : Si ton header est en position: fixed ou sticky */
    app-header {
      position: sticky;
      top: 0;
      z-index: 50; /* Doit être au dessus du contenu */
    }
  `]
})
export class ChildComponent {}
