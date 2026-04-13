-- Upgrade legacy NovaBank ATM schema → Net Banking (run once against existing DB)
-- mysql -u root -p novabank_atm < db/migration_v2_netbanking.sql
--
-- If a statement fails because the column already exists, comment it out and re-run.

USE novabank_atm;

ALTER TABLE users ADD COLUMN customer_id VARCHAR(16) NULL AFTER id;
UPDATE users SET customer_id = CONCAT('NB', LPAD(id, 8, '0')) WHERE customer_id IS NULL OR customer_id = '';
ALTER TABLE users MODIFY customer_id VARCHAR(16) NOT NULL;
ALTER TABLE users ADD UNIQUE KEY uq_users_customer (customer_id);

ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NULL AFTER pin_hash;

ALTER TABLE accounts ADD COLUMN ifsc_code VARCHAR(20) NOT NULL DEFAULT 'NOVA0001234' AFTER account_type;
ALTER TABLE accounts ADD COLUMN branch_name VARCHAR(120) NOT NULL DEFAULT 'NovaBank — Central Operations' AFTER ifsc_code;

ALTER TABLE transactions ADD COLUMN category VARCHAR(50) NOT NULL DEFAULT 'general' AFTER type;
ALTER TABLE transactions ADD COLUMN reference_id VARCHAR(64) NULL AFTER description;
ALTER TABLE transactions ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'posted' AFTER reference_id;
ALTER TABLE transactions ADD COLUMN transfer_id BIGINT UNSIGNED NULL AFTER status;

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

ALTER TABLE transactions ADD CONSTRAINT fk_tx_transfer FOREIGN KEY (transfer_id) REFERENCES transfers (id) ON DELETE SET NULL;
