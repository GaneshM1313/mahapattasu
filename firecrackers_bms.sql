-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               11.7.2-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.10.0.7000
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for MM-Bharathicrackers_bms
CREATE DATABASE IF NOT EXISTS `MM-Bharathicrackers_bms` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `MM-Bharathicrackers_bms`;

-- Dumping structure for table MM-Bharathicrackers_bms.audit_logs
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` int(10) unsigned NOT NULL,
  `branch_id` int(10) unsigned DEFAULT NULL,
  `user_id` int(10) unsigned DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `module` varchar(50) DEFAULT NULL,
  `record_id` int(10) unsigned DEFAULT NULL,
  `old_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_data`)),
  `new_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_data`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(300) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tenant_branch` (`tenant_id`,`branch_id`),
  KEY `idx_tenant_user` (`tenant_id`,`user_id`),
  KEY `idx_module` (`module`),
  KEY `idx_date` (`created_at`),
  KEY `fk_al_user` (`user_id`),
  CONSTRAINT `fk_al_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`),
  CONSTRAINT `fk_al_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table MM-Bharathicrackers_bms.audit_logs: ~9 rows (approximately)
INSERT IGNORE INTO `audit_logs` (`id`, `tenant_id`, `branch_id`, `user_id`, `action`, `module`, `record_id`, `old_data`, `new_data`, `ip_address`, `user_agent`, `created_at`) VALUES
	(1, 1, 1, 4, 'CREATE_SALE', 'sales', 1, NULL, NULL, '192.168.1.10', NULL, '2026-06-27 10:38:24'),
	(2, 1, 1, 4, 'CREATE_SALE', 'sales', 2, NULL, NULL, '192.168.1.10', NULL, '2026-06-27 10:38:24'),
	(3, 1, 2, 5, 'CREATE_SALE', 'sales', 3, NULL, NULL, '192.168.1.11', NULL, '2026-06-27 10:38:24'),
	(4, 2, 3, 9, 'CREATE_SALE', 'sales', 5, NULL, NULL, '192.168.2.10', NULL, '2026-06-27 10:38:24'),
	(5, 2, 3, 9, 'CREATE_SALE', 'sales', 6, NULL, NULL, '192.168.2.10', NULL, '2026-06-27 10:38:24'),
	(6, 2, 4, 10, 'CREATE_SALE', 'sales', 7, NULL, NULL, '192.168.2.11', NULL, '2026-06-27 10:38:24'),
	(7, 3, 5, 14, 'CREATE_SALE', 'sales', 9, NULL, NULL, '192.168.3.10', NULL, '2026-06-27 10:38:24'),
	(8, 3, 5, 14, 'CREATE_SALE', 'sales', 10, NULL, NULL, '192.168.3.10', NULL, '2026-06-27 10:38:24'),
	(9, 3, 6, 15, 'CREATE_SALE', 'sales', 11, NULL, NULL, '192.168.3.11', NULL, '2026-06-27 10:38:24');

-- Dumping structure for table MM-Bharathicrackers_bms.branches
CREATE TABLE IF NOT EXISTS `branches` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` int(10) unsigned NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(20) NOT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(60) DEFAULT NULL,
  `state` varchar(60) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `gstin` varchar(20) DEFAULT NULL,
  `license_no` varchar(50) DEFAULT NULL,
  `license_expiry` date DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tenant_code` (`tenant_id`,`code`),
  KEY `idx_tenant` (`tenant_id`),
  KEY `idx_active` (`is_active`),
  CONSTRAINT `fk_branch_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table MM-Bharathicrackers_bms.branches: ~6 rows (approximately)
INSERT IGNORE INTO `branches` (`id`, `tenant_id`, `name`, `code`, `address`, `city`, `state`, `pincode`, `phone`, `email`, `gstin`, `license_no`, `license_expiry`, `is_active`, `created_at`, `updated_at`) VALUES
	(1, 1, 'Main Shop', 'BR-001', NULL, 'Sivakasi', 'Tamil Nadu', NULL, '9876500001', NULL, '33AABCU9603R1ZT', NULL, NULL, 1, '2026-06-27 10:38:23', '2026-06-27 10:38:23'),
	(2, 1, 'City Branch', 'BR-002', NULL, 'Virudhunagar', 'Tamil Nadu', NULL, '9876500002', NULL, '33AABCU9603R2ZS', NULL, NULL, 1, '2026-06-27 10:38:23', '2026-06-27 10:38:23'),
	(3, 2, 'Sivakasi HQ', 'BR-001', NULL, 'Sivakasi', 'Tamil Nadu', NULL, '9876500003', NULL, '33BBBCU9603R1ZR', NULL, NULL, 1, '2026-06-27 10:38:23', '2026-06-27 10:38:23'),
	(4, 2, 'Sattur Branch', 'BR-002', NULL, 'Sattur', 'Tamil Nadu', NULL, '9876500004', NULL, '33BBBCU9603R2ZQ', NULL, NULL, 1, '2026-06-27 10:38:23', '2026-06-27 10:38:23'),
	(5, 3, 'Chennai Central', 'BR-001', NULL, 'Chennai', 'Tamil Nadu', NULL, '9876500005', NULL, '33CCCCU9603R1ZP', NULL, NULL, 1, '2026-06-27 10:38:23', '2026-06-27 10:38:23'),
	(6, 3, 'Anna Nagar', 'BR-002', NULL, 'Chennai', 'Tamil Nadu', NULL, '9876500006', NULL, '33CCCCU9603R2ZO', NULL, NULL, 1, '2026-06-27 10:38:23', '2026-06-27 10:38:23');

