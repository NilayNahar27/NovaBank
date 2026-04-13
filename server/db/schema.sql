-- NovaBank ATM Simulator — MySQL schema
-- Create database then run: mysql -u root -p < db/schema.sql

CREATE DATABASE IF NOT EXISTS novabank_atm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE novabank_atm;

CREATE TABLE users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  pin_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_phone (phone)
) ENGINE=InnoDB;

CREATE TABLE user_profiles (
  user_id INT UNSIGNED NOT NULL,
  dob DATE NULL,
  gender VARCHAR(30) NULL,
  address VARCHAR(500) NULL,
  city VARCHAR(100) NULL,
  state VARCHAR(100) NULL,
  pincode VARCHAR(20) NULL,
  occupation VARCHAR(100) NULL,
  income VARCHAR(50) NULL,
  education VARCHAR(100) NULL,
  marital_status VARCHAR(50) NULL,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_profiles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE accounts (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  card_number VARCHAR(19) NOT NULL,
  account_number VARCHAR(20) NOT NULL,
  account_type ENUM('Savings', 'Current') NOT NULL DEFAULT 'Savings',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_accounts_card (card_number),
  UNIQUE KEY uq_accounts_number (account_number),
  KEY idx_accounts_user (user_id),
  CONSTRAINT fk_accounts_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE transactions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  type ENUM('credit', 'debit') NOT NULL,
  amount DECIMAL(14, 2) NOT NULL,
  description VARCHAR(255) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_tx_account_time (account_id, created_at),
  CONSTRAINT fk_tx_account FOREIGN KEY (account_id) REFERENCES accounts (id) ON DELETE CASCADE
) ENGINE=InnoDB;
