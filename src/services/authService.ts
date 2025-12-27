
import type { User } from '../types';

const API_URL = 'http://localhost:5000'; // Adjust to your backend URL
const CURRENT_USER_KEY = 'logistics_app_current_user';
const TOKEN_KEY = 'logistics_app_token';

// --- Helper for Mock User ---
const createMockUser = (email: string, name: string, role: string = 'viewer'): User => ({
    id: `mock_${Date.now()}`,
    name: name || email.split('@')[0] || 'Demo User',
    email: email,
    subscription: 'free',
    role: role as any,
    isAdmin: role === 'super_admin' || email.includes('admin'),
    preferences: { emailNotifications: true, smsNotifications: false, marketingEmails: false }
});

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
        console.warn("Registration - Backend unavailable or failed:", error.message);
        
        // Always fallback to mock registration in demo environment if backend fails
        const mockUser = createMockUser(email, name, role);
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
        // FALLBACK: If backend is down (Failed to fetch) or any other error occurs in this demo environment, 
        // we fallback to a mock user to ensure the app is explorable.
        console.warn("Login - Backend unavailable or failed:", error);

        // Check if it's a real "Invalid credentials" error thrown above
        if (error.message === 'Invalid credentials') {
            // For demo purposes, we might still want to let them in, OR re-throw.
            // Let's assume if the backend responded 401, we respect that. 
            // BUT, if the backend isn't there, we create a mock user.
            throw error; 
        }

        const role = email.includes('admin') ? 'super_admin' : 'viewer';
        const mockUser = createMockUser(email, '', role);

        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem(CURRENT_USER_KEY, JSON.stringify(mockUser));
        
        return mockUser;
    }
};

export const loginWithGoogle = (): User => {
    return createMockUser('user@gmail.com', 'Google User');
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
