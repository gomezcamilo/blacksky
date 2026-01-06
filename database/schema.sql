-- =============================================
-- BLACK SKY - Database Schema
-- MySQL 8.0+ / MariaDB 10.4+
-- Red Social Cyberpunk con Encriptación
-- =============================================

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS black_sky_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE black_sky_db;

-- =============================================
-- TABLA: users
-- Usuarios de la plataforma
-- =============================================
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    handle VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    recovery_code_hash VARCHAR(255) NOT NULL COMMENT 'Código de recuperación hasheado',
    avatar_url VARCHAR(500) DEFAULT NULL,
    cover_url VARCHAR(500) DEFAULT NULL,
    bio TEXT DEFAULT NULL,
    is_verified TINYINT(1) DEFAULT 0,
    is_online TINYINT(1) DEFAULT 0,
    is_vip TINYINT(1) DEFAULT 0 COMMENT 'Usuario VIP sin anuncios',
    vip_expires_at TIMESTAMP NULL DEFAULT NULL,
    followers_count INT UNSIGNED DEFAULT 0,
    following_count INT UNSIGNED DEFAULT 0,
    posts_count INT UNSIGNED DEFAULT 0,
    encryption_level INT UNSIGNED DEFAULT 1,
    last_seen TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_handle (handle),
    INDEX idx_email (email),
    INDEX idx_is_online (is_online),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLA: user_sessions
