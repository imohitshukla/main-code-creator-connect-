const getBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
    if (import.meta.env.MODE === 'production') return 'https://api.creatorconnect.tech';
    return 'http://localhost:5000';
};

const API_URL = getBaseUrl();

export const getErrorMessage = (error: any): string => {
    if (error.response && error.response.data && error.response.data.message) {
        return error.response.data.message;
    }
    if (error.response && error.response.data && error.response.data.error) {
        return error.response.data.error;
    }
    if (error.message) {
        return error.message;
    }
    return "Something went wrong. Please try again.";
};

/**
 * A wrapper around fetch that ensures credentials (cookies) are always sent.
 * Use this for all API calls instead of raw fetch.
 */
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    const config: RequestInit = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
        credentials: 'include', // 🚨 CRITICAL: Always send cookies
    };

    const response = await fetch(url, config);

    // Optional: Handle 401 globally here if needed
    // if (response.status === 401) { ... }

    return response;
};