-- Dumping structure for table MM-Bharathicrackers_bms.categories
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` int(10) unsigned NOT NULL,
  `branch_id` int(10) unsigned NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(120) NOT NULL,
  `parent_id` int(10) unsigned DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `hazard_level` enum('none','low','medium','high') NOT NULL DEFAULT 'none',
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tenant_branch_slug` (`tenant_id`,`branch_id`,`slug`),
  KEY `idx_parent` (`parent_id`),
  KEY `idx_active` (`is_active`),
  KEY `fk_cat_branch` (`branch_id`),
  KEY `idx_tenant_branch` (`tenant_id`,`branch_id`),
  KEY `idx_tenant_active` (`tenant_id`,`is_active`),
  CONSTRAINT `fk_cat_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`),
  CONSTRAINT `fk_cat_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_cat_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table MM-Bharathicrackers_bms.categories: ~35 rows (approximately)
INSERT IGNORE INTO `categories` (`id`, `tenant_id`, `branch_id`, `name`, `slug`, `parent_id`, `description`, `image_url`, `hazard_level`, `sort_order`, `is_active`, `created_at`) VALUES
	(1, 1, 1, 'Aerial Shots', 'aerial-shots', NULL, NULL, NULL, 'high', 1, 1, '2026-06-27 10:27:27'),
	(2, 1, 1, 'Ground Crackers', 'ground-crackers', NULL, NULL, NULL, 'medium', 2, 1, '2026-06-27 10:27:27'),
	(3, 1, 1, 'Sparklers', 'sparklers', NULL, NULL, NULL, 'low', 3, 1, '2026-06-27 10:27:27'),
	(4, 1, 1, 'Bombs', 'bombs', NULL, NULL, NULL, 'high', 4, 1, '2026-06-27 10:27:27'),
	(5, 1, 1, 'Gift Boxes', 'gift-boxes', NULL, NULL, NULL, 'medium', 5, 1, '2026-06-27 10:27:27'),
	(6, 1, 1, 'Rockets', 'rockets', NULL, NULL, NULL, 'high', 6, 1, '2026-06-27 10:27:27'),
	(7, 1, 1, 'Fancy Items', 'fancy-items', NULL, NULL, NULL, 'low', 7, 1, '2026-06-27 10:27:27'),
	(8, 2, 3, 'Aerial Shots', 't2-b3-aerial-shots', NULL, NULL, NULL, 'high', 1, 1, '2026-06-28 16:40:56'),
	(9, 2, 3, 'Ground Crackers', 't2-b3-ground-crackers', NULL, NULL, NULL, 'medium', 2, 1, '2026-06-28 16:40:56'),
	(10, 2, 3, 'Sparklers', 't2-b3-sparklers', NULL, NULL, NULL, 'low', 3, 1, '2026-06-28 16:40:56'),
	(11, 2, 3, 'Bombs', 't2-b3-bombs', NULL, NULL, NULL, 'high', 4, 1, '2026-06-28 16:40:56'),
	(12, 2, 3, 'Gift Boxes', 't2-b3-gift-boxes', NULL, NULL, NULL, 'medium', 5, 1, '2026-06-28 16:40:56'),
	(13, 2, 3, 'Rockets', 't2-b3-rockets', NULL, NULL, NULL, 'high', 6, 1, '2026-06-28 16:40:56'),
	(14, 2, 3, 'Fancy Items', 't2-b3-fancy-items', NULL, NULL, NULL, 'low', 7, 1, '2026-06-28 16:40:56'),
	(15, 2, 4, 'Aerial Shots', 't2-b4-aerial-shots', NULL, NULL, NULL, 'high', 1, 1, '2026-06-28 16:40:56'),
	(16, 2, 4, 'Ground Crackers', 't2-b4-ground-crackers', NULL, NULL, NULL, 'medium', 2, 1, '2026-06-28 16:40:56'),
	(17, 2, 4, 'Sparklers', 't2-b4-sparklers', NULL, NULL, NULL, 'low', 3, 1, '2026-06-28 16:40:56'),
	(18, 2, 4, 'Bombs', 't2-b4-bombs', NULL, NULL, NULL, 'high', 4, 1, '2026-06-28 16:40:56'),
	(19, 2, 4, 'Gift Boxes', 't2-b4-gift-boxes', NULL, NULL, NULL, 'medium', 5, 1, '2026-06-28 16:40:56'),
	(20, 2, 4, 'Rockets', 't2-b4-rockets', NULL, NULL, NULL, 'high', 6, 1, '2026-06-28 16:40:56'),
	(21, 2, 4, 'Fancy Items', 't2-b4-fancy-items', NULL, NULL, NULL, 'low', 7, 1, '2026-06-28 16:40:56'),
	(22, 3, 5, 'Aerial Shots', 't3-b5-aerial-shots', NULL, NULL, NULL, 'high', 1, 1, '2026-06-28 16:40:56'),
	(23, 3, 5, 'Ground Crackers', 't3-b5-ground-crackers', NULL, NULL, NULL, 'medium', 2, 1, '2026-06-28 16:40:56'),
	(24, 3, 5, 'Sparklers', 't3-b5-sparklers', NULL, NULL, NULL, 'low', 3, 1, '2026-06-28 16:40:56'),
	(25, 3, 5, 'Bombs', 't3-b5-bombs', NULL, NULL, NULL, 'high', 4, 1, '2026-06-28 16:40:56'),
	(26, 3, 5, 'Gift Boxes', 't3-b5-gift-boxes', NULL, NULL, NULL, 'medium', 5, 1, '2026-06-28 16:40:56'),
	(27, 3, 5, 'Rockets', 't3-b5-rockets', NULL, NULL, NULL, 'high', 6, 1, '2026-06-28 16:40:56'),
	(28, 3, 5, 'Fancy Items', 't3-b5-fancy-items', NULL, NULL, NULL, 'low', 7, 1, '2026-06-28 16:40:56'),
	(29, 3, 6, 'Aerial Shots', 't3-b6-aerial-shots', NULL, NULL, NULL, 'high', 1, 1, '2026-06-28 16:40:56'),
	(30, 3, 6, 'Ground Crackers', 't3-b6-ground-crackers', NULL, NULL, NULL, 'medium', 2, 1, '2026-06-28 16:40:56'),
	(31, 3, 6, 'Sparklers', 't3-b6-sparklers', NULL, NULL, NULL, 'low', 3, 1, '2026-06-28 16:40:56'),
	(32, 3, 6, 'Bombs', 't3-b6-bombs', NULL, NULL, NULL, 'high', 4, 1, '2026-06-28 16:40:56'),
	(33, 3, 6, 'Gift Boxes', 't3-b6-gift-boxes', NULL, NULL, NULL, 'medium', 5, 1, '2026-06-28 16:40:56'),
	(34, 3, 6, 'Rockets', 't3-b6-rockets', NULL, NULL, NULL, 'high', 6, 1, '2026-06-28 16:40:56'),
	(35, 3, 6, 'Fancy Items', 't3-b6-fancy-items', NULL, NULL, NULL, 'low', 7, 1, '2026-06-28 16:40:56');

-- Dumping structure for table MM-Bharathicrackers_bms.customers
CREATE TABLE IF NOT EXISTS `customers` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` int(10) unsigned NOT NULL,
  `branch_id` int(10) unsigned NOT NULL,
  `name` varchar(150) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(80) DEFAULT NULL,
  `state` varchar(80) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `gstin` varchar(20) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `anniversary_date` date DEFAULT NULL,
  `loyalty_points` int(11) NOT NULL DEFAULT 0,
  `credit_balance` decimal(10,2) NOT NULL DEFAULT 0.00,
  `credit_limit` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_purchases` decimal(12,2) NOT NULL DEFAULT 0.00,
  `purchase_count` int(11) NOT NULL DEFAULT 0,
  `segment` enum('regular','silver','gold','platinum') NOT NULL DEFAULT 'regular',
  `notes` text DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tenant_branch` (`tenant_id`,`branch_id`),
  KEY `idx_tenant_phone` (`tenant_id`,`phone`),
  KEY `idx_segment` (`segment`),
  KEY `idx_active` (`is_active`),
  KEY `fk_cust_branch` (`branch_id`),
  CONSTRAINT `fk_cust_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`),
  CONSTRAINT `fk_cust_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table MM-Bharathicrackers_bms.customers: ~15 rows (approximately)
INSERT IGNORE INTO `customers` (`id`, `tenant_id`, `branch_id`, `name`, `phone`, `email`, `address`, `city`, `state`, `pincode`, `gstin`, `dob`, `anniversary_date`, `loyalty_points`, `credit_balance`, `credit_limit`, `total_purchases`, `purchase_count`, `segment`, `notes`, `password_hash`, `is_active`, `created_at`, `updated_at`) VALUES
	(1, 1, 1, 'Ganesh Retail Store', '9600001001', 'ganesh@retail.com', NULL, 'Sivakasi', NULL, NULL, NULL, NULL, NULL, 0, 0.00, 10000.00, 1700.00, 1, 'gold', NULL, NULL, 1, '2026-06-27 10:38:24', '2026-06-27 10:38:24'),
	(2, 1, 1, 'Walk-in Customer', '0000000000', NULL, NULL, 'Sivakasi', NULL, NULL, NULL, NULL, NULL, 0, 0.00, 0.00, 897.00, 1, 'regular', NULL, NULL, 1, '2026-06-27 10:38:24', '2026-06-27 10:38:24'),
	(3, 1, 2, 'Vijay Wholesale', '9600001003', 'vijay@wholesale.com', NULL, 'Virudhunagar', NULL, NULL, NULL, NULL, NULL, 0, 0.00, 50000.00, 2360.00, 1, 'platinum', NULL, NULL, 1, '2026-06-27 10:38:24', '2026-06-27 10:38:24'),
	(4, 1, 2, 'Saranya Devi', '9600001004', NULL, NULL, 'Virudhunagar', NULL, NULL, NULL, NULL, NULL, 0, 0.00, 0.00, 590.00, 1, 'regular', NULL, NULL, 1, '2026-06-27 10:38:24', '2026-06-27 10:38:24'),
	(5, 2, 3, 'Murugan Stores', '9600002001', 'murugan@stores.com', NULL, 'Sivakasi', NULL, NULL, NULL, NULL, NULL, 0, 0.00, 20000.00, 1829.00, 1, 'gold', NULL, NULL, 1, '2026-06-27 10:38:24', '2026-06-27 10:38:24'),
	(6, 2, 3, 'Walk-in', '0000000001', NULL, NULL, 'Sivakasi', NULL, NULL, NULL, NULL, NULL, 0, 0.00, 0.00, 767.00, 1, 'regular', NULL, NULL, 1, '2026-06-27 10:38:24', '2026-06-27 10:38:25'),
	(7, 2, 4, 'Ramesh Trading', '9600002003', 'ramesh@trading.com', NULL, 'Sattur', NULL, NULL, NULL, NULL, NULL, 0, 0.00, 5000.00, 1275.00, 1, 'silver', NULL, NULL, 1, '2026-06-27 10:38:24', '2026-06-27 10:38:25'),
	(8, 2, 4, 'Anitha S', '9600002004', NULL, NULL, 'Sattur', NULL, NULL, NULL, NULL, NULL, 0, 0.00, 0.00, 531.00, 1, 'regular', NULL, NULL, 1, '2026-06-27 10:38:24', '2026-06-27 10:38:25'),
	(9, 3, 5, 'Chennai Crackers', '9600003001', 'contact@chennaicr.com', NULL, 'Chennai', NULL, NULL, NULL, NULL, NULL, 0, 0.00, 100000.00, 2761.00, 1, 'platinum', NULL, NULL, 1, '2026-06-27 10:38:24', '2026-06-27 10:38:25'),
	(10, 3, 5, 'Walk-in Customer', '0000000002', NULL, NULL, 'Chennai', NULL, NULL, NULL, NULL, NULL, 0, 0.00, 0.00, 885.00, 1, 'regular', NULL, NULL, 1, '2026-06-27 10:38:24', '2026-06-27 10:38:25'),
	(11, 3, 6, 'Anna Nagar Stores', '9600003003', 'info@annastores.com', NULL, 'Chennai', NULL, NULL, NULL, NULL, NULL, 0, 0.00, 15000.00, 1806.00, 1, 'gold', NULL, NULL, 1, '2026-06-27 10:38:24', '2026-06-27 10:38:25'),
	(12, 3, 6, 'Priya Retail', '9600003004', 'priya@retail.com', NULL, 'Chennai', NULL, NULL, NULL, NULL, NULL, 0, 0.00, 3000.00, 448.00, 1, 'silver', NULL, NULL, 1, '2026-06-27 10:38:24', '2026-06-27 10:38:25'),
	(13, 1, 1, 'Ganesh', '9098703932', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0.00, 0.00, 0.00, 0, 'regular', NULL, NULL, 1, '2026-06-27 10:57:27', '2026-06-27 10:57:27'),
	(14, 1, 1, 'test', '9876543210', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0.00, 0.00, 270.00, 1, 'regular', NULL, NULL, 1, '2026-06-29 07:07:02', '2026-06-29 07:07:15'),
	(15, 1, 1, 'ganesh', '9876543211', 'vXXXXXXXXm@gmail.com', NULL, 'Virudhunagar', NULL, NULL, NULL, NULL, NULL, 0, 0.00, 0.00, 0.00, 0, 'regular', NULL, '$2a$12$7YBqyy/NRBz.piLK9GMmT.M7m8v3NqLm9SYs9UXxx/eMqXwo/EzwO', 1, '2026-06-30 06:27:47', '2026-06-30 06:27:47');

-- Dumping structure for table MM-Bharathicrackers_bms.discount_rules
CREATE TABLE IF NOT EXISTS `discount_rules` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` int(10) unsigned NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` enum('percentage','fixed','buy_x_get_y') NOT NULL DEFAULT 'percentage',
  `value` decimal(10,2) NOT NULL,
  `min_qty` decimal(10,3) DEFAULT NULL,
  `min_amount` decimal(10,2) DEFAULT NULL,
  `applies_to` enum('all','category','product') NOT NULL DEFAULT 'all',
  `reference_id` int(10) unsigned DEFAULT NULL,
  `valid_from` date DEFAULT NULL,
  `valid_until` date DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tenant_active` (`tenant_id`,`is_active`),
  CONSTRAINT `fk_dr_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table MM-Bharathicrackers_bms.discount_rules: ~6 rows (approximately)
INSERT IGNORE INTO `discount_rules` (`id`, `tenant_id`, `name`, `type`, `value`, `min_qty`, `min_amount`, `applies_to`, `reference_id`, `valid_from`, `valid_until`, `is_active`, `created_at`) VALUES
	(1, 1, 'Bulk 10% Off', 'percentage', 10.00, 10.000, NULL, 'all', NULL, NULL, NULL, 1, '2026-06-27 10:38:24'),
	(2, 1, 'Festival Flat 50', 'fixed', 50.00, NULL, 500.00, 'all', NULL, NULL, NULL, 1, '2026-06-27 10:38:24'),
	(3, 2, 'Wholesale Discount', 'percentage', 8.00, 20.000, NULL, 'all', NULL, NULL, NULL, 1, '2026-06-27 10:38:24'),
	(4, 2, 'Cart Discount 100', 'fixed', 100.00, NULL, 1000.00, 'all', NULL, NULL, NULL, 1, '2026-06-27 10:38:24'),
	(5, 3, 'VIP Member Discount', 'percentage', 12.00, 5.000, NULL, 'category', NULL, NULL, NULL, 1, '2026-06-27 10:38:24'),
	(6, 3, 'Bulk Order 15% Off', 'percentage', 15.00, 50.000, NULL, 'all', NULL, NULL, NULL, 1, '2026-06-27 10:38:24');

-- Dumping structure for table MM-Bharathicrackers_bms.expenses
CREATE TABLE IF NOT EXISTS `expenses` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` int(10) unsigned NOT NULL,
  `branch_id` int(10) unsigned NOT NULL,
  `user_id` int(10) unsigned DEFAULT NULL,
  `category_id` int(10) unsigned DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `expense_date` date NOT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `reference_no` varchar(100) DEFAULT NULL,
  `receipt_url` varchar(500) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tenant_branch` (`tenant_id`,`branch_id`),
  KEY `idx_tenant_date` (`tenant_id`,`expense_date`),
  KEY `idx_category` (`category_id`),
  KEY `idx_user` (`user_id`),
  KEY `fk_exp_branch` (`branch_id`),
  CONSTRAINT `fk_exp_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`),
  CONSTRAINT `fk_exp_category` FOREIGN KEY (`category_id`) REFERENCES `expense_categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_exp_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`),
  CONSTRAINT `fk_exp_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table MM-Bharathicrackers_bms.expenses: ~12 rows (approximately)
INSERT IGNORE INTO `expenses` (`id`, `tenant_id`, `branch_id`, `user_id`, `category_id`, `title`, `amount`, `expense_date`, `payment_method`, `reference_no`, `receipt_url`, `notes`, `created_at`) VALUES
	(1, 1, 1, 2, 1, 'June Shop Rent', 8000.00, '2026-06-01', 'Cash', NULL, NULL, NULL, '2026-06-27 10:38:24'),
	(2, 1, 1, 2, 2, 'Electricity Bill June', 1500.00, '2026-06-05', 'Bank Transfer', NULL, NULL, NULL, '2026-06-27 10:38:24'),
	(4, 1, 1, 2, 4, 'Delivery Transport', 500.00, '2026-06-20', 'Cash', NULL, NULL, NULL, '2026-06-27 10:38:24'),
	(5, 2, 3, 7, 1, 'Sivakasi HQ Rent', 7500.00, '2026-06-01', 'Bank Transfer', NULL, NULL, NULL, '2026-06-27 10:38:24'),
	(6, 2, 3, 7, 2, 'Generator Fuel', 800.00, '2026-06-10', 'Cash', NULL, NULL, NULL, '2026-06-27 10:38:24'),
	(7, 2, 4, 8, 3, 'Sattur Staff Salary', 5000.00, '2026-06-30', 'Bank Transfer', NULL, NULL, NULL, '2026-06-27 10:38:24'),
	(8, 2, 3, 7, 4, 'Loading Charges', 300.00, '2026-06-18', 'Cash', NULL, NULL, NULL, '2026-06-27 10:38:24'),
	(9, 3, 5, 12, 1, 'Chennai Office Rent', 12000.00, '2026-06-01', 'Bank Transfer', NULL, NULL, NULL, '2026-06-27 10:38:24'),
	(10, 3, 5, 12, 2, 'AC Electricity', 2500.00, '2026-06-07', 'Bank Transfer', NULL, NULL, NULL, '2026-06-27 10:38:24'),
	(11, 3, 6, 13, 3, 'Anna Nagar Staff Salary', 7000.00, '2026-06-30', 'Bank Transfer', NULL, NULL, NULL, '2026-06-27 10:38:24'),
	(12, 3, 5, 12, 5, 'Display Setup Cost', 2000.00, '2026-06-15', 'Cash', NULL, NULL, NULL, '2026-06-27 10:38:24'),
	(13, 1, 1, 1, 3, 'salary', 10000.00, '2026-06-29', 'Cash', NULL, NULL, NULL, '2026-06-29 07:10:14');

-- Dumping structure for table MM-Bharathicrackers_bms.expense_categories
CREATE TABLE IF NOT EXISTS `expense_categories` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` int(10) unsigned NOT NULL,
  `name` varchar(100) NOT NULL,
  `color` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tenant_expcat_name` (`tenant_id`,`name`),
  KEY `idx_tenant` (`tenant_id`),
  CONSTRAINT `fk_ec_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table MM-Bharathicrackers_bms.expense_categories: ~21 rows (approximately)
INSERT IGNORE INTO `expense_categories` (`id`, `tenant_id`, `name`, `color`) VALUES
	(1, 1, 'Rent', '#ef4444'),
	(2, 1, 'Utilities', '#f97316'),
	(3, 1, 'Salary', '#eab308'),
	(4, 1, 'Transport', '#22c55e'),
	(5, 1, 'Maintenance', '#3b82f6'),
	(6, 1, 'Marketing', '#a855f7'),
	(7, 1, 'Miscellaneous', '#6b7280'),
	(8, 2, 'Rent', '#ef4444'),
	(9, 2, 'Utilities', '#f97316'),
	(10, 2, 'Salary', '#eab308'),
	(11, 2, 'Transport', '#22c55e'),
	(12, 2, 'Maintenance', '#3b82f6'),
	(13, 2, 'Marketing', '#a855f7'),
	(14, 2, 'Miscellaneous', '#6b7280'),
	(15, 3, 'Rent', '#ef4444'),
	(16, 3, 'Utilities', '#f97316'),
	(17, 3, 'Salary', '#eab308'),
	(18, 3, 'Transport', '#22c55e'),
	(19, 3, 'Maintenance', '#3b82f6'),
	(20, 3, 'Marketing', '#a855f7'),
	(21, 3, 'Miscellaneous', '#6b7280');

-- Dumping structure for table MM-Bharathicrackers_bms.inventory_logs
CREATE TABLE IF NOT EXISTS `inventory_logs` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` int(10) unsigned NOT NULL,
  `branch_id` int(10) unsigned NOT NULL,
  `product_id` int(10) unsigned NOT NULL,
  `user_id` int(10) unsigned DEFAULT NULL,
  `type` enum('in','out','adjustment','transfer','return','damage','initial_stock') NOT NULL,
  `qty_before` decimal(10,3) NOT NULL,
  `qty_change` decimal(10,3) NOT NULL,
  `qty_after` decimal(10,3) NOT NULL,
  `reference_type` varchar(30) DEFAULT NULL,
  `reference_id` int(10) unsigned DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tenant_branch` (`tenant_id`,`branch_id`),
  KEY `idx_tenant_product` (`tenant_id`,`product_id`),
  KEY `idx_type` (`type`),
  KEY `idx_date` (`created_at`),
  KEY `idx_user` (`user_id`),
  KEY `fk_il_branch` (`branch_id`),
  KEY `fk_il_product` (`product_id`),
  CONSTRAINT `fk_il_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`),
  CONSTRAINT `fk_il_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_il_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`),
  CONSTRAINT `fk_il_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table MM-Bharathicrackers_bms.inventory_logs: ~36 rows (approximately)
