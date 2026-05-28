CREATE TABLE IF NOT EXISTS menus (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT DEFAULT '간단한 설명...',
  price INTEGER NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  status VARCHAR(20) NOT NULL DEFAULT 'received',
  total_price INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_id INTEGER NOT NULL REFERENCES menus(id),
  menu_name VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL,
  options JSONB DEFAULT '{}'
);

INSERT INTO menus (name, description, price, stock)
SELECT * FROM (VALUES
  ('아메리카노(ICE)', '간단한 설명...', 4000, 10),
  ('아메리카노(HOT)', '간단한 설명...', 4000, 10),
  ('카페라떼', '간단한 설명...', 5000, 10)
) AS v(name, description, price, stock)
WHERE NOT EXISTS (SELECT 1 FROM menus LIMIT 1);
