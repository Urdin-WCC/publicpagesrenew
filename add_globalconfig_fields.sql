ALTER TABLE GlobalConfig
  ADD COLUMN header JSON NULL AFTER themeColor,
  ADD COLUMN footer JSON NULL AFTER header,
  ADD COLUMN sidebar JSON NULL AFTER footer,
  ADD COLUMN social JSON NULL AFTER sidebar,
  ADD COLUMN sharing JSON NULL AFTER social;