INSERT IGNORE INTO `inventory_logs` (`id`, `tenant_id`, `branch_id`, `product_id`, `user_id`, `type`, `qty_before`, `qty_change`, `qty_after`, `reference_type`, `reference_id`, `notes`, `created_at`) VALUES
	(1, 1, 1, 1, 1, 'initial_stock', 0.000, 50.000, 50.000, 'initial_stock', NULL, 'Opening stock', '2026-06-27 10:38:24'),
	(2, 1, 1, 2, 1, 'initial_stock', 0.000, 200.000, 200.000, 'initial_stock', NULL, 'Opening stock', '2026-06-27 10:38:24'),
	(3, 1, 1, 3, 1, 'initial_stock', 0.000, 30.000, 30.000, 'initial_stock', NULL, 'Opening stock', '2026-06-27 10:38:24'),
	(4, 1, 2, 4, 1, 'initial_stock', 0.000, 80.000, 80.000, 'initial_stock', NULL, 'Opening stock', '2026-06-27 10:38:24'),
	(5, 1, 2, 5, 1, 'initial_stock', 0.000, 25.000, 25.000, 'initial_stock', NULL, 'Opening stock', '2026-06-27 10:38:24'),
	(6, 1, 2, 6, 1, 'initial_stock', 0.000, 150.000, 150.000, 'initial_stock', NULL, 'Opening stock', '2026-06-27 10:38:24'),
	(7, 1, 1, 1, 4, 'out', 50.000, -5.000, 45.000, 'sale', 1, 'Sale INV-202606-0001', '2026-06-27 10:38:24'),
	(8, 1, 1, 2, 4, 'out', 200.000, -8.000, 192.000, 'sale', 1, 'Sale INV-202606-0001', '2026-06-27 10:38:24'),
	(9, 1, 1, 2, 4, 'out', 192.000, -5.000, 187.000, 'sale', 2, 'Sale INV-202606-0002', '2026-06-27 10:38:24'),
	(10, 1, 1, 3, 4, 'out', 30.000, -1.000, 29.000, 'sale', 2, 'Sale INV-202606-0002', '2026-06-27 10:38:24'),
	(11, 1, 2, 4, 5, 'out', 80.000, -8.000, 72.000, 'sale', 3, 'Sale INV-202606-0003', '2026-06-27 10:38:24'),
	(12, 1, 2, 5, 5, 'out', 25.000, -3.000, 22.000, 'sale', 3, 'Sale INV-202606-0003', '2026-06-27 10:38:24'),
	(13, 1, 2, 6, 5, 'out', 150.000, -5.000, 145.000, 'sale', 3, 'Sale INV-202606-0003', '2026-06-27 10:38:24'),
	(14, 1, 1, 1, 2, 'in', 45.000, 40.000, 85.000, 'purchase', 1, 'PO-202606-0001', '2026-06-27 10:38:24'),
	(15, 1, 1, 2, 2, 'in', 187.000, 40.000, 227.000, 'purchase', 1, 'PO-202606-0001', '2026-06-27 10:38:24'),
	(16, 2, 3, 7, 6, 'initial_stock', 0.000, 60.000, 60.000, 'initial_stock', NULL, 'Opening stock', '2026-06-27 10:38:24'),
	(17, 2, 3, 8, 6, 'initial_stock', 0.000, 40.000, 40.000, 'initial_stock', NULL, 'Opening stock', '2026-06-27 10:38:24'),
	(18, 2, 3, 9, 6, 'initial_stock', 0.000, 100.000, 100.000, 'initial_stock', NULL, 'Opening stock', '2026-06-27 10:38:24'),
	(19, 2, 4, 10, 6, 'initial_stock', 0.000, 90.000, 90.000, 'initial_stock', NULL, 'Opening stock', '2026-06-27 10:38:24'),
	(20, 2, 4, 11, 6, 'initial_stock', 0.000, 20.000, 20.000, 'initial_stock', NULL, 'Opening stock', '2026-06-27 10:38:24'),
	(21, 2, 4, 12, 6, 'initial_stock', 0.000, 70.000, 70.000, 'initial_stock', NULL, 'Opening stock', '2026-06-27 10:38:24'),
	(22, 2, 3, 7, 9, 'out', 60.000, -5.000, 55.000, 'sale', 5, 'Sale INV-202606-0001', '2026-06-27 10:38:24'),
	(23, 2, 3, 9, 9, 'out', 100.000, -5.000, 95.000, 'sale', 5, 'Sale INV-202606-0001', '2026-06-27 10:38:24'),
	(24, 2, 3, 9, 9, 'out', 95.000, -4.000, 91.000, 'sale', 6, 'Sale INV-202606-0002', '2026-06-27 10:38:24'),
	(25, 2, 3, 8, 9, 'out', 40.000, -1.000, 39.000, 'sale', 6, 'Sale INV-202606-0002', '2026-06-27 10:38:24'),
	(26, 3, 5, 13, 11, 'initial_stock', 0.000, 45.000, 45.000, 'initial_stock', NULL, 'Opening stock', '2026-06-27 10:38:24'),
	(27, 3, 5, 14, 11, 'initial_stock', 0.000, 30.000, 30.000, 'initial_stock', NULL, 'Opening stock', '2026-06-27 10:38:24'),
	(28, 3, 5, 15, 11, 'initial_stock', 0.000, 120.000, 120.000, 'initial_stock', NULL, 'Opening stock', '2026-06-27 10:38:24'),
	(29, 3, 6, 16, 11, 'initial_stock', 0.000, 80.000, 80.000, 'initial_stock', NULL, 'Opening stock', '2026-06-27 10:38:24'),
	(30, 3, 6, 17, 11, 'initial_stock', 0.000, 15.000, 15.000, 'initial_stock', NULL, 'Opening stock', '2026-06-27 10:38:24'),
	(31, 3, 6, 18, 11, 'initial_stock', 0.000, 100.000, 100.000, 'initial_stock', NULL, 'Opening stock', '2026-06-27 10:38:24'),
	(32, 3, 5, 13, 14, 'out', 45.000, -6.000, 39.000, 'sale', 9, 'Sale INV-202606-0001', '2026-06-27 10:38:24'),
	(33, 3, 5, 15, 14, 'out', 120.000, -6.000, 114.000, 'sale', 9, 'Sale INV-202606-0001', '2026-06-27 10:38:24'),
	(34, 3, 5, 14, 14, 'out', 30.000, -3.000, 27.000, 'sale', 9, 'Sale INV-202606-0001', '2026-06-27 10:38:24'),
	(35, 1, 1, 6, 1, 'out', 145.000, -1.000, 144.000, 'sale', 13, NULL, '2026-06-27 10:54:12'),
	(36, 1, 1, 3, 1, 'out', 29.000, -1.000, 28.000, 'sale', 13, NULL, '2026-06-27 10:54:12'),
	(37, 1, 1, 6, 1, 'in', 144.000, 150.000, 294.000, NULL, NULL, NULL, '2026-06-27 10:56:41'),
	(38, 1, 1, 1, 1, 'out', 85.000, -2.000, 83.000, 'sale', 14, NULL, '2026-06-29 07:07:15'),
	(39, 1, 1, 6, 1, 'out', 294.000, -1.000, 293.000, 'sale', 14, NULL, '2026-06-29 07:07:15');

-- Dumping structure for table MM-Bharathicrackers_bms.licenses
CREATE TABLE IF NOT EXISTS `licenses` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` int(10) unsigned NOT NULL,
  `branch_id` int(10) unsigned NOT NULL,
  `type` varchar(100) NOT NULL,
  `license_no` varchar(100) NOT NULL,
  `issuing_authority` varchar(150) DEFAULT NULL,
  `issue_date` date DEFAULT NULL,
  `expiry_date` date NOT NULL,
  `document_url` varchar(500) DEFAULT NULL,
  `status` enum('active','expiring','expired') NOT NULL DEFAULT 'active',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tenant_branch` (`tenant_id`,`branch_id`),
  KEY `idx_tenant_expiry` (`tenant_id`,`expiry_date`),
  KEY `fk_lic_branch` (`branch_id`),
  CONSTRAINT `fk_lic_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`),
  CONSTRAINT `fk_lic_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table MM-Bharathicrackers_bms.licenses: ~6 rows (approximately)
INSERT IGNORE INTO `licenses` (`id`, `tenant_id`, `branch_id`, `type`, `license_no`, `issuing_authority`, `issue_date`, `expiry_date`, `document_url`, `status`, `notes`, `created_at`, `updated_at`) VALUES
	(1, 1, 1, 'Explosives License', 'EL/TN/2024/001', 'PESO', '2024-01-15', '2026-07-14', NULL, 'expiring', NULL, '2026-06-27 10:38:24', '2026-06-27 10:38:24'),
	(2, 1, 2, 'Fire Safety Certificate', 'FSC/VRD/2024/01', 'Fire Dept', '2024-03-01', '2027-02-28', NULL, 'active', NULL, '2026-06-27 10:38:24', '2026-06-27 10:38:24'),
	(3, 2, 3, 'Explosives License', 'EL/TN/2024/002', 'PESO', '2024-02-10', '2026-08-09', NULL, 'active', NULL, '2026-06-27 10:38:24', '2026-06-27 10:38:24'),
	(4, 2, 4, 'Shop License', 'SL/SAT/2024/01', 'Municipality', '2024-04-01', '2026-12-31', NULL, 'active', NULL, '2026-06-27 10:38:24', '2026-06-27 10:38:24'),
	(5, 3, 5, 'Explosives License', 'EL/TN/2024/003', 'PESO', '2024-01-20', '2026-06-30', NULL, 'expired', NULL, '2026-06-27 10:38:24', '2026-06-27 10:38:24'),
	(6, 3, 6, 'Fire Safety Certificate', 'FSC/CHN/2024/01', 'Fire Dept', '2024-05-01', '2027-04-30', NULL, 'active', NULL, '2026-06-27 10:38:24', '2026-06-27 10:38:24');

-- Dumping structure for table MM-Bharathicrackers_bms.notifications
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` int(10) unsigned NOT NULL,
  `branch_id` int(10) unsigned DEFAULT NULL,
  `user_id` int(10) unsigned DEFAULT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  `link` varchar(300) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tenant_branch` (`tenant_id`,`branch_id`),
  KEY `idx_tenant_user` (`tenant_id`,`user_id`),
  KEY `idx_read` (`is_read`),
  KEY `fk_notif_branch` (`branch_id`),
  KEY `fk_notif_user` (`user_id`),
  CONSTRAINT `fk_notif_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_notif_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`),
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table MM-Bharathicrackers_bms.notifications: ~9 rows (approximately)
INSERT IGNORE INTO `notifications` (`id`, `tenant_id`, `branch_id`, `user_id`, `type`, `title`, `message`, `is_read`, `priority`, `link`, `created_at`) VALUES
	(1, 1, 1, 2, 'low_stock', 'Low Stock: Bijili Crackers', 'Bijili Crackers 100s has only 45 units left (min: 10)', 0, 'high', NULL, '2026-06-27 10:38:24'),
	(2, 1, 1, 2, 'payment_due', 'Payment Due: PO-202606-0002', 'Balance of Rs. 2800 due for purchase from Coronation', 0, 'medium', NULL, '2026-06-27 10:38:24'),
	(3, 1, NULL, 1, 'system', 'Credit Sale Alert', 'Sale INV-202606-0003 has Rs. 1360 outstanding', 0, 'high', NULL, '2026-06-27 10:38:24'),
	(4, 2, 3, 7, 'low_stock', 'Low Stock: Atom Bomb', 'Atom Bomb 5s has 55 units left (min: 10)', 1, 'medium', NULL, '2026-06-27 10:38:24'),
	(5, 2, 3, 7, 'payment_due', 'Supplier Payment Due', 'Balance Rs. 2520 due for Sony Fireworks', 0, 'medium', NULL, '2026-06-27 10:38:24'),
	(6, 2, NULL, 6, 'system', 'New Sale Completed', 'Sale INV-202606-0004 is on credit — follow up needed', 1, 'low', NULL, '2026-06-27 10:38:24'),
	(7, 3, 5, 12, 'license_exp', 'License EXPIRED: EL/TN/2024/003', 'Explosives License expired on 2026-06-30. Renew NOW!', 0, 'critical', NULL, '2026-06-27 10:38:24'),
	(8, 3, 5, 12, 'low_stock', 'Low Stock: Thunder Bomb', 'Thunder Bomb 10pcs has 39 units left (min: 10)', 0, 'high', NULL, '2026-06-27 10:38:24'),
	(9, 3, NULL, 11, 'system', 'Partial Payment Alert', 'Sale INV-202606-0003 has Rs. 900 outstanding', 0, 'medium', NULL, '2026-06-27 10:38:24');

-- Dumping structure for table MM-Bharathicrackers_bms.payment_methods
CREATE TABLE IF NOT EXISTS `payment_methods` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` int(10) unsigned NOT NULL,
  `branch_id` int(10) unsigned NOT NULL,
  `name` varchar(60) NOT NULL,
  `type` enum('cash','upi','card','cheque','credit','other') NOT NULL DEFAULT 'cash',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `fk_pm_branch` (`branch_id`),
  KEY `idx_tenant_branch` (`tenant_id`,`branch_id`),
  KEY `idx_tenant_active` (`tenant_id`,`is_active`),
  CONSTRAINT `fk_pm_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`),
  CONSTRAINT `fk_pm_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table MM-Bharathicrackers_bms.payment_methods: ~25 rows (approximately)
INSERT IGNORE INTO `payment_methods` (`id`, `tenant_id`, `branch_id`, `name`, `type`, `is_active`, `sort_order`) VALUES
	(1, 1, 1, 'Cash', 'cash', 1, 1),
	(2, 1, 1, 'UPI / GPay', 'upi', 1, 2),
	(3, 1, 1, 'Card', 'card', 1, 3),
	(4, 1, 1, 'Bank Transfer', 'cheque', 1, 4),
	(5, 1, 1, 'Credit', 'credit', 1, 5),
	(6, 2, 3, 'Cash', 'cash', 1, 1),
	(7, 2, 3, 'UPI / GPay', 'upi', 1, 2),
	(8, 2, 3, 'Card', 'card', 1, 3),
	(9, 2, 3, 'Bank Transfer', 'cheque', 1, 4),
	(10, 2, 3, 'Credit', 'credit', 1, 5),
	(11, 2, 4, 'Cash', 'cash', 1, 1),
	(12, 2, 4, 'UPI / GPay', 'upi', 1, 2),
	(13, 2, 4, 'Card', 'card', 1, 3),
	(14, 2, 4, 'Bank Transfer', 'cheque', 1, 4),
	(15, 2, 4, 'Credit', 'credit', 1, 5),
	(16, 3, 5, 'Cash', 'cash', 1, 1),
	(17, 3, 5, 'UPI / GPay', 'upi', 1, 2),
	(18, 3, 5, 'Card', 'card', 1, 3),
	(19, 3, 5, 'Bank Transfer', 'cheque', 1, 4),
	(20, 3, 5, 'Credit', 'credit', 1, 5),
	(21, 3, 6, 'Cash', 'cash', 1, 1),
	(22, 3, 6, 'UPI / GPay', 'upi', 1, 2),
	(23, 3, 6, 'Card', 'card', 1, 3),
	(24, 3, 6, 'Bank Transfer', 'cheque', 1, 4),
	(25, 3, 6, 'Credit', 'credit', 1, 5);

-- Dumping structure for table MM-Bharathicrackers_bms.permissions
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` int(10) unsigned DEFAULT NULL,
  `module` varchar(50) NOT NULL,
  `action` varchar(50) NOT NULL,
  `description` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tenant_module_action` (`tenant_id`,`module`,`action`),
  KEY `idx_tenant` (`tenant_id`),
  CONSTRAINT `fk_perm_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table MM-Bharathicrackers_bms.permissions: ~25 rows (approximately)
