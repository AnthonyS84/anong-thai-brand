
-- Set all product prices to 0
UPDATE public.products 
SET 
  price = 0,
  compare_price = 0,
  cost_price = 0,
  updated_at = now()
WHERE price > 0 OR compare_price > 0 OR cost_price > 0;

-- Update the comment to reflect that prices are temporarily set to 0
COMMENT ON COLUMN public.products.price IS 'Product price - temporarily set to 0';
