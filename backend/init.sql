CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `projects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `domain` VARCHAR(255) NOT NULL,
  `banner_title` VARCHAR(255) DEFAULT 'Cookie Settings',
  `banner_text` TEXT,
  `accept_all_text` VARCHAR(255) DEFAULT 'Accept All',
  `accept_selection_text` VARCHAR(255) DEFAULT 'Accept Selection',
  `necessary_only_text` VARCHAR(255) DEFAULT 'Necessary Only',
  `language` VARCHAR(10) DEFAULT 'en',
  `expiry_months` INT DEFAULT 12,
  `active` BOOLEAN DEFAULT true,
  `about_cookies_text` TEXT,
  -- Optional: Verantwortlicher & Datenschutzerklärung
  `controller_name` VARCHAR(255),
  `controller_email` VARCHAR(255),
  `controller_address` VARCHAR(1024),
  `privacy_policy_url` VARCHAR(2048),
  `custom_html` TEXT,
  `custom_css` TEXT,
  `custom_js` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Backfill for existing installations: add columns if they don't exist
ALTER TABLE `projects` ADD COLUMN IF NOT EXISTS `controller_name` VARCHAR(255);
ALTER TABLE `projects` ADD COLUMN IF NOT EXISTS `controller_email` VARCHAR(255);
ALTER TABLE `projects` ADD COLUMN IF NOT EXISTS `controller_address` VARCHAR(1024);
ALTER TABLE `projects` ADD COLUMN IF NOT EXISTS `privacy_policy_url` VARCHAR(2048);

CREATE TABLE IF NOT EXISTS `cookie_categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `required` BOOLEAN DEFAULT false,
  `sort_order` INT DEFAULT 0,
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `cookie_services` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `provider` VARCHAR(255),
  `cookie_names` TEXT,
  `script_code` TEXT,
  `privacy_policy_url` VARCHAR(2048),
  `retention_period` VARCHAR(255),
  `purpose` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `cookie_categories`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `consent_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL,
  `consents` JSON,
  `ip_pseudonymized` VARCHAR(255),
  `expires_at` TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE
);

-- Add a default project for testing
INSERT INTO `projects` (`id`, `name`, `domain`) VALUES (1, 'Test Project', 'localhost') ON DUPLICATE KEY UPDATE name=name;

-- Add a default category for testing
INSERT INTO `cookie_categories` (`id`, `project_id`, `name`, `description`, `required`) VALUES (1, 1, 'Necessary', 'These cookies are essential for the website to function.', true) ON DUPLICATE KEY UPDATE name=name;

-- Add default user for testing
INSERT INTO `users` (`username`, `password`) VALUES ('philipp', '$2a$10$S6lr3mfigXRqSFdRGP9dueIYAQx4w.gbykhL7YzVLPjF6IdvCAIBW') ON DUPLICATE KEY UPDATE password=password;

-- Insert default cookie categories for the test project
INSERT IGNORE INTO `cookie_categories` (`id`, `project_id`, `name`, `description`, `required`, `sort_order`) VALUES
(1, 1, 'Notwendige Cookies', 'Diese Cookies sind für die Grundfunktionen der Website erforderlich und können nicht deaktiviert werden.', TRUE, 1),
(2, 1, 'Präferenzen Cookies', 'Diese Cookies ermöglichen es der Website, sich an Ihre Einstellungen zu erinnern.', FALSE, 2),
(3, 1, 'Statistik Cookies', 'Diese Cookies helfen uns zu verstehen, wie Besucher mit der Website interagieren.', FALSE, 3),
(4, 1, 'Marketing Cookies', 'Diese Cookies werden verwendet, um Ihnen relevante Werbung zu zeigen.', FALSE, 4);