INSERT IGNORE INTO `permissions` (`id`, `tenant_id`, `module`, `action`, `description`) VALUES
	(1, NULL, 'inventory', 'view', NULL),
	(2, NULL, 'inventory', 'create', NULL),
	(3, NULL, 'inventory', 'edit', NULL),
	(4, NULL, 'inventory', 'delete', NULL),
	(5, NULL, 'inventory', 'import', NULL),
	(6, NULL, 'pos', 'bill', NULL),
	(7, NULL, 'pos', 'discount', NULL),
	(8, NULL, 'pos', 'refund', NULL),
	(9, NULL, 'customers', 'view', NULL),
	(10, NULL, 'customers', 'manage', NULL),
	(11, NULL, 'suppliers', 'view', NULL),
	(12, NULL, 'suppliers', 'manage', NULL),
	(13, NULL, 'purchases', 'view', NULL),
	(14, NULL, 'purchases', 'manage', NULL),
	(15, NULL, 'expenses', 'view', NULL),
	(16, NULL, 'expenses', 'manage', NULL),
	(17, NULL, 'reports', 'view', NULL),
	(18, NULL, 'reports', 'export', NULL),
	(19, NULL, 'compliance', 'view', NULL),
	(20, NULL, 'compliance', 'manage', NULL),
	(21, NULL, 'users', 'view', NULL),
	(22, NULL, 'users', 'manage', NULL),
	(23, NULL, 'settings', 'view', NULL),
	(24, NULL, 'settings', 'manage', NULL),
	(25, NULL, 'dashboard', 'view', NULL);

-- Dumping structure for table MM-Bharathicrackers_bms.products
CREATE TABLE IF NOT EXISTS `products` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` int(10) unsigned NOT NULL,
  `branch_id` int(10) unsigned NOT NULL,
  `category_id` int(10) unsigned DEFAULT NULL,
  `supplier_id` int(10) unsigned DEFAULT NULL,
  `tax_rate_id` int(10) unsigned DEFAULT NULL,
  `unit_id` int(10) unsigned DEFAULT NULL,
  `name` varchar(200) NOT NULL,
  `sku` varchar(80) DEFAULT NULL,
  `barcode` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `purchase_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `selling_price` decimal(10,2) NOT NULL,
  `mrp` decimal(10,2) DEFAULT NULL,
  `min_price` decimal(10,2) DEFAULT NULL,
  `discount_pct` decimal(5,2) NOT NULL DEFAULT 0.00,
  `stock_qty` decimal(10,3) NOT NULL DEFAULT 0.000,
  `min_stock` decimal(10,3) NOT NULL DEFAULT 5.000,
  `max_stock` decimal(10,3) DEFAULT NULL,
  `batch_no` varchar(80) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `hazard_class` enum('none','division1','division2','division3','division4') NOT NULL DEFAULT 'none',
  `hazard_label` varchar(100) DEFAULT NULL,
  `storage_notes` text DEFAULT NULL,
  `weight_kg` decimal(8,3) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `thumb_url` varchar(500) DEFAULT NULL,
  `barcode_image` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` int(10) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tenant_branch_sku` (`tenant_id`,`branch_id`,`sku`),
  UNIQUE KEY `uq_tenant_branch_barcode` (`tenant_id`,`branch_id`,`barcode`),
  KEY `idx_tenant_branch` (`tenant_id`,`branch_id`),
  KEY `idx_tenant_active` (`tenant_id`,`is_active`),
  KEY `idx_category` (`category_id`),
  KEY `idx_supplier` (`supplier_id`),
  KEY `idx_stock` (`stock_qty`),
  KEY `fk_prod_branch` (`branch_id`),
  KEY `fk_prod_tax` (`tax_rate_id`),
  KEY `fk_prod_unit` (`unit_id`),
  KEY `fk_prod_creator` (`created_by`),
  FULLTEXT KEY `ft_name` (`name`,`description`),
  CONSTRAINT `fk_prod_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`),
  CONSTRAINT `fk_prod_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_prod_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_prod_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_prod_tax` FOREIGN KEY (`tax_rate_id`) REFERENCES `tax_rates` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_prod_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`),
  CONSTRAINT `fk_prod_unit` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table MM-Bharathicrackers_bms.products: ~18 rows (approximately)
INSERT IGNORE INTO `products` (`id`, `tenant_id`, `branch_id`, `category_id`, `supplier_id`, `tax_rate_id`, `unit_id`, `name`, `sku`, `barcode`, `description`, `purchase_price`, `selling_price`, `mrp`, `min_price`, `discount_pct`, `stock_qty`, `min_stock`, `max_stock`, `batch_no`, `expiry_date`, `hazard_class`, `hazard_label`, `storage_notes`, `weight_kg`, `image_url`, `thumb_url`, `barcode_image`, `is_active`, `is_featured`, `created_by`, `created_at`, `updated_at`) VALUES
	(1, 1, 1, 1, 1, 2, 1, 'Bijili Crackers 100s', 'SKU-T1-001', 'BC1000001', NULL, 120.00, 180.00, 200.00, NULL, 0.00, 83.000, 10.000, NULL, NULL, NULL, 'division2', NULL, NULL, NULL, '/uploads/tenants/1/branches/1/products/1/full_1782726700081.webp', '/uploads/tenants/1/branches/1/products/1/thumb_1782726700081.webp', NULL, 1, 1, NULL, '2026-06-27 10:38:24', '2026-06-30 07:10:22'),
	(2, 1, 1, 3, 1, 1, 1, 'Golden Sparkler 30cm', 'SKU-T1-002', 'BC1000002', NULL, 45.00, 80.00, 90.00, NULL, 0.00, 187.000, 20.000, NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, NULL, '2026-06-27 10:38:24', '2026-06-30 07:10:25'),
	(3, 1, 1, 5, 1, 2, 1, 'Diwali Gift Box Premium', 'SKU-T1-003', 'BC1000003', NULL, 350.00, 550.00, 600.00, NULL, 0.00, 28.000, 5.000, NULL, NULL, NULL, 'division2', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, NULL, '2026-06-27 10:38:24', '2026-06-30 07:10:27'),
	(4, 1, 1, 2, 2, 2, 1, 'Ground Chakkar', 'SKU-T1-004', 'BC1000004', NULL, 60.00, 100.00, 120.00, NULL, 0.00, 72.000, 15.000, NULL, NULL, NULL, 'division3', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, NULL, '2026-06-27 10:38:24', '2026-06-30 07:10:29'),
	(5, 1, 1, 1, 2, 2, 1, 'Aerial Shell 12 shots', 'SKU-T1-005', 'BC1000005', NULL, 200.00, 350.00, 400.00, NULL, 0.00, 22.000, 5.000, NULL, NULL, NULL, 'division1', NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-06-27 10:38:24', '2026-06-30 07:08:11'),
	(6, 1, 1, 7, 2, 1, 1, 'Color Smoke Bomb', 'SKU-T1-006', 'BC1000006', NULL, 30.00, 60.00, 70.00, NULL, 0.00, 293.000, 20.000, NULL, NULL, NULL, 'division4', NULL, NULL, NULL, '/uploads/tenants/1/branches/1/products/6/full_1782726807874.webp', '/uploads/tenants/1/branches/1/products/6/thumb_1782726807874.webp', NULL, 1, 0, NULL, '2026-06-27 10:38:24', '2026-06-30 07:08:15'),
	(7, 2, 3, 1, 3, 2, 1, 'Atom Bomb 5s', 'SKU-T2-001', 'BC2000001', NULL, 80.00, 130.00, 150.00, NULL, 0.00, 55.000, 10.000, NULL, NULL, NULL, 'division2', NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, '2026-06-27 10:38:24', '2026-06-27 10:38:25'),
	(8, 2, 3, 6, 3, 2, 1, 'Sky Rocket 10pcs', 'SKU-T2-002', 'BC2000002', NULL, 150.00, 250.00, 280.00, NULL, 0.00, 39.000, 8.000, NULL, NULL, NULL, 'division1', NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, '2026-06-27 10:38:24', '2026-06-27 10:38:25'),
	(9, 2, 3, 3, 3, 1, 1, 'Fancy Sparkler Set', 'SKU-T2-003', 'BC2000003', NULL, 90.00, 150.00, 170.00, NULL, 0.00, 91.000, 15.000, NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, '2026-06-27 10:38:24', '2026-06-27 10:38:25'),
	(10, 2, 4, 4, 4, 2, 1, 'Laxmi Bomb', 'SKU-T2-004', 'BC2000004', NULL, 50.00, 90.00, 100.00, NULL, 0.00, 84.000, 20.000, NULL, NULL, NULL, 'division2', NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, '2026-06-27 10:38:24', '2026-06-27 10:38:25'),
	(11, 2, 4, 5, 4, 2, 1, 'Family Pack Crackers 500gm', 'SKU-T2-005', 'BC2000005', NULL, 280.00, 450.00, 500.00, NULL, 0.00, 20.000, 5.000, NULL, NULL, NULL, 'division3', NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, '2026-06-27 10:38:24', '2026-06-27 10:38:24'),
	(12, 2, 4, 7, 4, 1, 1, 'Rainbow Fountain', 'SKU-T2-006', 'BC2000006', NULL, 70.00, 120.00, 140.00, NULL, 0.00, 70.000, 10.000, NULL, NULL, NULL, 'division4', NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, '2026-06-27 10:38:24', '2026-06-27 10:38:24'),
	(13, 3, 5, 1, 5, 2, 1, 'Thunder Bomb 10pcs', 'SKU-T3-001', 'BC3000001', NULL, 100.00, 180.00, 200.00, NULL, 0.00, 39.000, 10.000, NULL, NULL, NULL, 'division2', NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, '2026-06-27 10:38:24', '2026-06-27 10:38:25'),
	(14, 3, 5, 6, 5, 2, 1, 'Peacock Rocket', 'SKU-T3-002', 'BC3000002', NULL, 180.00, 320.00, 360.00, NULL, 0.00, 27.000, 6.000, NULL, NULL, NULL, 'division1', NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, '2026-06-27 10:38:24', '2026-06-27 10:38:25'),
	(15, 3, 5, 3, 5, 1, 1, 'Silver Sparkler Box', 'SKU-T3-003', 'BC3000003', NULL, 60.00, 100.00, 120.00, NULL, 0.00, 114.000, 20.000, NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, '2026-06-27 10:38:24', '2026-06-27 10:38:25'),
	(16, 3, 6, 2, 6, 2, 1, 'Flower Pot 5pcs', 'SKU-T3-004', 'BC3000004', NULL, 55.00, 95.00, 110.00, NULL, 0.00, 80.000, 15.000, NULL, NULL, NULL, 'division3', NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, '2026-06-27 10:38:24', '2026-06-27 10:38:24'),
	(17, 3, 6, 5, 6, 2, 1, 'Grand Diwali Box', 'SKU-T3-005', 'BC3000005', NULL, 500.00, 800.00, 900.00, NULL, 0.00, 15.000, 3.000, NULL, NULL, NULL, 'division2', NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, '2026-06-27 10:38:24', '2026-06-27 10:38:24'),
	(18, 3, 6, 7, 6, 1, 1, 'Smoke Grenade Asst', 'SKU-T3-006', 'BC3000006', NULL, 40.00, 70.00, 80.00, NULL, 0.00, 100.000, 15.000, NULL, NULL, NULL, 'division4', NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, '2026-06-27 10:38:24', '2026-06-27 10:38:24');

-- Dumping structure for table MM-Bharathicrackers_bms.purchases
CREATE TABLE IF NOT EXISTS `purchases` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` int(10) unsigned NOT NULL,
  `branch_id` int(10) unsigned NOT NULL,
  `supplier_id` int(10) unsigned DEFAULT NULL,
  `user_id` int(10) unsigned DEFAULT NULL,
  `po_number` varchar(30) NOT NULL,
  `invoice_no` varchar(50) DEFAULT NULL,
  `purchase_date` date NOT NULL,
  `due_date` date DEFAULT NULL,
  `status` enum('draft','ordered','partial','received','cancelled') NOT NULL DEFAULT 'draft',
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `discount_amt` decimal(10,2) NOT NULL DEFAULT 0.00,
  `tax_amt` decimal(10,2) NOT NULL DEFAULT 0.00,
  `freight_amt` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_amt` decimal(12,2) NOT NULL DEFAULT 0.00,
  `paid_amt` decimal(12,2) NOT NULL DEFAULT 0.00,
  `payment_status` enum('unpaid','partial','paid') NOT NULL DEFAULT 'unpaid',
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_log` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`payment_log`)),
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tenant_po` (`tenant_id`,`po_number`),
  KEY `idx_tenant_branch` (`tenant_id`,`branch_id`),
  KEY `idx_tenant_date` (`tenant_id`,`purchase_date`),
  KEY `idx_status` (`status`),
  KEY `idx_supplier` (`supplier_id`),
  KEY `idx_user` (`user_id`),
  KEY `fk_pur_branch` (`branch_id`),
  CONSTRAINT `fk_pur_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`),
  CONSTRAINT `fk_pur_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_pur_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`),
  CONSTRAINT `fk_pur_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table MM-Bharathicrackers_bms.purchases: ~9 rows (approximately)
