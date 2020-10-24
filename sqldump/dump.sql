-- MySQL dump 10.13  Distrib 5.7.31, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: equestre-db
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.6-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `tb_events`
--

DROP TABLE IF EXISTS `tb_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_events` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'key',
  `eventName` varchar(256) NOT NULL,
  `eventDate` datetime NOT NULL DEFAULT '2000-01-01 00:00:00',
  `title` varchar(256) DEFAULT NULL,
  `titleStart` datetime DEFAULT NULL,
  `titleEnd` datetime DEFAULT NULL,
  `roundNumber` tinyint(4) NOT NULL,
  `jumpoffNumber` tinyint(4) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=96 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tb_horses`
--

DROP TABLE IF EXISTS `tb_horses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_horses` (
  `eventId` int(11) NOT NULL,
  `number` int(11) NOT NULL,
  `name` varchar(256) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `birthday` datetime DEFAULT NULL,
  `owner` varchar(256) DEFAULT NULL,
  PRIMARY KEY (`eventId`,`number`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tb_ranks`
--

DROP TABLE IF EXISTS `tb_ranks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_ranks` (
  `eventId` int(11) NOT NULL,
  `number` int(11) NOT NULL,
  `rank` int(11) NOT NULL,
  `point1` int(11) DEFAULT NULL,
  `pointPlus1` int(11) DEFAULT NULL,
  `time1` int(11) DEFAULT NULL,
  `timePlus1` int(11) DEFAULT NULL,
  `point2` int(11) DEFAULT NULL,
  `pointPlus2` int(11) DEFAULT NULL,
  `time2` int(11) DEFAULT NULL,
  `timePlus2` int(11) DEFAULT NULL,
  `jumpOff` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`eventId`,`number`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tb_riders`
--

DROP TABLE IF EXISTS `tb_riders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_riders` (
  `eventId` int(11) NOT NULL,
  `number` int(11) NOT NULL,
  `firstName` varchar(256) NOT NULL,
  `lastName` varchar(256) NOT NULL,
  `nation` varchar(32) DEFAULT NULL,
  `birthday` datetime DEFAULT NULL,
  PRIMARY KEY (`eventId`,`number`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tb_startlist`
--

DROP TABLE IF EXISTS `tb_startlist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_startlist` (
  `eventId` int(255) DEFAULT NULL,
  `pos` int(255) DEFAULT NULL,
  `num` int(11) DEFAULT NULL,
  `horse_idx` int(255) DEFAULT NULL,
  `rider_idx` int(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-10-24 10:51:05
