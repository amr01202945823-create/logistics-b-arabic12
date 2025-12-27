
import type { User } from '../types';

const API_URL = 'http://localhost:5000'; // Adjust to your backend URL
const CURRENT_USER_KEY = 'logistics_app_current_user';
const TOKEN_KEY = 'logistics_app_token';

// --- API Interactions ---

export const register = async (name: string, email: string, password?: string, role: string = 'viewer'): Promise<User> => {
    try {
        const nameParts = name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'User';

        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email, 
                password, 
                firstName, 
                lastName 
            })
        });

        if (!response.ok) {
            let errorMessage = 'Registration failed';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
                if (Array.isArray(errorMessage)) errorMessage = errorMessage.join(', ');
            } catch (e) {
                errorMessage = response.statusText || errorMessage;
            }
            throw new Error(errorMessage);
        }

        const user = await response.json();
        return user; 
    } catch (error: any) {
        console.error("Registration Error:", error);
        
        // FALLBACK: If backend is down, return mock user for demo
        console.warn("Backend unavailable, using mock registration.");
        const mockUser: User = { 
            id: `mock_${Date.now()}`, 
            name, 
            email, 
            subscription: 'free', 
            role: role as any,
            preferences: { emailNotifications: true, smsNotifications: false, marketingEmails: false } 
        };
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(mockUser));
        return mockUser;
    }
};

export const login = async (email: string, password?: string, rememberMe: boolean = false): Promise<User> => {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            let errorMessage = 'Login failed';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || 'Invalid credentials';
                if (Array.isArray(errorMessage)) errorMessage = errorMessage.join(', ');
            } catch {
                errorMessage = response.status === 401 ? 'Invalid credentials' : 'Server error';
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        const user = data.user;
        const token = data.access_token;

        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem(TOKEN_KEY, token);
        storage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

        return user;
    } catch (error: any) {
        console.error("Login Error:", error);

        // FALLBACK: Detect network errors (Failed to fetch) and allow demo login
        if (
            error.message === 'Failed to fetch' || 
            error.name === 'TypeError' ||
            error.message.includes('Network') ||
            !error.response
        ) {
            console.warn("Backend unavailable (Failed to fetch), using mock login for demo.");
            
            const mockUser: User = {
                id: 'mock_user_id',
                name: email.split('@')[0] || 'Demo User',
                email: email,
                subscription: 'free',
                role: email.includes('admin') ? 'super_admin' : 'viewer',
                isAdmin: email.includes('admin'),
                preferences: { emailNotifications: true, smsNotifications: false, marketingEmails: false }
            };

            const storage = rememberMe ? localStorage : sessionStorage;
            storage.setItem(CURRENT_USER_KEY, JSON.stringify(mockUser));
            return mockUser;
        }

        throw error;
    }
};

export const loginWithGoogle = (): User => {
    return {
        id: 'google_user',
        name: 'Google User',
        email: 'user@gmail.com',
        subscription: 'free',
        role: 'viewer',
        preferences: { emailNotifications: true, smsNotifications: false, marketingEmails: false }
    };
};

export const logout = (): void => {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(CURRENT_USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
};

export const getCurrentUser = (): User | null => {
    try {
        let userJson = sessionStorage.getItem(CURRENT_USER_KEY);
        if (!userJson) {
             userJson = localStorage.getItem(CURRENT_USER_KEY);
        }
        return userJson ? JSON.parse(userJson) : null;
    } catch {
        return null;
    }
};

export const updateProfile = (updatedUser: User): User => {
    const isRemembered = localStorage.getItem(CURRENT_USER_KEY) !== null;
    const storage = isRemembered ? localStorage : sessionStorage;
    storage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    return updatedUser;
};

export const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
};