INSERT IGNORE INTO `purchases` (`id`, `tenant_id`, `branch_id`, `supplier_id`, `user_id`, `po_number`, `invoice_no`, `purchase_date`, `due_date`, `status`, `subtotal`, `discount_amt`, `tax_amt`, `freight_amt`, `total_amt`, `paid_amt`, `payment_status`, `payment_method`, `payment_log`, `notes`, `created_at`, `updated_at`) VALUES
	(1, 1, 1, 1, 2, 'PO-202606-0001', NULL, '2026-06-15', NULL, 'received', 8000.00, 0.00, 960.00, 0.00, 8960.00, 8960.00, 'paid', NULL, NULL, NULL, '2026-06-27 10:38:24', '2026-06-27 10:38:24'),
	(2, 1, 2, 2, 3, 'PO-202606-0002', NULL, '2026-06-18', NULL, 'received', 5000.00, 0.00, 600.00, 0.00, 5600.00, 2800.00, 'partial', NULL, NULL, NULL, '2026-06-27 10:38:24', '2026-06-27 10:38:24'),
	(3, 1, 1, 1, 2, 'PO-202606-0003', NULL, '2026-06-25', NULL, 'ordered', 3500.00, 0.00, 420.00, 0.00, 3920.00, 3500.00, 'partial', 'Cash', '[{"amount":3500,"payment_method":"Cash","reference_no":null,"payment_date":"2026-06-29T07:09:52.002Z"}]', NULL, '2026-06-27 10:38:24', '2026-06-29 07:09:52'),
	(4, 2, 3, 3, 7, 'PO-202606-0001', NULL, '2026-06-14', NULL, 'received', 7200.00, 0.00, 864.00, 0.00, 8064.00, 8064.00, 'paid', NULL, NULL, NULL, '2026-06-27 10:38:24', '2026-06-27 10:38:24'),
	(5, 2, 4, 4, 8, 'PO-202606-0002', NULL, '2026-06-17', NULL, 'received', 4500.00, 0.00, 540.00, 0.00, 5040.00, 2520.00, 'partial', NULL, NULL, NULL, '2026-06-27 10:38:24', '2026-06-27 10:38:24'),
	(6, 2, 3, 3, 7, 'PO-202606-0003', NULL, '2026-06-24', NULL, 'draft', 6000.00, 0.00, 720.00, 0.00, 6720.00, 0.00, 'unpaid', NULL, NULL, NULL, '2026-06-27 10:38:24', '2026-06-27 10:38:24'),
	(7, 3, 5, 5, 12, 'PO-202606-0001', NULL, '2026-06-13', NULL, 'received', 9000.00, 0.00, 1080.00, 0.00, 10080.00, 10080.00, 'paid', NULL, NULL, NULL, '2026-06-27 10:38:24', '2026-06-27 10:38:24'),
	(8, 3, 6, 6, 13, 'PO-202606-0002', NULL, '2026-06-19', NULL, 'received', 4000.00, 0.00, 480.00, 0.00, 4480.00, 2240.00, 'partial', NULL, NULL, NULL, '2026-06-27 10:38:24', '2026-06-27 10:38:24'),
	(9, 3, 5, 5, 12, 'PO-202606-0003', NULL, '2026-06-26', NULL, 'ordered', 5500.00, 0.00, 660.00, 0.00, 6160.00, 0.00, 'unpaid', NULL, NULL, NULL, '2026-06-27 10:38:24', '2026-06-27 10:38:24');

-- Dumping structure for table MM-Bharathicrackers_bms.purchase_items
CREATE TABLE IF NOT EXISTS `purchase_items` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` int(10) unsigned NOT NULL,
  `branch_id` int(10) unsigned NOT NULL,
  `purchase_id` int(10) unsigned NOT NULL,
  `product_id` int(10) unsigned NOT NULL,
  `qty` decimal(10,3) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `discount_pct` decimal(5,2) NOT NULL DEFAULT 0.00,
  `tax_pct` decimal(5,2) NOT NULL DEFAULT 0.00,
  `tax_amt` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_amt` decimal(12,2) NOT NULL,
  `batch_no` varchar(80) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `received_qty` decimal(10,3) NOT NULL DEFAULT 0.000,
  PRIMARY KEY (`id`),
  KEY `idx_purchase` (`purchase_id`),
  KEY `idx_product` (`product_id`),
  KEY `fk_pi_branch` (`branch_id`),
  KEY `idx_tenant_branch` (`tenant_id`,`branch_id`),
  CONSTRAINT `fk_pi_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`),
  CONSTRAINT `fk_pi_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `fk_pi_purchase` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pi_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table MM-Bharathicrackers_bms.purchase_items: ~19 rows (approximately)
INSERT IGNORE INTO `purchase_items` (`id`, `tenant_id`, `branch_id`, `purchase_id`, `product_id`, `qty`, `unit_price`, `discount_pct`, `tax_pct`, `tax_amt`, `total_amt`, `batch_no`, `expiry_date`, `received_qty`) VALUES
	(1, 1, 1, 1, 1, 40.000, 120.00, 0.00, 12.00, 576.00, 5376.00, NULL, NULL, 40.000),
	(2, 1, 1, 1, 2, 40.000, 45.00, 0.00, 0.00, 0.00, 1800.00, NULL, NULL, 40.000),
	(3, 1, 2, 2, 4, 30.000, 60.00, 0.00, 12.00, 216.00, 2016.00, NULL, NULL, 30.000),
	(4, 1, 2, 2, 5, 15.000, 200.00, 0.00, 12.00, 360.00, 3360.00, NULL, NULL, 15.000),
	(5, 1, 1, 3, 1, 20.000, 120.00, 0.00, 12.00, 288.00, 2688.00, NULL, NULL, 0.000),
	(6, 1, 1, 3, 2, 20.000, 45.00, 0.00, 0.00, 0.00, 900.00, NULL, NULL, 0.000),
	(7, 2, 3, 4, 7, 40.000, 80.00, 0.00, 12.00, 384.00, 3584.00, NULL, NULL, 40.000),
	(8, 2, 3, 4, 9, 40.000, 90.00, 0.00, 0.00, 0.00, 3600.00, NULL, NULL, 40.000),
	(9, 2, 4, 5, 10, 35.000, 50.00, 0.00, 12.00, 210.00, 1960.00, NULL, NULL, 35.000),
	(10, 2, 4, 5, 12, 25.000, 70.00, 0.00, 0.00, 0.00, 1750.00, NULL, NULL, 25.000),
	(11, 2, 3, 6, 7, 30.000, 80.00, 0.00, 12.00, 288.00, 2688.00, NULL, NULL, 0.000),
	(12, 2, 3, 6, 8, 20.000, 150.00, 0.00, 12.00, 360.00, 3360.00, NULL, NULL, 0.000),
	(13, 3, 5, 7, 13, 30.000, 100.00, 0.00, 12.00, 360.00, 3360.00, NULL, NULL, 30.000),
	(14, 3, 5, 7, 15, 40.000, 60.00, 0.00, 0.00, 0.00, 2400.00, NULL, NULL, 40.000),
	(15, 3, 5, 7, 14, 15.000, 180.00, 0.00, 12.00, 324.00, 2994.00, NULL, NULL, 15.000),
	(16, 3, 6, 8, 16, 25.000, 55.00, 0.00, 12.00, 165.00, 1540.00, NULL, NULL, 25.000),
	(17, 3, 6, 8, 18, 35.000, 40.00, 0.00, 0.00, 0.00, 1400.00, NULL, NULL, 35.000),
	(18, 3, 5, 9, 13, 20.000, 100.00, 0.00, 12.00, 240.00, 2240.00, NULL, NULL, 0.000),
	(19, 3, 5, 9, 14, 15.000, 180.00, 0.00, 12.00, 324.00, 2994.00, NULL, NULL, 0.000);

-- Dumping structure for table MM-Bharathicrackers_bms.refresh_tokens
CREATE TABLE IF NOT EXISTS `refresh_tokens` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `device_info` varchar(300) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `expires_at` timestamp NOT NULL,
  `revoked_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_token` (`token_hash`),
  KEY `idx_user` (`user_id`),
  CONSTRAINT `fk_rt_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table MM-Bharathicrackers_bms.refresh_tokens: ~19 rows (approximately)
