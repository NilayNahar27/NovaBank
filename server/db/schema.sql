-- NovaBank Net Banking — MySQL schema (fresh install)
-- Create database then run: mysql -u root -p < db/schema.sql
--
-- Upgrading an older ATM-only database? Run: mysql -u root -p < db/migration_v2_netbanking.sql

CREATE DATABASE IF NOT EXISTS novabank_atm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE novabank_atm;

CREATE TABLE users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  customer_id VARCHAR(16) NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  pin_hash VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_customer (customer_id),
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
  ifsc_code VARCHAR(20) NOT NULL DEFAULT 'NOVA0001234',
  branch_name VARCHAR(120) NOT NULL DEFAULT 'NovaBank — Central Operations',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_accounts_card (card_number),
  UNIQUE KEY uq_accounts_number (account_number),
  KEY idx_accounts_user (user_id),
  CONSTRAINT fk_accounts_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE beneficiaries (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  beneficiary_name VARCHAR(120) NOT NULL,
  bank_name VARCHAR(120) NOT NULL,
  account_number VARCHAR(20) NOT NULL,
  ifsc_code VARCHAR(20) NOT NULL,
  nickname VARCHAR(80) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_beneficiary_user_acct_ifsc (user_id, account_number, ifsc_code),
  KEY idx_beneficiaries_user (user_id),
  CONSTRAINT fk_beneficiaries_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE transfers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  from_account_id INT UNSIGNED NOT NULL,
  beneficiary_id INT UNSIGNED NULL,
  beneficiary_name VARCHAR(120) NOT NULL,
  to_account_number VARCHAR(20) NOT NULL,
  to_bank_name VARCHAR(120) NOT NULL,
  to_ifsc_code VARCHAR(20) NOT NULL,
  amount DECIMAL(14, 2) NOT NULL,
  remarks VARCHAR(255) NOT NULL DEFAULT '',
  reference_number VARCHAR(32) NOT NULL,
  status ENUM('pending', 'success', 'failed') NOT NULL DEFAULT 'success',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_transfers_ref (reference_number),
  KEY idx_transfers_from_time (from_account_id, created_at),
  CONSTRAINT fk_transfers_from_acct FOREIGN KEY (from_account_id) REFERENCES accounts (id) ON DELETE CASCADE,
  CONSTRAINT fk_transfers_beneficiary FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries (id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE transactions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  type ENUM('credit', 'debit') NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'general',
  amount DECIMAL(14, 2) NOT NULL,
  description VARCHAR(255) NOT NULL DEFAULT '',
  reference_id VARCHAR(64) NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'posted',
  transfer_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_tx_account_time (account_id, created_at),
  KEY idx_tx_account_category (account_id, category),
  KEY idx_tx_reference (reference_id),
  CONSTRAINT fk_tx_account FOREIGN KEY (account_id) REFERENCES accounts (id) ON DELETE CASCADE,
  CONSTRAINT fk_tx_transfer FOREIGN KEY (transfer_id) REFERENCES transfers (id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE notifications (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  type VARCHAR(40) NOT NULL,
  title VARCHAR(120) NOT NULL,
  body VARCHAR(500) NOT NULL,
  read_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notifications_user_time (user_id, created_at),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;
