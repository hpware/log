INSERT INTO kv_data (key, value) VALUES
('copyrightOwner', '"Default Owner"'),
('exposeVersion', 'false')
ON CONFLICT DO NOTHING;
