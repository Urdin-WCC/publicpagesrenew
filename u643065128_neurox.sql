-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 20-04-2025 a las 10:49:23
-- Versión del servidor: 10.11.10-MariaDB
-- Versión de PHP: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `u643065128_neurox`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Account`
--

CREATE TABLE `Account` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `provider` varchar(191) NOT NULL,
  `providerAccountId` varchar(191) NOT NULL,
  `refresh_token` text DEFAULT NULL,
  `access_token` text DEFAULT NULL,
  `expires_at` int(11) DEFAULT NULL,
  `token_type` varchar(191) DEFAULT NULL,
  `scope` varchar(191) DEFAULT NULL,
  `id_token` text DEFAULT NULL,
  `session_state` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `AdminAction`
--

CREATE TABLE `AdminAction` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `action` varchar(191) NOT NULL,
  `details` text DEFAULT NULL,
  `module` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `AdminLog`
--

CREATE TABLE `AdminLog` (
  `id` int(11) NOT NULL,
  `userId` varchar(255) DEFAULT NULL,
  `userEmail` varchar(255) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `timestamp` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Category`
--

CREATE TABLE `Category` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `Category`
--

INSERT INTO `Category` (`id`, `name`, `slug`, `description`, `createdAt`, `updatedAt`) VALUES
('cm9orar3x0000un54g4wzk4q5', 'Cosas raras', 'cosas-raras', NULL, '2025-04-19 21:54:50.683', '2025-04-19 21:54:50.683'),
('cm9orb0ee0001un540juo4o1k', 'Cosas divertidas', 'cosas-divertidas', NULL, '2025-04-19 21:55:02.727', '2025-04-19 21:55:02.727'),
('cm9orbbwg0002un5488f3xtei', 'Cosas interesantes', 'cosas-interesantes', NULL, '2025-04-19 21:55:17.633', '2025-04-19 21:55:17.633'),
('cm9orbtzb0003un547vbj00te', 'Cosas aburridas', 'cosas-aburridas', NULL, '2025-04-19 21:55:41.063', '2025-04-19 21:55:41.063'),
('cm9orc6gj0004un54w165i317', 'Cosas bonitas', 'cosas-bonitas', NULL, '2025-04-19 21:55:57.235', '2025-04-19 21:55:57.235'),
('cm9orcd6a0005un545ge1fkd4', 'Cosas feas', 'cosas-feas', NULL, '2025-04-19 21:56:05.939', '2025-04-19 21:56:05.939');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `GlobalConfig`
--

