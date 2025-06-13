
-- Create subscription analytics table for tracking metrics
CREATE TABLE IF NOT EXISTS public.subscription_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  new_subscriptions INTEGER NOT NULL DEFAULT 0,
  cancelled_subscriptions INTEGER NOT NULL DEFAULT 0,
  upgrades INTEGER NOT NULL DEFAULT 0,
  downgrades INTEGER NOT NULL DEFAULT 0,
  mrr NUMERIC NOT NULL DEFAULT 0,
  total_revenue NUMERIC NOT NULL DEFAULT 0,
  tier_breakdown JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create function to upsert analytics data
CREATE OR REPLACE FUNCTION upsert_analytics(
  analytics_date DATE,
  metric_name TEXT,
  metric_value INTEGER
) RETURNS VOID AS $$
BEGIN
  INSERT INTO subscription_analytics (date, new_subscriptions, cancelled_subscriptions, upgrades, downgrades)
  VALUES (analytics_date, 
    CASE WHEN metric_name = 'new_subscriptions' THEN metric_value ELSE 0 END,
    CASE WHEN metric_name = 'cancelled_subscriptions' THEN metric_value ELSE 0 END,
    CASE WHEN metric_name = 'upgrades' THEN metric_value ELSE 0 END,
    CASE WHEN metric_name = 'downgrades' THEN metric_value ELSE 0 END
  )
  ON CONFLICT (date) DO UPDATE SET
    new_subscriptions = subscription_analytics.new_subscriptions + 
      CASE WHEN metric_name = 'new_subscriptions' THEN metric_value ELSE 0 END,
    cancelled_subscriptions = subscription_analytics.cancelled_subscriptions + 
      CASE WHEN metric_name = 'cancelled_subscriptions' THEN metric_value ELSE 0 END,
    upgrades = subscription_analytics.upgrades + 
      CASE WHEN metric_name = 'upgrades' THEN metric_value ELSE 0 END,
    downgrades = subscription_analytics.downgrades + 
      CASE WHEN metric_name = 'downgrades' THEN metric_value ELSE 0 END;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on subscription_analytics
ALTER TABLE public.subscription_analytics ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to analytics (for dashboard)
CREATE POLICY "analytics_select_all" ON public.subscription_analytics
  FOR SELECT USING (true);

-- Create policy for edge functions to insert/update analytics
CREATE POLICY "analytics_insert_system" ON public.subscription_analytics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "analytics_update_system" ON public.subscription_analytics
  FOR UPDATE USING (true);
