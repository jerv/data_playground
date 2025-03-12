export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  registrationCode: string;
}

export interface ProfileUpdateData {
  username?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
} 