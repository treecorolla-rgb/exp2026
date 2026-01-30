-- Add instructions column to payment_methods table if it doesn't exist
ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS instructions TEXT;

-- Update existing payment methods with some default placeholders (optional, but good for testing)
UPDATE payment_methods SET instructions = 'Thank you for paying with Bitcoin. Please send the exact amount to the wallet address provided.' WHERE name ILIKE '%bitcoin%';
