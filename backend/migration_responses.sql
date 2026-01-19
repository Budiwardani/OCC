CREATE TABLE IF NOT EXISTS complaint_responses (
    id SERIAL PRIMARY KEY,
    complaint_id INTEGER REFERENCES complaints(id) ON DELETE CASCADE,
    responder_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Null if system or external
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sequences (
    name VARCHAR(50) PRIMARY KEY,
    current_value INTEGER DEFAULT 0
);

-- Initialize global sequence if not exists
INSERT INTO sequences (name, current_value) VALUES ('ticket_seq', 0) ON CONFLICT DO NOTHING;
