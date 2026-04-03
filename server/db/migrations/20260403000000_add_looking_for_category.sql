-- migrate:up
ALTER TABLE listings MODIFY COLUMN category ENUM('textbooks', 'electronics', 'furniture', 'clothing', 'supplies', 'tickets', 'looking_for', 'other') NOT NULL DEFAULT 'other';

-- migrate:down
ALTER TABLE listings MODIFY COLUMN category ENUM('textbooks', 'electronics', 'furniture', 'clothing', 'supplies', 'tickets', 'other') NOT NULL DEFAULT 'other';
