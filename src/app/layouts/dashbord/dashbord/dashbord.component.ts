import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { JournalManagerService } from '../../services/journal-manager-service.service';
import { ArticleDto, JournalPdfDto } from '../../../model/model';
import { AuthService } from '../../auth/auth.service';
import { HasRoleDirective } from '../../auth/has-role.directive';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HasRoleDirective],
  templateUrl: './dashbord.component.html',
  styleUrls: ['./dashbord.component.scss']
})
export class DashboardComponent implements OnInit {

  private service = inject(JournalManagerService);
  private authService = inject(AuthService);

  journals: JournalPdfDto[] = [];
  featuredArticles: ArticleDto[] = [];
  
  imageUrls: { [key: string]: string } = {};

  modules = [
    { title: 'Rubriques', icon: 'pi-th-large', color: 'bg-[#e11d48]', soft: 'bg-[#fff1f2]', text: 'text-[#e11d48]', num: '01', desc: 'Naviguez à travers nos grandes thématiques pédagogiques.', link: '/child/rubrique' },
    { title: 'Articles', icon: 'pi-pencil', isFeatured: true, num: '02', desc: 'Enquêtes exclusives et analyses signées par nos experts.', link: '/child/rubrique' },
    { title: 'Journaux PDF', icon: 'pi-file-pdf', color: 'bg-[#fb7185]', soft: 'bg-[#fff1f2]', text: 'text-[#fb7185]', num: '03', desc: 'Téléchargez nos éditions mensuelles complètes.', link: '/child/journal' },
    { title: 'Espace membres', icon: 'pi-users', color: 'bg-[#334155]', soft: 'bg-[#f1f5f9]', text: 'text-[#334155]', num: '04', desc: 'Gérez votre profil et rejoignez la communauté.', link: '/child/utilisateur' }
  ];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    forkJoin({
   
      journals: this.service.getJournals(undefined, 'ACTIF'),

      articles: this.service.getArticles(undefined, undefined, undefined, 'PUBLIE')
    }).subscribe({
      next: (res) => {

        this.journals = res.journals.slice(0, 3);
        this.featuredArticles = res.articles.slice(0, 4);

        this.journals.forEach(j => {
          if (j.imageCouverture) this.loadImage('journal', j.id, j.imageCouverture);
        });

        this.featuredArticles.forEach(a => {
          if (a.image) this.loadImage('articles', a.id, a.image);
        });
      }
    });
  }

  loadImage(type: 'articles' | 'journal', id: number, fileName: string) {
    this.service.getDownloadUrl(type, fileName).subscribe(blob => {
      const key = `${type}-${id}`;
      this.imageUrls[key] = URL.createObjectURL(blob);
    });
  }

  

  get isAuthenticated(): boolean {
   return this.authService.isauthenticate();
  }

}