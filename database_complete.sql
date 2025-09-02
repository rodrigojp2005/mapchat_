-- ============================================
-- 🗺️ MAPCHAT - CÓDIGO SQL COMPLETO
-- Execute este código diretamente no MySQL
-- ============================================

-- 1. CRIAR DATABASE (substitua 'mapchat_db' pelo nome desejado)
CREATE DATABASE IF NOT EXISTS mapchat_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mapchat_db;

-- 2. TABELA DE USUÁRIOS
CREATE TABLE users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified_at TIMESTAMP NULL DEFAULT NULL,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100) NULL DEFAULT NULL,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY users_email_unique (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABELA DE RESET DE SENHAS
CREATE TABLE password_reset_tokens (
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABELA DE JOBS FALHADOS
CREATE TABLE failed_jobs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    uuid VARCHAR(255) NOT NULL UNIQUE,
    connection TEXT NOT NULL,
    queue TEXT NOT NULL,
    payload LONGTEXT NOT NULL,
    exception LONGTEXT NOT NULL,
    failed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY failed_jobs_uuid_unique (uuid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. TABELA DE TOKENS DE ACESSO PESSOAL (Sanctum)
CREATE TABLE personal_access_tokens (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    tokenable_type VARCHAR(255) NOT NULL,
    tokenable_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    abilities TEXT NULL,
    last_used_at TIMESTAMP NULL DEFAULT NULL,
    expires_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY personal_access_tokens_token_unique (token),
    KEY personal_access_tokens_tokenable_type_tokenable_id_index (tokenable_type, tokenable_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. TABELA DE PERGUNTAS (Principal do jogo)
CREATE TABLE questions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    question_text VARCHAR(255) NOT NULL,
    answer_lat DECIMAL(10,7) NOT NULL,
    answer_lng DECIMAL(10,7) NOT NULL,
    category VARCHAR(255) NULL DEFAULT NULL,
    hint VARCHAR(255) NULL DEFAULT NULL,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (id),
    KEY questions_user_id_foreign (user_id),
    CONSTRAINT questions_user_id_foreign FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 🌱 DADOS INICIAIS (SEEDS)
-- ============================================

-- 7. INSERIR USUÁRIO ADMINISTRADOR
INSERT INTO users (name, email, password, created_at, updated_at) VALUES 
('Admin MapChat', 'admin@mapchat.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW(), NOW());

-- 8. INSERIR AS 10 PERGUNTAS DIVERTIDAS
INSERT INTO questions (user_id, question_text, answer_lat, answer_lng, category, hint, created_at, updated_at) VALUES 
(1, 'Qual cidade ficou mundialmente conhecida por um "visitante" extraterrestre em 1996?', -21.5554000, -45.4297000, 'UFO', 'ET Bilu mandou buscar conhecimento aqui!', NOW(), NOW()),
(1, 'Em qual cidade você encontraria o famoso "Pão de Açúcar"?', -22.9068000, -43.1729000, 'Turismo', 'Cidade maravilhosa, cheia de encantos mil!', NOW(), NOW()),
(1, 'Onde fica o "umbigo do mundo" segundo os paulistanos?', -23.5505000, -46.6333000, 'Humor', 'Terra da garoa e do trânsito infinito!', NOW(), NOW()),
(1, 'Em qual cidade você pode visitar as famosas Cataratas e ainda ouvir "Iguaçu Falls" em três idiomas?', -25.5163000, -54.5854000, 'Natureza', 'Tríplice fronteira com muito barulho de água!', NOW(), NOW()),
(1, 'Qual cidade é famosa por ter mais bois que gente e ser a capital do agronegócio?', -15.6014000, -56.0979000, 'Agronegócio', 'No coração do Pantanal, onde o boi é rei!', NOW(), NOW()),
(1, 'Em que cidade você pode "voar" de asa delta e depois tomar uma caipirinha na praia?', -22.9068000, -43.1729000, 'Aventura', 'Do alto da Pedra Bonita se vê o mar!', NOW(), NOW()),
(1, 'Qual cidade tem o maior carnaval fora de época do Brasil e todo mundo vira "axé music"?', -12.9714000, -38.5014000, 'Festa', 'Terra da música baiana e do acarajé!', NOW(), NOW()),
(1, 'Em qual cidade você pode almoçar no Brasil e jantar no Uruguai no mesmo dia?', -32.0346000, -52.0985000, 'Fronteira', 'Cidade gêmea onde se fala "portunhol"!', NOW(), NOW()),
(1, 'Qual cidade é conhecida como a "Suíça brasileira" mas tem mais montanha-russa que neve?', -22.7386000, -45.5908000, 'Turismo', 'No inverno fica cheio de paulista tentando ver neve!', NOW(), NOW()),
(1, 'Em que cidade você pode tomar banho de rio e ainda ver um encontro das águas que parece mágica?', -3.1190000, -60.0217000, 'Natureza', 'Portal da Amazônia, onde rios se abraçam!', NOW(), NOW());

-- ============================================
-- ✅ VERIFICAÇÃO DOS DADOS
-- ============================================

-- Verificar se tudo foi criado corretamente
SELECT 'USUÁRIOS CRIADOS:' as info, COUNT(*) as total FROM users;
SELECT 'PERGUNTAS CRIADAS:' as info, COUNT(*) as total FROM questions;
SELECT 'TABELAS CRIADAS:' as info, COUNT(*) as total FROM information_schema.tables WHERE table_schema = DATABASE();

-- Mostrar algumas perguntas para conferir
SELECT id, LEFT(question_text, 50) as pergunta_resumida, category, hint FROM questions LIMIT 5;

-- ============================================
-- 🎯 INFORMAÇÕES IMPORTANTES
-- ============================================
/*
🔹 BANCO CRIADO: mapchat_db
🔹 USUÁRIO ADMIN: admin@mapchat.com (senha padrão: password)
🔹 10 PERGUNTAS: Geografia brasileira divertida
🔹 ESTRUTURA: Compatível com Laravel 10 + Socialite

📝 PARA USAR NO .ENV:
DB_DATABASE=mapchat_db
DB_USERNAME=seu_usuario_mysql
DB_PASSWORD=sua_senha_mysql

🚀 PRÓXIMOS PASSOS:
1. Execute este SQL no seu MySQL
2. Configure o .env com os dados corretos
3. Teste a aplicação
4. Configure Google OAuth se necessário
*/
