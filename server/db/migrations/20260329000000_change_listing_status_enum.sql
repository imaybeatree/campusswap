-- migrate:up
ALTER TABLE listings MODIFY COLUMN status ENUM('active', 'reserved', 'sold') NOT NULL DEFAULT 'active';
UPDATE listings SET status = 'active' WHERE status = 'removed';

-- migrate:down
ALTER TABLE listings MODIFY COLUMN status ENUM('active', 'sold', 'removed') NOT NULL DEFAULT 'active';
