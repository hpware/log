-- Custom SQL migration file, put your code below! --

INSERT INTO main_schema.kvData (key, value) VALUES
('title', ''),
('description', 'Welcome to your instence of hpware/log!'),
('owner', 'Server owner')
ON CONFLICT DO NOTHING;
