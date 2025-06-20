const API_BASE_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8080';

export interface ApiError {
    error: string;
    message: string;
}

export class ApiService {
    protected baseUrl: string;
    protected token: string | null;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl.replace(/\/$/, '');
        this.token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        console.log('API Service initialized with base URL:', this.baseUrl);
    }

    protected getHeaders(): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    protected async handleResponse<T>(response: Response): Promise<T> {
        const contentType = response.headers.get('content-type');
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            if (contentType && contentType.includes('application/json')) {
                const error = await response.json();
                console.error('API error:', error);
                throw new Error(error.message || error.error || 'Request failed');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.log('Response data:', data);
            return data;
        }

        // Handle non-JSON responses
        const text = await response.text();
        if (!text) {
            return {} as T;
        }

        try {
            return JSON.parse(text);
        } catch (e) {
            throw new Error('Invalid JSON response from server');
        }
    }

    protected async get<T>(endpoint: string): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        console.log('GET request to:', url);
        const response = await fetch(url, {
            headers: this.getHeaders(),
        });
        return this.handleResponse<T>(response);
    }

    protected async post<T>(endpoint: string, data: any): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        console.log('POST request to:', url);
        console.log('Request data:', data);
        const response = await fetch(url, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });
        return this.handleResponse<T>(response);
    }

    protected async put<T>(endpoint: string, data: any): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        console.log('PUT request to:', url);
        console.log('Request data:', data);
        const response = await fetch(url, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });
        return this.handleResponse<T>(response);
    }

    protected async delete<T>(endpoint: string): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        console.log('DELETE request to:', url);
        const response = await fetch(url, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });
        return this.handleResponse<T>(response);
    }

    setToken(token: string | null) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }
}

export const apiFetch = async (path: string, options?: RequestInit) => {
    const baseUrl = API_BASE_URL.replace(/\/$/, '');
    const url = `${baseUrl}${path}`;
    return fetch(url, options);
};

// Example usage:
// apiFetch('/api/users/login', { method: 'POST', body: JSON.stringify(data) }) 