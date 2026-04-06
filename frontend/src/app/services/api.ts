/**
 * API service for the Flask backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface BehavioralDataSubmission {
  userId: string;
  date: string;
  sleepHours?: number;
  sleepQuality: number;
  physicalActivity: number;
  socialInteraction: number;
  screenTime?: number;
  moodScore: number;
  stressLevel: number;
  productivityScore: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  consent: boolean;
  createdAt: string;
  lastLoginAt?: string;
  passwordUpdatedAt?: string;
}

export interface EmailDeliveryStatus {
  delivered: boolean;
  mode: "smtp" | "simulated";
  message: string;
  preview?: string;
}

export interface AuthPayload {
  success: boolean;
  token: string;
  user: AuthUser;
  emailDelivery?: EmailDeliveryStatus;
}

export interface CurrentUserPayload {
  success: boolean;
  user: AuthUser;
}

export interface ForgotPasswordPayload {
  success: boolean;
  message: string;
  emailDelivery?: EmailDeliveryStatus;
}

class ApiService {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  clearAuthToken() {
    this.authToken = null;
  }

  getAuthToken() {
    return this.authToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    defaultError = "Request failed",
  ): Promise<ApiResponse<T>> {
    try {
      const headers = new Headers(options.headers);

      if (options.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      if (this.authToken && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${this.authToken}`);
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const rawText = await response.text();
      const payload = rawText ? JSON.parse(rawText) : null;

      if (!response.ok) {
        return {
          success: false,
          error: payload?.error || payload?.message || defaultError,
        };
      }

      return {
        success: true,
        data: payload as T,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : defaultError,
      };
    }
  }

  async healthCheck(): Promise<ApiResponse<any>> {
    return this.request("/health", {}, "Cannot connect to backend");
  }

  async register(payload: {
    name: string;
    email: string;
    password: string;
    consent: boolean;
  }): Promise<ApiResponse<AuthPayload>> {
    return this.request<AuthPayload>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      "Failed to create account",
    );
  }

  async login(email: string, password: string): Promise<ApiResponse<AuthPayload>> {
    return this.request<AuthPayload>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
      "Failed to sign in",
    );
  }

  async logout(): Promise<ApiResponse<{ success: boolean; message: string }>> {
    const response = await this.request<{ success: boolean; message: string }>(
      "/auth/logout",
      { method: "POST" },
      "Failed to sign out",
    );

    if (response.success) {
      this.clearAuthToken();
    }

    return response;
  }

  async getCurrentUser(): Promise<ApiResponse<CurrentUserPayload>> {
    return this.request<CurrentUserPayload>(
      "/auth/me",
      {},
      "Failed to restore session",
    );
  }

  async forgotPassword(email: string): Promise<ApiResponse<ForgotPasswordPayload>> {
    return this.request<ForgotPasswordPayload>(
      "/auth/forgot-password",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      },
      "Failed to start password reset",
    );
  }

  async submitBehavioralData(
    data: BehavioralDataSubmission,
  ): Promise<ApiResponse<any>> {
    return this.request<any>(
      "/behavioral-data",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      "Failed to submit data",
    );
  }

  async getBehavioralData(userId: string, days = 30): Promise<ApiResponse<any>> {
    return this.request<any>(
      `/behavioral-data/${userId}?days=${days}`,
      {},
      "Failed to fetch data",
    );
  }

  async getInsights(userId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/insights/${userId}`, {}, "Failed to fetch insights");
  }

  async getCorrelations(userId: string): Promise<ApiResponse<any>> {
    return this.request<any>(
      `/correlations/${userId}`,
      {},
      "Failed to fetch correlations",
    );
  }

  async getTrends(userId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/trends/${userId}`, {}, "Failed to fetch trends");
  }

  async exportUserData(userId: string): Promise<ApiResponse<any>> {
    return this.request<any>(
      `/privacy/export/${userId}`,
      {},
      "Failed to export data",
    );
  }

  async deleteUserData(userId: string): Promise<ApiResponse<any>> {
    return this.request<any>(
      `/privacy/delete/${userId}`,
      { method: "DELETE" },
      "Failed to delete data",
    );
  }
}

export const apiService = new ApiService();
export default apiService;
