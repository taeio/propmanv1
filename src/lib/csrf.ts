let csrfToken: string | null = null;

export async function getCsrfToken(): Promise<string> {
  if (csrfToken) {
    return csrfToken;
  }

  try {
    const response = await fetch('/api/csrf-token');
    if (!response.ok) {
      throw new Error('Failed to fetch CSRF token');
    }
    const data = await response.json();
    csrfToken = data.csrfToken;
    return data.csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    throw error;
  }
}

export function clearCsrfToken() {
  csrfToken = null;
}

export async function fetchWithCsrf(url: string, options: RequestInit = {}): Promise<Response> {
  const method = options.method?.toUpperCase() || 'GET';
  
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return fetch(url, options);
  }

  const token = await getCsrfToken();
  const headers = new Headers(options.headers);
  headers.set('x-csrf-token', token);

  return fetch(url, {
    ...options,
    headers,
  });
}
