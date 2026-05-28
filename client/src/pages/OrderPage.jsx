import { useState, useEffect } from 'react';
import { api } from '../api';

function formatPrice(n) {
  return n.toLocaleString('ko-KR') + '원';
}

function optionsLabel(options) {
  const details = Array.isArray(options?.option_details) ? options.option_details : [];
  const parts = details.map((d) => d.name).filter(Boolean);
  return parts.length ? ` (${parts.join(', ')})` : '';
}

function cartKey(menuId, options) {
  const ids = Array.isArray(options?.option_ids) ? options.option_ids : [];
  return `${menuId}-${ids.slice().sort((a, b) => a - b).join('.')}`;
}

export default function OrderPage() {
  const [menus, setMenus] = useState([]);
  const [cart, setCart] = useState([]);
  const [optionsMap, setOptionsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getMenus()
      .then((data) => {
        setMenus(data);
        setError('');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function getOptions(menuId) {
    return optionsMap[menuId] || { option_ids: [] };
  }

  function toggleOption(menuId, optionId, checked) {
    setOptionsMap((prev) => {
      const current = getOptions(menuId);
      const set = new Set(current.option_ids || []);
      if (checked) set.add(optionId);
      else set.delete(optionId);
      return { ...prev, [menuId]: { option_ids: Array.from(set).sort((a, b) => a - b) } };
    });
  }

  function calcUnitPrice(menu, options) {
    const ids = Array.isArray(options?.option_ids) ? options.option_ids : [];
    const optTotal = (menu.options || [])
      .filter((o) => ids.includes(o.id))
      .reduce((sum, o) => sum + (o.price || 0), 0);
    return menu.price + optTotal;
  }

  function addToCart(menu) {
    if (menu.stock <= 0) return alert('품절입니다');
    const options = getOptions(menu.id);
    const unitPrice = calcUnitPrice(menu, options);
    const key = cartKey(menu.id, options);
    const option_details = (menu.options || []).filter((o) => (options.option_ids || []).includes(o.id));

    setCart((prev) => {
      const found = prev.find((c) => cartKey(c.menu_id, c.options) === key);
      if (found) {
        if (found.quantity + 1 > menu.stock) {
          alert(`재고가 ${menu.stock}개뿐입니다`);
          return prev;
        }
        return prev.map((c) =>
          cartKey(c.menu_id, c.options) === key ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [
        ...prev,
        {
          menu_id: menu.id,
          name: menu.name,
          price: unitPrice,
          options: { ...options, option_details },
          quantity: 1,
        },
      ];
    });
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  async function handleOrder() {
    if (!cart.length) return;
    setOrdering(true);
    try {
      await api.createOrder(
        cart.map(({ menu_id, quantity, options }) => ({ menu_id, quantity, options }))
      );
      setCart([]);
      const data = await api.getMenus();
      setMenus(data);
      alert('주문이 완료되었습니다!');
    } catch (err) {
      alert(err.message);
    } finally {
      setOrdering(false);
    }
  }

  if (loading) return <p className="loading">불러오는 중...</p>;
  if (error) return <p className="loading">에러: {error}</p>;

  return (
    <div className="order-page">
      <section className="menu-grid">
        {menus.map((menu) => {
          const opts = getOptions(menu.id);
          const displayPrice = calcUnitPrice(menu, opts);
          return (
            <article key={menu.id} className="menu-card">
              <div className="img-placeholder">
                <span className="img-x">✕</span>
              </div>
              <h3 className="menu-name">{menu.name}</h3>
              <p className="menu-price">{formatPrice(displayPrice)}</p>
              <p className="menu-desc">{menu.description}</p>
              {(menu.options || []).map((opt) => (
                <label key={opt.id} className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={(opts.option_ids || []).includes(opt.id)}
                    onChange={(e) => toggleOption(menu.id, opt.id, e.target.checked)}
                  />
                  {opt.name} (+{formatPrice(opt.price || 0)})
                </label>
              ))}
              <button
                type="button"
                className="btn-add"
                disabled={menu.stock <= 0}
                onClick={() => addToCart(menu)}
              >
                담기
              </button>
            </article>
          );
        })}
      </section>

      <section className="cart-section">
        <h2 className="cart-title">장바구니</h2>
        <div className="cart-body">
          <div className="cart-items">
            {cart.length === 0 ? (
              <p className="cart-empty">담은 메뉴가 없습니다</p>
            ) : (
              cart.map((item) => (
                <p key={cartKey(item.menu_id, item.options)} className="cart-line">
                  {item.name}
                  {optionsLabel(item.options)} X {item.quantity} — {formatPrice(item.price * item.quantity)}
                </p>
              ))
            )}
          </div>
          <div className="cart-right">
            <p className="cart-total">
              총 금액 <strong>{formatPrice(total)}</strong>
            </p>
            <button
              type="button"
              className="btn-order"
              disabled={!cart.length || ordering}
              onClick={handleOrder}
            >
              주문하기
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
