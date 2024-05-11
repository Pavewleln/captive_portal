-- Добавление тестовых данных в таблицу macs
INSERT INTO macs (username, callingstationid) VALUES
('user@gmail.com', '7C-C2-C6-1F-49-EE'),
('admin@gmail.com', '77-C4-8H-3F-54-DD');

-- Добавление тестовых данных в таблицу radcheck
INSERT INTO radcheck (username, attribute, op, value) VALUES
('user@gmail.com', 'Cleartext-Password', ':=', '33467784'),
('user@gmail.com', 'Service-Type', ':=', 'Login-User'),
('user@gmail.com', 'Session-Timeout', ':=', '3600'),
('admin@gmail.com', 'Cleartext-Password', ':=', 'admin'),
('admin@gmail.com', 'Service-Type', ':=', 'Administrative-User'),
('admin@gmail.com', 'Session-Timeout', ':=', '3600');
