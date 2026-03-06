// Interface pour UserDto
export interface User {
  id: string; // UUID converti en string pour Angular
  email: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
  role: string;
}

// Interface pour UserSaveDto (Création d'utilisateur)
export interface UserSaveRequest {
  email: string;
  username: string;
  passwordHash: string;
  role: string;
}

// Interface pour LoginUserDto (Connexion)
export interface LoginRequest {
  email: string;
  password: string;
  role?: string;
}

 export interface UserMap {
    success:  boolean,
    message:  string,
    username : string,
    role: string;
    id : string,
 }