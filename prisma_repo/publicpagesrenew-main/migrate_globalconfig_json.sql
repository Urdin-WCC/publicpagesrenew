-- Eliminar los checks de validez JSON si existen (puede requerir nombre del constraint)
ALTER TABLE `GlobalConfig` DROP CHECK `GlobalConfig_chk_1`, DROP CHECK `GlobalConfig_chk_2`, DROP CHECK `GlobalConfig_chk_3`, DROP CHECK `GlobalConfig_chk_4`, DROP CHECK `GlobalConfig_chk_5`;

-- Cambiar cada campo individualmente a tipo JSON
ALTER TABLE `GlobalConfig` MODIFY COLUMN `header` JSON NULL;
ALTER TABLE `GlobalConfig` MODIFY COLUMN `footer` JSON NULL;
ALTER TABLE `GlobalConfig` MODIFY COLUMN `sidebar` JSON NULL;
ALTER TABLE `GlobalConfig` MODIFY COLUMN `social` JSON NULL;
ALTER TABLE `GlobalConfig` MODIFY COLUMN `sharing` JSON NULL;