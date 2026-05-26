ALTER TABLE habitaciones
ADD COLUMN servicios TEXT NULL AFTER estado;

UPDATE habitaciones
SET servicios = CASE
    WHEN tipo = 'VIP' THEN JSON_ARRAY('WiFi premium', 'Desayuno buffet', 'Spa privado')
    WHEN tipo = 'Deluxe' THEN JSON_ARRAY('WiFi premium', 'Desayuno incluido', 'Acceso a piscina')
    ELSE JSON_ARRAY('WiFi', 'Baño privado', 'Aire acondicionado')
END
WHERE servicios IS NULL OR servicios = '';

UPDATE habitaciones
SET servicios = JSON_ARRAY('WiFi', 'Baño privado', 'Aire acondicionado')
WHERE (servicios IS NULL OR servicios = '') AND tipo NOT IN ('VIP', 'Deluxe');
