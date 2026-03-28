-- migrate:up
ALTER TABLE listings ADD COLUMN image_data LONGBLOB;
ALTER TABLE listings ADD COLUMN image_mime VARCHAR(50);

-- migrate:down
ALTER TABLE listings DROP COLUMN image_data;
ALTER TABLE listings DROP COLUMN image_mime;
