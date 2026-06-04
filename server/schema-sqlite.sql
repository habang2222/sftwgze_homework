CREATE TABLE IF NOT EXISTS menus (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT DEFAULT '간단한 설명...',
  image_url TEXT DEFAULT '',
  price INTEGER NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS menu_options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  menu_id INTEGER NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  status TEXT NOT NULL DEFAULT 'received',
  total_price INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_id INTEGER NOT NULL REFERENCES menus(id),
  menu_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL,
  options TEXT DEFAULT '{}'
);

INSERT INTO menus (name, description, image_url, price, stock)
SELECT '아메리카노(ICE)', '진한 에스프레소에 시원한 얼음을 더한 아이스 아메리카노', 'images/americano-ice.png', 4000, 10
WHERE NOT EXISTS (SELECT 1 FROM menus LIMIT 1);

INSERT INTO menus (name, description, image_url, price, stock)
SELECT '아메리카노(HOT)', '고소한 원두 향이 살아있는 따뜻한 아메리카노', 'images/americano-hot.png', 4000, 10
WHERE (SELECT COUNT(*) FROM menus) = 1;

INSERT INTO menus (name, description, image_url, price, stock)
SELECT '카페라떼', '부드러운 우유와 에스프레소의 조화', 'images/cafe-latte.png', 5000, 10
WHERE (SELECT COUNT(*) FROM menus) = 2;

INSERT INTO menu_options (menu_id, name, price)
SELECT 1, '샷 추가', 500 WHERE NOT EXISTS (SELECT 1 FROM menu_options WHERE menu_id = 1 AND name = '샷 추가');

INSERT INTO menu_options (menu_id, name, price)
SELECT 1, '시럽 추가', 0 WHERE NOT EXISTS (SELECT 1 FROM menu_options WHERE menu_id = 1 AND name = '시럽 추가');

INSERT INTO menu_options (menu_id, name, price)
SELECT 2, '샷 추가', 500 WHERE NOT EXISTS (SELECT 1 FROM menu_options WHERE menu_id = 2 AND name = '샷 추가');

INSERT INTO menu_options (menu_id, name, price)
SELECT 2, '시럽 추가', 0 WHERE NOT EXISTS (SELECT 1 FROM menu_options WHERE menu_id = 2 AND name = '시럽 추가');

INSERT INTO menu_options (menu_id, name, price)
SELECT 3, '샷 추가', 500 WHERE NOT EXISTS (SELECT 1 FROM menu_options WHERE menu_id = 3 AND name = '샷 추가');

INSERT INTO menu_options (menu_id, name, price)
SELECT 3, '시럽 추가', 0 WHERE NOT EXISTS (SELECT 1 FROM menu_options WHERE menu_id = 3 AND name = '시럽 추가');
