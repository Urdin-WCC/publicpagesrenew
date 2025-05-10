-- Insertar un proyecto de prueba
INSERT INTO Project (
  id,
  title,
  slug,
  content,
  excerpt,
  coverImage,
  additionalImageUrls,
  displayType,
  status,
  featured,
  authorDisplayName,
  deleted,
  createdAt,
  updatedAt
) VALUES (
  CONCAT('cuid', FLOOR(RAND() * 1000000)), -- ID único
  'Proyecto de prueba',
  'proyecto-de-prueba',
  'Contenido del proyecto de prueba',
  'Extracto del proyecto de prueba',
  NULL, -- coverImage
  NULL, -- additionalImageUrls
  'SINGLE', -- displayType
  'PUBLISHED', -- status
  0, -- featured
  'Admin', -- authorDisplayName
  0, -- deleted
  NOW(), -- createdAt
  NOW() -- updatedAt
);