INSERT IGNORE INTO `refresh_tokens` (`id`, `user_id`, `token_hash`, `device_info`, `ip_address`, `expires_at`, `revoked_at`, `created_at`) VALUES
	(1, 1, 'c44538f767f6407f26de7a79bf5cecc2a9f42de8e7c36f8c90cbc9ef5087b27f', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '127.0.0.1', '2026-07-04 10:32:03', '2026-06-27 10:40:17', '2026-06-27 10:32:03'),
	(2, 1, '6a6a8bdeb5a52375e8f26594653a7579b1af38a34caa1c54f2d20c6c0e94b8af', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '127.0.0.1', '2026-07-04 10:40:27', '2026-06-27 11:10:43', '2026-06-27 10:40:27'),
	(3, 1, '6667a084e890c80d53bc57ee4790fbddcefea35cff6f3336184efb46571914ca', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '127.0.0.1', '2026-07-04 11:10:43', NULL, '2026-06-27 11:10:43'),
	(4, 1, 'f979fda5df3b726bbee989a93ea78054436ccafdfca4048238412f4627d2667d', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '2026-07-04 11:16:55', '2026-06-27 13:43:14', '2026-06-27 11:16:55'),
	(5, 1, 'd729286a59287148b16c8b039aac00914d8ecfba4f6c1a1773f1bff45e999425', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '127.0.0.1', '2026-07-04 13:43:14', NULL, '2026-06-27 13:43:14'),
	(6, 1, 'f5cebdcc8419a7cf976ac001cccb9cdfa4aea4c2bbfb1682adcdd87a2ae88f42', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '127.0.0.1', '2026-07-05 16:58:18', '2026-06-28 17:28:19', '2026-06-28 16:58:18'),
	(7, 1, 'b585e0b78e1ef33cbcc9f8367b34db16a56a4662a361d73bf2819c764c48d249', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '127.0.0.1', '2026-07-05 17:28:19', '2026-06-28 17:59:11', '2026-06-28 17:28:19'),
	(8, 1, '91a40da8b8ddeae4e8b260655763d4a30cbdae63efea9f7a5fd6bf3496133279', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '127.0.0.1', '2026-07-05 17:59:11', '2026-06-29 02:04:09', '2026-06-28 17:59:11'),
	(9, 1, '69528d88ebbff68277102ecf08992ca9ec588ea51814676b692a0980078e5e3c', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '127.0.0.1', '2026-07-06 02:04:09', '2026-06-29 02:35:46', '2026-06-29 02:04:09'),
	(10, 1, '6eba1fd14d360ef488a99612fdcf47337156aa67b5c930b322a42a8677fc818a', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '127.0.0.1', '2026-07-06 02:35:46', '2026-06-29 04:36:42', '2026-06-29 02:35:46'),
	(11, 1, '6b1991826e8c212ddfb32cce7179ba324884cd63ddd43ffa5018879492c040c2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '127.0.0.1', '2026-07-06 04:36:42', '2026-06-29 06:42:15', '2026-06-29 04:36:42'),
	(12, 1, '1913cb86e7f542280126e2d5459417ff219624be5dbe81f37eb1efb35c3ea62f', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '127.0.0.1', '2026-07-06 06:42:15', '2026-06-29 07:12:20', '2026-06-29 06:42:15'),
	(13, 1, 'bf915b97bab6ec9ca68000c247021a3b05cf51b40f44fc936b3121db11a629bd', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '127.0.0.1', '2026-07-06 07:12:20', '2026-06-29 07:42:46', '2026-06-29 07:12:20'),
	(14, 1, '3bd988b37d6c348d22efe05ec2b60a7cda0761f9d56a891fd87bc5de678cc537', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '127.0.0.1', '2026-07-06 07:42:46', '2026-06-29 08:13:44', '2026-06-29 07:42:46'),
	(15, 1, '3d50228e87535b0eba083501336b81704adbe136faad7e06d9d78374ff54a578', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '127.0.0.1', '2026-07-06 08:13:44', '2026-06-29 08:43:44', '2026-06-29 08:13:44'),
	(16, 1, 'a79a2a958bc61e334150f8d477b23861779a87a5ebf5cb5529c426061d94f7f4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '127.0.0.1', '2026-07-06 08:43:44', '2026-06-29 09:14:18', '2026-06-29 08:43:44'),
	(17, 1, '8d5c5ec249a94a002a19f5cd0bde1e4cf0a0cc67c9b4d49ba6d9b71632c50ae0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '127.0.0.1', '2026-07-06 09:14:18', NULL, '2026-06-29 09:14:18'),
	(18, 1, 'aa3a7abb7a01126a5006d019eec79eea3fc1a2be4b31d1dade536545fcaac573', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '2026-07-06 09:49:52', '2026-06-30 05:14:12', '2026-06-29 09:49:52'),
	(19, 1, '9a3ba685c965da377410033a2fa478a8ef71cbeab4830ab856f2358bb38c1ee8', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '127.0.0.1', '2026-07-07 05:13:50', NULL, '2026-06-30 05:13:50');

-- Dumping structure for table MM-Bharathicrackers_bms.returns
CREATE TABLE IF NOT EXISTS `returns` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` int(10) unsigned NOT NULL,
  `branch_id` int(10) unsigned NOT NULL,
  `sale_id` int(10) unsigned NOT NULL,
  `user_id` int(10) unsigned DEFAULT NULL,
  `return_no` varchar(30) NOT NULL,
  `return_date` timestamp NULL DEFAULT current_timestamp(),
  `reason` text DEFAULT NULL,
  `refund_method` varchar(50) DEFAULT NULL,
  `refund_amt` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'approved',
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tenant_return` (`tenant_id`,`return_no`),
  KEY `idx_tenant_branch` (`tenant_id`,`branch_id`),
  KEY `idx_sale` (`sale_id`),
  KEY `idx_user` (`user_id`),
  KEY `fk_ret_branch` (`branch_id`),
  CONSTRAINT `fk_ret_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`),
  CONSTRAINT `fk_ret_sale` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`),
  CONSTRAINT `fk_ret_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`),
  CONSTRAINT `fk_ret_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table MM-Bharathicrackers_bms.returns: ~3 rows (approximately)
INSERT IGNORE INTO `returns` (`id`, `tenant_id`, `branch_id`, `sale_id`, `user_id`, `return_no`, `return_date`, `reason`, `refund_method`, `refund_amt`, `status`, `notes`) VALUES
	(1, 1, 1, 2, 4, 'RTN-T1-0001', '2026-06-27 10:38:24', 'Product damaged', 'Cash', 400.00, 'approved', NULL),
	(2, 2, 3, 6, 9, 'RTN-T2-0001', '2026-06-27 10:38:24', 'Wrong item', 'Cash', 280.00, 'approved', NULL),
	(3, 3, 5, 10, 14, 'RTN-T3-0001', '2026-06-27 10:38:24', 'Customer changed mind', 'UPI', 201.60, 'approved', NULL);

-- Dumping structure for table MM-Bharathicrackers_bms.return_items
CREATE TABLE IF NOT EXISTS `return_items` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` int(10) unsigned NOT NULL,
  `branch_id` int(10) unsigned NOT NULL,
  `return_id` int(10) unsigned NOT NULL,
  `product_id` int(10) unsigned NOT NULL,
  `qty` decimal(10,3) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total_amt` decimal(10,2) NOT NULL,
  `restock` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_return` (`return_id`),
  KEY `idx_product` (`product_id`),
  KEY `fk_ri_branch` (`branch_id`),
  KEY `idx_tenant_branch` (`tenant_id`,`branch_id`),
  CONSTRAINT `fk_ri_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`),
  CONSTRAINT `fk_ri_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `fk_ri_return` FOREIGN KEY (`return_id`) REFERENCES `returns` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ri_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table MM-Bharathicrackers_bms.return_items: ~3 rows (approximately)
INSERT IGNORE INTO `return_items` (`id`, `tenant_id`, `branch_id`, `return_id`, `product_id`, `qty`, `unit_price`, `total_amt`, `restock`) VALUES
	(1, 1, 1, 1, 2, 5.000, 80.00, 400.00, 1),
	(2, 2, 3, 2, 8, 1.000, 250.00, 250.00, 0),
	(3, 3, 5, 3, 13, 1.000, 180.00, 180.00, 1);

-- Dumping structure for table MM-Bharathicrackers_bms.roles
CREATE TABLE IF NOT EXISTS `roles` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` int(10) unsigned DEFAULT NULL,
  `name` varchar(50) NOT NULL,
  `display_name` varchar(80) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_system` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tenant_role_name` (`tenant_id`,`name`),
  KEY `idx_tenant` (`tenant_id`),
  CONSTRAINT `fk_role_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table MM-Bharathicrackers_bms.roles: ~5 rows (approximately)
INSERT IGNORE INTO `roles` (`id`, `tenant_id`, `name`, `display_name`, `description`, `is_system`, `created_at`) VALUES
	(1, NULL, 'super_admin', 'Super Admin', 'Full platform access across all tenants', 1, '2026-06-27 10:27:27'),
	(2, NULL, 'admin', 'Admin', 'Full access within their tenant', 1, '2026-06-27 10:27:27'),
	(3, NULL, 'manager', 'Branch Manager', 'Branch-level management access', 1, '2026-06-27 10:27:27'),
	(4, NULL, 'cashier', 'Cashier', 'POS billing and basic operations', 1, '2026-06-27 10:27:27'),
	(5, NULL, 'tenant_owner', 'Tenant Owner', 'Owner-level access to tenant settings', 1, '2026-06-27 10:27:27');

-- Dumping structure for table MM-Bharathicrackers_bms.role_permissions
CREATE TABLE IF NOT EXISTS `role_permissions` (
  `role_id` int(10) unsigned NOT NULL,
  `permission_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`role_id`,`permission_id`),
  KEY `idx_permission` (`permission_id`),
  CONSTRAINT `fk_rp_perm` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rp_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table MM-Bharathicrackers_bms.role_permissions: ~72 rows (approximately)
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`) VALUES
	(1, 1),
	(2, 1),
	(3, 1),
	(4, 1),
	(1, 2),
	(2, 2),
	(1, 3),
	(2, 3),
	(3, 3),
	(1, 4),
	(2, 4),
	(1, 5),
	(2, 5),
	(1, 6),
	(2, 6),
	(3, 6),
	(4, 6),
	(1, 7),
	(2, 7),
	(3, 7),
	(4, 7),
	(1, 8),
	(2, 8),
	(3, 8),
	(1, 9),
	(2, 9),
	(3, 9),
	(4, 9),
	(1, 10),
	(2, 10),
	(3, 10),
	(4, 10),
	(1, 11),
	(2, 11),
	(3, 11),
	(1, 12),
	(2, 12),
	(3, 12),
	(1, 13),
	(2, 13),
	(3, 13),
	(1, 14),
	(2, 14),
	(3, 14),
	(1, 15),
	(2, 15),
	(3, 15),
	(1, 16),
	(2, 16),
	(3, 16),
	(1, 17),
	(2, 17),
	(3, 17),
	(1, 18),
	(2, 18),
	(3, 18),
	(1, 19),
	(2, 19),
	(3, 19),
	(1, 20),
	(2, 20),
	(3, 20),
	(1, 21),
	(1, 22),
	(1, 23),
	(2, 23),
	(1, 24),
	(2, 24),
	(1, 25),
	(2, 25),
	(3, 25),
	(4, 25);

-- Dumping structure for table MM-Bharathicrackers_bms.safety_checklists
CREATE TABLE IF NOT EXISTS `safety_checklists` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` int(10) unsigned NOT NULL,
  `branch_id` int(10) unsigned NOT NULL,
  `user_id` int(10) unsigned DEFAULT NULL,
  `check_date` date NOT NULL,
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`items`)),
  `status` enum('pass','fail','partial') NOT NULL DEFAULT 'pass',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tenant_branch` (`tenant_id`,`branch_id`),
  KEY `idx_tenant_date` (`tenant_id`,`check_date`),
  KEY `idx_user` (`user_id`),
  KEY `fk_sc_branch` (`branch_id`),
  CONSTRAINT `fk_sc_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`),
  CONSTRAINT `fk_sc_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`),
  CONSTRAINT `fk_sc_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table MM-Bharathicrackers_bms.safety_checklists: ~6 rows (approximately)
INSERT IGNORE INTO `safety_checklists` (`id`, `tenant_id`, `branch_id`, `user_id`, `check_date`, `items`, `status`, `notes`, `created_at`) VALUES
	(1, 1, 1, 2, '2026-06-01', '[{"item":"Fire extinguisher serviceable","checked":true},{"item":"Storage temp within limits","checked":true},{"item":"No smoking signs visible","checked":true},{"item":"Emergency exits clear","checked":true}]', 'pass', 'All checks clear', '2026-06-27 10:38:24'),
	(2, 1, 2, 3, '2026-06-01', '[{"item":"Fire extinguisher serviceable","checked":true},{"item":"Water sprinkler functional","checked":false},{"item":"No smoking signs visible","checked":true},{"item":"Emergency exits clear","checked":true}]', 'partial', 'Water sprinkler needs service', '2026-06-27 10:38:24'),
	(3, 2, 3, 7, '2026-06-01', '[{"item":"Fire extinguisher serviceable","checked":true},{"item":"Storage temp within limits","checked":true},{"item":"No smoking signs visible","checked":true},{"item":"Emergency exits clear","checked":true}]', 'pass', 'All items checked', '2026-06-27 10:38:24'),
	(4, 2, 4, 8, '2026-06-01', '[{"item":"Fire extinguisher serviceable","checked":true},{"item":"Storage temp within limits","checked":true},{"item":"No smoking signs visible","checked":true},{"item":"Emergency exits clear","checked":true}]', 'pass', 'Routine check completed', '2026-06-27 10:38:24'),
	(5, 3, 5, 12, '2026-06-01', '[{"item":"Fire extinguisher serviceable","checked":false},{"item":"Storage temp within limits","checked":true},{"item":"No smoking signs visible","checked":false},{"item":"Emergency exits clear","checked":true}]', 'fail', 'Multiple issues found — see notes', '2026-06-27 10:38:24'),
	(6, 3, 6, 13, '2026-06-01', '[{"item":"Fire extinguisher serviceable","checked":true},{"item":"Storage temp within limits","checked":true},{"item":"No smoking signs visible","checked":true},{"item":"Emergency exits clear","checked":true}]', 'pass', 'All clear', '2026-06-27 10:38:24');

-- Dumping structure for table MM-Bharathicrackers_bms.sales
CREATE TABLE IF NOT EXISTS `sales` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` int(10) unsigned NOT NULL,
  `branch_id` int(10) unsigned NOT NULL,
  `customer_id` int(10) unsigned DEFAULT NULL,
  `user_id` int(10) unsigned DEFAULT NULL,
  `invoice_no` varchar(30) NOT NULL,
  `sale_date` timestamp NULL DEFAULT current_timestamp(),
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `discount_amt` decimal(10,2) NOT NULL DEFAULT 0.00,
  `tax_amt` decimal(10,2) NOT NULL DEFAULT 0.00,
  `round_off` decimal(5,2) NOT NULL DEFAULT 0.00,
  `total_amt` decimal(12,2) NOT NULL DEFAULT 0.00,
  `paid_amt` decimal(12,2) NOT NULL DEFAULT 0.00,
  `change_amt` decimal(10,2) NOT NULL DEFAULT 0.00,
  `payment_status` enum('paid','partial','credit','refunded') NOT NULL DEFAULT 'paid',
  `sale_type` enum('retail','wholesale','online') NOT NULL DEFAULT 'retail',
  `status` enum('completed','cancelled','returned') NOT NULL DEFAULT 'completed',
  `order_status` enum('pending','confirmed','processing','shipped','delivered','cancelled','returned') DEFAULT 'pending',
  `tracking_note` varchar(300) DEFAULT NULL,
  `apply_gst` tinyint(1) NOT NULL DEFAULT 1,
  `notes` text DEFAULT NULL,
  `is_offline` tinyint(1) NOT NULL DEFAULT 0,
  `synced_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tenant_invoice` (`tenant_id`,`invoice_no`),
  KEY `idx_tenant_branch` (`tenant_id`,`branch_id`),
  KEY `idx_tenant_date` (`tenant_id`,`sale_date`),
  KEY `idx_tenant_status` (`tenant_id`,`status`),
  KEY `idx_customer` (`customer_id`),
  KEY `idx_user` (`user_id`),
  KEY `fk_sale_branch` (`branch_id`),
  CONSTRAINT `fk_sale_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`),
  CONSTRAINT `fk_sale_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_sale_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`),
  CONSTRAINT `fk_sale_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table MM-Bharathicrackers_bms.sales: ~13 rows (approximately)
INSERT IGNORE INTO `sales` (`id`, `tenant_id`, `branch_id`, `customer_id`, `user_id`, `invoice_no`, `sale_date`, `subtotal`, `discount_amt`, `tax_amt`, `round_off`, `total_amt`, `paid_amt`, `change_amt`, `payment_status`, `sale_type`, `status`, `order_status`, `tracking_note`, `apply_gst`, `notes`, `is_offline`, `synced_at`, `created_at`) VALUES
	(1, 1, 1, 1, 4, 'INV-202606-0001', '2026-06-20 05:00:00', 1440.00, 0.00, 259.20, 0.80, 1700.00, 1700.00, 0.00, 'paid', 'retail', 'completed', 'delivered', NULL, 1, NULL, 0, NULL, '2026-06-27 10:38:24'),
	(2, 1, 1, 2, 4, 'INV-202606-0002', '2026-06-21 08:45:00', 760.00, 0.00, 136.80, 0.20, 897.00, 897.00, 0.00, 'paid', 'retail', 'completed', 'delivered', NULL, 1, NULL, 0, NULL, '2026-06-27 10:38:24'),
	(3, 1, 2, 3, 5, 'INV-202606-0003', '2026-06-22 05:30:00', 2050.00, 50.00, 360.00, 0.00, 2360.00, 1000.00, 0.00, 'partial', 'retail', 'completed', 'delivered', NULL, 1, NULL, 0, NULL, '2026-06-27 10:38:24'),
	(4, 1, 2, 4, 5, 'INV-202606-0004', '2026-06-23 11:15:00', 500.00, 0.00, 90.00, 0.00, 590.00, 590.00, 0.00, 'paid', 'retail', 'completed', 'delivered', NULL, 1, NULL, 0, NULL, '2026-06-27 10:38:24'),
	(5, 2, 3, 5, 9, 'INV-202606-0001', '2026-06-20 03:30:00', 1550.00, 0.00, 279.00, 0.00, 1829.00, 1829.00, 0.00, 'paid', 'retail', 'completed', 'delivered', NULL, 1, NULL, 0, NULL, '2026-06-27 10:38:24'),
	(6, 2, 3, 6, 9, 'INV-202606-0002', '2026-06-21 08:00:00', 650.00, 0.00, 117.00, 0.00, 767.00, 767.00, 0.00, 'paid', 'retail', 'completed', 'delivered', NULL, 1, NULL, 0, NULL, '2026-06-27 10:38:24'),
	(7, 2, 4, 7, 10, 'INV-202606-0003', '2026-06-22 04:30:00', 1080.00, 0.00, 194.40, 0.60, 1275.00, 1275.00, 0.00, 'paid', 'retail', 'completed', 'delivered', NULL, 1, NULL, 0, NULL, '2026-06-27 10:38:24'),
	(8, 2, 4, 8, 10, 'INV-202606-0004', '2026-06-23 09:30:00', 450.00, 0.00, 81.00, 0.00, 531.00, 0.00, 0.00, 'credit', 'retail', 'completed', 'delivered', NULL, 1, NULL, 0, NULL, '2026-06-27 10:38:24'),
	(9, 3, 5, 9, 14, 'INV-202606-0001', '2026-06-20 05:30:00', 2340.00, 0.00, 421.20, -0.20, 2761.00, 2761.00, 0.00, 'paid', 'retail', 'completed', 'delivered', NULL, 1, NULL, 0, NULL, '2026-06-27 10:38:24'),
	(10, 3, 5, 10, 14, 'INV-202606-0002', '2026-06-21 06:30:00', 750.00, 0.00, 135.00, 0.00, 885.00, 885.00, 0.00, 'paid', 'retail', 'completed', 'delivered', NULL, 1, NULL, 0, NULL, '2026-06-27 10:38:24'),
	(11, 3, 6, 11, 15, 'INV-202606-0003', '2026-06-22 04:00:00', 1530.00, 0.00, 275.40, 0.60, 1806.00, 906.00, 0.00, 'partial', 'retail', 'completed', 'delivered', NULL, 1, NULL, 0, NULL, '2026-06-27 10:38:24'),
	(12, 3, 6, 12, 15, 'INV-202606-0004', '2026-06-23 08:30:00', 380.00, 0.00, 68.40, -0.40, 448.00, 448.00, 0.00, 'paid', 'retail', 'completed', 'delivered', NULL, 1, NULL, 0, NULL, '2026-06-27 10:38:24'),
	(13, 1, 1, NULL, 1, 'INV-202606-0005', '2026-06-27 10:54:12', 610.00, 61.00, 0.00, 0.00, 549.00, 549.00, 0.00, 'paid', 'retail', 'completed', 'delivered', NULL, 1, NULL, 0, NULL, '2026-06-27 10:54:12'),
	(14, 1, 1, 14, 1, 'INV-202606-0006', '2026-06-29 07:07:15', 420.00, 150.00, 0.00, 0.00, 270.00, 270.00, 0.00, 'paid', 'retail', 'completed', 'delivered', NULL, 0, NULL, 0, NULL, '2026-06-29 07:07:15');

-- Dumping structure for table MM-Bharathicrackers_bms.sale_items
CREATE TABLE IF NOT EXISTS `sale_items` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` int(10) unsigned NOT NULL,
  `branch_id` int(10) unsigned NOT NULL,
  `sale_id` int(10) unsigned NOT NULL,
  `product_id` int(10) unsigned NOT NULL,
  `qty` decimal(10,3) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `discount_pct` decimal(5,2) NOT NULL DEFAULT 0.00,
  `discount_amt` decimal(10,2) NOT NULL DEFAULT 0.00,
  `tax_pct` decimal(5,2) NOT NULL DEFAULT 0.00,
  `tax_amt` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_amt` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sale` (`sale_id`),
  KEY `idx_product` (`product_id`),
  KEY `fk_si_branch` (`branch_id`),
  KEY `idx_tenant_branch` (`tenant_id`,`branch_id`),
  CONSTRAINT `fk_si_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`),
  CONSTRAINT `fk_si_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `fk_si_sale` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_si_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table MM-Bharathicrackers_bms.sale_items: ~30 rows (approximately)
INSERT IGNORE INTO `sale_items` (`id`, `tenant_id`, `branch_id`, `sale_id`, `product_id`, `qty`, `unit_price`, `discount_pct`, `discount_amt`, `tax_pct`, `tax_amt`, `total_amt`) VALUES
	(1, 1, 1, 1, 1, 5.000, 180.00, 0.00, 0.00, 12.00, 108.00, 1008.00),
	(2, 1, 1, 1, 2, 8.000, 80.00, 0.00, 0.00, 0.00, 0.00, 640.00),
	(3, 1, 1, 2, 2, 5.000, 80.00, 0.00, 0.00, 0.00, 0.00, 400.00),
	(4, 1, 1, 2, 3, 1.000, 550.00, 0.00, 0.00, 12.00, 66.00, 616.00),
	(5, 1, 2, 3, 4, 8.000, 100.00, 0.00, 0.00, 12.00, 96.00, 896.00),
	(6, 1, 2, 3, 5, 3.000, 350.00, 0.00, 0.00, 12.00, 126.00, 1176.00),
	(7, 1, 2, 3, 6, 5.000, 60.00, 0.00, 0.00, 0.00, 0.00, 300.00),
	(8, 1, 2, 4, 6, 5.000, 60.00, 0.00, 0.00, 0.00, 0.00, 300.00),
	(9, 1, 2, 4, 4, 2.000, 100.00, 0.00, 0.00, 12.00, 24.00, 224.00),
	(10, 2, 3, 5, 7, 5.000, 130.00, 0.00, 0.00, 12.00, 78.00, 728.00),
	(11, 2, 3, 5, 9, 5.000, 150.00, 0.00, 0.00, 0.00, 0.00, 750.00),
	(12, 2, 3, 6, 9, 4.000, 150.00, 0.00, 0.00, 0.00, 0.00, 600.00),
	(13, 2, 3, 6, 8, 1.000, 250.00, 0.00, 0.00, 12.00, 30.00, 280.00),
	(14, 2, 4, 7, 10, 6.000, 90.00, 0.00, 0.00, 12.00, 64.80, 604.80),
	(15, 2, 4, 7, 12, 4.000, 120.00, 0.00, 0.00, 0.00, 0.00, 480.00),
	(16, 2, 4, 8, 10, 5.000, 90.00, 0.00, 0.00, 12.00, 54.00, 504.00),
	(17, 3, 5, 9, 13, 6.000, 180.00, 0.00, 0.00, 12.00, 129.60, 1209.60),
	(18, 3, 5, 9, 15, 6.000, 100.00, 0.00, 0.00, 0.00, 0.00, 600.00),
	(19, 3, 5, 9, 14, 3.000, 320.00, 0.00, 0.00, 12.00, 115.20, 1075.20),
	(20, 3, 5, 10, 15, 5.000, 100.00, 0.00, 0.00, 0.00, 0.00, 500.00),
	(21, 3, 5, 10, 13, 1.000, 180.00, 0.00, 0.00, 12.00, 21.60, 201.60),
	(22, 3, 6, 11, 16, 6.000, 95.00, 0.00, 0.00, 12.00, 68.40, 638.40),
	(23, 3, 6, 11, 18, 8.000, 70.00, 0.00, 0.00, 0.00, 0.00, 560.00),
	(24, 3, 6, 11, 17, 1.000, 800.00, 0.00, 0.00, 12.00, 96.00, 896.00),
	(25, 3, 6, 12, 18, 4.000, 70.00, 0.00, 0.00, 0.00, 0.00, 280.00),
	(26, 3, 6, 12, 16, 1.000, 95.00, 0.00, 0.00, 12.00, 11.40, 106.40),
	(27, 1, 1, 13, 6, 1.000, 60.00, 0.00, 0.00, 0.00, 0.00, 60.00),
	(28, 1, 1, 13, 3, 1.000, 550.00, 0.00, 0.00, 0.00, 0.00, 550.00),
	(29, 1, 1, 14, 1, 2.000, 180.00, 0.00, 0.00, 0.00, 0.00, 360.00),
	(30, 1, 1, 14, 6, 1.000, 60.00, 0.00, 0.00, 0.00, 0.00, 60.00);

-- Dumping structure for table MM-Bharathicrackers_bms.sale_payments
CREATE TABLE IF NOT EXISTS `sale_payments` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` int(10) unsigned NOT NULL,
  `branch_id` int(10) unsigned NOT NULL,
  `sale_id` int(10) unsigned NOT NULL,
  `payment_method_id` int(10) unsigned DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `reference_no` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_sale` (`sale_id`),
  KEY `idx_method` (`payment_method_id`),
  KEY `fk_sp_branch` (`branch_id`),
  KEY `idx_tenant_branch` (`tenant_id`,`branch_id`),
  CONSTRAINT `fk_sp_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`),
  CONSTRAINT `fk_sp_method` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_sp_sale` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sp_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table MM-Bharathicrackers_bms.sale_payments: ~13 rows (approximately)
