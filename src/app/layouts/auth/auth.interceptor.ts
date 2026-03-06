import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
   // ici on recupere le token stoker dans le localStorage
  const token = localStorage.getItem('token');
  
  let requestToSend = req;

  // si le token n'est pas null on crait un header d'autorisation avec les mot cle : 'Authorization', `Bearer ' au quel on rajoute notre token
  // le backend reconnaitra automatiquement la requete d'autorisation avec l'entete  : 'Authorization'
  if (token) {
    const headers = req.headers.set(
        'Authorization',
        `Bearer ${token}`
    );

    // ici on clone le headers de nos requetes avec le headers defini plus haut
    requestToSend = req.clone({ headers : headers });
     
  }

  return next(requestToSend);
};
