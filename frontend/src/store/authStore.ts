import { create } from 'zustand';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'STUDENT' | 'ADMIN';
    grade?: number;
    xp?: number;
    level?: number;
    bio?: string;
    avatarUrl?: string;
    badges?: any[];
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (userData: User, token: string) => void;
    logout: () => void;
    checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isLoading: true,

    login: (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        set({ user: userData, token, isLoading: false });
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isLoading: false });
    },

    checkAuth: () => {
        try {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');

            if (token && userStr) {
                set({ user: JSON.parse(userStr), token, isLoading: false });
            } else {
                set({ user: null, token: null, isLoading: false });
            }
        } catch (error) {
            set({ user: null, token: null, isLoading: false });
        }
    }
}));
