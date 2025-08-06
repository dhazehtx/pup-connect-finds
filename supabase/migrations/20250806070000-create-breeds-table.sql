-- Create breeds table for the 50 most popular dog breeds
CREATE TABLE IF NOT EXISTS breeds (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    popularity_rank INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the 50 most popular breeds by popularity ranking
INSERT INTO breeds (name, popularity_rank) VALUES 
('Labrador Retriever', 1),
('Golden Retriever', 2),
('German Shepherd', 3),
('French Bulldog', 4),
('Bulldog', 5),
('Poodle', 6),
('Beagle', 7),
('Rottweiler', 8),
('Yorkshire Terrier', 9),
('German Shorthaired Pointer', 10),
('Siberian Husky', 11),
('Dachshund', 12),
('Pembroke Welsh Corgi', 13),
('Australian Shepherd', 14),
('Boston Terrier', 15),
('Bernese Mountain Dog', 16),
('Boxer', 17),
('Cocker Spaniel', 18),
('Border Collie', 19),
('Great Dane', 20),
('Pomeranian', 21),
('Shih Tzu', 22),
('Mastiff', 23),
('Chihuahua', 24),
('Brittany', 25),
('Shetland Sheepdog', 26),
('Belgian Malinois', 27),
('Weimaraner', 28),
('Miniature Schnauzer', 29),
('Cavalier King Charles Spaniel', 30),
('Doberman Pinscher', 31),
('Australian Cattle Dog', 32),
('Cane Corso', 33),
('Collie', 34),
('Rhodesian Ridgeback', 35),
('Newfoundland', 36),
('West Highland White Terrier', 37),
('Saint Bernard', 38),
('Bloodhound', 39),
('Bull Terrier', 40),
('Basset Hound', 41),
('Bichon Frise', 42),
('Akita', 43),
('Portuguese Water Dog', 44),
('Whippet', 45),
('Alaskan Malamute', 46),
('Scottish Terrier', 47),
('Australian Terrier', 48),
('Chinese Shar-Pei', 49),
('Vizsla', 50)
ON CONFLICT (name) DO NOTHING;

-- Create index for efficient ordering by popularity
CREATE INDEX IF NOT EXISTS idx_breeds_popularity_rank ON breeds(popularity_rank);