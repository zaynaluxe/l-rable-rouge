-- Schéma SQL pour l'application "L'Érable Rouge"
-- Compatible Neon PostgreSQL

-- Extensions (optionnel, mais utile pour les UUID si besoin)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table des utilisateurs (Clients + Admins)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'client' CHECK (role IN ('client', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table des catégories
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table des articles du menu
CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    photo_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Table des commandes
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'en attente' CHECK (status IN ('en attente', 'en préparation', 'en route', 'livré', 'annulé')),
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    order_type VARCHAR(20) DEFAULT 'sur place' CHECK (order_type IN ('sur place', 'à emporter', 'livraison')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Détails des articles de la commande
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INTEGER REFERENCES menu_items(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- 6. Table des réservations
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    number_of_guests INTEGER NOT NULL CHECK (number_of_guests > 0),
    status VARCHAR(50) DEFAULT 'en_attente' CHECK (status IN ('en_attente', 'confirmé', 'rejeté', 'annulé', 'terminé')),
    special_requests TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Table des livraisons
CREATE TABLE IF NOT EXISTS deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    delivery_address TEXT NOT NULL,
    delivery_status VARCHAR(50) DEFAULT 'en attente' CHECK (delivery_status IN ('en attente', 'en cours', 'livré', 'échec')),
    delivery_person_name VARCHAR(100),
    estimated_delivery_time TIMESTAMP WITH TIME ZONE,
    actual_delivery_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimiser les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_menu_items_updated_at ON menu_items;
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Table des paiements
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    methode VARCHAR(50) NOT NULL CHECK (methode IN ('cash', 'carte')),
    montant DECIMAL(10, 2) NOT NULL,
    statut VARCHAR(50) DEFAULT 'en attente' CHECK (statut IN ('en attente', 'payé', 'échoué')),
    transaction_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Table des slides (Carousel)
CREATE TABLE IF NOT EXISTS slides (
    id SERIAL PRIMARY KEY,
    photo_url TEXT NOT NULL,
    titre VARCHAR(255),
    description TEXT,
    ordre INTEGER DEFAULT 0,
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertion de données par défaut (si vide)
INSERT INTO categories (name, description, display_order)
SELECT 'Plats Signature', 'Nos meilleures créations culinaires.', 1
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Plats Signature');

INSERT INTO categories (name, description, display_order)
SELECT 'Entrées Fraîches', 'Pour bien commencer votre repas.', 2
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Entrées Fraîches');

INSERT INTO categories (name, description, display_order)
SELECT 'Desserts Gourmands', 'Une touche sucrée pour finir en beauté.', 3
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Desserts Gourmands');

INSERT INTO categories (name, description, display_order)
SELECT 'Jus & Cocktails', 'Rafraîchissements naturels.', 4
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Jus & Cocktails');

INSERT INTO slides (photo_url, titre, description, ordre, actif)
SELECT 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=2000', 'L''Érable Rouge', 'Une expérience culinaire unique à Agadir.', 1, true
WHERE NOT EXISTS (SELECT 1 FROM slides WHERE titre = 'L''Érable Rouge');

INSERT INTO slides (photo_url, titre, description, ordre, actif)
SELECT 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&q=80&w=2000', 'Saveurs Authentiques', 'Des produits frais sélectionnés avec soin.', 2, true
WHERE NOT EXISTS (SELECT 1 FROM slides WHERE titre = 'Saveurs Authentiques');
