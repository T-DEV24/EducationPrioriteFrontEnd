import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JournalPdfDto, JournalPdfSaveDto } from '../../model/model';
import { StatutJournal } from '../../model/enum';
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
  selector: 'app-journal',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, ToastModule, 
    ConfirmDialogModule, SelectButtonModule, DialogModule,DatePickerModule,
    InputTextModule, TextareaModule, DropdownModule, HasRoleDirective
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.scss']
})
export class JournalComponent implements OnInit, OnDestroy {
  private service = inject(JournalManagerService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private subs = new Subscription();

  journals: JournalPdfDto[] = [];
  searchTerm: string = '';
  imageUrls: { [key: number]: string } = {};

  displayJournalDetails: boolean = false;
  selectedJournal: JournalPdfDto | null = null;
   selectedDate: Date | null = null;

  selectedStatut: string = 'TOUT';
  statutOptions = [
    { label: 'Tous', value: 'TOUT' },
    { label: 'Actifs', value: StatutJournal.ACTIF },
    { label: 'Inactifs', value: StatutJournal.INACTIF }
  ];

  statutDropdown = [
    { label: 'Actif', value: StatutJournal.ACTIF },
    { label: 'Inactif', value: StatutJournal.INACTIF }
  ];

  journalDialog: boolean = false;
  submitted: boolean = false;
  selectedId: number | null = null;
  journal: JournalPdfSaveDto = { titre: '', statut: StatutJournal.ACTIF, description: '' };
  
  pdfFile: File | null = null;
  coverFile: File | null = null;
  coverPreview: string | null = null;

  ngOnInit() {
    this.loadJournals();
  }

  loadJournals() {
    const statutFilter = this.selectedStatut === 'TOUT' ? undefined : this.selectedStatut;
    this.subs.add(
      this.service.getJournals(undefined, statutFilter).subscribe({
        next: (data) => {
          this.journals = data;
          this.journals.forEach(j => {
            if (j.imageCouverture) this.downloadCover(j.id, j.imageCouverture);
          });
        },
        error: () => this.showToast('error', 'Erreur', 'Impossible de charger les journaux')
      })
    );
  }

  downloadCover(id: number, fileName: string) {
    this.subs.add(
      this.service.getDownloadUrl('journal', fileName).subscribe(blob => {
        this.imageUrls[id] = URL.createObjectURL(blob);
      })
    );
  }

  onFileChange(event: any, type: 'pdf' | 'cover') {
    const file = event.target.files[0];
    if (!file) return;

    if (type === 'pdf') {
      this.pdfFile = file;
    } else {
      this.coverFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => this.coverPreview = e.target.result;
      reader.readAsDataURL(file);
    }
  }

  saveJournal() {
    this.submitted = true;
    if (!this.journal.titre || (!this.selectedId && !this.pdfFile)) return;

    this.subs.add(
      this.service.saveJournal(this.selectedId, this.journal, this.pdfFile || undefined, this.coverFile || undefined).subscribe({
        next: () => {
          this.showToast('success', 'Succès', 'Journal enregistré');
          this.journalDialog = false;
          this.loadJournals();
          this.resetUploads();
        }
      })
    );
  }

  deleteJournal(id: number) {
    this.confirmationService.confirm({
      message: 'Voulez-vous vraiment supprimer ce journal ?',
      header: 'Confirmation de suppression',
      icon: 'pi pi-info-circle',
      acceptLabel: 'Supprimer',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectLabel: 'Annuler',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: () => {
        this.subs.add(this.service.deleteJournal(id).subscribe(() => {
          this.loadJournals();
          this.showToast('success', 'Supprimé', 'Le journal a été supprimé');
        }));
      }
    });
  }

  downloadPdf(fileName: string | undefined): void {
    if (!fileName) return;
    
    this.subs.add(
      this.service.getDownloadUrl('journal', fileName).subscribe(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.getShortFileName(fileName); // nom propre sans UUID
        a.click();
        URL.revokeObjectURL(url); // libère la mémoire
      })
    );
  }

  openPdf(fileName: string) {
    this.subs.add(this.service.getDownloadUrl('journal', fileName).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    }));
  }

  resetUploads() {
    this.pdfFile = null;
    this.coverFile = null;
    this.coverPreview = null;
    this.submitted = false;
  }

  openNew(){
    this.journal = {
      titre: '',
      statut: StatutJournal.ACTIF,
      description: undefined
    };

    this.resetUploads();
    this.selectedId = null;
    this.journalDialog = true;
  }

  editJournal(item: JournalPdfDto) {
    this.selectedId = item.id; 
    
    this.journal = {
      titre: item.titre,
      statut: item.statut,
      description: item.description
    };

    this.coverPreview = this.imageUrls[item.id] || null;
    
    this.pdfFile = null;
    this.coverFile = null;
    
    this.submitted = false;
    this.journalDialog = true;
  }

  private showToast(severity: string, summary: string, detail: string) {
    this.messageService.add({ severity, summary, detail });
  }

  get filteredJournals() {
    return this.journals.filter(j => {
      const matchesSearch = j.titre.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatut = !this.selectedStatut || 
                            this.selectedStatut === 'TOUT' || 
                            j.statut === this.selectedStatut;

      let matchesDate = true;
      if (this.selectedDate) {
        const journalDate = new Date(j.dateAjout).setHours(0, 0, 0, 0);
        const filterDate = new Date(this.selectedDate).setHours(0, 0, 0, 0);
        matchesDate = journalDate === filterDate;
      }

      return matchesSearch && matchesStatut && matchesDate;
    });
  }

  getShortFileName(fileName: string | undefined): string {
  if (!fileName) return 'Aucun fichier';
  
  // Supprime tout ce qui précède et inclut le dernier _ avant le vrai nom
  // Gère les cas : UUID_nom.pdf / PDF_UUID_nom.pdf / prefix_UUID_nom.pdf
  const uuidPattern = /^.*[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_/i;
  return fileName.replace(uuidPattern, '');
}

  showDetails(journal: JournalPdfDto) {
    this.selectedJournal = journal;
    this.displayJournalDetails = true;
  }

    goBack() {
    this.journalDialog = false; 
  }

  goBack2() {
    this.displayJournalDetails = false;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    Object.values(this.imageUrls).forEach(url => URL.revokeObjectURL(url));
  }
}