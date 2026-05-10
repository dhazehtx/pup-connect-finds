-- Community reporting: users can report "I saw this dog", "Possible match", "Sighted location"
CREATE TABLE IF NOT EXISTS lost_pet_alert_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES lost_pet_alerts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  location_text TEXT,
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lost_pet_alert_reports_alert ON lost_pet_alert_reports(alert_id);