CREATE TABLE `GlobalConfig` (
  `id` varchar(191) NOT NULL DEFAULT 'global',
  `siteName` varchar(191) NOT NULL DEFAULT 'Neurowitch',
  `description` text DEFAULT NULL,
  `globalMetaTitle` varchar(255) DEFAULT NULL,
  `globalMetaDescription` text DEFAULT NULL,
  `globalKeywords` text DEFAULT NULL,
  `defaultSocialShareImage` varchar(255) DEFAULT NULL,
  `robotsTxtContent` longtext DEFAULT NULL,
  `googleAnalyticsId` varchar(50) DEFAULT NULL,
  `googleTagManagerId` varchar(50) DEFAULT NULL,
  `siteUrl` varchar(191) NOT NULL DEFAULT 'http://localhost:3000',
  `logoUrl` varchar(191) DEFAULT NULL,
  `faviconUrl` varchar(191) DEFAULT NULL,
  `themeColor` varchar(191) DEFAULT NULL,
  `header` longtext DEFAULT NULL,
  `footer` longtext DEFAULT NULL,
  `sidebar` longtext DEFAULT NULL,
  `social` longtext DEFAULT NULL,
  `sharing` longtext DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `maintenanceMode` tinyint(1) NOT NULL DEFAULT 0,
  `blogConfig` longtext DEFAULT NULL,
  `portfolioConfig` longtext DEFAULT NULL,
  `defaultLightThemePresetId` int(11) DEFAULT NULL,
  `defaultDarkThemePresetId` int(11) DEFAULT NULL,
  `themeAssignments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`themeAssignments`)),
  `loadingSpinnerConfig` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`loadingSpinnerConfig`)),
  `themeSwitcherConfig` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`themeSwitcherConfig`)),
  `stickyElementsConfig` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`stickyElementsConfig`)),
  `cookieBannerLinkPageId` int(11) DEFAULT NULL,
  `cookieBannerText` text DEFAULT NULL,
  `activeThemeId` varchar(255) DEFAULT NULL,
  `passwordMinLength` int(11) DEFAULT 8,
  `passwordRequireUppercase` tinyint(1) DEFAULT 1,
  `passwordRequireNumber` tinyint(1) DEFAULT 1,
  `passwordRequireSymbol` tinyint(1) DEFAULT 1,
  `sessionDuration` int(11) DEFAULT 24,
  `maxLoginAttempts` int(11) DEFAULT 5,
  `captchaEnabled` tinyint(1) DEFAULT 0,
  `accountLockoutDuration` int(11) DEFAULT 30,
  `globalSeoTitle` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `GlobalConfig`
--

INSERT INTO `GlobalConfig` (`id`, `siteName`, `description`, `globalMetaTitle`, `globalMetaDescription`, `globalKeywords`, `defaultSocialShareImage`, `robotsTxtContent`, `googleAnalyticsId`, `googleTagManagerId`, `siteUrl`, `logoUrl`, `faviconUrl`, `themeColor`, `header`, `footer`, `sidebar`, `social`, `sharing`, `createdAt`, `updatedAt`, `maintenanceMode`, `blogConfig`, `portfolioConfig`, `defaultLightThemePresetId`, `defaultDarkThemePresetId`, `themeAssignments`, `loadingSpinnerConfig`, `themeSwitcherConfig`, `stickyElementsConfig`, `cookieBannerLinkPageId`, `cookieBannerText`, `activeThemeId`, `passwordMinLength`, `passwordRequireUppercase`, `passwordRequireNumber`, `passwordRequireSymbol`, `sessionDuration`, `maxLoginAttempts`, `captchaEnabled`, `accountLockoutDuration`, `globalSeoTitle`) VALUES
('global', 'UrDiN.art', NULL, NULL, NULL, NULL, NULL, 'User-agent: *\nAllow: /\n\nDisallow: /admin/', NULL, NULL, 'http://192.168.228.199:3000', NULL, '/uploads/images/1745123242778-urdintransp.png', NULL, '{\"elements\":[{\"type\":\"logo\",\"visible\":true,\"position\":\"center-left\",\"logoUrl\":\"/uploads/images/1744614274473-urdintransp.png\"},{\"type\":\"text\",\"visible\":false,\"position\":\"top-left\",\"text\":\"\"},{\"type\":\"menu\",\"visible\":true,\"position\":\"bottom-right\"},{\"type\":\"social\",\"visible\":true,\"position\":\"top-right\"},{\"type\":\"theme\",\"visible\":false,\"position\":\"top-left\"},{\"type\":\"html\",\"visible\":false,\"position\":\"top-left\"}]}', NULL, NULL, NULL, NULL, '2025-04-20 06:26:46.000', '2025-04-20 06:26:46.000', 0, NULL, NULL, 1, 1, '{\"header\":{\"light\":1}}', '{\"enabled\":false,\"overlayColor\":\"#00000080\"}', '{\"visible\":true,\"style\":\"icon\",\"position\":\"bottom_right\"}', '{\"header\":false,\"sidebar\":false,\"footer\":false,\"themeSwitcher\":true}', NULL, NULL, NULL, 8, 1, 1, 1, 24, 5, 0, 30, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `MenuItem`
--

CREATE TABLE `MenuItem` (
  `id` varchar(191) NOT NULL,
  `label` varchar(191) NOT NULL,
  `url` varchar(191) NOT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `parentId` varchar(191) DEFAULT NULL,
  `sectionId` varchar(191) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `PageView`
--

CREATE TABLE `PageView` (
  `id` int(11) NOT NULL,
  `url` varchar(255) NOT NULL,
  `referrer` varchar(255) DEFAULT NULL,
  `ipAddress` varchar(45) DEFAULT NULL,
  `userAgent` text DEFAULT NULL,
  `timestamp` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Post`
--

CREATE TABLE `Post` (
  `id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `content` text NOT NULL,
  `excerpt` text DEFAULT NULL,
  `coverImage` varchar(191) DEFAULT NULL,
  `status` enum('DRAFT','PUBLISHED','ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  `publishedAt` datetime(3) DEFAULT NULL,
  `featured` tinyint(1) NOT NULL DEFAULT 0,
  `deleted` tinyint(1) NOT NULL DEFAULT 0,
  `authorId` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `authorDisplayName` varchar(191) DEFAULT NULL,
  `categoryId` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `Post`
--

INSERT INTO `Post` (`id`, `title`, `slug`, `content`, `excerpt`, `coverImage`, `status`, `publishedAt`, `featured`, `deleted`, `authorId`, `createdAt`, `updatedAt`, `authorDisplayName`, `categoryId`) VALUES
('cuid229786', 'Post guachi', 'post-guachi', '<p>Contenido guachi</p>', 'Extracto de contenido guachi', '/uploads/images/1745100719837-png-clipart-professor-utonium-mojo-jojo-drawing-cartoon-network-character-professor-miscellaneous-angle-thumbnail.png', 'ARCHIVED', NULL, 0, 0, 'cm9ezhgvc0000unjsz3po1hch', '2025-04-19 22:12:26.000', '2025-04-19 22:12:26.000', 'Professor', 'cm9orbbwg0002un5488f3xtei'),
('cuid38036', 'Post chupi', 'post-chupi', '<p>Contenido chupi</p>', 'Extracto de contenido chupi', '/uploads/images/1745100445504-Burbuja1-2.webp', 'PUBLISHED', NULL, 0, 0, 'cm9ezhgvc0000unjsz3po1hch', '2025-04-19 22:07:48.000', '2025-04-19 22:07:48.000', 'Burbuja', 'cm9orb0ee0001un540juo4o1k'),
('cuid698505', 'Post chachi', 'post-chachi', '<p>Contenido chachi</p>', 'Extracto de contenido chachi', '/uploads/images/1745099078596-Bomb3Fn1.webp', 'PUBLISHED', NULL, 1, 0, 'cm9ezhgvc0000unjsz3po1hch', '2025-04-19 21:52:04.000', '2025-04-19 22:06:25.000', 'Pétalo', 'cm9orc6gj0004un54w165i317'),
('cuid90535', 'Post chuli', 'post-chuli', '<p>Contenido chuli</p>', 'Extracto de contenido chuli', '/uploads/images/1745100527380-Bellota1.webp', 'DRAFT', NULL, 0, 0, 'cm9ezhgvc0000unjsz3po1hch', '2025-04-19 22:09:19.000', '2025-04-19 22:09:19.000', 'Cactus', 'cm9orar3x0000un54g4wzk4q5');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Project`
--

CREATE TABLE `Project` (
  `id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `content` text NOT NULL,
  `excerpt` text DEFAULT NULL,
  `coverImage` varchar(191) DEFAULT NULL,
  `additionalImageUrls` longtext DEFAULT NULL,
  `displayType` enum('SINGLE','GALLERY','SLIDER','GRID') NOT NULL DEFAULT 'SINGLE',
  `status` enum('DRAFT','PUBLISHED','ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  `publishedAt` datetime(3) DEFAULT NULL,
  `featured` tinyint(1) NOT NULL DEFAULT 0,
  `authorDisplayName` varchar(191) DEFAULT NULL,
  `deleted` tinyint(1) NOT NULL DEFAULT 0,
  `authorId` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `categoryId` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `Project`
--

INSERT INTO `Project` (`id`, `title`, `slug`, `content`, `excerpt`, `coverImage`, `additionalImageUrls`, `displayType`, `status`, `publishedAt`, `featured`, `authorDisplayName`, `deleted`, `authorId`, `createdAt`, `updatedAt`, `categoryId`) VALUES
('cuid140123', 'Proyecto cutre', 'proyecto-cutre', '<p>Contenido cutre</p>', 'Extracto cutre', '/uploads/images/1744958112265-Chicoscocosos2.webp', '[\"/uploads/images/1744957129543-Mojo_jojo.webp\",\"/uploads/images/1744958112265-Chicoscocosos2.webp\",\"/uploads/images/1744958619492-Princess-pic.webp\",\"/uploads/images/1744958477112-El-100.webp\"]', 'GRID', 'ARCHIVED', NULL, 0, 'Chicos Cocosos', 0, 'cm9ezhgvc0000unjsz3po1hch', '2025-04-19 22:24:25.000', '2025-04-19 22:24:25.000', 'cm9orcd6a0005un545ge1fkd4'),
('cuid531381', 'Proyecto abyecto', 'proyecto-abyecto', '<p>Contenido abyecto</p>', 'Extracto abyecto', '/uploads/images/1744958477112-El-100.webp', '[\"/uploads/images/1744816065513-caballodemar.jpg\",\"/uploads/images/1744816073451-08568a9c-b04e-4f15-a590-c8307981536a.jpg\",\"/uploads/images/1744904240995-72ade57b-0c95-40e6-a230-ad4d5bb6091c.jpg\",\"/uploads/images/1744816090264-desfafcarga.jpg\"]', 'GALLERY', 'PUBLISHED', NULL, 1, 'Él', 0, 'cm9ezhgvc0000unjsz3po1hch', '2025-04-19 22:17:47.000', '2025-04-19 22:17:47.000', 'cm9orbtzb0003un547vbj00te'),
('cuid595311', 'Proyecto chorra', 'proyecto-chorra', '<p>Contenido chorra</p>', 'Extracto chorra', '/uploads/images/1744958619492-Princess-pic.webp', '[]', 'SINGLE', 'DRAFT', NULL, 0, 'Princesa Masbilletes', 0, 'cm9ezhgvc0000unjsz3po1hch', '2025-04-19 22:22:28.000', '2025-04-19 22:22:28.000', 'cm9orar3x0000un54g4wzk4q5'),
('cuid952109', 'Proyecto absurdo', 'proyecto-absurdo', '<p>Contenido absurdo</p>', 'Extracto absurdo', '/uploads/images/1744957129543-Mojo_jojo.webp', '[\"/uploads/images/1744904240995-72ade57b-0c95-40e6-a230-ad4d5bb6091c.jpg\",\"/uploads/images/1744818447513-ChatGPTImage16abr202513_07_20.png\",\"/uploads/images/1744769468137-almadefenix.jpg\",\"/uploads/images/1744816073451-08568a9c-b04e-4f15-a590-c8307981536a.jpg\",\"/uploads/images/1744816065513-caballodemar.jpg\"]', 'SLIDER', 'PUBLISHED', NULL, 1, 'Mojo Jojo', 0, 'cm9ezhgvc0000unjsz3po1hch', '2025-04-19 22:20:03.000', '2025-04-19 22:20:03.000', 'cm9orcd6a0005un545ge1fkd4');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Referrer`
--

CREATE TABLE `Referrer` (
  `id` varchar(191) NOT NULL,
  `referrer` varchar(191) NOT NULL,
  `date` datetime(3) NOT NULL,
  `count` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Session`
--

CREATE TABLE `Session` (
  `id` varchar(191) NOT NULL,
  `sessionToken` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `expires` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `SiteSection`
--

CREATE TABLE `SiteSection` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `type` enum('HEADER','FOOTER','SIDEBAR') NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `StaticPage`
--

CREATE TABLE `StaticPage` (
  `id` int(11) NOT NULL,
  `title` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `contentHtml` longtext NOT NULL,
  `menuOrder` int(11) NOT NULL DEFAULT 0,
  `includeInMenu` tinyint(1) NOT NULL DEFAULT 0,
  `isHomePage` tinyint(1) NOT NULL DEFAULT 0,
  `isVisible` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `StaticPage`
--

INSERT INTO `StaticPage` (`id`, `title`, `slug`, `contentHtml`, `menuOrder`, `includeInMenu`, `isHomePage`, `isVisible`, `createdAt`, `updatedAt`) VALUES
(1, 'Inicio', 'inicio', '<p>&lt;h1&gt;HTML Ipsum Presents&lt;/h1&gt;</p><p>				&lt;p&gt;&lt;strong&gt;Pellentesque habitant morbi tristique&lt;/strong&gt; senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. &lt;em&gt;Aenean ultricies mi vitae est.&lt;/em&gt; Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, &lt;code&gt;commodo vitae&lt;/code&gt;, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. &lt;a href=\"#\"&gt;Donec non enim&lt;/a&gt; in turpis pulvinar facilisis. Ut felis.&lt;/p&gt;</p><p>				&lt;h2&gt;Header Level 2&lt;/h2&gt;</p><p>				&lt;ol&gt;</p><p>				   &lt;li&gt;Lorem ipsum dolor sit amet, consectetuer adipiscing elit.&lt;/li&gt;</p><p>				   &lt;li&gt;Aliquam tincidunt mauris eu risus.&lt;/li&gt;</p><p>				&lt;/ol&gt;</p><p>				&lt;blockquote&gt;&lt;p&gt;Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus magna. Cras in mi at felis aliquet congue. Ut a est eget ligula molestie gravida. Curabitur massa. Donec eleifend, libero at sagittis mollis, tellus est malesuada tellus, at luctus turpis elit sit amet quam. Vivamus pretium ornare est.&lt;/p&gt;&lt;/blockquote&gt;</p><p>				&lt;h3&gt;Header Level 3&lt;/h3&gt;</p><p>				&lt;ul&gt;</p><p>				   &lt;li&gt;Lorem ipsum dolor sit amet, consectetuer adipiscing elit.&lt;/li&gt;</p><p>				   &lt;li&gt;Aliquam tincidunt mauris eu risus.&lt;/li&gt;</p><p>				&lt;/ul&gt;</p><p>				&lt;pre&gt;&lt;code&gt;</p><p>				#header h1 a {</p><p>				  display: block;</p><p>				  width: 300px;</p><p>				  height: 80px;</p><p>				}</p><p>				&lt;/code&gt;&lt;/pre&gt;</p>', 0, 1, 1, 1, '2025-04-19 22:35:41.000', '2025-04-20 04:38:21.000'),
(2, 'Contacto', 'contacto', '<p>&lt;h1&gt;HTML Ipsum Presents&lt;/h1&gt;</p><p>				&lt;p&gt;&lt;strong&gt;Pellentesque habitant morbi tristique&lt;/strong&gt; senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. &lt;em&gt;Aenean ultricies mi vitae est.&lt;/em&gt; Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, &lt;code&gt;commodo vitae&lt;/code&gt;, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. &lt;a href=\"#\"&gt;Donec non enim&lt;/a&gt; in turpis pulvinar facilisis. Ut felis.&lt;/p&gt;</p><p>				&lt;h2&gt;Header Level 2&lt;/h2&gt;</p><p>				&lt;ol&gt;</p><p>				   &lt;li&gt;Lorem ipsum dolor sit amet, consectetuer adipiscing elit.&lt;/li&gt;</p><p>				   &lt;li&gt;Aliquam tincidunt mauris eu risus.&lt;/li&gt;</p><p>				&lt;/ol&gt;</p><p>				&lt;blockquote&gt;&lt;p&gt;Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus magna. Cras in mi at felis aliquet congue. Ut a est eget ligula molestie gravida. Curabitur massa. Donec eleifend, libero at sagittis mollis, tellus est malesuada tellus, at luctus turpis elit sit amet quam. Vivamus pretium ornare est.&lt;/p&gt;&lt;/blockquote&gt;</p><p>				&lt;h3&gt;Header Level 3&lt;/h3&gt;</p><p>				&lt;ul&gt;</p><p>				   &lt;li&gt;Lorem ipsum dolor sit amet, consectetuer adipiscing elit.&lt;/li&gt;</p><p>				   &lt;li&gt;Aliquam tincidunt mauris eu risus.&lt;/li&gt;</p><p>				&lt;/ul&gt;</p><p>				&lt;pre&gt;&lt;code&gt;</p><p>				#header h1 a {</p><p>				  display: block;</p><p>				  width: 300px;</p><p>				  height: 80px;</p><p>				}</p><p>				&lt;/code&gt;&lt;/pre&gt;</p>', 1, 1, 0, 1, '2025-04-19 22:41:00.000', '2025-04-20 04:38:43.000'),
(3, 'Servicios', 'servicios', '<p>&lt;h1&gt;HTML Ipsum Presents&lt;/h1&gt;</p><p>				&lt;p&gt;&lt;strong&gt;Pellentesque habitant morbi tristique&lt;/strong&gt; senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. &lt;em&gt;Aenean ultricies mi vitae est.&lt;/em&gt; Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, &lt;code&gt;commodo vitae&lt;/code&gt;, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. &lt;a href=\"#\"&gt;Donec non enim&lt;/a&gt; in turpis pulvinar facilisis. Ut felis.&lt;/p&gt;</p><p>				&lt;h2&gt;Header Level 2&lt;/h2&gt;</p><p>				&lt;ol&gt;</p><p>				   &lt;li&gt;Lorem ipsum dolor sit amet, consectetuer adipiscing elit.&lt;/li&gt;</p><p>				   &lt;li&gt;Aliquam tincidunt mauris eu risus.&lt;/li&gt;</p><p>				&lt;/ol&gt;</p><p>				&lt;blockquote&gt;&lt;p&gt;Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus magna. Cras in mi at felis aliquet congue. Ut a est eget ligula molestie gravida. Curabitur massa. Donec eleifend, libero at sagittis mollis, tellus est malesuada tellus, at luctus turpis elit sit amet quam. Vivamus pretium ornare est.&lt;/p&gt;&lt;/blockquote&gt;</p><p>				&lt;h3&gt;Header Level 3&lt;/h3&gt;</p><p>				&lt;ul&gt;</p><p>				   &lt;li&gt;Lorem ipsum dolor sit amet, consectetuer adipiscing elit.&lt;/li&gt;</p><p>				   &lt;li&gt;Aliquam tincidunt mauris eu risus.&lt;/li&gt;</p><p>				&lt;/ul&gt;</p><p>				&lt;pre&gt;&lt;code&gt;</p><p>				#header h1 a {</p><p>				  display: block;</p><p>				  width: 300px;</p><p>				  height: 80px;</p><p>				}</p><p>				&lt;/code&gt;&lt;/pre&gt;</p>', 2, 1, 0, 1, '2025-04-19 22:41:45.000', '2025-04-20 04:38:56.000');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Tag`
--

CREATE TABLE `Tag` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ThemePreset`
--

CREATE TABLE `ThemePreset` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`config`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `ThemePreset`
--

INSERT INTO `ThemePreset` (`id`, `name`, `config`) VALUES
(1, 'Default', '{\"background\":{\"type\":\"color\",\"value\":\"rgba(255, 255, 255, 1)\"},\"typography\":{\"heading\":{\"fontFamily\":\"Arial, sans-serif\",\"color\":\"rgba(51, 51, 51, 1)\"},\"paragraph\":{\"fontFamily\":\"Arial, sans-serif\",\"color\":\"#666666\"},\"link\":{\"fontFamily\":\"Arial, sans-serif\",\"color\":\"#007bff\",\"hoverColor\":\"#0056b3\"}},\"spacing\":{\"baseMargin\":\"1rem\",\"basePadding\":\"1rem\"},\"cards\":{\"borderRadius\":\"0.5rem\",\"borderWidth\":\"1px\",\"borderColor\":\"rgba(0,0,0,0.1)\",\"background\":{\"type\":\"color\",\"value\":\"#ffffff\"},\"shadow\":\"shadow-md\"},\"buttons\":{\"primary\":{\"backgroundColor\":\"#007bff\",\"textColor\":\"#ffffff\",\"borderRadius\":\"0.25rem\",\"hoverBackgroundColor\":\"#0069d9\",\"hoverTextColor\":\"#ffffff\"},\"secondary\":{\"backgroundColor\":\"#6c757d\",\"textColor\":\"#ffffff\",\"borderRadius\":\"0.25rem\",\"hoverBackgroundColor\":\"#5a6268\",\"hoverTextColor\":\"#ffffff\"}},\"forms\":{\"input\":{\"backgroundColor\":\"#ffffff\",\"textColor\":\"#495057\",\"borderColor\":\"#ced4da\",\"borderRadius\":\"0.25rem\",\"focusBorderColor\":\"#80bdff\"},\"label\":{\"textColor\":\"#212529\",\"fontWeight\":\"bold\"}},\"effects\":{\"transitions\":true}}'),
(2, 'Header light', '{\"background\":{\"type\":\"image\",\"value\":\"#ffffff\",\"imageUrl\":\"/uploads/images/1745097916621-01.png\"},\"typography\":{\"heading\":{\"fontFamily\":\"Montserrat, sans-serif\",\"color\":\"#333333\"},\"paragraph\":{\"fontFamily\":\"Raleway, sans-serif\",\"color\":\"#666666\"},\"link\":{\"fontFamily\":\"Arial, sans-serif\",\"color\":\"#007bff\",\"hoverColor\":\"#0056b3\"}},\"spacing\":{\"margin\":{\"top\":\"10px\",\"right\":\"30px\",\"bottom\":\"10px\",\"left\":\"30px\",\"base\":\"1rem\"},\"padding\":{\"top\":\"0px\",\"right\":\"10px\",\"bottom\":\"0px\",\"left\":\"10px\",\"base\":\"1rem\"}},\"cards\":{\"borderRadius\":\"10px\",\"borderWidth\":\"1px\",\"borderColor\":\"rgba(144, 144, 144, 0.1)\",\"background\":{\"type\":\"color\",\"value\":\"#ffffff\"},\"shadow\":{\"x\":\"10px\",\"y\":\"10px\",\"blur\":\"10px\",\"spread\":\"0px\",\"color\":\"rgba(0, 0, 0, 0.42)\"}},\"buttons\":{\"primary\":{\"backgroundColor\":\"#007bff\",\"textColor\":\"#ffffff\",\"borderRadius\":\"0.25rem\",\"hoverBackgroundColor\":\"#0069d9\",\"hoverTextColor\":\"#ffffff\"},\"secondary\":{\"backgroundColor\":\"#6c757d\",\"textColor\":\"#ffffff\",\"borderRadius\":\"0.25rem\",\"hoverBackgroundColor\":\"#5a6268\",\"hoverTextColor\":\"#ffffff\"}},\"forms\":{\"input\":{\"backgroundColor\":\"#ffffff\",\"textColor\":\"#495057\",\"borderColor\":\"#ced4da\",\"borderRadius\":\"0.25rem\",\"focusBorderColor\":\"#80bdff\"},\"label\":{\"textColor\":\"#212529\",\"fontWeight\":\"bold\"}},\"effects\":{\"transitions\":true,\"animation\":\"scale\"}}');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `User`
--

CREATE TABLE `User` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) DEFAULT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `role` enum('MASTER','ADMIN','EDITOR','COLLABORATOR') NOT NULL DEFAULT 'COLLABORATOR',
  `emailVerified` datetime(3) DEFAULT NULL,
  `image` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `User`
--

INSERT INTO `User` (`id`, `name`, `email`, `password`, `role`, `emailVerified`, `image`, `createdAt`, `updatedAt`) VALUES
('cm9ezhgvc0000unjsz3po1hch', 'master', 'master@app.com', '$2b$10$B.w7kRJtNkgBsBCYDen5cu/YNN4j4bpx8/3gA7VPvemydIrlu63Uu', 'MASTER', NULL, NULL, '2025-04-19 13:28:45.938', '2025-04-20 05:23:38.086'),
('cm9o97xqn0001un3oi6yg2x6r', 'admin', 'admin@app.com', '$2b$10$B.w7kRJtNkgBsBCYDen5cu/YNN4j4bpx8/3gA7VPvemydIrlu63Uu', 'ADMIN', NULL, NULL, '2025-04-19 13:28:46.223', '2025-04-19 13:28:46.223'),
('cm9o97xuu0002un3oraqti7nn', 'editor', 'editor@app.com', '$2b$10$B.w7kRJtNkgBsBCYDen5cu/YNN4j4bpx8/3gA7VPvemydIrlu63Uu', 'EDITOR', NULL, NULL, '2025-04-19 13:28:46.374', '2025-04-19 13:28:46.374'),
('cm9o97xz30003un3onf9pb30i', 'collaborator', 'collaborator@app.com', '$2b$10$B.w7kRJtNkgBsBCYDen5cu/YNN4j4bpx8/3gA7VPvemydIrlu63Uu', 'COLLABORATOR', NULL, NULL, '2025-04-19 13:28:46.527', '2025-04-19 13:28:46.527'),
('cm9p4qr120001unggcb0ls4ci', 'oscar', 'oscar@oscar', '$2b$10$dSNDrYsRmvTj3kKQGq/nMuqeo/KUnzBfbm6Svqx0c/7CED9mFtdJK', 'MASTER', NULL, NULL, '2025-04-20 04:11:12.086', '2025-04-20 05:23:20.860');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `VerificationToken`
--

CREATE TABLE `VerificationToken` (
  `identifier` varchar(191) NOT NULL,
  `token` varchar(191) NOT NULL,
  `expires` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Visit`
--

CREATE TABLE `Visit` (
  `id` varchar(191) NOT NULL,
  `date` datetime(3) NOT NULL,
  `count` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Widget`
--

CREATE TABLE `Widget` (
  `id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `type` enum('LATEST_POSTS','LATEST_PROJECTS','SEARCH','CATEGORIES','TAGS','SOCIAL_LINKS','TEXT','NEWSLETTER','RECENT_COMMENTS') NOT NULL,
  `content` text DEFAULT NULL,
  `config` longtext DEFAULT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `sectionId` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `Account`
--
ALTER TABLE `Account`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Account_provider_providerAccountId_key` (`provider`,`providerAccountId`),
  ADD KEY `Account_userId_fkey` (`userId`);

--
-- Indices de la tabla `AdminAction`
--
ALTER TABLE `AdminAction`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `AdminLog`
--
ALTER TABLE `AdminLog`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_timestamp` (`timestamp`),
  ADD KEY `idx_userId` (`userId`),
  ADD KEY `idx_action` (`action`);

--
-- Indices de la tabla `Category`
--
ALTER TABLE `Category`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Category_slug_key` (`slug`);

--
-- Indices de la tabla `GlobalConfig`
--
ALTER TABLE `GlobalConfig`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `MenuItem`
--
ALTER TABLE `MenuItem`
  ADD PRIMARY KEY (`id`),
  ADD KEY `MenuItem_parentId_fkey` (`parentId`),
  ADD KEY `MenuItem_sectionId_fkey` (`sectionId`);

--
-- Indices de la tabla `PageView`
--
ALTER TABLE `PageView`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_timestamp` (`timestamp`),
  ADD KEY `idx_url` (`url`);

--
-- Indices de la tabla `Post`
--
ALTER TABLE `Post`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Post_slug_key` (`slug`),
  ADD KEY `Post_authorId_fkey` (`authorId`),
  ADD KEY `Post_categoryId_fkey` (`categoryId`);

--
-- Indices de la tabla `Project`
--
ALTER TABLE `Project`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Project_slug_key` (`slug`),
  ADD KEY `Project_authorId_fkey` (`authorId`),
  ADD KEY `Project_categoryId_fkey` (`categoryId`);

--
-- Indices de la tabla `Referrer`
--
ALTER TABLE `Referrer`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `Session`
--
ALTER TABLE `Session`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Session_sessionToken_key` (`sessionToken`),
  ADD KEY `Session_userId_fkey` (`userId`);

--
-- Indices de la tabla `SiteSection`
--
ALTER TABLE `SiteSection`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `StaticPage`
--
ALTER TABLE `StaticPage`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `StaticPage_slug_key` (`slug`);

--
-- Indices de la tabla `Tag`
--
ALTER TABLE `Tag`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Tag_slug_key` (`slug`);

--
-- Indices de la tabla `ThemePreset`
--
ALTER TABLE `ThemePreset`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ThemePreset_name_key` (`name`);

--
-- Indices de la tabla `User`
--
ALTER TABLE `User`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_email_key` (`email`);

--
-- Indices de la tabla `VerificationToken`
--
ALTER TABLE `VerificationToken`
  ADD UNIQUE KEY `VerificationToken_token_key` (`token`),
  ADD UNIQUE KEY `VerificationToken_identifier_token_key` (`identifier`,`token`);

--
-- Indices de la tabla `Visit`
--
ALTER TABLE `Visit`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Visit_date_key` (`date`);

--
-- Indices de la tabla `Widget`
--
ALTER TABLE `Widget`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Widget_sectionId_fkey` (`sectionId`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `AdminLog`
--
ALTER TABLE `AdminLog`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `PageView`
--
ALTER TABLE `PageView`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `StaticPage`
--
ALTER TABLE `StaticPage`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `ThemePreset`
--
ALTER TABLE `ThemePreset`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `Account`
--
ALTER TABLE `Account`
  ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `MenuItem`
--
ALTER TABLE `MenuItem`
  ADD CONSTRAINT `MenuItem_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `MenuItem` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `MenuItem_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `SiteSection` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `Post`
--
ALTER TABLE `Post`
  ADD CONSTRAINT `Post_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Post_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `Project`
--
ALTER TABLE `Project`
  ADD CONSTRAINT `Project_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Project_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `Session`
--
ALTER TABLE `Session`
  ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `Widget`
--
ALTER TABLE `Widget`
  ADD CONSTRAINT `Widget_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `SiteSection` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
