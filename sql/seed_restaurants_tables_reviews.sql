-- =============================================================================
-- sql/seed_restaurants_tables_reviews.sql
-- Seeds real Malaysian restaurants, unique floor plan layouts, and authentic reviews.
-- Vendor: c004 (imanz36163@gmail.com)
-- Customer for reviews: c005 (2024439998@student.uitm.edu.my)
-- =============================================================================

USE `reserve-hub`;

SET FOREIGN_KEY_CHECKS = 0;

-- =============================================================================
-- SECTION 1: RESTAURANTS
-- =============================================================================

INSERT INTO `restaurants`
  (restaurant_id, vendor_id, name, description, cuisine, location, price_range,
   seed_rating, opening_time, closing_time, opening_hours, image_url,
   status, is_halal, is_open)
VALUES

-- R1: ZUS Coffee (Kiosk/Café style)
('r001', 'c004',
 'ZUS Coffee',
 'Malaysia''s fastest-growing home-grown coffee chain, known for its premium quality coffee at affordable prices. From signature cold brews to creamy lattes, ZUS brings specialty coffee to everyone.',
 'Cafe & Beverages',
 'Pavilion Bukit Jalil, Kuala Lumpur',
 '$',
 4.5,
 '07:00:00', '23:00:00', '7:00 AM – 11:00 PM',
 '../pictures/restaurants/zus_coffee.png',
 'approved', 1, 1),

-- R2: McDonald's Malaysia (Fast Food / Grid style)
('r002', 'c004',
 'McDonald''s Malaysia',
 'The world''s most iconic fast food chain, serving Malaysians since 1982. Enjoy Prosperity Burgers, McSpicy Chicken, and local favourites alongside the globally beloved Big Mac — all Halal certified.',
 'Fast Food',
 'Mid Valley Megamall, Kuala Lumpur',
 '$$',
 4.2,
 '08:00:00', '00:00:00', '8:00 AM – 12:00 AM',
 '../pictures/restaurants/mcdonalds_malaysia.png',
 'approved', 1, 1),

-- R3: Nasi Kandar Pelita (Family Dining / Spacious style)
('r003', 'c004',
 'Nasi Kandar Pelita',
 'An iconic Malaysian institution serving authentic Penang-style Nasi Kandar since 1995. Renowned for its rich, spiced curries, fresh fish, and the legendary signature curry sauce poured generously over steamed rice.',
 'Malaysian / Nasi Kandar',
 'KLCC, Kuala Lumpur',
 '$$',
 4.3,
 '10:00:00', '22:00:00', '10:00 AM – 10:00 PM',
 '../pictures/restaurants/nasi_kandar_pelita.png',
 'approved', 1, 1),

-- R4: Texas Chicken Malaysia (Counter Service / Mixed Rows style)
('r004', 'c004',
 'Texas Chicken Malaysia',
 'Home of the Original Southern Fried Chicken in Malaysia. With its perfectly seasoned crispy coating and juicy tender meat, Texas Chicken brings bold Texan flavour to every Malaysian neighbourhood.',
 'Fast Food / Fried Chicken',
 'Sunway Pyramid, Petaling Jaya',
 '$',
 4.1,
 '09:00:00', '23:00:00', '9:00 AM – 11:00 PM',
 '../pictures/restaurants/texas_chicken.png',
 'approved', 1, 1),

-- R5: Marrybrown (Local Fast Food / Booth style)
('r005', 'c004',
 'Marrybrown',
 'Malaysia''s very own homegrown fast food chain — the only Malaysian fast food brand with global presence. Famous for its Crispy Chicken, Rice Meal sets, and the beloved Nasi Lemak Burger, Marrybrown is a proud national treasure.',
 'Local Fast Food',
 'IOI City Mall, Putrajaya',
 '$',
 4.0,
 '08:00:00', '22:00:00', '8:00 AM – 10:00 PM',
 '../pictures/restaurants/marrybrown.png',
 'approved', 1, 1);


-- =============================================================================
-- SECTION 2: TABLES (Unique floor plan per restaurant)
-- =============================================================================

-- ─────────────────────────────────────────────
-- R1: ZUS Coffee — Kiosk/Cafe style
-- Small round tables, tight cluster, narrow canvas (low x, low y)
-- Great for solo and pair seating
-- ─────────────────────────────────────────────
INSERT INTO `tables` (table_id, restaurant_id, table_number, capacity, shape, canvas_x_coordinate, canvas_y_coordinate) VALUES
('t001', 'r001', 'T1', 2, 'round',  80,  80),
('t002', 'r001', 'T2', 2, 'round', 180,  80),
('t003', 'r001', 'T3', 2, 'round',  80, 180),
('t004', 'r001', 'T4', 2, 'round', 180, 180),
('t005', 'r001', 'T5', 4, 'round', 130, 290),
('t006', 'r001', 'T6', 2, 'round', 280,  80),
('t007', 'r001', 'T7', 2, 'round', 280, 180);

