CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categories (name) VALUES 
('Product Quality'),
('Customer Service'),
('Billing Issue'),
('Delivery Problem'),
('Other')
ON CONFLICT (name) DO NOTHING;
