-- StoreRate - MySQL Seed Data
-- Demo dataset: 6 users, 3 stores, 6 ratings

USE storerate;

-- Clear existing data safely
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE ratings;
TRUNCATE TABLE stores;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Insert Users
-- Admin (Password: Admin@123)
INSERT INTO users (id, name, email, password_hash, address, role)
VALUES (
    1,
    'System Administrator Official',
    'admin@storerating.com',
    '$2b$10$MpSkKJsLXU6wfZlB0K8vcet6hDP9iZk1U1k/tWexlSbqJQiUY3h8m',
    'Headquarters, 100 Main Boulevard, Tech District, City',
    'admin'
);

-- Normal User 1 (Password: User@1234)
INSERT INTO users (id, name, email, password_hash, address, role)
VALUES (
    2,
    'Christopher Johnathan Davis',
    'user1@example.com',
    '$2b$10$42m3Wy2OM8Cm3UtGuqvc1.BsysI/Rfv2qhTvJGLvLETs3pczPrTWy',
    '452 Maple Avenue, Apartment 3B, Downtown Metro City',
    'user'
);

-- Normal User 2 (Password: User@1234)
INSERT INTO users (id, name, email, password_hash, address, role)
VALUES (
    3,
    'Alexander Benjamin Scott',
    'user2@example.com',
    '$2b$10$42m3Wy2OM8Cm3UtGuqvc1.BsysI/Rfv2qhTvJGLvLETs3pczPrTWy',
    '789 Pine Tree Road, Suite 12, Greenfield Heights',
    'user'
);

-- Store Owner 1 (Password: Owner@1234)
INSERT INTO users (id, name, email, password_hash, address, role)
VALUES (
    4,
    'Michael Edward Anderson',
    'owner1@example.com',
    '$2b$10$GPQ9VeefgqbGTu57gFiLiu70qKSrrnMV7OnQPuCiHeBq1MSIRc5BS',
    '123 Market Square, Commercial Plaza, Metro City',
    'owner'
);

-- Store Owner 2 (Password: Owner@1234)
INSERT INTO users (id, name, email, password_hash, address, role)
VALUES (
    5,
    'Elizabeth Sarah Jenkins',
    'owner2@example.com',
    '$2b$10$GPQ9VeefgqbGTu57gFiLiu70qKSrrnMV7OnQPuCiHeBq1MSIRc5BS',
    '567 Harbor Boulevard, Waterfront District, City',
    'owner'
);

-- Store Owner 3 (Password: Owner@1234)
INSERT INTO users (id, name, email, password_hash, address, role)
VALUES (
    6,
    'David Harrison Miller-Jones',
    'owner3@example.com',
    '$2b$10$GPQ9VeefgqbGTu57gFiLiu70qKSrrnMV7OnQPuCiHeBq1MSIRc5BS',
    '890 Central Plaza, Financial District, City',
    'owner'
);

-- 2. Insert Stores (1-to-1 relationship with Store Owner)
INSERT INTO stores (id, name, email, address, owner_id)
VALUES (
    1,
    'Apex Electronics & Gadgets',
    'contact@apexelectronics.com',
    '123 Market Square, Commercial Plaza, Metro City',
    4
);

INSERT INTO stores (id, name, email, address, owner_id)
VALUES (
    2,
    'Gourmet Artisan Coffee House',
    'support@gourmetartisan.com',
    '567 Harbor Boulevard, Waterfront District, City',
    5
);

INSERT INTO stores (id, name, email, address, owner_id)
VALUES (
    3,
    'Urban Style Fashion Boutique',
    'hello@urbanstyleboutique.com',
    '890 Central Plaza, Financial District, City',
    6
);

-- 3. Insert Ratings (1 rating per user per store)
INSERT INTO ratings (user_id, store_id, rating) VALUES (2, 1, 5);
INSERT INTO ratings (user_id, store_id, rating) VALUES (2, 2, 4);
INSERT INTO ratings (user_id, store_id, rating) VALUES (2, 3, 3);
INSERT INTO ratings (user_id, store_id, rating) VALUES (3, 1, 4);
INSERT INTO ratings (user_id, store_id, rating) VALUES (3, 2, 5);
INSERT INTO ratings (user_id, store_id, rating) VALUES (3, 3, 4);