-- ─────────────────────────────────────────────
-- R2: McDonald's — Fast Food / Grid style
-- Rect tables in neat rows, uniform capacity 4, evenly spread
-- ─────────────────────────────────────────────
INSERT INTO `tables` (table_id, restaurant_id, table_number, capacity, shape, canvas_x_coordinate, canvas_y_coordinate) VALUES
('t008', 'r002', 'T1', 4, 'rect', 100, 100),
('t009', 'r002', 'T2', 4, 'rect', 250, 100),
('t010', 'r002', 'T3', 4, 'rect', 400, 100),
('t011', 'r002', 'T4', 4, 'rect', 100, 230),
('t012', 'r002', 'T5', 4, 'rect', 250, 230),
('t013', 'r002', 'T6', 4, 'rect', 400, 230),
('t014', 'r002', 'T7', 4, 'rect', 100, 360),
('t015', 'r002', 'T8', 4, 'rect', 250, 360),
('t016', 'r002', 'T9', 4, 'rect', 400, 360);

-- ─────────────────────────────────────────────
-- R3: Nasi Kandar Pelita — Family Dining / Spacious style
-- Mix of large family tables (6–8 cap) and intimate booths (2 cap)
-- Wide coordinate range across canvas
-- ─────────────────────────────────────────────
INSERT INTO `tables` (table_id, restaurant_id, table_number, capacity, shape, canvas_x_coordinate, canvas_y_coordinate) VALUES
('t017', 'r003', 'Family 1',  8, 'rect', 150, 100),
('t018', 'r003', 'Family 2',  8, 'rect', 400, 100),
('t019', 'r003', 'Family 3',  6, 'rect', 150, 280),
('t020', 'r003', 'Family 4',  6, 'rect', 400, 280),
('t021', 'r003', 'Booth 1',   2, 'round', 650,  80),
('t022', 'r003', 'Booth 2',   2, 'round', 650, 200),
('t023', 'r003', 'Booth 3',   2, 'round', 650, 320),
('t024', 'r003', 'Table 9',   4, 'rect',  150, 440),
('t025', 'r003', 'Table 10',  4, 'rect',  400, 440);

-- ─────────────────────────────────────────────
-- R4: Texas Chicken — Counter-service / Mixed rows
-- Alternating round 2-seat and rect 4-seat in diagonal spread
-- ─────────────────────────────────────────────
INSERT INTO `tables` (table_id, restaurant_id, table_number, capacity, shape, canvas_x_coordinate, canvas_y_coordinate) VALUES
('t026', 'r004', 'A1', 2, 'round',  80, 120),
('t027', 'r004', 'A2', 4, 'rect',  220, 120),
('t028', 'r004', 'A3', 2, 'round', 380, 120),
('t029', 'r004', 'B1', 4, 'rect',   80, 270),
('t030', 'r004', 'B2', 2, 'round', 220, 270),
('t031', 'r004', 'B3', 4, 'rect',  380, 270),
('t032', 'r004', 'C1', 6, 'rect',  150, 420),
('t033', 'r004', 'C2', 6, 'rect',  350, 420);

-- ─────────────────────────────────────────────
-- R5: Marrybrown — Booth + open floor hybrid
-- Booths along the left wall, open round tables in center
-- Asymmetric, intentionally different from all above
-- ─────────────────────────────────────────────
INSERT INTO `tables` (table_id, restaurant_id, table_number, capacity, shape, canvas_x_coordinate, canvas_y_coordinate) VALUES
('t034', 'r005', 'Booth 1', 2, 'rect',   70, 100),
('t035', 'r005', 'Booth 2', 2, 'rect',   70, 210),
('t036', 'r005', 'Booth 3', 2, 'rect',   70, 320),
('t037', 'r005', 'Booth 4', 2, 'rect',   70, 430),
('t038', 'r005', 'C1',      4, 'round', 240, 130),
('t039', 'r005', 'C2',      4, 'round', 380, 130),
('t040', 'r005', 'C3',      4, 'round', 240, 300),
('t041', 'r005', 'C4',      4, 'round', 380, 300),
('t042', 'r005', 'VIP 1',   6, 'rect',  300, 450);


-- =============================================================================
-- SECTION 3: REVIEWS (Authentic-style sourced from real feedback)
-- customer_id c005 is the only non-admin customer in the system.
-- =============================================================================

INSERT INTO `reviews` (review_id, customer_id, restaurant_id, reservation_id, rating, comment, created_at) VALUES

-- ── ZUS Coffee (r001) ──
('rv001', 'c005', 'r001', NULL, 5,
 'Absolutely love ZUS Coffee! The Caramel Iced Latte is dangerously addictive and the price is so reasonable compared to other specialty cafes. Staff are always cheerful and the app loyalty rewards make every visit worth it. My go-to spot before work every morning!',
 '2026-05-15 09:21:00'),

('rv002', 'c005', 'r001', NULL, 4,
 'Great coffee at an unbeatable price. The Oat Milk Brown Sugar Latte is surprisingly smooth. Waiting time can be a bit long during peak morning hours, but it is understandable given how popular the place is. Overall a solid 4 stars — will keep coming back.',
 '2026-05-22 08:45:00'),

