import { useState, useEffect } from 'react';
import { api } from '../api';

function formatPrice(n) {
  return n.toLocaleString('ko-KR') + '원';
}

function optionsLabel(options) {
  const parts = [];
  if (options.shot) parts.push('샷 추가');
  if (options.syrup) parts.push('시럽 추가');
  return parts.length ? ` (${parts.join(', ')})` : '';
}

function cartKey(menuId, options) {
  return `${menuId}-${options.shot}-${options.syrup}`;
}

export default function OrderPage() {
  const [menus, setMenus] = useState([]);
  const [cart, setCart] = useState([]);
  const [optionsMap, setOptionsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    api.getMenus().then(setMenus).finally(() => setLoading(false));
  }, []);

  function getOptions(menuId) {
    return optionsMap[menuId] || { shot: false, syrup: false };
  }

  function setOption(menuId, key, value) {
    setOptionsMap((prev) => ({
      ...prev,
      [menuId]: { ...getOptions(menuId), [key]: value },
    }));
  }

  function calcUnitPrice(menu, options) {
    return menu.price + (options.shot ? 500 : 0);
  }

  function addToCart(menu) {
    if (menu.stock <= 0) return alert('품절입니다');
    const options = getOptions(menu.id);
    const unitPrice = calcUnitPrice(menu, options);
    const key = cartKey(menu.id, options);

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
          options,
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
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={opts.shot}
                  onChange={(e) => setOption(menu.id, 'shot', e.target.checked)}
                />
                샷 추가 (+500원)
              </label>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={opts.syrup}
                  onChange={(e) => setOption(menu.id, 'syrup', e.target.checked)}
                />
                시럽 추가 (+0원)
              </label>
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
