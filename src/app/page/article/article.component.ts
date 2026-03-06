import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router'; 
import { ArticleDto, ArticleSaveDto } from '../../model/model'; 
import { StatutArticle } from '../../model/enum';
import { JournalManagerService } from '../../layouts/services/journal-manager-service.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { HasRoleDirective } from '../../layouts/auth/has-role.directive';

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, ToastModule, 
    ConfirmDialogModule, SelectButtonModule, DialogModule,
    InputTextModule, TextareaModule, DropdownModule, DatePickerModule,
     HasRoleDirective
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent implements OnInit, OnDestroy {
  private service = inject(JournalManagerService);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private subs = new Subscription();
  private router = inject(Router);

  rubriqueId!: number;
  rubriqueNom!: string;

  articles: ArticleDto[] = [];
  searchTerm: string = '';
  
  articleDialog: boolean = false;
  submitted: boolean = false;
  selectedId: number | null = null;
  article: ArticleSaveDto = this.resetForm();
  
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  imageUrls: { [key: number]: string } = {};

  displayDetails: boolean = false;
  selectedArticle: ArticleDto | null = null;

  selectedStatut: string = 'TOUT'; 
  selectedDate: Date | null = null;

 statutOptions = [
  { label: 'Tout', value: 'TOUT' },
  { label: 'Publiés', value: 'PUBLIE' },
  { label: 'Brouillons', value: 'BROUILLON' }
];

  statutDropdown = [
    { label: 'Publié', value: StatutArticle.PUBLIE },
    { label: 'Brouillon', value: StatutArticle.BROUILLON }
  ];

  ngOnInit() {
    this.subs.add(
      this.route.params.subscribe(params => {
        this.rubriqueId = +params['rubriqueId'];
        this.rubriqueNom = params['rubriqueNom'];
        this.loadArticles();
      })
    );
  }

  resetForm(): ArticleSaveDto {
    return { titre: '', contenu: '', statut: StatutArticle.BROUILLON, rubriqueId: this.rubriqueId };
  }

 loadArticles() {
  this.subs.add(
    this.service.getArticles(undefined, this.rubriqueId).subscribe({
      next: (data) => {
        this.articles = data;

        this.articles.forEach(article => {
          if (article.image) {
            this.downloadAndPreviewImage(article.id, article.image);
          }
        });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec du chargement' })
    })
  );
 }

  openNew() {
    this.article = this.resetForm();
    this.article.rubriqueId = this.rubriqueId;
    this.selectedId = null;
    this.selectedFile = null;
    this.imagePreview = null;
    this.submitted = false;
    this.articleDialog = true;
  }

  
  showDetails(article: ArticleDto) {
    this.selectedArticle = article;
    this.displayDetails = true;
    
    if (article.image && !this.imageUrls[article.id]) {
      this.downloadAndPreviewImage(article.id, article.image);
    }
  }

  editArticle(item: ArticleDto) {
    this.selectedId = item.id;
    this.article = {
      titre: item.titre,
      contenu: item.contenu,
      statut: item.statut,
      rubriqueId: item.rubriqueId
    };
    this.imagePreview = item.image ?  this.imageUrls[item.id] : null;
    this.submitted = false;
    this.articleDialog = true;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => this.imagePreview = e.target.result;
      reader.readAsDataURL(file);
    }
  }

  saveArticle() {
    this.submitted = true;

    if (!this.article.titre || !this.article.contenu || !this.article.statut) {
      return;
    }

    this.subs.add(
      this.service.saveArticle(this.selectedId, this.article, this.selectedFile || undefined).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Article enregistré' });
          this.loadArticles();
          this.articleDialog = false;
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur serveur' })
      })
    );
  }

  deleteArticle(article: ArticleDto) {
    this.confirmationService.confirm({
      message: 'Voulez-vous vraiment supprimer cet article ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectLabel: 'Annuler',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: () => {
        this.subs.add(
          this.service.deleteArticle(article.id).subscribe({
            next: () => {
              this.loadArticles();
              this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Article supprimé' });
            }
          })
        );
      }
    });
  }

  get filteredArticles(): ArticleDto[] {
    return this.articles.filter(article => {
      
      const searchLower = this.searchTerm.toLowerCase();
      const matchesSearch = !this.searchTerm || 
        article.titre.toLowerCase().includes(searchLower) || 
        article.slug.toLowerCase().includes(searchLower) ||
        article.rubriqueNom.toLowerCase().includes(searchLower);

      const matchesStatut = this.selectedStatut === 'TOUT' || article.statut === this.selectedStatut;

      let matchesDate = true;
      if (this.selectedDate) {
        const pubDate = new Date(article.datePublication);
        matchesDate = pubDate.toDateString() === this.selectedDate.toDateString();
      }

      return matchesSearch && matchesStatut && matchesDate;
    });
  }

  
 downloadAndPreviewImage(articleId: number, fileName: string) {
  this.subs.add(
    this.service.getDownloadUrl('articles', fileName).subscribe({
      next: (blob) => {
      
        const objectUrl = URL.createObjectURL(blob);
        this.imageUrls[articleId] = objectUrl;
      },
      error: (err) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur de téléchargement image' })
    })
  );
}

goBack(): void { 
  this.router.navigate(['/child/rubrique']);
}

saveAsDraft(): void {
  this.article.statut = StatutArticle.BROUILLON;
  this.saveArticle();
}

  ngOnDestroy() { 
    this.subs.unsubscribe(); 
  Object.values(this.imageUrls).forEach(url => URL.revokeObjectURL(url));}
}