INSERT IGNORE INTO `sale_payments` (`id`, `tenant_id`, `branch_id`, `sale_id`, `payment_method_id`, `amount`, `reference_no`, `created_at`) VALUES
	(1, 1, 1, 1, 1, 1700.00, NULL, '2026-06-27 10:38:24'),
	(2, 1, 1, 2, 2, 897.00, 'UPI202606001', '2026-06-27 10:38:24'),
	(3, 1, 2, 3, 1, 1000.00, NULL, '2026-06-27 10:38:24'),
	(4, 1, 2, 4, 1, 590.00, NULL, '2026-06-27 10:38:24'),
	(5, 2, 3, 5, 1, 1829.00, NULL, '2026-06-27 10:38:24'),
	(6, 2, 3, 6, 2, 767.00, 'UPI202606002', '2026-06-27 10:38:24'),
	(7, 2, 4, 7, 1, 1275.00, NULL, '2026-06-27 10:38:24'),
	(8, 3, 5, 9, 2, 2761.00, 'UPI202606003', '2026-06-27 10:38:24'),
	(9, 3, 5, 10, 1, 885.00, NULL, '2026-06-27 10:38:24'),
	(10, 3, 6, 11, 1, 906.00, NULL, '2026-06-27 10:38:24'),
	(11, 3, 6, 12, 2, 448.00, 'UPI202606004', '2026-06-27 10:38:24'),
	(12, 1, 1, 13, 1, 549.00, NULL, '2026-06-27 10:54:12'),
	(13, 1, 1, 14, 1, 270.00, NULL, '2026-06-29 07:07:15');

-- Dumping structure for table MM-Bharathicrackers_bms.suppliers
CREATE TABLE IF NOT EXISTS `suppliers` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` int(10) unsigned NOT NULL,
  `branch_id` int(10) unsigned NOT NULL,
  `name` varchar(150) NOT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(80) DEFAULT NULL,
  `state` varchar(80) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `gstin` varchar(20) DEFAULT NULL,
  `pan` varchar(15) DEFAULT NULL,
  `opening_balance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `credit_limit` decimal(12,2) NOT NULL DEFAULT 0.00,
  `payment_terms` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tenant_branch` (`tenant_id`,`branch_id`),
  KEY `idx_active` (`is_active`),
  KEY `idx_phone` (`phone`),
  KEY `fk_sup_branch` (`branch_id`),
  CONSTRAINT `fk_sup_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`),
  CONSTRAINT `fk_sup_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table MM-Bharathicrackers_bms.suppliers: ~6 rows (approximately)
