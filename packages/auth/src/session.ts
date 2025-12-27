export interface User {
    id: string;
    username: string;
    role: string;
    permissions: string[];
}

export const checkSession = async (): Promise<User | null> => {
    try {
        // In a real implementation, this would call the /me endpoint
        // The HTTP-only cookie would be sent automatically by the browser
        const response = await fetch('/api/auth/me');
        if (response.ok) {
            return await response.json();
        }
        return null;
    } catch (error) {
        console.error('Session check failed', error);
        return null;
    }
};

export const logout = async (): Promise<void> => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
};
