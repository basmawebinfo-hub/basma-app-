-- Add instance binding to webhook_configs
-- So each webhook can be tied to a specific WhatsApp number (prevents cross-number mixing)
ALTER TABLE webhook_configs
  ADD COLUMN IF NOT EXISTS instance_id UUID REFERENCES instances(id) ON DELETE CASCADE;

-- index for faster lookup when delivering events per-instance
CREATE INDEX IF NOT EXISTS idx_webhook_configs_instance ON webhook_configs(instance_id);
