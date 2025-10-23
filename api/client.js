import config from '../config';

export const BASE_URL = config.API_URL;

export async function apiFetch(path, { method = "GET", token, body, headers: customHeaders } = {}) {
    // Check if body is FormData (for file uploads)
    const isFormData = body instanceof FormData;
    
    // Set headers - don't set Content-Type for FormData (browser will set it with boundary)
    const headers = {};
    if (!isFormData) {
        headers["Content-Type"] = "application/json";
    }
    if (token) headers["Authorization"] = `Bearer ${token}`;
    
    // Merge custom headers if provided
    if (customHeaders) {
        Object.assign(headers, customHeaders);
        // Remove Content-Type if it was set in custom headers for FormData
        if (isFormData && headers["Content-Type"]) {
            delete headers["Content-Type"];
        }
    }

    const response = await fetch(`${BASE_URL}${path}`, { 
        method, 
        headers, 
        body: isFormData ? body : (body ? JSON.stringify(body) : undefined)
    });

    let data = null;
    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        const message = data?.messages
            ? Object.values(data.messages).flat().join('\n')
            : data?.message || `Request failed: ${response.status}`;
        const error = new Error(message);
        error.status = response.status;
        throw error;
    }

    return data;
}