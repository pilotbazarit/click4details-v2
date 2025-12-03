-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 17, 2025 at 06:15 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pbl`
--

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('laravel_cache_table_columns_master_data', 'a:9:{i:0;s:5:\"md_id\";i:1;s:8:\"md_title\";i:2;s:12:\"md_is_active\";i:3;s:10:\"md_type_id\";i:4;s:14:\"md_description\";i:5;s:13:\"md_created_at\";i:6;s:13:\"md_created_by\";i:7;s:13:\"md_updated_at\";i:8;s:13:\"md_updated_by\";}', 2064382135),
('laravel_cache_table_columns_master_data_types', 'a:8:{i:0;s:6:\"mdt_id\";i:1;s:9:\"mdt_title\";i:2;s:15:\"mdt_description\";i:3;s:14:\"mdt_created_at\";i:4;s:14:\"mdt_created_by\";i:5;s:14:\"mdt_updated_at\";i:6;s:14:\"mdt_updated_by\";i:7;s:8:\"mdt_code\";}', 2064382135),
('laravel_cache_table_columns_packages', 'a:10:{i:0;s:4:\"p_id\";i:1;s:10:\"p_brand_id\";i:2;s:10:\"p_model_id\";i:3;s:6:\"p_name\";i:4;s:13:\"p_description\";i:5;s:8:\"p_status\";i:6;s:12:\"p_created_by\";i:7;s:12:\"p_updated_by\";i:8;s:12:\"p_created_at\";i:9;s:12:\"p_updated_at\";}', 2064217565),
('laravel_cache_table_columns_shops', 'a:10:{i:0;s:4:\"s_id\";i:1;s:9:\"s_user_id\";i:2;s:7:\"s_title\";i:3;s:18:\"s_shop_category_id\";i:4;s:13:\"s_shop_banner\";i:5;s:13:\"s_description\";i:6;s:12:\"s_created_by\";i:7;s:12:\"s_updated_by\";i:8;s:12:\"s_created_at\";i:9;s:12:\"s_updated_at\";}', 2064382134),
('laravel_cache_table_columns_vehicle_models', 'a:9:{i:0;s:5:\"vm_id\";i:1;s:18:\"vm_vehicle_type_id\";i:2;s:11:\"vm_brand_id\";i:3;s:7:\"vm_name\";i:4;s:9:\"vm_status\";i:5;s:13:\"vm_created_by\";i:6;s:13:\"vm_updated_by\";i:7;s:13:\"vm_created_at\";i:8;s:13:\"vm_updated_at\";}', 2063868009),
('laravel_cache_table_columns_vehicles', 'a:34:{i:0;s:4:\"v_id\";i:1;s:9:\"v_user_id\";i:2;s:9:\"v_shop_id\";i:3;s:7:\"v_title\";i:4;s:6:\"v_slug\";i:5;s:6:\"v_code\";i:6;s:10:\"v_brand_id\";i:7;s:12:\"v_edition_id\";i:8;s:14:\"v_condition_id\";i:9;s:17:\"v_transmission_id\";i:10;s:9:\"v_fuel_id\";i:11;s:13:\"v_skeleton_id\";i:12;s:10:\"v_grade_id\";i:13;s:10:\"v_color_id\";i:14;s:17:\"v_availability_id\";i:15;s:10:\"v_capacity\";i:16;s:9:\"v_mileage\";i:17;s:14:\"v_registration\";i:18;s:13:\"v_manufacture\";i:19;s:8:\"v_engine\";i:20;s:9:\"v_chassis\";i:21;s:11:\"v_sketch_id\";i:22;s:10:\"v_priority\";i:23;s:8:\"v_staged\";i:24;s:8:\"v_status\";i:25;s:7:\"v_video\";i:26;s:15:\"v_is_saleBy_pbl\";i:27;s:10:\"v_model_id\";i:28;s:12:\"v_created_by\";i:29;s:12:\"v_updated_by\";i:30;s:12:\"v_created_at\";i:31;s:12:\"v_updated_at\";i:32;s:20:\"v_tax_token_exp_date\";i:33;s:18:\"v_fitness_exp_date\";}', 2063640896);

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `feature_specifications`
--

CREATE TABLE `feature_specifications` (
  `fs_id` bigint(20) UNSIGNED NOT NULL,
  `fs_feature_id` int(10) UNSIGNED NOT NULL,
  `fs_title` varchar(255) DEFAULT NULL,
  `fs_status` varchar(255) DEFAULT NULL,
  `fs_created_by` int(10) UNSIGNED DEFAULT NULL,
  `fs_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `fs_created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `fs_updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `feature_specifications`
--

INSERT INTO `feature_specifications` (`fs_id`, `fs_feature_id`, `fs_title`, `fs_status`, `fs_created_by`, `fs_updated_by`, `fs_created_at`, `fs_updated_at`) VALUES
(1, 1, 'Led 3', 'active', NULL, NULL, '2025-05-17 00:51:19', '2025-05-17 00:51:19'),
(2, 1, 'Led 4', 'active', NULL, NULL, '2025-05-17 00:54:57', '2025-05-17 00:54:57'),
(3, 14, 'Led', 'active', NULL, NULL, '2025-05-17 03:42:45', '2025-05-17 03:42:45'),
(4, 15, 'Led', 'active', NULL, NULL, '2025-05-17 03:42:53', '2025-05-17 03:42:53'),
(5, 16, 'Vew Led', 'active', NULL, NULL, '2025-06-10 02:32:09', '2025-06-10 02:32:09');

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `master_data`
--

