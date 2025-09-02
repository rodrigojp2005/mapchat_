-- 🗺️ MAPCHAT - SQL ESSENCIAL
-- Execute no MySQL da sua hospedagem

-- 1. Criar banco (mude o nome se quiser)
CREATE DATABASE IF NOT EXISTS mapchat_db;
USE mapchat_db;

-- 2. Tabela de usuários
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- 3. Tabela de perguntas (principal)
CREATE TABLE questions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    question_text VARCHAR(500) NOT NULL,
    answer_lat DECIMAL(10,7) NOT NULL,
    answer_lng DECIMAL(10,7) NOT NULL,
    category VARCHAR(100),
    hint VARCHAR(300),
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Outras tabelas necessárias
CREATE TABLE password_reset_tokens (
    email VARCHAR(255) PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL
);

CREATE TABLE failed_jobs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(255) UNIQUE NOT NULL,
    connection TEXT NOT NULL,
    queue TEXT NOT NULL,
    payload LONGTEXT NOT NULL,
    exception LONGTEXT NOT NULL,
    failed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE personal_access_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tokenable_type VARCHAR(255) NOT NULL,
    tokenable_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(64) UNIQUE NOT NULL,
    abilities TEXT NULL,
    last_used_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- 5. Inserir usuário admin
INSERT INTO users (name, email, password, created_at, updated_at) 
VALUES ('Admin MapChat', 'admin@mapchat.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW(), NOW());

-- 6. Inserir as 10 perguntas divertidas
INSERT INTO questions (user_id, question_text, answer_lat, answer_lng, category, hint, created_at, updated_at) VALUES 
(1, 'Qual cidade ficou mundialmente conhecida por um "visitante" extraterrestre em 1996?', -21.5554, -45.4297, 'UFO', 'ET Bilu mandou buscar conhecimento aqui!', NOW(), NOW()),
(1, 'Em qual cidade você encontraria o famoso "Pão de Açúcar"?', -22.9068, -43.1729, 'Turismo', 'Cidade maravilhosa, cheia de encantos mil!', NOW(), NOW()),
(1, 'Onde fica o "umbigo do mundo" segundo os paulistanos?', -23.5505, -46.6333, 'Humor', 'Terra da garoa e do trânsito infinito!', NOW(), NOW()),
(1, 'Em qual cidade você pode visitar as famosas Cataratas e ainda ouvir "Iguaçu Falls" em três idiomas?', -25.5163, -54.5854, 'Natureza', 'Tríplice fronteira com muito barulho de água!', NOW(), NOW()),
(1, 'Qual cidade é famosa por ter mais bois que gente e ser a capital do agronegócio?', -15.6014, -56.0979, 'Agronegócio', 'No coração do Pantanal, onde o boi é rei!', NOW(), NOW()),
(1, 'Em que cidade você pode "voar" de asa delta e depois tomar uma caipirinha na praia?', -22.9068, -43.1729, 'Aventura', 'Do alto da Pedra Bonita se vê o mar!', NOW(), NOW()),
(1, 'Qual cidade tem o maior carnaval fora de época do Brasil e todo mundo vira "axé music"?', -12.9714, -38.5014, 'Festa', 'Terra da música baiana e do acarajé!', NOW(), NOW()),
(1, 'Em qual cidade você pode almoçar no Brasil e jantar no Uruguai no mesmo dia?', -32.0346, -52.0985, 'Fronteira', 'Cidade gêmea onde se fala "portunhol"!', NOW(), NOW()),
(1, 'Qual cidade é conhecida como a "Suíça brasileira" mas tem mais montanha-russa que neve?', -22.7386, -45.5908, 'Turismo', 'No inverno fica cheio de paulista tentando ver neve!', NOW(), NOW()),
(1, 'Em que cidade você pode tomar banho de rio e ainda ver um encontro das águas que parece mágica?', -3.1190, -60.0217, 'Natureza', 'Portal da Amazônia, onde rios se abraçam!', NOW(), NOW());

-- Verificar se deu certo
SELECT 'Usuários:', COUNT(*) FROM users;
SELECT 'Perguntas:', COUNT(*) FROM questions;
