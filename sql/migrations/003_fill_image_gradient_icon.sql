-- ============================================================
-- Migration 003: Fill NULL image_gradient and icon for all restaurants
-- Run this once against the reserve-hub database.
-- Targets the 5 restaurants seeded by seed_restaurants_tables_reviews.sql
-- (r001–r005) that were inserted without these UI columns.
-- Also catches any other restaurants that may have NULL values.
-- ============================================================

USE `reserve-hub`;

-- ── ZUS Coffee (Café & Beverages) ──
-- Warm brown-to-orange gradient evoking coffee tones; coffee mug icon
UPDATE `restaurants`
SET `image_gradient` = 'linear-gradient(135deg,#6f4e37,#c0956c)',
    `icon`           = 'fa-mug-hot'
WHERE `name` = 'ZUS Coffee'
  AND `image_gradient` IS NULL;

-- ── McDonald's Malaysia (Fast Food) ──
-- Classic McDonald's red-to-gold gradient; burger icon
UPDATE `restaurants`
SET `image_gradient` = 'linear-gradient(135deg,#da291c,#ffbc0d)',
    `icon`           = 'fa-burger'
WHERE `name` = 'McDonald''s Malaysia'
  AND `image_gradient` IS NULL;

-- ── Nasi Kandar Pelita (Malaysian / Nasi Kandar) ──
-- Rich golden-to-amber curry tones; bowl-rice icon for Nasi Kandar
UPDATE `restaurants`
SET `image_gradient` = 'linear-gradient(135deg,#6c3483,#af7ac5)',
    `icon`           = 'fa-bowl-rice'
WHERE `name` = 'Nasi Kandar Pelita'
  AND `image_gradient` IS NULL;

-- ── Texas Chicken Malaysia (Fast Food / Fried Chicken) ──
-- Bold Texan red-to-burnt orange; drumstick icon
UPDATE `restaurants`
SET `image_gradient` = 'linear-gradient(135deg,#c0392b,#e74c3c)',
    `icon`           = 'fa-drumstick-bite'
WHERE `name` = 'Texas Chicken Malaysia'
  AND `image_gradient` IS NULL;

-- ── Marrybrown (Local Fast Food) ──
-- Marrybrown brand orange-to-red; drumstick icon for fried chicken
UPDATE `restaurants`
SET `image_gradient` = 'linear-gradient(135deg,#e67e22,#d35400)',
    `icon`           = 'fa-drumstick-bite'
WHERE `name` = 'Marrybrown'
  AND `image_gradient` IS NULL;

-- ── Safety net: set a default for any remaining NULLs ──
UPDATE `restaurants`
SET `image_gradient` = 'linear-gradient(135deg,#34495e,#2c3e50)'
WHERE `image_gradient` IS NULL;

UPDATE `restaurants`
SET `icon` = 'fa-utensils'
WHERE `icon` IS NULL;

-- ── Verification ──
SELECT `restaurant_id`, `name`, `image_gradient`, `icon`
FROM `restaurants`
WHERE `name` IN ('ZUS Coffee', 'McDonald''s Malaysia', 'Nasi Kandar Pelita', 'Texas Chicken Malaysia', 'Marrybrown');