CREATE TABLE `master_data` (
  `md_id` bigint(20) UNSIGNED NOT NULL,
  `md_title` varchar(255) NOT NULL,
  `md_is_active` tinyint(4) NOT NULL DEFAULT 1,
  `md_type_id` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `md_description` text DEFAULT NULL,
  `md_created_at` timestamp NULL DEFAULT current_timestamp(),
  `md_created_by` int(10) UNSIGNED DEFAULT NULL,
  `md_updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `md_updated_by` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `master_data`
--

INSERT INTO `master_data` (`md_id`, `md_title`, `md_is_active`, `md_type_id`, `md_description`, `md_created_at`, `md_created_by`, `md_updated_at`, `md_updated_by`) VALUES
(1, 'Salsabil', 1, 1, 'Swwr', '2025-05-10 21:23:31', NULL, '2025-05-10 21:23:31', NULL),
(2, 'Dhaka Car', 1, 1, 'Cee', '2025-05-10 21:23:45', NULL, '2025-05-10 21:23:45', NULL),
(3, 'White', 1, 2, 'White Color', '2025-05-14 08:24:06', NULL, '2025-05-14 08:24:06', NULL),
(4, 'Black', 1, 2, 'Black Color', '2025-05-14 08:24:29', NULL, '2025-05-14 08:24:29', NULL),
(5, 'Damage', 1, 3, 'Damage', '2025-05-14 08:32:03', NULL, '2025-05-14 08:32:03', NULL),
(6, 'Brand New', 1, 3, 'Brand New', '2025-05-14 08:32:17', NULL, '2025-05-14 08:32:17', NULL),
(7, 'New Edition', 1, 4, 'New', '2025-05-14 09:50:08', NULL, '2025-05-14 09:50:08', NULL),
(8, 'Race', 1, 5, 'Race', '2025-05-14 09:57:24', NULL, '2025-05-14 09:57:24', NULL),
(9, 'Transs', 1, 6, 'Transs', '2025-05-14 09:57:45', NULL, '2025-05-14 09:57:45', NULL),
(10, 'A', 1, 7, 'A Grade', '2025-05-14 10:07:54', NULL, '2025-05-14 10:07:54', NULL),
(11, 'B', 1, 7, 'B Grade', '2025-05-14 10:08:03', NULL, '2025-05-14 10:08:03', NULL),
(12, 'Octan', 1, 8, 'Octane', '2025-05-14 23:25:38', NULL, '2025-05-14 23:25:38', NULL),
(13, 'Stock', 1, 9, 'Stock', '2025-05-14 23:25:56', NULL, '2025-05-14 23:25:56', NULL),
(14, '7 Person', 1, 10, '7 Person', '2025-05-14 23:26:16', NULL, '2025-05-14 23:26:16', NULL),
(15, 'Light', 1, 11, 'Vehicle', '2025-05-17 03:02:07', NULL, '2025-05-17 03:02:07', NULL),
(16, 'Seat', 1, 11, 'Car Seat', '2025-05-17 03:02:38', NULL, '2025-05-17 03:02:38', NULL),
(17, 'cityBrand', 1, 1, 'sd', '2025-05-18 00:43:49', NULL, '2025-05-18 00:43:49', NULL),
(18, 'BMW', 1, 12, 'Car BMW', '2025-05-18 01:09:58', NULL, '2025-05-18 01:09:58', NULL),
(19, 'Petrol', 1, 13, 'Petrol', '2025-05-18 01:19:25', NULL, '2025-05-18 01:19:25', NULL),
(20, 'User', 1, 14, 'User', '2025-05-18 02:43:19', NULL, '2025-05-18 02:43:19', NULL),
(21, 'Member', 1, 14, 'Member', '2025-05-18 02:43:31', NULL, '2025-05-18 02:43:31', NULL),
(22, 'Partner', 1, 14, 'Partner', '2025-05-18 02:44:03', NULL, '2025-05-18 02:44:03', NULL),
(23, 'City', 1, 1, 'Dssss', '2025-06-04 02:05:58', NULL, '2025-06-04 02:05:58', NULL),
(24, 'BMW 2', 1, 12, 'Car BMW', '2025-05-18 01:09:58', NULL, '2025-05-18 01:09:58', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `master_data_types`
--

CREATE TABLE `master_data_types` (
  `mdt_id` bigint(20) UNSIGNED NOT NULL,
  `mdt_title` varchar(255) NOT NULL,
  `mdt_description` text DEFAULT NULL,
  `mdt_created_at` timestamp NULL DEFAULT NULL,
  `mdt_created_by` int(10) UNSIGNED DEFAULT NULL,
  `mdt_updated_at` timestamp NULL DEFAULT NULL,
  `mdt_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `mdt_code` varchar(25) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `master_data_types`
--

INSERT INTO `master_data_types` (`mdt_id`, `mdt_title`, `mdt_description`, `mdt_created_at`, `mdt_created_by`, `mdt_updated_at`, `mdt_updated_by`, `mdt_code`) VALUES
(1, 'Brand', 'Car Brand', '2025-05-10 21:23:06', NULL, '2025-05-10 21:23:06', NULL, 'brand_1746933786'),
(2, 'Color', 'Color', '2025-05-14 08:23:17', NULL, '2025-05-14 08:23:17', NULL, 'color_1747232597'),
(3, 'Condition', 'Condition', '2025-05-14 08:28:16', NULL, '2025-05-14 08:28:16', NULL, 'condition_1747232896'),
(4, 'Edition', 'Edition', '2025-05-14 09:49:23', NULL, '2025-05-14 09:49:23', NULL, 'edition_1747237763'),
(5, 'Skeleton', 'Skeleton', '2025-05-14 09:54:35', NULL, '2025-05-14 09:54:35', NULL, 'skeleton_1747238075'),
(6, 'Transmission', 'Transmission', '2025-05-14 09:55:53', NULL, '2025-05-14 09:55:53', NULL, 'transmission_1747238153'),
(7, 'Grade', 'Grade', '2025-05-14 10:07:31', NULL, '2025-05-14 10:07:31', NULL, 'grade_1747238851'),
(8, 'Fuel', 'Car Fuel', '2025-05-14 23:22:29', NULL, '2025-05-14 23:22:29', NULL, 'fuel_1747286549'),
(9, 'Availability', 'Availability', '2025-05-14 23:22:50', NULL, '2025-05-14 23:22:50', NULL, 'availability_1747286570'),
(10, 'Capacity', 'Capacity', '2025-05-14 23:23:14', NULL, '2025-05-14 23:23:14', NULL, 'capacity_1747286594'),
(11, 'Feature', 'Vehicle Feature', '2025-05-17 03:01:42', NULL, '2025-05-17 03:01:42', NULL, 'feature_1747472502'),
(12, 'Model', 'Car Model', '2025-05-18 01:08:50', NULL, '2025-05-18 01:08:50', NULL, 'model_1747552130'),
(13, 'Fuel', 'Car Fuel', '2025-05-18 01:18:52', NULL, '2025-05-18 01:18:52', NULL, 'fuel_1747552732'),
(14, 'User Mode', 'User Mode', '2025-05-18 02:42:55', NULL, '2025-05-18 02:42:55', NULL, 'user_mode_1747557775');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2025_04_19_123940_create_personal_access_tokens_table', 1),
(5, '2025_04_23_080426_create_master_data_types_table', 1),
(6, '2025_04_23_080446_create_master_data_table', 1),
(7, '2025_04_24_121424_create_vehicles_table', 2),
(8, '2025_04_25_100111_create_vehicle_prices_table', 2),
(9, '2025_04_25_120239_create_vehicle_metadata_table', 2),
(10, '2025_04_25_120255_create_vehicle_images_table', 2),
(13, '2025_04_28_010348_create_shops_table', 3),
(14, '2025_04_25_121230_create_feature_specifications_table', 4),
(15, '2025_04_25_121302_create_vehicle_specification_mappings_table', 4),
(16, '2025_05_28_111947_create_vehicle_models_table', 5),
(17, '2025_06_01_101938_create_packages_table', 6);

-- --------------------------------------------------------

--
-- Table structure for table `packages`
--

CREATE TABLE `packages` (
  `p_id` bigint(20) UNSIGNED NOT NULL,
  `p_brand_id` int(10) UNSIGNED DEFAULT NULL,
  `p_model_id` int(10) UNSIGNED NOT NULL,
  `p_name` varchar(255) NOT NULL,
  `p_description` varchar(255) DEFAULT NULL,
  `p_status` varchar(255) NOT NULL DEFAULT 'active',
  `p_created_by` int(10) UNSIGNED DEFAULT NULL,
  `p_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `p_created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `p_updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(11, 'App\\Models\\User', 2, 'auth_token', '5bf40efb272555424641a5a94dffe6105aa15bfda9187c70696835ab624f295d', '[\"*\"]', NULL, NULL, '2025-04-30 06:38:14', '2025-04-30 06:38:14'),
(28, 'App\\Models\\User', 1, 'auth_token', '7490facc88cfdc5a2267f6b1b592db98454f2ea86362148096d00245f82d3e10', '[\"*\"]', '2025-05-17 03:04:32', NULL, '2025-05-15 10:43:49', '2025-05-17 03:04:32'),
(29, 'App\\Models\\User', 1, 'auth_token', 'cee3dce35cae58a0b835711c8171465a8159fd3afa63efb77ffe58d8d9cb0113', '[\"*\"]', '2025-05-17 07:29:53', NULL, '2025-05-16 22:43:05', '2025-05-17 07:29:53'),
(30, 'App\\Models\\User', 4, 'auth_token', 'e22cd6c6a8d021bbf7b36139f7f1dde641086b9ae0c451c15f4efebb98889826', '[\"*\"]', NULL, NULL, '2025-05-18 00:17:26', '2025-05-18 00:17:26'),
(31, 'App\\Models\\User', 4, 'auth_token', 'fa7bc6bef5b1868f0986ee95ce1e2df399f28eda5b612e849b895ddd46ba342f', '[\"*\"]', '2025-05-18 03:37:27', NULL, '2025-05-18 00:17:41', '2025-05-18 03:37:27'),
(32, 'App\\Models\\User', 1, 'auth_token', '0ab5ced787013ee41ca496a5487987253fa68fb2e84f3bfee3bde1a0c957145c', '[\"*\"]', '2025-05-19 04:32:33', NULL, '2025-05-18 03:44:04', '2025-05-19 04:32:33'),
(33, 'App\\Models\\User', 1, 'auth_token', '162b93c644113777ae687fa3c8d2aaed510a83460bf71fe6bdbf3cfdce14f2a1', '[\"*\"]', '2025-05-22 02:38:55', NULL, '2025-05-18 04:51:22', '2025-05-22 02:38:55'),
(34, 'App\\Models\\User', 1, 'auth_token', 'ff2a0dd8b63e445ea111b296c78ce2c55b1f398e0ac29a8636a6c24ad21e42a6', '[\"*\"]', '2025-05-20 04:11:19', NULL, '2025-05-20 03:36:46', '2025-05-20 04:11:19'),
(35, 'App\\Models\\User', 16, 'auth_token', '9d7c7b0fb768f9bd554c1bff4ba953bc6acf06bcc1d279740b5111a32f9159ec', '[\"*\"]', NULL, NULL, '2025-05-20 05:44:39', '2025-05-20 05:44:39'),
(36, 'App\\Models\\User', 20, 'auth_token', '2c83719e379eafdfdc1d5b5e63f9d81e54e52e66714e00f43df3d52ee25b5ecd', '[\"*\"]', NULL, NULL, '2025-05-21 02:29:45', '2025-05-21 02:29:45'),
(37, 'App\\Models\\User', 1, 'auth_token', '545228b2a2d5eea3cee1ea6399e715b3dd0174d4160b1a7702c1b761c591d23a', '[\"*\"]', NULL, NULL, '2025-05-21 04:15:15', '2025-05-21 04:15:15'),
(38, 'App\\Models\\User', 1, 'auth_token', '3a6ba9249acf5c817920e3bf75345a2f03b3b4acf395cede9d1ee8a94070b1b2', '[\"*\"]', '2025-05-25 06:20:16', NULL, '2025-05-21 04:15:58', '2025-05-25 06:20:16'),
(39, 'App\\Models\\User', 1, 'auth_token', '2dd04ed878500c99ad480eefe1f4db8353a34a23590fb8a5f4d42464ae7837cf', '[\"*\"]', '2025-05-22 22:29:20', NULL, '2025-05-22 22:16:52', '2025-05-22 22:29:20'),
(40, 'App\\Models\\User', 4, 'auth_token', '5cb83807bf8e16ddfa48f17b2bad8405f663245331fcd168dc22a619a98658f5', '[\"*\"]', '2025-05-26 03:28:22', NULL, '2025-05-25 00:54:31', '2025-05-26 03:28:22'),
(41, 'App\\Models\\User', 4, 'auth_token', 'd671a0b27d48e321c9d93498927340bcd8d0925f3b9103c67ab7e6bc3847d8ec', '[\"*\"]', NULL, NULL, '2025-05-25 05:00:59', '2025-05-25 05:00:59'),
(42, 'App\\Models\\User', 4, 'auth_token', 'a047534bdb5e54529e889047bdf53f3ad09c6769d7704b6e6271eaae40d087ca', '[\"*\"]', NULL, NULL, '2025-05-25 05:59:24', '2025-05-25 05:59:24'),
(43, 'App\\Models\\User', 4, 'auth_token', 'c107d81a59e442b08b1c2be31cbf0ff878cc8d505f5d46e63aff16f5b19e2dc1', '[\"*\"]', NULL, NULL, '2025-05-25 06:03:58', '2025-05-25 06:03:58'),
(44, 'App\\Models\\User', 4, 'auth_token', 'f7706f95fc3098a94d7caa41b142b163c14c723cc019d24025291ded06ad09f5', '[\"*\"]', NULL, NULL, '2025-05-25 06:20:21', '2025-05-25 06:20:21'),
(45, 'App\\Models\\User', 4, 'auth_token', '7af2f7afcf0021a65e1ef20a70f2a5757815c2033e42181aa96e51098855e46b', '[\"*\"]', NULL, NULL, '2025-05-25 06:21:32', '2025-05-25 06:21:32'),
(46, 'App\\Models\\User', 4, 'auth_token', 'bb57eb61eb36384dc143762b3ff5deaa724d574ad213570adc12f6860b0d935e', '[\"*\"]', NULL, NULL, '2025-05-25 06:21:48', '2025-05-25 06:21:48'),
(47, 'App\\Models\\User', 4, 'auth_token', '5bf30964b50ff95cc000e969807481efb56cc564232b4497817529d095afdfa3', '[\"*\"]', NULL, NULL, '2025-05-25 06:22:10', '2025-05-25 06:22:10'),
(48, 'App\\Models\\User', 4, 'auth_token', '1b8531b1e51cf5d764c9338e6e997e87fc1938b09c0789b040b6126eba85bcb8', '[\"*\"]', NULL, NULL, '2025-05-25 06:24:13', '2025-05-25 06:24:13'),
(49, 'App\\Models\\User', 4, 'auth_token', '84b443f2ce7de9c6364ea4e70163a2bfb56bd755c6178561de2e0567dd5bcfac', '[\"*\"]', NULL, NULL, '2025-05-25 06:24:43', '2025-05-25 06:24:43'),
(50, 'App\\Models\\User', 4, 'auth_token', '46e5362c339be5e981129d3e85b180ee641c78b34abbc6f2ef21bc5fac9fc018', '[\"*\"]', '2025-05-25 07:31:08', NULL, '2025-05-25 06:25:10', '2025-05-25 07:31:08'),
(51, 'App\\Models\\User', 4, 'auth_token', '3cdfcc3f99083f6e078ac9c497b83ee9594a6e1bff8ccae37de4eb91800c642f', '[\"*\"]', '2025-05-26 03:00:01', NULL, '2025-05-26 02:56:26', '2025-05-26 03:00:01'),
(52, 'App\\Models\\User', 4, 'auth_token', '63c944662c943d307e48805055139944d8cac9845f8f04b964f76d3908a8f4ed', '[\"*\"]', '2025-05-26 03:04:08', NULL, '2025-05-26 03:03:51', '2025-05-26 03:04:08'),
(53, 'App\\Models\\User', 4, 'auth_token', 'aa071ef0dddeba1e5793b8179866adf1a4200de5739d12430e46b25a7b9ee483', '[\"*\"]', '2025-05-26 08:18:17', NULL, '2025-05-26 05:01:17', '2025-05-26 08:18:17'),
(54, 'App\\Models\\User', 4, 'auth_token', 'e1bfd248913efc378b9a7cbf4b4602407b67f04b320c4b9bb0a84fee5fb7024b', '[\"*\"]', '2025-05-27 03:33:13', NULL, '2025-05-26 11:30:02', '2025-05-27 03:33:13'),
(55, 'App\\Models\\User', 4, 'auth_token', '06a6eab679c05d22cbd0c5d09adba2efae35410bbdce5eefed0dd466e991381f', '[\"*\"]', '2025-05-28 05:50:30', NULL, '2025-05-28 05:49:55', '2025-05-28 05:50:30'),
(56, 'App\\Models\\User', 4, 'auth_token', 'a55e0ebafc62233196cddb3e0ece73e2ad108d6b8b28e49255b70324221f4437', '[\"*\"]', '2025-06-02 05:01:57', NULL, '2025-05-29 02:19:18', '2025-06-02 05:01:57'),
(57, 'App\\Models\\User', 4, 'auth_token', '5281b465a4581d90ad47e09c26b5fcd98b70ec19fabc260e3652251f8c5fdd1b', '[\"*\"]', NULL, NULL, '2025-06-01 04:40:45', '2025-06-01 04:40:45'),
(58, 'App\\Models\\User', 1, 'auth_token', 'f9315b1e4184406d40e1ce65f617adafc0691c38754c411972bd44c51ad7be28', '[\"*\"]', '2025-06-04 01:59:41', NULL, '2025-06-04 01:28:30', '2025-06-04 01:59:41'),
(59, 'App\\Models\\User', 1, 'auth_token', 'db81f532473921191a882d575efc63189c3d58a6d1fdb173ee9f05ef14996286', '[\"*\"]', '2025-06-04 02:21:47', NULL, '2025-06-04 01:45:29', '2025-06-04 02:21:47'),
(60, 'App\\Models\\User', 1, 'auth_token', 'f4f705b65a8920d7bcf3e5c7b4487bd5026706b22dcf0180d25d398452203f44', '[\"*\"]', '2025-06-04 03:02:08', NULL, '2025-06-04 02:00:26', '2025-06-04 03:02:08'),
(61, 'App\\Models\\User', 1, 'auth_token', '72d40623e11b3f3afcc41acca097a1b4d7bedf99709c606a77069f352a27ae8a', '[\"*\"]', '2025-06-04 03:34:23', NULL, '2025-06-04 03:10:42', '2025-06-04 03:34:23'),
(62, 'App\\Models\\User', 1, 'auth_token', '9607401284238746303b893817f2cf35ac74b30e102ae622a811590d75bcfde5', '[\"*\"]', '2025-06-10 06:03:07', NULL, '2025-06-06 03:37:24', '2025-06-10 06:03:07'),
(63, 'App\\Models\\User', 4, 'auth_token', 'b0a4cf0711dd4778467376886c60a7e3faede9b94640955ecbf04bbd76b1e4da', '[\"*\"]', NULL, NULL, '2025-06-15 00:31:27', '2025-06-15 00:31:27'),
(64, 'App\\Models\\User', 4, 'auth_token', '8ba46dfe7554e9a5d2a6c1b947264731d0a127fbabd7fa174e2e2b0fce9611b9', '[\"*\"]', NULL, NULL, '2025-06-15 01:30:41', '2025-06-15 01:30:41'),
(65, 'App\\Models\\User', 1, 'auth_token', '4f29271180766c6db051e4a04b6ac0a9cbb4016c134807427975a5ae23148a6b', '[\"*\"]', '2025-06-15 05:42:12', NULL, '2025-06-15 05:34:39', '2025-06-15 05:42:12'),
(66, 'App\\Models\\User', 4, 'auth_token', 'f16428675a42b617ebd90de32b95904978ff77ae2f433fcc0e1b0ef4a50babfb', '[\"*\"]', NULL, NULL, '2025-06-15 06:03:05', '2025-06-15 06:03:05'),
(67, 'App\\Models\\User', 4, 'auth_token', '22259cbe2aab82a64c361d064a5001bf6c0ccf5a577ef230cc6dad07128999d0', '[\"*\"]', NULL, NULL, '2025-06-15 06:05:45', '2025-06-15 06:05:45'),
(68, 'App\\Models\\User', 4, 'auth_token', 'd297d13cd333b78f562304e04d542e180e9c0c4049b2ef57d94db9e3ff83e8c3', '[\"*\"]', '2025-06-15 06:09:26', NULL, '2025-06-15 06:06:12', '2025-06-15 06:09:26'),
(69, 'App\\Models\\User', 4, 'auth_token', 'fe38b175c5d859b6872a1e837b5de24294e5d5361d39bb95b9beec2d60df1142', '[\"*\"]', NULL, NULL, '2025-06-15 06:14:49', '2025-06-15 06:14:49'),
(70, 'App\\Models\\User', 4, 'auth_token', '7c7c51a99f8cc68630b818bbdf28e41fc86ae2a5f20489a6d3f8418f0d610203', '[\"*\"]', NULL, NULL, '2025-06-15 06:15:31', '2025-06-15 06:15:31'),
(71, 'App\\Models\\User', 4, 'auth_token', 'b9de255ef7717ff9b38c7db71b3136ae71e22ce93b14f01de3f121c8969a46aa', '[\"*\"]', NULL, NULL, '2025-06-15 06:16:54', '2025-06-15 06:16:54'),
(72, 'App\\Models\\User', 4, 'auth_token', '1296cad7f96b8ffe4a065c1b1723654eee711365322df3acdbebc18669fa2e6f', '[\"*\"]', NULL, NULL, '2025-06-15 06:19:06', '2025-06-15 06:19:06'),
(73, 'App\\Models\\User', 4, 'auth_token', 'b2b5c840b1fc5224aa54d27c924f6328c0e8d84a3682d2d162d3a63eee222584', '[\"*\"]', NULL, NULL, '2025-06-15 06:24:44', '2025-06-15 06:24:44'),
(74, 'App\\Models\\User', 4, 'auth_token', '883c3a90be40e6de4a133dcbbb5ff98eb4d344fba761d8452d940a4933a9f5b6', '[\"*\"]', NULL, NULL, '2025-06-15 06:26:58', '2025-06-15 06:26:58'),
(75, 'App\\Models\\User', 4, 'auth_token', 'b7522df10ba4d58028652c0e33c1424ba6021e794b0fe6f172a420043258878a', '[\"*\"]', NULL, NULL, '2025-06-15 06:28:40', '2025-06-15 06:28:40'),
(76, 'App\\Models\\User', 4, 'auth_token', 'e6e54b77e78618bce6092fcf2a97ef29c8fe38264a04200debf1282d601fedd3', '[\"*\"]', '2025-06-15 06:33:23', NULL, '2025-06-15 06:30:41', '2025-06-15 06:33:23'),
(77, 'App\\Models\\User', 4, 'auth_token', '57d4b1f53a46d09496a69e02145df1e06c01d79dc80435770c11dccf60ec7d5a', '[\"*\"]', NULL, NULL, '2025-06-15 06:34:13', '2025-06-15 06:34:13'),
(78, 'App\\Models\\User', 4, 'auth_token', 'e08b288a0b562497b6a6ca7755ddf2bb2653b5acbf6f7d2e70d0eb7a3aa7fbed', '[\"*\"]', '2025-06-15 06:41:15', NULL, '2025-06-15 06:41:09', '2025-06-15 06:41:15'),
(79, 'App\\Models\\User', 4, 'auth_token', 'a7b9022c74ecbcd52382281ac5ea40bd747ff28a1434611f9c155c4c1695b515', '[\"*\"]', '2025-06-15 06:42:08', NULL, '2025-06-15 06:41:56', '2025-06-15 06:42:08'),
(80, 'App\\Models\\User', 4, 'auth_token', '43a869de2afe89adbcabd8863e9a58f0bc1da685c3434dd86ca3d79e9ca4f20e', '[\"*\"]', '2025-06-15 06:43:39', NULL, '2025-06-15 06:43:30', '2025-06-15 06:43:39'),
(81, 'App\\Models\\User', 4, 'auth_token', '2c9dfc8641fbb493a5bf0bd277ed547ae2028b8a6982c8b01f416dbee0e2cf7d', '[\"*\"]', NULL, NULL, '2025-06-15 06:57:56', '2025-06-15 06:57:56'),
(82, 'App\\Models\\User', 4, 'auth_token', 'ad0e3d8bb7f4854d80cd16c59e064bcbc5fdb2b1bcd92dbd89cd245bb0a49367', '[\"*\"]', '2025-06-15 07:17:16', NULL, '2025-06-15 07:06:20', '2025-06-15 07:17:16'),
(83, 'App\\Models\\User', 1, 'auth_token', 'a844cae03aabc655a922a8ca1ffbb37536d2058a2967a3b3ca4eaef1275f65f7', '[\"*\"]', '2025-06-15 07:25:20', NULL, '2025-06-15 07:06:24', '2025-06-15 07:25:20'),
(84, 'App\\Models\\User', 4, 'auth_token', 'bf201bcfd39f872bc1fe9637913031ba0bb343e54abde4bbbba44d1d6a873081', '[\"*\"]', NULL, NULL, '2025-06-15 07:18:20', '2025-06-15 07:18:20'),
(85, 'App\\Models\\User', 4, 'auth_token', '11aa2b7c5b84effe57dbc90133b79958f14da91d55dc40b115a675a0e61a4401', '[\"*\"]', NULL, NULL, '2025-06-15 07:18:41', '2025-06-15 07:18:41'),
(86, 'App\\Models\\User', 4, 'auth_token', 'e6aec2d9e3ece451bd95d0d1be67ae74abd40e818d4ccd3f975baa6546bcfdeb', '[\"*\"]', NULL, NULL, '2025-06-15 07:20:31', '2025-06-15 07:20:31'),
(87, 'App\\Models\\User', 4, 'auth_token', 'cacb2c181eb4b23f987fae61ae453043bebfb9c06a0099833862eee5b8b98bab', '[\"*\"]', '2025-06-15 07:29:05', NULL, '2025-06-15 07:20:58', '2025-06-15 07:29:05'),
(88, 'App\\Models\\User', 4, 'auth_token', 'a8db4bdb8cb43552dd4988df7b0a8dad3ae91d2e0e2389ff264205789091a4dc', '[\"*\"]', '2025-06-15 07:29:32', NULL, '2025-06-15 07:29:22', '2025-06-15 07:29:32'),
(89, 'App\\Models\\User', 4, 'auth_token', 'b0adfd184655d9965adf5077343a5649453f3ba236bd4683519b6cd29ac80425', '[\"*\"]', '2025-06-15 07:33:15', NULL, '2025-06-15 07:30:51', '2025-06-15 07:33:15'),
(90, 'App\\Models\\User', 4, 'auth_token', 'b708f21217c019f90bc9fcbecef1872598a7af6df4c63ef99add6acd60188c64', '[\"*\"]', '2025-06-15 07:36:15', NULL, '2025-06-15 07:33:30', '2025-06-15 07:36:15'),
(91, 'App\\Models\\User', 4, 'auth_token', '6c56e559cb0e7d8bb50d6712c0913c57fc05213c01279b284cf977b643efdfa0', '[\"*\"]', '2025-06-15 07:40:49', NULL, '2025-06-15 07:37:49', '2025-06-15 07:40:49'),
(92, 'App\\Models\\User', 4, 'auth_token', '80863dde952f4c63cdb12b8d7d554298b35a72e7baafd0bd3fe9642ca1d7de0a', '[\"*\"]', '2025-06-15 07:48:10', NULL, '2025-06-15 07:41:39', '2025-06-15 07:48:10');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('80pNwO6zNQHy3GVgmDwGa3EQ4ke8beSNVRZKSYiC', NULL, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiaWxxS0RiMkVMZFpGcUJvaWtVMUZMWFlIT05NVHQ3RGFUNjF2RlpTYyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1745710585),
('9PC9Yrj6qwXTCsHuwZDFN6TYq1DmUmRkumbto448', NULL, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoibWF5NHB0UVFGQ2ZOd29mR2JoTHFBY3Y2ZXZTNlRyYjgyQ0Z1SENOViI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1747454595),
('h3xkMLI7nASF1nXXha6vVX7LMIw5feNkhJp1RbN7', NULL, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoic1JnaXZtT3RaaG9Bb3VTUWdlc1lTUm9JbGd3SXNRNHVZVUJUNHF2aCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1746330201),
('j3WeNQny2HwGsEFHUKC07eXsZofrlhlstdYRN3dL', NULL, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiR25FOGxzQkdqcEVaa3FjR1ozODM2RmJRWEZnWmgyQkljUWFSV1lmQSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1745557570),
('JOxsGOzmLJROb2rRq7EUU4lbTaR2NtcBFc6iMDf3', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiUzR6RTlEam1KbGIyOGJzcEJYdG81ZUJ1emsxcTdWc2lPNHZtZ2dqbiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1749992513),
('KplU0cS4vHoBFvtBiYn9QvwqEp1MBkDfNWcjhx2t', NULL, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoib1Rha1B1cmNQUzM4ZzlzQjg4RUxldGZ3VTdiYW96QTlncjB5ZUxMViI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1745831431),
('KvfdNwRX3NeBuBrZ27ZABnAK1rE8q2sVAFlLetGG', NULL, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoidUhTdm8zaENjeFFVZE1hbENUUXFxc0VFSXVOc3NyMHJoNVNSVmxNTiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1745907732),
('NRosqQZL6VN2kCGDQxfmaULZu5WP0nsTZVMXSNA6', NULL, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoidmVQQThKRDJZa2JST0R6eVMzcXRpRHZ3aVg2dTBLVDdLOXVoUExKbyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1746291897),
('RNFLsLHkut7JVvDKsUhB99j2y9bdW8hvTcuDukQE', NULL, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiT0JUQ2k4cUU4TFlWQUIzZ0REN3NsUGhmZ2pVVFl2dERKMDdzNFpmNSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1747305594),
('txi3KZ5Wq7vFLF9buWEsWbXU19NuXACJGGxffzEn', NULL, '127.0.0.1', 'PostmanRuntime/7.43.3', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoicDZzZVNpZ0gzcURKMjhzbmxjZ1NsNE1zanJLVkJvRzN6cGpCNnZYUSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1747465359),
('xoGjObGd3pCwCUgMk0wvKTjrAA0a0QVFkxmFPHKw', NULL, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiQXNiQzFlbmx6ZjZERDY3RFpGWVU5MXhKZWJUOFk5eDVSbWRNbVNyaSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1746014551),
('ZwNTMXq6TEFLZpUPcjputxhI1dtyi0LFbfeFxWO9', NULL, '127.0.0.1', 'PostmanRuntime/7.43.3', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoic3ZSWWdsNmJQNHVSQm45R3hLcjdua0pHbG9MR3czVHpHaVQ1UHdJNSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1745475589);

-- --------------------------------------------------------

--
-- Table structure for table `shops`
--

CREATE TABLE `shops` (
  `s_id` bigint(20) UNSIGNED NOT NULL,
  `s_user_id` int(10) UNSIGNED NOT NULL,
  `s_title` varchar(255) NOT NULL,
  `s_shop_category_id` int(10) UNSIGNED NOT NULL,
  `s_shop_banner` varchar(255) DEFAULT NULL,
  `s_description` longtext DEFAULT NULL,
  `s_created_by` int(10) UNSIGNED DEFAULT NULL,
  `s_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `s_created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `s_updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `shops`
--

INSERT INTO `shops` (`s_id`, `s_user_id`, `s_title`, `s_shop_category_id`, `s_shop_banner`, `s_description`, `s_created_by`, `s_updated_by`, `s_created_at`, `s_updated_at`) VALUES
(1, 1, 'shop1', 1, 'uploads/00d4fddf-ae2b-4f8a-9c2f-91ed0914eac5.png', 'admin1@gmail.com', NULL, NULL, '2025-04-28 00:37:06', '2025-04-28 00:37:06'),
(2, 1, 'PBL', 1, '/private/var/folders/wy/53_j8c6d6_bb10d0vg054vxw0000gn/T/phpigjkja604gvleKBZVgb', 'admin1@gmail.com', NULL, NULL, '2025-04-29 03:37:13', '2025-04-29 03:37:13'),
(3, 1, 'PBL', 1, '/private/var/folders/wy/53_j8c6d6_bb10d0vg054vxw0000gn/T/phpmr5ah2nmr3og4lS9HpK', 'admin1@gmail.com', NULL, NULL, '2025-04-29 03:37:52', '2025-04-29 03:37:52'),
(4, 4, 'PBL', 11, '/private/var/folders/wy/53_j8c6d6_bb10d0vg054vxw0000gn/T/phpsr27ck02dl124tYL9QB', 'admin1@gmail.com', NULL, NULL, '2025-04-29 03:38:14', '2025-05-25 12:22:07'),
(5, 1, 'PBL', 11, '/private/var/folders/wy/53_j8c6d6_bb10d0vg054vxw0000gn/T/php99gelaniutaf0RKRrpK', 'admin1@gmail.com', NULL, NULL, '2025-04-29 03:40:21', '2025-04-29 03:40:21'),
(6, 1, 'PBL', 11, 'uploads/Shop/cbe1e447-d902-4954-9e2b-cdb320d792e1.png', 'admin1@gmail.com', NULL, NULL, '2025-04-29 04:03:12', '2025-04-29 04:03:12'),
(7, 1, 'Shop 12', 1, '/private/var/folders/wy/53_j8c6d6_bb10d0vg054vxw0000gn/T/phphsqvqns5qv356EZ2f50', 'wewe', NULL, NULL, '2025-05-14 22:14:57', '2025-05-14 22:14:57'),
(8, 15, 'sadd', 1, NULL, NULL, NULL, NULL, '2025-05-20 05:43:55', '2025-05-20 05:43:55'),
(9, 16, 'sadd', 1, NULL, NULL, NULL, NULL, '2025-05-20 05:44:39', '2025-05-20 05:44:39'),
(10, 20, 'sadd', 1, NULL, NULL, NULL, NULL, '2025-05-21 02:29:45', '2025-05-21 02:29:45');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `user_mode` varchar(25) DEFAULT 'user',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `user_mode`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'saddss', 'admin@gmail.com', '1111', 'user', NULL, '$2y$12$F5dLqFnR1mgcfOOjYcX8vuxGsbSoDMA6Cu.loQp8ZP3glFXSRyWXG', NULL, '2025-04-23 23:47:32', '2025-06-06 04:20:46'),
(2, 'sadd', 'admin111123@gmail.com', '01920797869', 'user', NULL, '$2y$12$u/LRIwe/gdetRpIkVOd8heUOgqOD5jEgRrfxQAmz1AKVvhF904KhG', NULL, '2025-04-30 06:38:14', '2025-04-30 06:38:14'),
(3, 'Abu Sabir', 'abusabir00@gmail.com', '+8801920797864', 'user', NULL, '$2y$12$XeA6Zzf0dT1x2jXAGh.8jO1BNFhDuv37kXmek1l6/gTymSwpH6Gu6', NULL, '2025-05-04 03:20:22', '2025-05-04 03:20:22'),
(4, 'Aminul Islam', 'aminul@gmail.com', '01768062664', 'user', NULL, '$2y$10$LzBlq8KmEIut.I9B5rh/SOtrGiuyP0h9L01oyilcKKd8rFj6UZOIC', NULL, '2025-05-18 00:17:26', '2025-05-18 00:17:26'),
(15, 'sadd', 'admin1111231@gmail.com', '01920797864', 'user', NULL, '$2y$12$50N/9Gwg2K8KR8p8NhqrAucwPt4nEsQ5qYqo6oFfLtY7WcDix1IaG', NULL, '2025-05-20 05:43:55', '2025-05-20 05:43:55'),
(16, 'sadd', 'admin11112131@gmail.com', '019207978614', 'user', NULL, '$2y$12$c0L9kiKRqB8u5DP8O8nLMeC52x/OD9KAKaEWvC58DCjsZbVSWgVKS', NULL, '2025-05-20 05:44:39', '2025-05-20 05:44:39'),
(20, 'sadd', 'admin111121131@gmail.com', '019207978617', 'user', NULL, '$2y$12$VSjEUTQRQ11wpk/kRzd7qu33CWhWIaWpaKBHzVo77F2nue/8qwpq2', NULL, '2025-05-21 02:29:45', '2025-05-21 02:29:45');

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

CREATE TABLE `vehicles` (
  `v_id` bigint(20) UNSIGNED NOT NULL,
  `v_user_id` int(10) UNSIGNED NOT NULL,
  `v_shop_id` int(10) UNSIGNED NOT NULL,
  `v_title` varchar(255) NOT NULL,
  `v_slug` varchar(255) NOT NULL,
  `v_code` varchar(255) DEFAULT NULL,
  `v_brand_id` int(10) UNSIGNED NOT NULL,
  `v_edition_id` int(10) UNSIGNED DEFAULT NULL,
  `v_condition_id` int(10) UNSIGNED DEFAULT NULL,
  `v_transmission_id` int(10) UNSIGNED DEFAULT NULL,
  `v_fuel_id` int(10) UNSIGNED DEFAULT NULL,
  `v_skeleton_id` int(10) UNSIGNED DEFAULT NULL,
  `v_grade_id` int(10) UNSIGNED DEFAULT NULL,
  `v_int_grade_id` int(10) DEFAULT NULL,
  `v_ext_grade_id` int(10) DEFAULT NULL,
  `v_color_id` int(10) UNSIGNED DEFAULT NULL,
  `v_availability_id` int(10) UNSIGNED DEFAULT NULL,
  `v_capacity` decimal(10,2) NOT NULL COMMENT 'Engine capacity in cc',
  `v_mileage` int(11) DEFAULT NULL COMMENT 'Odometer reading in km/miles',
  `v_registration` year(4) DEFAULT NULL COMMENT 'Vehicle registration date',
  `v_manufacture` year(4) DEFAULT NULL COMMENT 'Year of manufacture',
  `v_engine` varchar(255) DEFAULT NULL,
  `v_chassis` varchar(255) NOT NULL,
  `v_sketch_id` int(10) UNSIGNED DEFAULT NULL,
  `v_priority` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `v_staged` enum('draft','review','approved','published') NOT NULL DEFAULT 'draft',
  `v_status` enum('active','inactive','damaged','sold') NOT NULL DEFAULT 'active',
  `v_video` varchar(255) DEFAULT NULL,
  `v_is_saleBy_pbl` tinyint(10) DEFAULT 0,
  `v_model_id` int(11) DEFAULT NULL,
  `v_created_by` int(10) UNSIGNED DEFAULT NULL,
  `v_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `v_created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `v_updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `v_tax_token_exp_date` timestamp NULL DEFAULT NULL,
  `v_fitness_exp_date` timestamp NULL DEFAULT NULL,
  `v_urgent_sale` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `v_seat_id` int(1) DEFAULT NULL,
  `v_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vehicles`
--

INSERT INTO `vehicles` (`v_id`, `v_user_id`, `v_shop_id`, `v_title`, `v_slug`, `v_code`, `v_brand_id`, `v_edition_id`, `v_condition_id`, `v_transmission_id`, `v_fuel_id`, `v_skeleton_id`, `v_grade_id`, `v_int_grade_id`, `v_ext_grade_id`, `v_color_id`, `v_availability_id`, `v_capacity`, `v_mileage`, `v_registration`, `v_manufacture`, `v_engine`, `v_chassis`, `v_sketch_id`, `v_priority`, `v_staged`, `v_status`, `v_video`, `v_is_saleBy_pbl`, `v_model_id`, `v_created_by`, `v_updated_by`, `v_created_at`, `v_updated_at`, `v_tax_token_exp_date`, `v_fitness_exp_date`, `v_urgent_sale`, `v_seat_id`, `v_description`) VALUES
(2, 1, 2, 'X Corolla 1111', 'gg', 'PBL-002', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, NULL, 1200.00, 3434, '2021', '2020', 'E8877', 'SE3333', NULL, 0, 'draft', 'active', NULL, 1, 1, NULL, NULL, '2025-05-18 03:50:35', '2025-06-06 03:49:12', '2024-10-09 18:00:00', '2024-10-09 18:00:00', NULL, NULL, NULL),
(12, 1, 2, 'Mitsubishu Car11', 'mitsubishu-car11-G78S9', 'PBL-002', 1, 1, 1, 1, 1, 1, 1, NULL, NULL, 1, NULL, 1200.00, 3434, '2021', '2020', 'E8877', 'SE3333', NULL, 0, 'draft', 'active', NULL, 0, 1, NULL, NULL, '2025-05-20 04:10:44', '2025-05-20 04:10:44', '2024-10-09 18:00:00', '2024-10-09 18:00:00', NULL, NULL, NULL),
(13, 1, 2, 'Mitsubishu Car111', 'mitsubishu-car111-ICZUG', 'PBL-002', 1, 1, 1, 1, 1, 1, 1, NULL, NULL, 1, NULL, 1200.00, 3434, '2021', '2020', 'E8877', 'SE3333', NULL, 0, 'draft', 'active', NULL, 0, 1, NULL, NULL, '2025-05-20 04:11:19', '2025-05-20 04:11:19', '2024-10-09 18:00:00', '2024-10-09 18:00:00', NULL, NULL, NULL),
(16, 1, 2, 'X Corolla 120', 'x-corolla-120-XJ5RG', 'PBL-002', 1, 1, 1, 1, 1, 1, 1, NULL, NULL, 1, NULL, 1200.00, 3434, '2021', '2020', 'E8877', 'SE3333', NULL, 0, 'draft', 'active', NULL, 0, 1, NULL, NULL, '2025-05-26 11:33:50', '2025-05-26 11:33:50', '2024-10-09 18:00:00', '2024-10-09 18:00:00', NULL, NULL, NULL),
(17, 1, 2, 'X Corolla 12011', 'x-corolla-12011-ZLDHF', 'PBL-002', 1, 1, 1, 1, 1, 1, 1, NULL, NULL, 1, NULL, 1200.00, 3434, '2021', '2020', 'E8877', 'SE3333', NULL, 0, 'draft', 'active', NULL, 0, 1, NULL, NULL, '2025-05-27 03:32:01', '2025-05-27 03:32:01', '2024-10-09 18:00:00', '2024-10-09 18:00:00', NULL, NULL, NULL),
(18, 1, 2, 'X Corolla 12011', 'x-corolla-12011-ZHS2T', 'PBL-002', 1, 1, 1, 1, 1, 1, 1, NULL, NULL, 1, NULL, 1200.00, 3434, '2021', '2020', 'E8877', 'SE3333', NULL, 0, 'draft', 'active', NULL, 0, 1, NULL, NULL, '2025-05-27 03:33:13', '2025-05-27 03:33:13', '2024-10-09 18:00:00', '2024-10-09 18:00:00', NULL, NULL, NULL),
(19, 1, 2, 'X Corolla Text 11', 'x-corolla-text-11-U9YRZ', 'PBL-002', 1, 1, 1, 1, 1, 1, 1, NULL, NULL, 1, NULL, 1200.00, 3434, '2021', '2020', 'E8877', 'SE3333', NULL, 0, 'draft', 'active', NULL, 0, 1, NULL, NULL, '2025-05-29 05:28:24', '2025-05-29 05:28:24', '2024-10-09 18:00:00', '2024-10-09 18:00:00', NULL, NULL, NULL),
(20, 1, 2, 'X Corolla Text 11', 'x-corolla-text-11-L36RS', 'PBL-002', 1, 1, 1, 1, 1, 1, 1, 11, 12, 1, NULL, 1200.00, 3434, '2021', '2020', 'E8877', 'SE3333', NULL, 0, 'draft', 'active', NULL, 0, 1, NULL, NULL, '2025-05-29 05:32:05', '2025-05-29 05:32:05', '2024-10-09 18:00:00', '2024-10-09 18:00:00', NULL, NULL, NULL),
(21, 1, 2, 'X Corolla Text 110', 'x-corolla-text-110-L6AIQ', 'PBL-002', 1, 1, 1, 1, 1, 1, 1, 11, 12, 1, NULL, 1200.00, 3434, '2021', '2020', 'E8877', 'SE3333', NULL, 0, 'draft', 'active', NULL, 0, 1, NULL, NULL, '2025-06-02 05:01:57', '2025-06-02 05:01:57', '2024-10-09 18:00:00', '2024-10-09 18:00:00', '1', 1, 'আমাদের সার্ভিস সমূহঃ - ৫০%-৬০% দ্রুত ব্যাংক লোনের সুবিধা। - ব্যবহৃত গাড়ি এনালাইসিস সেন্টারে চেক করার সুবিধা। - রিকন্ডিশন গাড়ি অকশন সিট ভেরিফাই ও ট্রান্সলেট এর সুবিধা।'),
(22, 1, 2, 'Noah Voxi', 'noah-voxi-93KYZ', 'PBL-002', 1, 1, 1, 1, 1, 1, 1, 11, 12, 1, NULL, 1200.00, 3434, '2021', '2020', 'E8877', 'SE3333', NULL, 0, 'draft', 'active', NULL, 0, 1, NULL, NULL, '2025-06-04 01:47:10', '2025-06-04 01:47:10', '2024-10-09 18:00:00', '2024-10-09 18:00:00', '1', 1, 'আমাদের সার্ভিস সমূহঃ - ৫০%-৬০% দ্রুত ব্যাংক লোনের সুবিধা। - ব্যবহৃত গাড়ি এনালাইসিস সেন্টারে চেক করার সুবিধা। - রিকন্ডিশন গাড়ি অকশন সিট ভেরিফাই ও ট্রান্সলেট এর সুবিধা।'),
(23, 1, 1, 'Noah Voxi', 'noah-voxi-LZDP8', 'SHO-001', 1, 1, 1, 1, 1, 1, 1, 11, 12, 1, NULL, 1200.00, 3434, '2021', '2020', 'E8877', 'SE3333', NULL, 0, 'draft', 'active', NULL, 0, 1, NULL, NULL, '2025-06-09 04:12:17', '2025-06-09 04:12:17', '2024-10-09 18:00:00', '2024-10-09 18:00:00', '1', 1, 'আমাদের সার্ভিস সমূহঃ - ৫০%-৬০% দ্রুত ব্যাংক লোনের সুবিধা। - ব্যবহৃত গাড়ি এনালাইসিস সেন্টারে চেক করার সুবিধা। - রিকন্ডিশন গাড়ি অকশন সিট ভেরিফাই ও ট্রান্সলেট এর সুবিধা।');

-- --------------------------------------------------------

--
-- Table structure for table `vehicle_images`
--

CREATE TABLE `vehicle_images` (
  `vi_id` bigint(20) UNSIGNED NOT NULL,
  `vi_vehicle_id` int(10) UNSIGNED NOT NULL,
  `vi_image_path` text DEFAULT NULL,
  `vi_is_primary` tinyint(1) DEFAULT 0,
  `vi_created_by` int(10) UNSIGNED DEFAULT NULL,
  `vi_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `vi_created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `vi_updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vehicle_images`
--

INSERT INTO `vehicle_images` (`vi_id`, `vi_vehicle_id`, `vi_image_path`, `vi_is_primary`, `vi_created_by`, `vi_updated_by`, `vi_created_at`, `vi_updated_at`) VALUES
(1, 2, 'vehicle/7fa96a1f-1818-4857-9bbc-736c668e1d2d.png', 0, NULL, NULL, '2025-05-18 03:50:35', '2025-05-18 03:50:35'),
(2, 12, 'vehicle/aba09a1a-684c-467b-9a76-0cd4da8cd58f.png', 1, NULL, NULL, '2025-05-20 04:10:44', '2025-05-20 04:10:44'),
(3, 12, 'vehicle/9519efe3-fe06-44d5-835c-5489ec405926.png', 1, NULL, NULL, '2025-05-20 04:10:44', '2025-05-20 04:10:44'),
(4, 13, 'vehicle/0a46546b-9b3c-4b33-9e53-a3a831d4c354.png', 1, NULL, NULL, '2025-05-20 04:11:19', '2025-05-20 04:11:19'),
(5, 13, 'vehicle/9864afa1-5f56-4f33-883b-83a5b8a892e8.png', 1, NULL, NULL, '2025-05-20 04:11:19', '2025-05-20 04:11:19'),
(6, 16, '{\"public_id\":\"product\\/vehicle\\/16\\/ig1dqpjmrphbcglpgcho\",\"url\":\"https:\\/\\/res.cloudinary.com\\/dmonl1o2w\\/image\\/upload\\/v1748280785\\/product\\/vehicle\\/16\\/ig1dqpjmrphbcglpgcho.png\",\"secure_url\":\"https:\\/\\/res.cloudinary.com\\/dmonl1o2w\\/image\\/upload\\/v1748280785\\/product\\/vehicle\\/16\\/ig1dqpjmrphbcglpgcho.png\",\"format\":\"png\",\"api_key\":\"874936341646749\"}', 1, NULL, NULL, '2025-05-26 11:33:53', '2025-05-26 11:33:53'),
(7, 16, '[{\"public_id\":\"product\\/vehicle\\/16\\/ldav3pkhgmmers0bympg\",\"url\":\"https:\\/\\/res.cloudinary.com\\/dmonl1o2w\\/image\\/upload\\/v1748280788\\/product\\/vehicle\\/16\\/ldav3pkhgmmers0bympg.png\",\"secure_url\":\"https:\\/\\/res.cloudinary.com\\/dmonl1o2w\\/image\\/upload\\/v1748280788\\/product\\/vehicle\\/16\\/ldav3pkhgmmers0bympg.png\",\"format\":\"png\",\"api_key\":\"874936341646749\"},{\"public_id\":\"product\\/vehicle\\/16\\/c5jafb102opiblbeenlf\",\"url\":\"https:\\/\\/res.cloudinary.com\\/dmonl1o2w\\/image\\/upload\\/v1748280791\\/product\\/vehicle\\/16\\/c5jafb102opiblbeenlf.png\",\"secure_url\":\"https:\\/\\/res.cloudinary.com\\/dmonl1o2w\\/image\\/upload\\/v1748280791\\/product\\/vehicle\\/16\\/c5jafb102opiblbeenlf.png\",\"format\":\"png\",\"api_key\":\"874936341646749\"}]', 0, NULL, NULL, '2025-05-26 11:33:59', '2025-05-26 11:33:59'),
(8, 17, '{\"public_id\":\"product\\/vehicle\\/17\\/jslsf6mrmgw8r3mjatxh\",\"url\":\"https:\\/\\/res.cloudinary.com\\/dmonl1o2w\\/image\\/upload\\/v1748338275\\/product\\/vehicle\\/17\\/jslsf6mrmgw8r3mjatxh.png\",\"secure_url\":\"https:\\/\\/res.cloudinary.com\\/dmonl1o2w\\/image\\/upload\\/v1748338275\\/product\\/vehicle\\/17\\/jslsf6mrmgw8r3mjatxh.png\",\"format\":\"png\",\"api_key\":\"874936341646749\"}', 1, NULL, NULL, '2025-05-27 03:32:04', '2025-05-27 03:32:04'),
(9, 17, '[{\"public_id\":\"product\\/vehicle\\/17\\/wvi0lzco1axrujvzzgcm\",\"url\":\"https:\\/\\/res.cloudinary.com\\/dmonl1o2w\\/image\\/upload\\/v1748338278\\/product\\/vehicle\\/17\\/wvi0lzco1axrujvzzgcm.png\",\"secure_url\":\"https:\\/\\/res.cloudinary.com\\/dmonl1o2w\\/image\\/upload\\/v1748338278\\/product\\/vehicle\\/17\\/wvi0lzco1axrujvzzgcm.png\",\"format\":\"png\",\"api_key\":\"874936341646749\"},{\"public_id\":\"product\\/vehicle\\/17\\/cypjpzwuql5dzbgwqjdn\",\"url\":\"https:\\/\\/res.cloudinary.com\\/dmonl1o2w\\/image\\/upload\\/v1748338281\\/product\\/vehicle\\/17\\/cypjpzwuql5dzbgwqjdn.png\",\"secure_url\":\"https:\\/\\/res.cloudinary.com\\/dmonl1o2w\\/image\\/upload\\/v1748338281\\/product\\/vehicle\\/17\\/cypjpzwuql5dzbgwqjdn.png\",\"format\":\"png\",\"api_key\":\"874936341646749\"}]', 0, NULL, NULL, '2025-05-27 03:32:10', '2025-05-27 03:32:10'),
(10, 18, '{\"public_id\":\"product\\/vehicle\\/18\\/qtuf0jqawtoof1kmukvp\",\"url\":\"https:\\/\\/res.cloudinary.com\\/dmonl1o2w\\/image\\/upload\\/v1748338347\\/product\\/vehicle\\/18\\/qtuf0jqawtoof1kmukvp.png\",\"secure_url\":\"https:\\/\\/res.cloudinary.com\\/dmonl1o2w\\/image\\/upload\\/v1748338347\\/product\\/vehicle\\/18\\/qtuf0jqawtoof1kmukvp.png\",\"format\":\"png\",\"api_key\":\"874936341646749\"}', 1, NULL, NULL, '2025-05-27 03:33:16', '2025-05-27 03:33:16'),
(11, 18, '[{\"public_id\":\"product\\/vehicle\\/18\\/p1q4fivhztgb1rnmtneg\",\"url\":\"https:\\/\\/res.cloudinary.com\\/dmonl1o2w\\/image\\/upload\\/v1748338350\\/product\\/vehicle\\/18\\/p1q4fivhztgb1rnmtneg.png\",\"secure_url\":\"https:\\/\\/res.cloudinary.com\\/dmonl1o2w\\/image\\/upload\\/v1748338350\\/product\\/vehicle\\/18\\/p1q4fivhztgb1rnmtneg.png\",\"format\":\"png\",\"api_key\":\"874936341646749\"},{\"public_id\":\"product\\/vehicle\\/18\\/ldenuns27xxkhixmlhwa\",\"url\":\"https:\\/\\/res.cloudinary.com\\/dmonl1o2w\\/image\\/upload\\/v1748338353\\/product\\/vehicle\\/18\\/ldenuns27xxkhixmlhwa.png\",\"secure_url\":\"https:\\/\\/res.cloudinary.com\\/dmonl1o2w\\/image\\/upload\\/v1748338353\\/product\\/vehicle\\/18\\/ldenuns27xxkhixmlhwa.png\",\"format\":\"png\",\"api_key\":\"874936341646749\"}]', 0, NULL, NULL, '2025-05-27 03:33:22', '2025-05-27 03:33:22'),
(12, 19, '{\"public_id\":\"product\\/vehicle\\/19\\/rhnjvuc9ybn7fzzijfse\",\"url\":\"https:\\/\\/res.cloudinary.com\\/dmonl1o2w\\/image\\/upload\\/v1748518056\\/product\\/vehicle\\/19\\/rhnjvuc9ybn7fzzijfse.jpg\",\"secure_url\":\"https:\\/\\/res.cloudinary.com\\/dmonl1o2w\\/image\\/upload\\/v1748518056\\/product\\/vehicle\\/19\\/rhnjvuc9ybn7fzzijfse.jpg\",\"format\":\"jpg\",\"api_key\":\"874936341646749\"}', 1, NULL, NULL, '2025-05-29 05:28:31', '2025-05-29 05:28:31'),
(13, 19, '[{\"public_id\":\"product\\/vehicle\\/19\\/ehe8ku5ev36yyfavf4f2\",\"url\":\"https:\\/\\/res.cloudinary.com\\/dmonl1o2w\\/image\\/upload\\/v1748518060\\/product\\/vehicle\\/19\\/ehe8ku5ev36yyfavf4f2.jpg\",\"secure_url\":\"https:\\/\\/res.cloudinary.com\\/dmonl1o2w\\/image\\/upload\\/v1748518060\\/product\\/vehicle\\/19\\/ehe8ku5ev36yyfavf4f2.jpg\",\"format\":\"jpg\",\"api_key\":\"874936341646749\"}]', 0, NULL, NULL, '2025-05-29 05:28:34', '2025-05-29 05:28:34'),
(14, 20, '{\"public_id\":\"product\\/vehicle\\/20\\/nvb0b9vrb8s3fyrzziph\",\"url\":\"https:\\/\\/res.cloudinary.com\\/dmonl1o2w\\/image\\/upload\\/v1748518275\\/product\\/vehicle\\/20\\/nvb0b9vrb8s3fyrzziph.jpg\",\"secure_url\":\"https:\\/\\/res.cloudinary.com\\/dmonl1o2w\\/image\\/upload\\/v1748518275\\/product\\/vehicle\\/20\\/nvb0b9vrb8s3fyrzziph.jpg\",\"format\":\"jpg\",\"api_key\":\"874936341646749\"}', 1, NULL, NULL, '2025-05-29 05:32:10', '2025-05-29 05:32:10'),
(15, 20, '[{\"public_id\":\"product\\/vehicle\\/20\\/bplokistvt6i4dxdfuei\",\"url\":\"https:\\/\\/res.cloudinary.com\\/dmonl1o2w\\/image\\/upload\\/v1748518279\\/product\\/vehicle\\/20\\/bplokistvt6i4dxdfuei.jpg\",\"secure_url\":\"https:\\/\\/res.cloudinary.com\\/dmonl1o2w\\/image\\/upload\\/v1748518279\\/product\\/vehicle\\/20\\/bplokistvt6i4dxdfuei.jpg\",\"format\":\"jpg\",\"api_key\":\"874936341646749\"}]', 0, NULL, NULL, '2025-05-29 05:32:14', '2025-05-29 05:32:14'),
(16, 21, '{\"public_id\":\"product\\/vehicle\\/21\\/avjzvv5xkehgseqswlnu\",\"url\":\"https:\\/\\/res.cloudinary.com\\/dmonl1o2w\\/image\\/upload\\/v1748862057\\/product\\/vehicle\\/21\\/avjzvv5xkehgseqswlnu.jpg\",\"secure_url\":\"https:\\/\\/res.cloudinary.com\\/dmonl1o2w\\/image\\/upload\\/v1748862057\\/product\\/vehicle\\/21\\/avjzvv5xkehgseqswlnu.jpg\",\"format\":\"jpg\",\"api_key\":\"874936341646749\"}', 1, NULL, NULL, '2025-06-02 05:02:02', '2025-06-02 05:02:02'),
(17, 21, '[{\"public_id\":\"product\\/vehicle\\/21\\/bwfxh9buzwltpmncn9x4\",\"url\":\"https:\\/\\/res.cloudinary.com\\/dmonl1o2w\\/image\\/upload\\/v1748862060\\/product\\/vehicle\\/21\\/bwfxh9buzwltpmncn9x4.jpg\",\"secure_url\":\"https:\\/\\/res.cloudinary.com\\/dmonl1o2w\\/image\\/upload\\/v1748862060\\/product\\/vehicle\\/21\\/bwfxh9buzwltpmncn9x4.jpg\",\"format\":\"jpg\",\"api_key\":\"874936341646749\"}]', 0, NULL, NULL, '2025-06-02 05:02:05', '2025-06-02 05:02:05'),
(18, 22, '{\"public_id\":\"product\\/vehicle\\/22\\/m99vdvvhgltaykvsqbvb\",\"url\":\"https:\\/\\/res.cloudinary.com\\/dmonl1o2w\\/image\\/upload\\/v1749023163\\/product\\/vehicle\\/22\\/m99vdvvhgltaykvsqbvb.jpg\",\"secure_url\":\"https:\\/\\/res.cloudinary.com\\/dmonl1o2w\\/image\\/upload\\/v1749023163\\/product\\/vehicle\\/22\\/m99vdvvhgltaykvsqbvb.jpg\",\"format\":\"jpg\",\"api_key\":\"874936341646749\"}', 1, NULL, NULL, '2025-06-04 01:47:13', '2025-06-04 01:47:13'),
(19, 22, '[{\"public_id\":\"product\\/vehicle\\/22\\/nweujyldz6qveps7inxn\",\"url\":\"https:\\/\\/res.cloudinary.com\\/dmonl1o2w\\/image\\/upload\\/v1749023166\\/product\\/vehicle\\/22\\/nweujyldz6qveps7inxn.jpg\",\"secure_url\":\"https:\\/\\/res.cloudinary.com\\/dmonl1o2w\\/image\\/upload\\/v1749023166\\/product\\/vehicle\\/22\\/nweujyldz6qveps7inxn.jpg\",\"format\":\"jpg\",\"api_key\":\"874936341646749\"}]', 0, NULL, NULL, '2025-06-04 01:47:17', '2025-06-04 01:47:17'),
(20, 23, '{\"public_id\":\"product\\/vehicle\\/22\\/m99vdvvhgltaykvsqbvb\",\"url\":\"https:\\/\\/res.cloudinary.com\\/dmonl1o2w\\/image\\/upload\\/v1749023163\\/product\\/vehicle\\/22\\/m99vdvvhgltaykvsqbvb.jpg\",\"secure_url\":\"https:\\/\\/res.cloudinary.com\\/dmonl1o2w\\/image\\/upload\\/v1749023163\\/product\\/vehicle\\/22\\/m99vdvvhgltaykvsqbvb.jpg\",\"format\":\"jpg\",\"api_key\":\"874936341646749\"}', 1, NULL, NULL, '2025-06-09 04:12:17', '2025-06-09 04:12:17'),
(21, 23, '[{\"public_id\":\"product\\/vehicle\\/22\\/nweujyldz6qveps7inxn\",\"url\":\"https:\\/\\/res.cloudinary.com\\/dmonl1o2w\\/image\\/upload\\/v1749023166\\/product\\/vehicle\\/22\\/nweujyldz6qveps7inxn.jpg\",\"secure_url\":\"https:\\/\\/res.cloudinary.com\\/dmonl1o2w\\/image\\/upload\\/v1749023166\\/product\\/vehicle\\/22\\/nweujyldz6qveps7inxn.jpg\",\"format\":\"jpg\",\"api_key\":\"874936341646749\"}]', 0, NULL, NULL, '2025-06-09 04:12:17', '2025-06-09 04:12:17');

-- --------------------------------------------------------

--
-- Table structure for table `vehicle_metadata`
--

CREATE TABLE `vehicle_metadata` (
  `vm_id` bigint(20) UNSIGNED NOT NULL,
  `vm_vehicle_id` int(10) UNSIGNED NOT NULL,
  `vm_description` text DEFAULT NULL,
  `vm_keywords` text DEFAULT NULL,
  `vm_created_by` int(10) UNSIGNED DEFAULT NULL,
  `vm_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `vm_created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `vm_updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vehicle_metadata`
--

INSERT INTO `vehicle_metadata` (`vm_id`, `vm_vehicle_id`, `vm_description`, `vm_keywords`, `vm_created_by`, `vm_updated_by`, `vm_created_at`, `vm_updated_at`) VALUES
(1, 16, NULL, '[]', NULL, NULL, '2025-05-26 11:33:50', '2025-05-26 11:33:50'),
(2, 17, NULL, '[]', NULL, NULL, '2025-05-27 03:32:01', '2025-05-27 03:32:01'),
(3, 18, NULL, '[]', NULL, NULL, '2025-05-27 03:33:13', '2025-05-27 03:33:13'),
(4, 19, NULL, '[]', NULL, NULL, '2025-05-29 05:28:24', '2025-05-29 05:28:24'),
(5, 20, NULL, '[]', NULL, NULL, '2025-05-29 05:32:05', '2025-05-29 05:32:05'),
(6, 21, NULL, '[]', NULL, NULL, '2025-06-02 05:01:57', '2025-06-02 05:01:57'),
(7, 22, NULL, '[]', NULL, NULL, '2025-06-04 01:47:10', '2025-06-04 01:47:10'),
(8, 23, NULL, '[]', NULL, NULL, '2025-06-09 04:12:17', '2025-06-09 04:12:17');

-- --------------------------------------------------------

--
-- Table structure for table `vehicle_models`
--

CREATE TABLE `vehicle_models` (
  `vm_id` bigint(20) UNSIGNED NOT NULL,
  `vm_vehicle_type_id` int(10) UNSIGNED DEFAULT NULL,
  `vm_brand_id` int(10) UNSIGNED DEFAULT NULL,
  `vm_name` varchar(255) NOT NULL,
  `vm_status` varchar(255) NOT NULL DEFAULT 'active',
  `vm_created_by` int(10) UNSIGNED DEFAULT NULL,
  `vm_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `vm_created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `vm_updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vehicle_models`
--

INSERT INTO `vehicle_models` (`vm_id`, `vm_vehicle_type_id`, `vm_brand_id`, `vm_name`, `vm_status`, `vm_created_by`, `vm_updated_by`, `vm_created_at`, `vm_updated_at`) VALUES
(2, 1, 1, 'FL', 'active', NULL, NULL, '2025-05-29 03:05:32', '2025-05-29 03:05:32'),
(3, NULL, 1, 'FDS', 'active', NULL, NULL, '2025-06-04 02:06:50', '2025-06-04 02:06:50');

-- --------------------------------------------------------

--
-- Table structure for table `vehicle_prices`
--

CREATE TABLE `vehicle_prices` (
  `vp_id` bigint(20) UNSIGNED NOT NULL,
  `vp_vehicle_id` int(10) UNSIGNED NOT NULL,
  `vp_currency` varchar(10) NOT NULL DEFAULT 'USD',
  `vp_user_purchase_price` decimal(15,2) DEFAULT NULL,
  `vp_user_asking_price` decimal(15,2) DEFAULT NULL,
  `vp_user_fixed_price` decimal(15,2) DEFAULT NULL,
  `vp_show_price` varchar(25) DEFAULT 'fixed',
  `vp_user_price_status` varchar(255) DEFAULT NULL,
  `vp_pbl_additional_amount` decimal(15,2) DEFAULT NULL,
  `vp_pbl_price_status` enum('negotiable','fixed','variable') DEFAULT NULL,
  `vp_user_hs_asking_price` decimal(15,2) DEFAULT NULL,
  `vp_user_hs_fixed_price` decimal(15,2) DEFAULT NULL,
  `vp_user_hs_price_status` varchar(255) DEFAULT NULL,
  `vp_pbl_hs_additional_amount` decimal(15,2) DEFAULT NULL,
  `vp_user_hs_min_qty` int(10) UNSIGNED DEFAULT NULL,
  `vp_pbl_hs_price_status` enum('negotiable','fixed','variable') DEFAULT NULL,
  `vp_created_by` int(10) UNSIGNED DEFAULT NULL,
  `vp_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `vp_created_at` timestamp NULL DEFAULT NULL,
  `vp_updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vehicle_prices`
--

INSERT INTO `vehicle_prices` (`vp_id`, `vp_vehicle_id`, `vp_currency`, `vp_user_purchase_price`, `vp_user_asking_price`, `vp_user_fixed_price`, `vp_show_price`, `vp_user_price_status`, `vp_pbl_additional_amount`, `vp_pbl_price_status`, `vp_user_hs_asking_price`, `vp_user_hs_fixed_price`, `vp_user_hs_price_status`, `vp_pbl_hs_additional_amount`, `vp_user_hs_min_qty`, `vp_pbl_hs_price_status`, `vp_created_by`, `vp_updated_by`, `vp_created_at`, `vp_updated_at`) VALUES
(2, 2, 'USD', 150000000.00, 30000000.00, 890000.00, 'fixed', 'negotiable', 12.00, 'negotiable', 111111.00, 11111.00, 'negotiable', 34.00, NULL, 'negotiable', NULL, NULL, '2025-05-18 03:50:35', '2025-06-06 03:50:02'),
(9, 12, 'USD', 11111.00, 111111.00, 12.00, NULL, 'negotiable', 12.00, 'negotiable', 111111.00, 11111.00, 'negotiable', 34.00, NULL, 'negotiable', NULL, NULL, '2025-05-20 04:10:44', '2025-05-20 04:10:44'),
(10, 13, 'USD', 11111.00, 111111.00, 12.00, NULL, 'negotiable', 12.00, 'negotiable', 111111.00, 11111.00, 'negotiable', 34.00, NULL, 'negotiable', NULL, NULL, '2025-05-20 04:11:19', '2025-05-20 04:11:19'),
(13, 16, 'USD', 11111.00, 111111.00, 344.00, NULL, 'negotiable', 12.00, 'negotiable', 111111.00, 11111.00, 'negotiable', 34.00, NULL, 'negotiable', NULL, NULL, '2025-05-26 11:33:50', '2025-05-26 11:33:50'),
(14, 17, 'USD', 11111.00, 111111.00, 344.00, NULL, 'negotiable', 12.00, 'negotiable', 111111.00, 11111.00, 'negotiable', 34.00, NULL, 'negotiable', NULL, NULL, '2025-05-27 03:32:01', '2025-05-27 03:32:01'),
(15, 18, 'USD', 11111.00, 111111.00, 344.00, NULL, 'negotiable', 12.00, 'negotiable', 111111.00, 11111.00, 'negotiable', 34.00, NULL, 'negotiable', NULL, NULL, '2025-05-27 03:33:13', '2025-05-27 03:33:13'),
(16, 19, 'USD', 11111.00, 111111.00, 344.00, 'fixed', 'negotiable', 12.00, 'negotiable', 111111.00, 11111.00, 'negotiable', 34.00, NULL, 'negotiable', NULL, NULL, '2025-05-29 05:28:24', '2025-05-29 05:28:24'),
(17, 20, 'USD', 11111.00, 111111.00, 344.00, 'fixed', 'negotiable', 12.00, 'negotiable', 111111.00, 11111.00, 'negotiable', 34.00, NULL, 'negotiable', NULL, NULL, '2025-05-29 05:32:05', '2025-05-29 05:32:05'),
(18, 21, 'USD', 11111.00, 111111.00, 344.00, 'fixed', 'negotiable', 12.00, 'negotiable', 111111.00, 11111.00, 'negotiable', 34.00, NULL, 'negotiable', NULL, NULL, '2025-06-02 05:01:57', '2025-06-02 05:01:57'),
(19, 22, 'USD', 11111.00, 111111.00, 344.00, 'fixed', 'negotiable', 12.00, 'negotiable', 111111.00, 11111.00, 'negotiable', 34.00, NULL, 'negotiable', NULL, NULL, '2025-06-04 01:47:10', '2025-06-04 01:47:10'),
(20, 23, 'USD', 11111.00, 111111.00, 344.00, 'fixed', 'negotiable', 12.00, 'negotiable', 111111.00, 11111.00, 'negotiable', 34.00, NULL, 'negotiable', NULL, NULL, '2025-06-09 04:12:17', '2025-06-09 04:12:17');

-- --------------------------------------------------------

--
-- Table structure for table `ve_specification_mappings`
--

CREATE TABLE `ve_specification_mappings` (
  `vsm_id` bigint(20) UNSIGNED NOT NULL,
  `vsm_model_id` int(11) UNSIGNED DEFAULT NULL,
  `vsm_feature_id` int(11) UNSIGNED DEFAULT NULL,
  `vsm_ve_id` int(10) UNSIGNED NOT NULL,
  `vsm_fs_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ve_specification_mappings`
--

INSERT INTO `ve_specification_mappings` (`vsm_id`, `vsm_model_id`, `vsm_feature_id`, `vsm_ve_id`, `vsm_fs_id`) VALUES
(1, NULL, NULL, 1, 1),
(2, NULL, NULL, 1, 11),
(4, NULL, NULL, 1, 13);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `feature_specifications`
--
ALTER TABLE `feature_specifications`
  ADD PRIMARY KEY (`fs_id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `master_data`
--
ALTER TABLE `master_data`
  ADD PRIMARY KEY (`md_id`),
  ADD KEY `master_data_md_type_id_index` (`md_type_id`),
  ADD KEY `master_data_md_title_index` (`md_title`);

--
-- Indexes for table `master_data_types`
--
ALTER TABLE `master_data_types`
  ADD PRIMARY KEY (`mdt_id`),
  ADD KEY `master_data_types_mdt_created_by_index` (`mdt_created_by`),
  ADD KEY `master_data_types_mdt_updated_by_index` (`mdt_updated_by`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `packages`
--
ALTER TABLE `packages`
  ADD PRIMARY KEY (`p_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `shops`
--
ALTER TABLE `shops`
  ADD PRIMARY KEY (`s_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_phone_unique` (`phone`);

--
-- Indexes for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`v_id`),
  ADD UNIQUE KEY `vehicles_v_slug_unique` (`v_slug`);

--
-- Indexes for table `vehicle_images`
--
ALTER TABLE `vehicle_images`
  ADD PRIMARY KEY (`vi_id`);

--
-- Indexes for table `vehicle_metadata`
--
ALTER TABLE `vehicle_metadata`
  ADD PRIMARY KEY (`vm_id`);

--
-- Indexes for table `vehicle_models`
--
ALTER TABLE `vehicle_models`
  ADD PRIMARY KEY (`vm_id`);

--
-- Indexes for table `vehicle_prices`
--
ALTER TABLE `vehicle_prices`
  ADD PRIMARY KEY (`vp_id`);

--
-- Indexes for table `ve_specification_mappings`
--
ALTER TABLE `ve_specification_mappings`
  ADD PRIMARY KEY (`vsm_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `feature_specifications`
--
ALTER TABLE `feature_specifications`
  MODIFY `fs_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `master_data`
--
ALTER TABLE `master_data`
  MODIFY `md_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `master_data_types`
--
ALTER TABLE `master_data_types`
  MODIFY `mdt_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `packages`
--
ALTER TABLE `packages`
  MODIFY `p_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=93;

--
-- AUTO_INCREMENT for table `shops`
--
ALTER TABLE `shops`
  MODIFY `s_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `vehicles`
--
ALTER TABLE `vehicles`
  MODIFY `v_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `vehicle_images`
--
ALTER TABLE `vehicle_images`
  MODIFY `vi_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `vehicle_metadata`
--
ALTER TABLE `vehicle_metadata`
  MODIFY `vm_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `vehicle_models`
--
ALTER TABLE `vehicle_models`
  MODIFY `vm_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `vehicle_prices`
--
ALTER TABLE `vehicle_prices`
  MODIFY `vp_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `ve_specification_mappings`
--
ALTER TABLE `ve_specification_mappings`
  MODIFY `vsm_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;


https://bd-node.clouds-network.net:2083/cpsess0211652001/frontend/jupiter/lveversion/nodejs-selector.html.tt#/applications/public_html%2Freactapp