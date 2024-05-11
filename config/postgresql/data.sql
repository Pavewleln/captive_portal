-- Добавление тестовых данных в таблицу macs
INSERT INTO macs (username, callingstationid) VALUES
('user@google.com', '7C-C2-C6-1F-49-EE'),
('admin@google.com', '77-C4-8H-3F-54-DD');

-- Добавление тестовых данных в таблицу radcheck
INSERT INTO radcheck (username, attribute, op, value) VALUES
('user@google.com', 'Cleartext-Password', ':=', '33467784'),
('user@google.com', 'Service-Type', ':=', 'Login-User'),
('user@google.com', 'Session-Timeout', ':=', '3600'),
('admin@google.com', 'Cleartext-Password', ':=', 'admin'),
('admin@google.com', 'Service-Type', ':=', 'Administrative-User'),
('admin@google.com', 'Session-Timeout', ':=', '3600');
