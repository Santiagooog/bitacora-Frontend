import api from "./axios";

export interface LoginRequest {
  correo: string;
  password: string;
}

export interface AuthResponse {
  id:number;
  token: string;
  nombre: string;
  correo: string;
  rol: string;
}

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/login", data);
  return response.data;
};