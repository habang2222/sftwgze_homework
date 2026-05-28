CREATE TABLE IF NOT EXISTS menus (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT DEFAULT '간단한 설명...',
  image_url TEXT DEFAULT '',
  price INTEGER NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menu_options (
  id SERIAL PRIMARY KEY,
  menu_id INTEGER NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
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

INSERT INTO menus (name, description, image_url, price, stock)
SELECT * FROM (VALUES
  ('아메리카노(ICE)', '간단한 설명...', '', 4000, 10),
  ('아메리카노(HOT)', '간단한 설명...', '', 4000, 10),
  ('카페라떼', '간단한 설명...', '', 5000, 10)
) AS v(name, description, image_url, price, stock)
WHERE NOT EXISTS (SELECT 1 FROM menus LIMIT 1);

INSERT INTO menu_options (menu_id, name, price)
SELECT * FROM (VALUES
  (1, '샷 추가', 500),
  (1, '시럽 추가', 0),
  (2, '샷 추가', 500),
  (2, '시럽 추가', 0),
  (3, '샷 추가', 500),
  (3, '시럽 추가', 0)
) AS v(menu_id, name, price)
WHERE NOT EXISTS (SELECT 1 FROM menu_options LIMIT 1);
