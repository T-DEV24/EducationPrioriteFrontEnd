import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from './auth.service';

@Directive({
  selector: '[appHasRole]'
})
export class HasRoleDirective {

  @Input() set appHasRole(roles: string[]) {
    if (this.authService.hasRole(...roles)) {
      // Si l'utilisateur a le droit, on affiche l'élément
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      // Sinon, on supprime carrément l'élément du HTML
      this.viewContainer.clear();
    }
  }

  constructor(
      private templateRef: TemplateRef<any>,
      private viewContainer: ViewContainerRef,
      private authService: AuthService
  ) { 
   
  }

}