INSERT IGNORE INTO `suppliers` (`id`, `tenant_id`, `branch_id`, `name`, `contact_person`, `phone`, `email`, `address`, `city`, `state`, `pincode`, `gstin`, `pan`, `opening_balance`, `credit_limit`, `payment_terms`, `is_active`, `notes`, `created_at`, `updated_at`) VALUES
	(1, 1, 1, 'Standard Fireworks Pvt Ltd', 'Arun K', '9444001001', 'arun@standardfw.com', NULL, 'Sivakasi', NULL, NULL, '33AABCS1234A1Z5', NULL, 0.00, 500000.00, NULL, 1, NULL, '2026-06-27 10:38:24', '2026-06-27 10:38:24'),
	(2, 1, 2, 'Coronation Fireworks', 'Balan S', '9444001002', 'balan@coronation.com', NULL, 'Sivakasi', NULL, NULL, '33AABCC1234A1Z4', NULL, 0.00, 200000.00, NULL, 1, NULL, '2026-06-27 10:38:24', '2026-06-29 07:09:22'),
	(3, 2, 3, 'Aman Fireworks Industries', 'Chandra R', '9444002001', 'chandra@aman.com', NULL, 'Sivakasi', NULL, NULL, '33AABCA1234A1Z3', NULL, 0.00, 400000.00, NULL, 1, NULL, '2026-06-27 10:38:24', '2026-06-27 10:38:24'),
	(4, 2, 4, 'Sony Fireworks', 'Dinesh V', '9444002002', 'dinesh@sony.com', NULL, 'Sattur', NULL, NULL, '33AABCS5678A1Z2', NULL, 0.00, 200000.00, NULL, 1, NULL, '2026-06-27 10:38:24', '2026-06-27 10:38:24'),
	(5, 3, 5, 'Sri Kaliswari Fireworks', 'Elan M', '9444003001', 'elan@kaliswari.com', NULL, 'Sivakasi', NULL, NULL, '33AABCK1234A1Z1', NULL, 0.00, 350000.00, NULL, 1, NULL, '2026-06-27 10:38:24', '2026-06-27 10:38:24'),
	(6, 3, 6, 'Pandi Fireworks', 'Fathima N', '9444003002', 'fathima@pandi.com', NULL, 'Chennai', NULL, NULL, '33AABCP1234A1Z9', NULL, 0.00, 150000.00, NULL, 1, NULL, '2026-06-27 10:38:24', '2026-06-27 10:38:24');

-- Dumping structure for table MM-Bharathicrackers_bms.tax_rates
CREATE TABLE IF NOT EXISTS `tax_rates` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` int(10) unsigned NOT NULL,
  `name` varchar(80) NOT NULL,
  `rate` decimal(5,2) NOT NULL,
  `type` enum('GST','IGST','CESS') NOT NULL DEFAULT 'GST',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tenant` (`tenant_id`),
  KEY `idx_tenant_active` (`tenant_id`,`is_active`),
  CONSTRAINT `fk_tax_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table MM-Bharathicrackers_bms.tax_rates: ~15 rows (approximately)
INSERT IGNORE INTO `tax_rates` (`id`, `tenant_id`, `name`, `rate`, `type`, `is_active`, `created_at`) VALUES
	(1, 1, 'GST 0%', 0.00, 'GST', 1, '2026-06-27 10:27:27'),
	(2, 1, 'GST 5%', 5.00, 'GST', 1, '2026-06-27 10:27:27'),
	(3, 1, 'GST 12%', 12.00, 'GST', 1, '2026-06-27 10:27:27'),
	(4, 1, 'GST 18%', 18.00, 'GST', 1, '2026-06-27 10:27:27'),
	(5, 1, 'GST 28%', 28.00, 'GST', 1, '2026-06-27 10:27:27'),
	(6, 2, 'GST 0%', 0.00, 'GST', 1, '2026-06-28 16:40:56'),
	(7, 2, 'GST 5%', 5.00, 'GST', 1, '2026-06-28 16:40:56'),
	(8, 2, 'GST 12%', 12.00, 'GST', 1, '2026-06-28 16:40:56'),
	(9, 2, 'GST 18%', 18.00, 'GST', 1, '2026-06-28 16:40:56'),
	(10, 2, 'GST 28%', 28.00, 'GST', 1, '2026-06-28 16:40:56'),
	(11, 3, 'GST 0%', 0.00, 'GST', 1, '2026-06-28 16:40:56'),
	(12, 3, 'GST 5%', 5.00, 'GST', 1, '2026-06-28 16:40:56'),
	(13, 3, 'GST 12%', 12.00, 'GST', 1, '2026-06-28 16:40:56'),
	(14, 3, 'GST 18%', 18.00, 'GST', 1, '2026-06-28 16:40:56'),
	(15, 3, 'GST 28%', 28.00, 'GST', 1, '2026-06-28 16:40:56');

-- Dumping structure for table MM-Bharathicrackers_bms.tenants
CREATE TABLE IF NOT EXISTS `tenants` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `slug` varchar(60) NOT NULL,
  `plan` enum('trial','basic','pro') NOT NULL DEFAULT 'trial',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `trial_ends` date DEFAULT NULL,
  `settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`settings`)),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_slug` (`slug`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table MM-Bharathicrackers_bms.tenants: ~3 rows (approximately)
INSERT IGNORE INTO `tenants` (`id`, `name`, `slug`, `plan`, `is_active`, `trial_ends`, `settings`, `created_at`, `updated_at`) VALUES
	(1, 'Main Business', 'main-business', 'pro', 1, NULL, NULL, '2026-06-27 10:38:23', '2026-06-27 10:38:23'),
	(2, 'Sri Murugan Crackers', 'sri-murugan', 'basic', 1, NULL, NULL, '2026-06-27 10:38:23', '2026-06-27 10:38:23'),
	(3, 'Lakshmi Fireworks', 'lakshmi-fw', 'trial', 1, NULL, NULL, '2026-06-27 10:38:23', '2026-06-27 10:38:23');

-- Dumping structure for table MM-Bharathicrackers_bms.units
CREATE TABLE IF NOT EXISTS `units` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` int(10) unsigned NOT NULL,
  `name` varchar(50) NOT NULL,
  `short_form` varchar(10) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tenant_unit_name` (`tenant_id`,`name`),
  KEY `idx_tenant` (`tenant_id`),
  KEY `idx_tenant_active` (`tenant_id`,`is_active`),
  CONSTRAINT `fk_unit_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table MM-Bharathicrackers_bms.units: ~18 rows (approximately)
INSERT IGNORE INTO `units` (`id`, `tenant_id`, `name`, `short_form`, `is_active`) VALUES
	(1, 1, 'Piece', 'Pcs', 1),
	(2, 1, 'Box', 'Box', 1),
	(3, 1, 'Kilogram', 'Kg', 1),
	(4, 1, 'Gram', 'Gm', 1),
	(5, 1, 'Litre', 'Ltr', 1),
	(6, 1, 'Dozen', 'Doz', 1),
	(7, 2, 'Piece', 'Pcs', 1),
	(8, 2, 'Box', 'Box', 1),
	(9, 2, 'Kilogram', 'Kg', 1),
	(10, 2, 'Gram', 'Gm', 1),
	(11, 2, 'Litre', 'Ltr', 1),
	(12, 2, 'Dozen', 'Doz', 1),
	(13, 3, 'Piece', 'Pcs', 1),
	(14, 3, 'Box', 'Box', 1),
	(15, 3, 'Kilogram', 'Kg', 1),
	(16, 3, 'Gram', 'Gm', 1),
	(17, 3, 'Litre', 'Ltr', 1),
	(18, 3, 'Dozen', 'Doz', 1);

-- Dumping structure for table MM-Bharathicrackers_bms.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` int(10) unsigned NOT NULL,
  `branch_id` int(10) unsigned DEFAULT NULL,
  `role_id` int(10) unsigned NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `password_reset_token` varchar(100) DEFAULT NULL,
  `password_reset_expires` timestamp NULL DEFAULT NULL,
  `otp_code` varchar(10) DEFAULT NULL,
  `otp_expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tenant_email` (`tenant_id`,`email`),
  KEY `idx_tenant` (`tenant_id`),
  KEY `idx_branch` (`branch_id`),
  KEY `idx_role` (`role_id`),
  KEY `idx_active` (`is_active`),
  CONSTRAINT `fk_user_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_user_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `fk_user_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table MM-Bharathicrackers_bms.users: ~15 rows (approximately)
INSERT IGNORE INTO `users` (`id`, `tenant_id`, `branch_id`, `role_id`, `name`, `email`, `phone`, `password_hash`, `avatar_url`, `is_active`, `last_login_at`, `password_reset_token`, `password_reset_expires`, `otp_code`, `otp_expires_at`, `created_at`, `updated_at`) VALUES
	(1, 1, 1, 2, 'Ravi Kumar', 'admin@MM-Bharathicrackers.com', '9500001001', '$2a$12$K0m5XaUv45wFhqe582v/qevjgmcKMFkUebqETr9YB1/IrMU7nJSVy', NULL, 1, '2026-06-29 09:49:52', NULL, NULL, NULL, NULL, '2026-06-27 10:38:24', '2026-06-30 05:14:38'),
	(2, 1, 1, 3, 'Anand Raj', 'manager1@mainbusiness.com', '9500001002', '$2a$12$K0m5XaUv45wFhqe582v/qevjgmcKMFkUebqETr9YB1/IrMU7nJSVy', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2026-06-27 10:38:24', '2026-06-27 10:39:12'),
	(3, 1, 2, 3, 'Suresh M', 'manager2@mainbusiness.com', '9500001003', '$2a$12$K0m5XaUv45wFhqe582v/qevjgmcKMFkUebqETr9YB1/IrMU7nJSVy', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2026-06-27 10:38:24', '2026-06-27 10:39:15'),
	(4, 1, 1, 4, 'Priya S', 'cashier1@mainbusiness.com', '9500001004', '$2a$12$K0m5XaUv45wFhqe582v/qevjgmcKMFkUebqETr9YB1/IrMU7nJSVy', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2026-06-27 10:38:24', '2026-06-27 10:39:22'),
	(5, 1, 2, 4, 'Deepa R', 'cashier2@mainbusiness.com', '9500001005', '$2a$12$K0m5XaUv45wFhqe582v/qevjgmcKMFkUebqETr9YB1/IrMU7nJSVy', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2026-06-27 10:38:24', '2026-06-27 10:39:26'),
	(6, 2, 3, 2, 'Murugan S', 'admin@srimurugan.com', '9500002001', '$2a$12$K0m5XaUv45wFhqe582v/qevjgmcKMFkUebqETr9YB1/IrMU7nJSVy', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2026-06-27 10:38:24', '2026-06-27 10:39:28'),
	(7, 2, 3, 3, 'Selvam K', 'manager1@srimurugan.com', '9500002002', '$2a$12$K0m5XaUv45wFhqe582v/qevjgmcKMFkUebqETr9YB1/IrMU7nJSVy', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2026-06-27 10:38:24', '2026-06-27 10:39:29'),
	(8, 2, 4, 3, 'Karthik N', 'manager2@srimurugan.com', '9500002003', '$2a$12$K0m5XaUv45wFhqe582v/qevjgmcKMFkUebqETr9YB1/IrMU7nJSVy', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2026-06-27 10:38:24', '2026-06-27 10:39:31'),
	(9, 2, 3, 4, 'Lakshmi V', 'cashier1@srimurugan.com', '9500002004', '$2a$12$K0m5XaUv45wFhqe582v/qevjgmcKMFkUebqETr9YB1/IrMU7nJSVy', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2026-06-27 10:38:24', '2026-06-27 10:39:32'),
	(10, 2, 4, 4, 'Pavithra D', 'cashier2@srimurugan.com', '9500002005', '$2a$12$K0m5XaUv45wFhqe582v/qevjgmcKMFkUebqETr9YB1/IrMU7nJSVy', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2026-06-27 10:38:24', '2026-06-27 10:39:34'),
	(11, 3, 5, 2, 'Ganesan P', 'admin@lakshmifw.com', '9500003001', '$2a$12$K0m5XaUv45wFhqe582v/qevjgmcKMFkUebqETr9YB1/IrMU7nJSVy', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2026-06-27 10:38:24', '2026-06-27 10:39:36'),
	(12, 3, 5, 3, 'Vignesh T', 'manager1@lakshmifw.com', '9500003002', '$2a$12$K0m5XaUv45wFhqe582v/qevjgmcKMFkUebqETr9YB1/IrMU7nJSVy', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2026-06-27 10:38:24', '2026-06-27 10:39:38'),
	(13, 3, 6, 3, 'Ramesh B', 'manager2@lakshmifw.com', '9500003003', '$2a$12$K0m5XaUv45wFhqe582v/qevjgmcKMFkUebqETr9YB1/IrMU7nJSVy', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2026-06-27 10:38:24', '2026-06-27 10:39:41'),
	(14, 3, 5, 4, 'Kavitha M', 'cashier1@lakshmifw.com', '9500003004', '$2a$12$K0m5XaUv45wFhqe582v/qevjgmcKMFkUebqETr9YB1/IrMU7nJSVy', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2026-06-27 10:38:24', '2026-06-27 10:39:43'),
	(15, 3, 6, 4, 'Meena J', 'cashier2@lakshmifw.com', '9500003005', '$2a$12$K0m5XaUv45wFhqe582v/qevjgmcKMFkUebqETr9YB1/IrMU7nJSVy', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2026-06-27 10:38:24', '2026-06-27 10:39:45');

-- Dumping structure for table MM-Bharathicrackers_bms.user_sessions
CREATE TABLE IF NOT EXISTS `user_sessions` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `session_token` varchar(255) NOT NULL,
  `device_info` varchar(300) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `last_active` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_session` (`session_token`),
  KEY `idx_user` (`user_id`),
  CONSTRAINT `fk_us_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table MM-Bharathicrackers_bms.user_sessions: ~0 rows (approximately)

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