('rv003', 'c005', 'r001', NULL, 5,
 'ZUS has completely replaced Starbucks for me. The quality is on par if not better, and the prices are 30–40% cheaper. The seasonal menu items are always exciting and they rotate frequently. The Pavilion Bukit Jalil branch is also clean and well-managed.',
 '2026-06-01 10:10:00'),

-- ── McDonald's (r002) ──
('rv004', 'c005', 'r002', NULL, 5,
 'McDonald''s Malaysia never disappoints. The McSpicy is genuinely one of the best fast food burgers in Malaysia — spicy, juicy and crispy all at once. The fries are always hot and fresh at this outlet. Service is fast and the self-order kiosks are very convenient.',
 '2026-05-18 13:30:00'),

('rv005', 'c005', 'r002', NULL, 4,
 'Solid and consistent as always. Love the Prosperity Burger season — it''s a national tradition at this point! The Mid Valley outlet is spacious and well-maintained. Could improve the cleanliness of some dining areas during peak lunch hours but otherwise a great experience.',
 '2026-05-28 12:15:00'),

('rv006', 'c005', 'r002', NULL, 4,
 'Always reliable. The McFlurry is my weakness. Came here after a movie and the drive-through was surprisingly quick for a Friday night. The staff were polite and my order was accurate. Four stars because the ice cream machine was down which was a minor letdown!',
 '2026-06-05 21:00:00'),

-- ── Nasi Kandar Pelita (r003) ──
('rv007', 'c005', 'r003', NULL, 5,
 'Pelita Nasi Kandar is an institution in Malaysia. The curries are rich, deeply spiced, and incredibly flavourful. The fish curry in particular is legendary — they pour it over your rice and the combination is absolutely divine. Prices are fair for the portion size. A must-try for anyone visiting KL.',
 '2026-05-10 19:45:00'),

('rv008', 'c005', 'r003', NULL, 4,
 'Great nasi kandar with authentic Penang flavour right here in KL. The ayam goreng berempah is crispy and delicious. Service can be a bit hectic as it gets very busy, especially during dinner time. But the food quality makes it worth the wait. Highly recommend the dhal curry!',
 '2026-05-24 20:00:00'),

('rv009', 'c005', 'r003', NULL, 5,
 'This place is open 24 hours which is a lifesaver! Late night nasi kandar cravings? Pelita has got you covered. The freshness of the food even at 2am is impressive. The KLCC location is premium and the ambience is great for a family dinner or even a solo late-night meal.',
 '2026-06-08 23:30:00'),

-- ── Texas Chicken (r004) ──
('rv010', 'c005', 'r004', NULL, 5,
 'Texas Chicken is seriously underrated in Malaysia. The Original Fried Chicken here is crunchier and juicier than most competitors. The honey butter biscuit is an absolute gem — soft, warm and buttery. The combo meal value is great and the staff are friendly. Definitely coming back!',
 '2026-05-12 18:30:00'),

('rv011', 'c005', 'r004', NULL, 4,
 'Came here for dinner with the family and everyone enjoyed it. The chicken is well-seasoned with a good crunch and the Whipped Potato is a great comfort side dish. The Sunway Pyramid outlet is clean and spacious. Slightly pricier than I expected for a fast food place but the quality justifies it.',
 '2026-05-30 19:15:00'),

('rv012', 'c005', 'r004', NULL, 4,
 'Really enjoyed my Texas Chicken experience. The spicy chicken has great heat without being overwhelming. The coleslaw is fresh and creamy. My only minor complaint is the waiting time — it took about 15 minutes for my order which is a bit long. But food quality was excellent so I cannot complain too much.',
 '2026-06-10 13:00:00'),

-- ── Marrybrown (r005) ──
('rv013', 'c005', 'r005', NULL, 5,
 'So proud of Marrybrown as a Malaysian brand! The Nasi Lemak Burger is an absolute stroke of genius — the flavours are uniquely Malaysian and delicious. The Crispy Chicken is perfectly fried and not overly greasy. Love that this is a locally owned brand competing on the global stage. Full 5 stars!',
 '2026-05-17 12:45:00'),

('rv014', 'c005', 'r005', NULL, 4,
 'Marrybrown is a great Malaysian alternative to international fast food chains. The rice meal sets are satisfying and the chicken is consistently good. The IOI City Mall branch is modern and well-maintained. Service could be a touch faster but overall a pleasant dining experience.',
 '2026-06-02 13:30:00'),

('rv015', 'c005', 'r005', NULL, 5,
 'Been a loyal Marrybrown customer since I was a child. There''s something nostalgic and comforting about this place. The Spicy Fried Chicken is exceptional — really crispy coating with a kick. The Marrybrown app deals and promotions make it even more affordable. Truly a Malaysian icon!',
 '2026-06-14 18:00:00');

SET FOREIGN_KEY_CHECKS = 1;

-- Verification
SELECT 'restaurants' AS tbl, COUNT(*) AS total FROM restaurants
UNION ALL
SELECT 'tables', COUNT(*) FROM `tables`
UNION ALL
SELECT 'reviews', COUNT(*) FROM reviews;
