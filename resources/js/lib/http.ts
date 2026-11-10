/** JSON requests to the app with Laravel's CSRF cookie. */

function xsrfToken(): string {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);

    return match ? decodeURIComponent(match[1]) : '';
}

export class HttpError extends Error {
    constructor(
        public status: number,
        public body: Record<string, unknown>,
    ) {
        super(
            typeof body.message === 'string'
                ? body.message
                : `Request failed (${status})`,
        );
    }
}

export async function sendJson<T = Record<string, unknown>>(
    method: 'POST' | 'PATCH' | 'PUT' | 'DELETE',
    url: string,
    body?: unknown,
    init: RequestInit = {},
): Promise<T> {
    const response = await fetch(url, {
        method,
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': xsrfToken(),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        ...init,
    });

    const text = await response.text();
    const data = text ? (JSON.parse(text) as Record<string, unknown>) : {};

    if (!response.ok) {
        throw new HttpError(response.status, data);
    }

    return data as T;
}
