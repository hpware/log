INSERT INTO kv_data (key, value) VALUES
('homePageStatus', 'true'),
('registrationStatus', 'true'),
('robotsTxtStatus', 'false'),
('instenceInitlization', 'false'),
('robotsTxtList', '{}')
ON CONFLICT DO NOTHING;
