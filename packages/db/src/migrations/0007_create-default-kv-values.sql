INSERT INTO kv_data (key, value) VALUES
('title', '"Title here"'),
('description', '"Welcome to your instance of hpware/log!"'),
('owner', '"Server owner"')
ON CONFLICT DO NOTHING;
