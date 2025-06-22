
-- Create RPC functions for incrementing ad metrics
CREATE OR REPLACE FUNCTION increment_ad_impressions(ad_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE advertisements 
  SET total_impressions = total_impressions + 1 
  WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_ad_clicks(ad_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE advertisements 
  SET total_clicks = total_clicks + 1 
  WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql;
