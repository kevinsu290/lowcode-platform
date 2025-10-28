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
-- Table structure for table `progreso`
--

DROP TABLE IF EXISTS `progreso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `progreso` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint NOT NULL,
  `ejercicio_id` bigint NOT NULL,
  `iniciado_en` timestamp NULL DEFAULT NULL,
  `completado_en` timestamp NULL DEFAULT NULL,
  `tiempo_seg` int DEFAULT '0',
  `bloques_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `codigo_generado` text COLLATE utf8mb4_unicode_ci,
  `exito` tinyint(1) DEFAULT '0',
  `contar` tinyint(1) NOT NULL DEFAULT '0',
  `creado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ejercicio_id` (`ejercicio_id`),
  KEY `idx_progreso_usuario` (`usuario_id`),
  KEY `idx_usuario_ejercicio` (`usuario_id`,`ejercicio_id`),
  CONSTRAINT `progreso_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `progreso_ibfk_2` FOREIGN KEY (`ejercicio_id`) REFERENCES `ejercicios` (`id`),
  CONSTRAINT `progreso_chk_1` CHECK (json_valid(`bloques_json`))
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `progreso`
--

LOCK TABLES `progreso` WRITE;
/*!40000 ALTER TABLE `progreso` DISABLE KEYS */;
INSERT INTO `progreso` VALUES (19,6,6,NULL,NULL,78,'{\"bloques\":8}','var x;\n\n\nif (x >= 18) {\n  console.log(\'Mayor de edad\');\n} else {\n  console.log(\'Menor de edad\');\n}\n',1,1,'2025-10-23 06:22:12'),(20,6,7,NULL,NULL,196,'{\"bloques\":10}','var x;\n\n\nif (x % 2 == 0) {\n  console.log(\'Par\');\n} else {\n  console.log(\'Impar\');\n}\n',1,1,'2025-10-23 06:33:19'),(21,6,8,NULL,NULL,82,'{\"bloques\":8}','var x, y;\n\n\nif (x > y) {\n  console.log(x);\n} else {\n  console.log(y);\n}\n',1,1,'2025-10-23 06:42:53'),(22,6,9,NULL,NULL,150,'{\"bloques\":13}','var x;\n\n\nif (x < 0) {\n  console.log(\'Frío\');\n} else if (x <= 25) {\n  console.log(\'Templado\');\n} else {\n  console.log(\'Caliente\');\n}\n',1,1,'2025-10-23 07:08:33'),(23,6,10,NULL,NULL,58,'{\"bloques\":8}','var x;\n\n\nif (x >= 100) {\n  console.log(\'Descuento aplicado\');\n} else {\n  console.log(\'Sin descuento\');\n}\n',1,1,'2025-10-23 07:16:04'),(24,6,11,NULL,NULL,229,'{\"bloques\":30}','var x;\n\n\nswitch (x) {\n  case 1:\n  console.log(\'Lunes\');\n    break;\n  case 2:\n  console.log(\'Martes\');\n    break;\n  case 3:\n  console.log(\'Miercoles\');\n    break;\n  case 4:\n  console.log(\'Jueves\');\n    break;\n  case 5:\n  console.log(\'Viernes\');\n    break;\n  case 6:\n  console.log(\'Sabado\');\n    break;\n  case 7:\n  console.log(\'Domingo\');\n    break;\n}\n',1,1,'2025-10-23 07:55:56'),(25,6,12,NULL,NULL,128,'{\"bloques\":22}','var x;\n\n\nswitch (x) {\n  case \'A\':\n  console.log(\'Excelente\');\n    break;\n  case \'B\':\n  console.log(\'Notable\');\n    break;\n  case \'C\':\n  console.log(\'Aprobado\');\n    break;\n  case \'D\':\n  console.log(\'Insuficiente\');\n    break;\n  case \'F\':\n  console.log(\'Reprobado\');\n    break;\n}\n',1,1,'2025-10-25 03:00:29'),(26,6,13,NULL,NULL,261,'{\"bloques\":31}','var x;\n\n\nswitch (true) {\n  case x == 10 || x == 9:\n  console.log(\'Sobresaliente\');\n    break;\n  case x == 8 || x == 7:\n  console.log(\'Notable\');\n    break;\n  case x == 6:\n  console.log(\'Aprobado\');\n    break;\n  default:\n  console.log(\'Insuficiente\');\n    break;\n}\n',1,1,'2025-10-25 03:10:08'),(27,6,14,NULL,NULL,409,'{\"bloques\":58}','var x;\n\n\nswitch (true) {\n  case x == 12 || x == 1 || x == 2:\n  console.log(\'Invierno\');\n    break;\n  case x == 3 || x == 4 || x == 5:\n  console.log(\'Primavera\');\n    break;\n  case x == 6 || x == 7 || x == 8:\n  console.log(\'Verano\');\n    break;\n  case x == 9 || x == 10 || x == 11:\n  console.log(\'Otoño\');\n    break;\n}\n',1,1,'2025-10-25 03:20:05'),(28,6,15,NULL,NULL,84,'{\"bloques\":17}','var x;\n\n\nswitch (x) {\n  case 1:\n  console.log(\'Nuevo\');\n    break;\n  case 2:\n  console.log(\'Guardar\');\n    break;\n  case 3:\n  console.log(\'Salir\');\n    break;\n  default:\n  console.log(\'Opción inválida\');\n    break;\n}\n',1,1,'2025-10-25 03:25:32'),(29,6,16,NULL,NULL,472,'{\"bloques\":12}','var y, i, x;\n\n\ny = 0;\nfor (i = 1; i <= x; i++) {\n  y = y + i;\n}\nconsole.log(y);\n',1,1,'2025-10-25 04:02:58'),(30,6,17,NULL,NULL,130,'{\"bloques\":12}','var x;\n\n\nwhile (x >= 1) {\n  if(--window.__loopTrap < 0) throw \"Loop limit exceeded\";\n  console.log(x);\n  x = x - 1;\n}\nconsole.log(\'Despegue!\');\n',1,1,'2025-10-25 04:13:52'),(31,6,18,NULL,NULL,132,'{\"bloques\":18}','var x;\n\n\ndo {\n    if (x % 3 != 0) {\n      x = x - 1;\n    }\n  } while (x % 3 != 0);\nconsole.log(x);\n',1,1,'2025-10-25 04:49:11'),(32,6,19,NULL,NULL,94,'{\"bloques\":12}','var y, i, x;\n\n\ny = 1;\nfor (i = 1; i <= x; i++) {\n  y = y * i;\n}\nconsole.log(y);\n',1,1,'2025-10-25 05:41:59'),(33,6,20,NULL,NULL,224,'{\"bloques\":22}','var y, x;\n\n\ny = 0;\nwhile (x >= 0) {\n  if (x % 2 == 0) {\n    y = y + x;\n  }\n  x = x - 1;\n}\nconsole.log(y);\n',1,1,'2025-10-25 05:52:23');
/*!40000 ALTER TABLE `progreso` ENABLE KEYS */;
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
