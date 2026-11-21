const BASE_URL = "/api/orders";

async function parseResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      Array.isArray(data.errors) && data.errors.length > 0
        ? data.errors.join(", ")
        : data.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

export async function getOrders() {
  const res = await fetch(BASE_URL);
  const body = await parseResponse(res);
  return body.data || [];
}

export async function createOrder(payload) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseResponse(res);
}

export async function updateOrder(id, payload) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseResponse(res);
}

export async function deleteOrder(id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
  return parseResponse(res);
}
