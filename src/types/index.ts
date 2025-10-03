export interface User {
  id: string;
  email: string;
  waiverCompleted: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
}

export interface WaiverData {
  fullName: string;
  email: string;
  phone: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalConditions: string;
  signature: string;
  date: string;
}