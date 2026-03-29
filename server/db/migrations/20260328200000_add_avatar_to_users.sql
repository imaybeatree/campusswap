-- migrate:up
ALTER TABLE users ADD COLUMN avatar_data LONGBLOB;
ALTER TABLE users ADD COLUMN avatar_mime VARCHAR(50);

-- migrate:down
ALTER TABLE users DROP COLUMN avatar_data;
ALTER TABLE users DROP COLUMN avatar_mime;
