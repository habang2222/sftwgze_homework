const API_BASE =
  window.location.protocol === 'file:'
    ? 'http://localhost:3001/api'
    : `${window.location.origin}/api`;

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || '요청 실패');
  return data;
}

export const api = {
  getMenus: () => request('/menus'),
  updateStock: (id, stock) => request(`/menus/${id}/stock`, { method: 'PATCH', body: JSON.stringify({ stock }) }),
  getOrders: () => request('/orders'),
  getStats: () => request('/orders/stats'),
  createOrder: (items) => request('/orders', { method: 'POST', body: JSON.stringify({ items }) }),
  advanceOrder: (id) => request(`/orders/${id}/status`, { method: 'PATCH' }),
};
