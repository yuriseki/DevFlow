export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const url = `${baseUrl}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`Fetch failed: ${res.status} ${res.statusText} - ${msg}`);
    }

    return (await res.json()) as Promise<T>;
  } catch (e) {
    console.log("Fetch failed.");
    return e as Promise<T>;
  }
}
