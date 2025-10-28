CREATE DATABASE  IF NOT EXISTS `lowcode_es` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `lowcode_es`;
-- MySQL dump 10.13  Distrib 8.0.36, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: lowcode_es
-- ------------------------------------------------------
-- Server version	8.0.43-0ubuntu0.22.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `encuestas_likert`
--

DROP TABLE IF EXISTS `encuestas_likert`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `encuestas_likert` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint NOT NULL,
  `ejercicio_id` bigint NOT NULL,
  `nivel_id` tinyint DEFAULT NULL,
  `motivacion` tinyint NOT NULL,
  `compromiso` tinyint NOT NULL,
  `comentario` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_usuario` (`usuario_id`),
  KEY `idx_ejercicio` (`ejercicio_id`),
  CONSTRAINT `fk_enc_likert_ejercicio` FOREIGN KEY (`ejercicio_id`) REFERENCES `ejercicios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_enc_likert_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `encuestas_likert`
--

LOCK TABLES `encuestas_likert` WRITE;
/*!40000 ALTER TABLE `encuestas_likert` DISABLE KEYS */;
INSERT INTO `encuestas_likert` VALUES (7,6,6,1,5,5,'Gran inicio para esta plataforma, estoy muy motivado en seguir adelante.','2025-10-23 06:22:42'),(8,6,7,1,4,4,'Gran ejercicio muy didáctico, espero siga avanzando así.','2025-10-23 06:33:53'),(9,6,8,1,3,3,'Voy mejorando, ya tengo nociones básicas, esta plataforma me esta ayudando mucho.','2025-10-23 06:43:34'),(10,6,9,1,2,2,'Ejercicio un poco difícil, pero voy avanzando, por temas personales no podre continuar en un tiempo.','2025-10-23 07:09:08'),(11,6,10,1,1,1,'Me aleje un poco de la plataforma, regreso poco a poco.','2025-10-23 07:16:33'),(12,6,11,2,5,5,'Muy buen ejercicio para iniciar este nuevo nivel, estoy muy motivado.','2025-10-23 07:56:17'),(13,6,12,2,4,4,'Un muy buen ejercicio, estoy aprendiendo mucho.','2025-10-25 03:00:54'),(14,6,13,2,3,3,'Ejercicio un poco complicado pero usando la lógica es mucho mas facil.','2025-10-25 03:10:28'),(15,6,14,2,2,2,'Un poco largo pero con lógica es un gran ejercicio me puso a pensar.','2025-10-25 03:20:31'),(16,6,15,2,1,1,'Me gusto este modulo es muy educativo y didáctico.','2025-10-25 03:25:59'),(17,6,16,3,5,5,'Ejercicio un poco complicado pero ya estoy por terminarla así tiene que ser.','2025-10-25 04:03:19'),(18,6,17,3,4,4,'Buen ejercicio, me gusto mucho.','2025-10-25 04:14:10'),(19,6,18,3,3,3,'Ejercicio un poco difícil, pero muy bueno.','2025-10-25 04:49:26'),(20,6,19,3,2,2,'Ejercicio muy bueno y equilibrado.','2025-10-25 05:42:19'),(21,6,20,3,1,1,'Grandes ejercicios llegue al final y aprendí mucho.','2025-10-25 05:52:39');
/*!40000 ALTER TABLE `encuestas_likert` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-25  3:21:25
