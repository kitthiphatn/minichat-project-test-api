// Authentication utilities for frontend

export const getToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
};

export const getUser = () => {
    if (typeof window !== 'undefined') {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
    return null;
};

export const getWorkspace = () => {
    if (typeof window !== 'undefined') {
        const workspace = localStorage.getItem('workspace');
        return workspace ? JSON.parse(workspace) : null;
    }
    return null;
};

export const setAuthData = (token, user, workspace) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        if (workspace) {
            localStorage.setItem('workspace', JSON.stringify(workspace));
        }
    }
};

export const clearAuthData = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('workspace');
    }
};

export const isAuthenticated = () => {
    return !!getToken();
};