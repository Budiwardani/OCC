CREATE TABLE IF NOT EXISTS official_emails (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE
);

INSERT INTO official_emails (name, email) VALUES ('Support Team', 'support@occ.com') ON CONFLICT DO NOTHING;
