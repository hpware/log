INSERT INTO kv_data (key, value) VALUES
('title', ''),
('description', 'Welcome to your instence of hpware/log!'),
('owner', 'Server owner')
ON CONFLICT DO NOTHING;
