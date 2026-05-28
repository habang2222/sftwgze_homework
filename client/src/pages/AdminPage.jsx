import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';

const ACTION_LABELS = { pending: '주문 접수', received: '제조 시작', preparing: '제조 완료' };

function formatPrice(n) {
  return n.toLocaleString('ko-KR') + '원';
}

function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function optionsLabel(options) {
  const parts = [];
  if (options?.shot) parts.push('샷 추가');
  if (options?.syrup) parts.push('시럽 추가');
  return parts.length ? ` (${parts.join(', ')})` : '';
}

function orderItemText(items) {
  return items
    .map((item) => `${item.menu_name}${optionsLabel(item.options)} x ${item.quantity}`)
    .join(', ');
}

export default function AdminPage() {
  const [menus, setMenus] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ total: 0, received: 0, preparing: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [menuData, orderData, statsData] = await Promise.all([
        api.getMenus(),
        api.getOrders(),
        api.getStats(),
      ]);
      setMenus(menuData);
      setOrders(orderData);
      setStats(statsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const t = setInterval(loadData, 5000);
    return () => clearInterval(t);
  }, [loadData]);

  async function handleStock(id, delta) {
    const menu = menus.find((m) => m.id === id);
    const newStock = Math.max(0, menu.stock + delta);
    await api.updateStock(id, newStock);
    loadData();
  }

  async function handleAdvance(id) {
    await api.advanceOrder(id);
    loadData();
  }

  if (loading) return <p className="loading">불러오는 중...</p>;

  return (
    <div className="admin-page">
      <section className="panel">
        <h2 className="panel-title">관리자 대시보드</h2>
        <p className="dashboard-stats">
          총 주문 {stats.total} / 주문 접수 {stats.received} / 제조 중 {stats.preparing} / 제조 완료{' '}
          {stats.completed}
        </p>
      </section>

      <section className="panel">
        <h2 className="panel-title">재고 현황</h2>
        <div className="stock-grid">
          {menus.map((menu) => (
            <article key={menu.id} className="stock-card">
              <p className="stock-name">{menu.name}</p>
              <p className="stock-qty">{menu.stock}개</p>
              <div className="stock-btns">
                <button type="button" onClick={() => handleStock(menu.id, 1)}>
                  +
                </button>
                <button type="button" onClick={() => handleStock(menu.id, -1)}>
                  −
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2 className="panel-title">주문 현황</h2>
        {orders.length === 0 ? (
          <p className="empty">주문이 없습니다</p>
        ) : (
          <ul className="order-list">
            {orders.map((order) => (
              <li key={order.id} className="order-row">
                <span className="order-info">
                  {formatDate(order.created_at)} {orderItemText(order.items)} {formatPrice(order.total_price)}
                </span>
                {ACTION_LABELS[order.status] && (
                  <button type="button" className="btn-action" onClick={() => handleAdvance(order.id)}>
                    {ACTION_LABELS[order.status]}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