-- Sesiones activas de usuarios
-- =============================================
DROP TABLE IF EXISTS user_sessions;
CREATE TABLE user_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    token VARCHAR(500) NOT NULL,
    device_info TEXT DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_token (token(255)),
    INDEX idx_expires_at (expires_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLA: followers
-- Relaciones de seguimiento entre usuarios
-- =============================================
DROP TABLE IF EXISTS followers;
CREATE TABLE followers (
    id VARCHAR(36) PRIMARY KEY,
    follower_id VARCHAR(36) NOT NULL,
    following_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_follow (follower_id, following_id),
    INDEX idx_follower (follower_id),
    INDEX idx_following (following_id),
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLA: posts
-- Publicaciones de los usuarios
-- =============================================
DROP TABLE IF EXISTS posts;
CREATE TABLE posts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    encrypted_content TEXT DEFAULT NULL,
    encryption_type ENUM('binary', 'aes', 'reverse', 'none') DEFAULT 'none',
    visibility ENUM('public', 'followers', 'private') DEFAULT 'public',
    -- Música adjunta
    music_url VARCHAR(500) DEFAULT NULL,
    music_title VARCHAR(255) DEFAULT NULL,
    music_artist VARCHAR(255) DEFAULT NULL,
    music_platform ENUM('youtube', 'spotify', 'soundcloud') DEFAULT NULL,
    -- Imagen adjunta
    image_url VARCHAR(500) DEFAULT NULL,
    -- Repost
    is_repost TINYINT(1) DEFAULT 0,
    original_post_id VARCHAR(36) DEFAULT NULL,
    repost_comment TEXT DEFAULT NULL,
    reposted_to_community VARCHAR(36) DEFAULT NULL,
    -- Contadores
    likes_count INT UNSIGNED DEFAULT 0,
    comments_count INT UNSIGNED DEFAULT 0,
    shares_count INT UNSIGNED DEFAULT 0,
    views_count INT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at DESC),
    INDEX idx_encryption_type (encryption_type),
    INDEX idx_is_repost (is_repost),
    INDEX idx_visibility (visibility),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (original_post_id) REFERENCES posts(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLA: post_likes
-- Likes en publicaciones
-- =============================================
DROP TABLE IF EXISTS post_likes;
CREATE TABLE post_likes (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    post_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_like (user_id, post_id),
    INDEX idx_post_id (post_id),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLA: comments
-- Comentarios en publicaciones
-- =============================================
DROP TABLE IF EXISTS comments;
CREATE TABLE comments (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    post_id VARCHAR(36) NOT NULL,
    parent_id VARCHAR(36) DEFAULT NULL,
    content TEXT NOT NULL,
    likes_count INT UNSIGNED DEFAULT 0,
    replies_count INT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_post_id (post_id),
    INDEX idx_parent_id (parent_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLA: comment_likes
-- Likes en comentarios
-- =============================================
DROP TABLE IF EXISTS comment_likes;
CREATE TABLE comment_likes (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    comment_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_comment_like (user_id, comment_id),
    INDEX idx_comment_id (comment_id),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLA: saved_posts
-- Posts guardados por usuarios
-- =============================================
DROP TABLE IF EXISTS saved_posts;
CREATE TABLE saved_posts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    post_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_saved (user_id, post_id),
    INDEX idx_user_id (user_id),
    INDEX idx_post_id (post_id),
    INDEX idx_created_at (created_at DESC),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================
-- TABLA: communities
-- Comunidades de la plataforma
-- =============================================
DROP TABLE IF EXISTS communities;
CREATE TABLE communities (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT DEFAULT NULL,
    icon VARCHAR(10) DEFAULT '🌐',
    cover_image_url VARCHAR(500) DEFAULT NULL,
    creator_id VARCHAR(36) NOT NULL,
    is_private TINYINT(1) DEFAULT 0,
    members_count INT UNSIGNED DEFAULT 1,
    posts_count INT UNSIGNED DEFAULT 0,
    tags JSON DEFAULT NULL,
    rules TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_creator_id (creator_id),
    INDEX idx_is_private (is_private),
    INDEX idx_members_count (members_count DESC),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLA: community_members
-- Miembros de comunidades
-- =============================================
DROP TABLE IF EXISTS community_members;
CREATE TABLE community_members (
    id VARCHAR(36) PRIMARY KEY,
    community_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    role ENUM('owner', 'admin', 'moderator', 'member') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_membership (community_id, user_id),
    INDEX idx_community_id (community_id),
    INDEX idx_user_id (user_id),
    INDEX idx_role (role),
    FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLA: community_messages
-- Mensajes/chat de comunidades
-- =============================================
DROP TABLE IF EXISTS community_messages;
CREATE TABLE community_messages (
    id VARCHAR(36) PRIMARY KEY,
    community_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    parent_message_id VARCHAR(36) DEFAULT NULL,
    likes_count INT UNSIGNED DEFAULT 0,
    replies_count INT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_community_id (community_id),
    INDEX idx_user_id (user_id),
    INDEX idx_parent_message (parent_message_id),
    INDEX idx_created_at (created_at DESC),
    FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_message_id) REFERENCES community_messages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLA: community_message_likes
-- Likes en mensajes de comunidades
-- =============================================
DROP TABLE IF EXISTS community_message_likes;
CREATE TABLE community_message_likes (
    id VARCHAR(36) PRIMARY KEY,
    message_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_message_like (message_id, user_id),
    INDEX idx_message_id (message_id),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (message_id) REFERENCES community_messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLA: boards
-- Tableros/pensamientos largos
-- =============================================
DROP TABLE IF EXISTS boards;
CREATE TABLE boards (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category ENUM('philosophy', 'technology', 'art', 'music', 'personal', 'random') DEFAULT 'random',
    encryption_type ENUM('binary', 'aes', 'reverse', 'none') DEFAULT 'none',
    encrypted_content TEXT DEFAULT NULL,
    cover_image_url VARCHAR(500) DEFAULT NULL,
    music_url VARCHAR(500) DEFAULT NULL,
    music_title VARCHAR(255) DEFAULT NULL,
    music_artist VARCHAR(255) DEFAULT NULL,
    is_private TINYINT(1) DEFAULT 0,
    likes_count INT UNSIGNED DEFAULT 0,
    comments_count INT UNSIGNED DEFAULT 0,
    shares_count INT UNSIGNED DEFAULT 0,
    views_count INT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_category (category),
    INDEX idx_encryption_type (encryption_type),
    INDEX idx_is_private (is_private),
    INDEX idx_created_at (created_at DESC),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLA: board_likes
-- Likes en boards
-- =============================================
DROP TABLE IF EXISTS board_likes;
CREATE TABLE board_likes (
    id VARCHAR(36) PRIMARY KEY,
    board_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_board_like (board_id, user_id),
    INDEX idx_board_id (board_id),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================
-- TABLA: messages
-- Mensajes directos entre usuarios
-- =============================================
DROP TABLE IF EXISTS messages;
CREATE TABLE messages (
    id VARCHAR(36) PRIMARY KEY,
    sender_id VARCHAR(36) NOT NULL,
    receiver_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    encrypted_content TEXT DEFAULT NULL,
    encryption_type ENUM('binary', 'aes', 'reverse', 'none') DEFAULT 'none',
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_sender (sender_id),
    INDEX idx_receiver (receiver_id),
    INDEX idx_conversation (sender_id, receiver_id, created_at),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at DESC),
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLA: notifications
-- Notificaciones del sistema
-- =============================================
DROP TABLE IF EXISTS notifications;
CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    type ENUM('like', 'comment', 'follow', 'mention', 'message', 'community_invite', 'community_message', 'system') NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT DEFAULT NULL,
    reference_id VARCHAR(36) DEFAULT NULL,
    reference_type VARCHAR(50) DEFAULT NULL,
    related_user_id VARCHAR(36) DEFAULT NULL,
    related_post_id VARCHAR(36) DEFAULT NULL,
    related_community_id VARCHAR(36) DEFAULT NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at DESC),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLA: vip_subscriptions
-- Suscripciones VIP de usuarios
-- =============================================
DROP TABLE IF EXISTS vip_subscriptions;
CREATE TABLE vip_subscriptions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    plan_type ENUM('monthly', 'yearly') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method VARCHAR(50) DEFAULT NULL,
    payment_id VARCHAR(255) DEFAULT NULL,
    starts_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_is_active (is_active),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLA: api_keys
-- Claves API para integraciones
-- =============================================
DROP TABLE IF EXISTS api_keys;
CREATE TABLE api_keys (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    key_name VARCHAR(100) NOT NULL,
    api_key VARCHAR(255) NOT NULL UNIQUE,
    permissions JSON DEFAULT NULL,
    last_used TIMESTAMP NULL DEFAULT NULL,
    expires_at TIMESTAMP NULL DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_api_key (api_key),
    INDEX idx_is_active (is_active),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- DATOS DE PRUEBA PARA DESARROLLO
-- =============================================

-- Insertar usuarios de prueba (password: test123 hasheado con bcrypt)
INSERT INTO users (id, username, handle, email, password_hash, recovery_code_hash, avatar_url, bio, is_verified, followers_count, following_count, posts_count) VALUES
('user-001', 'Cipher User', 'cipher_user', 'cipher@blacksky.app', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '$2b$10$example_recovery_hash', 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150', 'Encrypted thoughts only 🔐', 1, 1542, 234, 89),
('user-002', 'Neon Hacker', 'neon_hacker', 'neon@blacksky.app', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '$2b$10$example_recovery_hash', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150', 'Living in the matrix 💻', 0, 892, 156, 45),
('user-003', 'Binary Queen', 'binary_queen', 'binary@blacksky.app', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '$2b$10$example_recovery_hash', 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150', '01001000 01101001', 1, 2341, 89, 123),
('user-004', 'Void Runner', 'void_runner', 'void@blacksky.app', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '$2b$10$example_recovery_hash', 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=150', 'Running through the void 🌌', 0, 567, 445, 67),
('user-005', 'Synth Lord', 'synth_lord', 'synth@blacksky.app', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '$2b$10$example_recovery_hash', 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150', 'Creating darkwave beats 🎵', 1, 4521, 123, 234);

-- Insertar posts de prueba
INSERT INTO posts (id, user_id, content, encryption_type, likes_count, comments_count) VALUES
('post-001', 'user-001', 'Welcome to the encrypted world! 🔐', 'aes', 42, 5),
('post-002', 'user-002', '01001000 01100101 01101100 01101100 01101111', 'binary', 28, 3),
('post-003', 'user-003', 'dlroW olleH', 'reverse', 35, 8),
('post-004', 'user-004', 'The void speaks in code...', 'none', 19, 2),
('post-005', 'user-005', 'New track dropping soon 🎵', 'aes', 156, 23);

-- Insertar comunidades de prueba
INSERT INTO communities (id, name, description, icon, creator_id, is_private, members_count, tags) VALUES
('comm-001', 'Crypto Anarchists', 'Discusiones sobre criptografía y privacidad digital', '🔐', 'user-001', 0, 1247, '["crypto", "privacy", "freedom"]'),
('comm-002', 'Neural Hackers', 'Explorando IA e interfaces neuronales', '🧠', 'user-002', 0, 892, '["ai", "neural", "future"]'),
('comm-003', 'Underground Music', 'Synthwave, darkwave, cyberpunk beats', '🎵', 'user-005', 0, 2103, '["music", "synthwave", "electronic"]'),
('comm-004', 'Code Rebels', 'Programadores que desafían límites', '💻', 'user-003', 1, 567, '["coding", "opensource", "hacking"]'),
('comm-005', 'Digital Artists', 'Arte digital, NFTs, diseño cyberpunk', '🎨', 'user-004', 0, 756, '["art", "nft", "design"]');

-- Insertar miembros de comunidades
INSERT INTO community_members (id, community_id, user_id, role) VALUES
(UUID(), 'comm-001', 'user-001', 'owner'),
(UUID(), 'comm-001', 'user-002', 'member'),
(UUID(), 'comm-001', 'user-003', 'admin'),
(UUID(), 'comm-002', 'user-002', 'owner'),
(UUID(), 'comm-002', 'user-001', 'member'),
(UUID(), 'comm-003', 'user-005', 'owner'),
(UUID(), 'comm-003', 'user-001', 'member'),
(UUID(), 'comm-003', 'user-002', 'member'),
(UUID(), 'comm-004', 'user-003', 'owner'),
(UUID(), 'comm-005', 'user-004', 'owner');

-- =============================================
-- FIN DEL ESQUEMA
-- =============================================

/*
INSTRUCCIONES PARA phpMyAdmin:
1. Copia todo este código SQL
2. Ve a phpMyAdmin
3. Haz clic en "SQL" en la barra superior
4. Pega el código y ejecuta
5. La base de datos 'black_sky_db' se creará con todas las tablas

TABLAS INCLUIDAS:
- users (con código de recuperación y VIP)
- user_sessions
- followers
- posts (con encriptación y multimedia)
- post_likes
- comments
- comment_likes
- saved_posts
- communities
- community_members
- community_messages
- community_message_likes
- boards
- board_likes
- messages (DMs)
- notifications
- vip_subscriptions
- api_keys
*/
