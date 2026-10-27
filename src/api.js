export const API_URL = 'http://127.0.0.1:8000/api/v1'

export async function api(path, options = {}) {
    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
    })

    const data = await res.json().catch(() => null)

    if (!res.ok) {
        const error = new Error(data?.message || `HTTP ${res.status}`)
        error.status = res.status
        error.errors = data?.errors || {}
        throw error
    }

    return data
}