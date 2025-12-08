const BASE_URL = "https://sdmxv9jz-8081.brs.devtunnels.ms/";


async function safeFetch(url) {
  try {
    const res = await fetch(url, {
      method: "GET",
      mode: "cors",
      credentials: "omit",
    });

    if (!res.ok) throw new Error(`Error API ${res.status}`);

    return await res.json();
  } catch (err) {
    console.warn("⚠️ No se pudo conectar a la API:", err);
    return [];
  }
}

export async function fetchUsers() {
  return safeFetch(`${BASE_URL}/users`);
}

export async function fetchEmittersLastSeen() {
  return safeFetch(`${BASE_URL}/locales`);
}

export async function fetchActivos(windowSeconds = 50) {
  return safeFetch(`${BASE_URL}/api/activos?windowSeconds=${windowSeconds}`);
}
