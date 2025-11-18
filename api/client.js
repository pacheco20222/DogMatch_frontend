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

    const url = `${BASE_URL}${path}`;
    console.log(`🌐 API Request: ${method} ${url}`);
    
    let response;
    try {
        response = await fetch(url, { 
            method, 
            headers, 
            body: isFormData ? body : (body ? JSON.stringify(body) : undefined)
        });
    } catch (networkError) {
        console.error('❌ Network Error:', networkError);
        const error = new Error(`Network error: ${networkError.message}`);
        error.status = 0;
        error.isNetworkError = true;
        throw error;
    }

    let data = null;
    try {
        const text = await response.text();
        if (text) {
            data = JSON.parse(text);
        }
    } catch {
        data = null;
    }

    console.log(`📡 API Response: ${response.status} ${response.statusText}`, data || '(no body)');

    if (!response.ok) {
        const message = data?.messages
            ? Object.values(data.messages).flat().join('\n')
            : data?.message || data?.error || `Request failed: ${response.status}`;
        const error = new Error(message);
        error.status = response.status;
        error.response = data;
        console.error(`❌ API Error [${response.status}]:`, message, data);
        throw error;
    }

    return data;
}