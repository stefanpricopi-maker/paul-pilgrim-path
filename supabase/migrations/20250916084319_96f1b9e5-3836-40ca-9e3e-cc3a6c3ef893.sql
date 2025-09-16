-- Insert sample biblical characters for the game
INSERT INTO characters (name, description_en, description_ro, ability_type, ability_key) VALUES
('Paul the Apostle', 'Missionary journeys grant extra income from church buildings', 'Călătoriile misionare oferă venit suplimentar de la clădirile bisericilor', 'passive', 'church_income_boost'),
('Peter the Rock', 'Can escape jail immediately once per game', 'Poate scăpa din închisoare imediat o dată pe joc', 'one_time', 'jail_escape'),
('John the Beloved', 'Immune to negative community chest cards', 'Imun la cărțile negative ale trezoreriei comunității', 'passive', 'community_immunity'),
('Timothy', 'Receives extra denarii when passing start', 'Primește denarii suplimentari când trece prin start', 'passive', 'start_bonus'),
('Barnabas', 'Can teleport to any city once per turn', 'Poate teleporta în orice oraș o dată pe tură', 'active', 'city_teleport'),
('Silas', 'Reduces building costs by 25%', 'Reduce costurile de construcție cu 25%', 'passive', 'building_discount')
ON CONFLICT (name) DO NOTHING;