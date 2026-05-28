import { Routes, Route, NavLink } from 'react-router-dom';
import OrderPage from './pages/OrderPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <span className="brand">COZY</span>
        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-btn active' : 'nav-btn')}>
            주문하기
          </NavLink>
          <NavLink to="/admin" className={({ isActive }) => (isActive ? 'nav-btn active' : 'nav-btn')}>
            관리자
          </NavLink>
        </nav>
      </header>
      <main className="main">
        <Routes>
          <Route path="/" element={<OrderPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
    </div>
  );
}
