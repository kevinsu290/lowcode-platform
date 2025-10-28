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
-- Table structure for table `diagnosticos`
--

DROP TABLE IF EXISTS `diagnosticos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `diagnosticos` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint NOT NULL,
  `resultado_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `nivel_sugerido_id` tinyint NOT NULL,
  `creado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `nivel_sugerido_id` (`nivel_sugerido_id`),
  CONSTRAINT `diagnosticos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `diagnosticos_ibfk_2` FOREIGN KEY (`nivel_sugerido_id`) REFERENCES `niveles` (`id`),
  CONSTRAINT `diagnosticos_chk_1` CHECK (json_valid(`resultado_json`))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `diagnosticos`
--

LOCK TABLES `diagnosticos` WRITE;
/*!40000 ALTER TABLE `diagnosticos` DISABLE KEYS */;
INSERT INTO `diagnosticos` VALUES (1,4,'{\"total\":18,\"detalle\":[{\"preguntaId\":1,\"opcionId\":\"C\",\"score\":3},{\"preguntaId\":2,\"opcionId\":\"B\",\"score\":3},{\"preguntaId\":3,\"opcionId\":\"B\",\"score\":3},{\"preguntaId\":4,\"opcionId\":\"A\",\"score\":3},{\"preguntaId\":5,\"opcionId\":\"A\",\"score\":3},{\"preguntaId\":6,\"opcionId\":\"A\",\"score\":3}],\"nivel_sugerido_id\":3}',3,'2025-10-23 06:05:46'),(2,6,'{\"total\":0,\"detalle\":[],\"nivel_sugerido_id\":1,\"motivo\":\"omitido\"}',1,'2025-10-23 06:20:31');
/*!40000 ALTER TABLE `diagnosticos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ejercicios`
--

DROP TABLE IF EXISTS `ejercicios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ejercicios` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nivel_id` tinyint NOT NULL,
  `slug` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `titulo` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `objetivos_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `toolbox_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `criterios_exito_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `nivel_id` (`nivel_id`),
  CONSTRAINT `ejercicios_ibfk_1` FOREIGN KEY (`nivel_id`) REFERENCES `niveles` (`id`),
  CONSTRAINT `ejercicios_chk_1` CHECK (json_valid(`objetivos_json`)),
  CONSTRAINT `ejercicios_chk_2` CHECK (json_valid(`toolbox_json`)),
  CONSTRAINT `ejercicios_chk_3` CHECK (json_valid(`criterios_exito_json`))
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ejercicios`
--

LOCK TABLES `ejercicios` WRITE;
/*!40000 ALTER TABLE `ejercicios` DISABLE KEYS */;
INSERT INTO `ejercicios` VALUES (6,1,'if-mayoria-edad','Mayoría de edad','Si x >= 18 imprime \'Mayor de edad\', en caso contrario imprime \'Menor de edad\'.','{\"competencias\":[\"if\",\"else\",\"comparadores (>=)\"],\"tiempo_sugerido_min\":5}','{\"kind\":\"flyoutToolbox\",\"contents\":[{\"kind\":\"block\",\"type\":\"controls_if\"},{\"kind\":\"block\",\"type\":\"logic_compare\"},{\"kind\":\"block\",\"type\":\"logic_operation\"},{\"kind\":\"block\",\"type\":\"math_number\"},{\"kind\":\"block\",\"type\":\"math_arithmetic\"},{\"kind\":\"block\",\"type\":\"text\"},{\"kind\":\"block\",\"type\":\"text_join\"},{\"kind\":\"block\",\"type\":\"text_print\"},{\"kind\":\"block\",\"type\":\"variables_set\"},{\"kind\":\"block\",\"type\":\"variables_get\"}]}','{\"mustUse\":[\"if\",\"else\"],\"checks\":[{\"expr\":\"x>=18 => print(\'Mayor de edad\')\"},{\"expr\":\"x<18  => print(\'Menor de edad\')\"}],\"tests\":[{\"vars\":{\"x\":20},\"expectPrint\":\"Mayor de edad\"},{\"vars\":{\"x\":15},\"expectPrint\":\"Menor de edad\"}]}'),(7,1,'if-par-o-impar','Par o impar','Imprime \'Par\' si x % 2 == 0; de lo contrario imprime \'Impar\'.','{\"competencias\":[\"if\",\"else\",\"operador %\",\"==\"],\"tiempo_sugerido_min\":6}','{\"kind\":\"flyoutToolbox\",\"contents\":[{\"kind\":\"block\",\"type\":\"controls_if\"},{\"kind\":\"block\",\"type\":\"logic_compare\"},{\"kind\":\"block\",\"type\":\"logic_operation\"},{\"kind\":\"block\",\"type\":\"math_number\"},{\"kind\":\"block\",\"type\":\"math_arithmetic\"},{\"kind\":\"block\",\"type\":\"math_modulo\"},{\"kind\":\"block\",\"type\":\"text\"},{\"kind\":\"block\",\"type\":\"text_join\"},{\"kind\":\"block\",\"type\":\"text_print\"},{\"kind\":\"block\",\"type\":\"variables_set\"},{\"kind\":\"block\",\"type\":\"variables_get\"}]}','{\"mustUse\":[\"if\",\"else\"],\"checks\":[{\"expr\":\"x%2==0 => print(\'Par\')\"},{\"expr\":\"x%2!=0 => print(\'Impar\')\"}],\"tests\":[{\"vars\":{\"x\":4},\"expectPrint\":\"Par\"},{\"vars\":{\"x\":9},\"expectPrint\":\"Impar\"}]}'),(8,1,'if-max-de-dos','Máximo de dos números','Dados x y y, imprime el mayor.','{\"competencias\":[\"if\",\"else\",\"comparadores (>)\"],\"tiempo_sugerido_min\":6}','{\"kind\":\"flyoutToolbox\",\"contents\":[{\"kind\":\"block\",\"type\":\"controls_if\"},{\"kind\":\"block\",\"type\":\"logic_compare\"},{\"kind\":\"block\",\"type\":\"logic_operation\"},{\"kind\":\"block\",\"type\":\"math_number\"},{\"kind\":\"block\",\"type\":\"math_arithmetic\"},{\"kind\":\"block\",\"type\":\"text\"},{\"kind\":\"block\",\"type\":\"text_join\"},{\"kind\":\"block\",\"type\":\"text_print\"},{\"kind\":\"block\",\"type\":\"variables_set\"},{\"kind\":\"block\",\"type\":\"variables_get\"}]}','{\"mustUse\":[\"if\",\"else\"],\"checks\":[{\"expr\":\"x>y => print(x); else => print(y)\"}],\"tests\":[{\"vars\":{\"x\":7,\"y\":3},\"expectPrint\":\"7\"},{\"vars\":{\"x\":2,\"y\":5},\"expectPrint\":\"5\"}]}'),(9,1,'if-clasificar-temperatura','Clasificar temperatura','Imprime \'Frío\' (t<0), \'Templado\' (0<=t<=25) o \'Caliente\' (t>25).','{\"competencias\":[\"if\",\"else if\",\"else\",\"rangos\"],\"tiempo_sugerido_min\":7}','{\"kind\":\"flyoutToolbox\",\"contents\":[{\"kind\":\"block\",\"type\":\"controls_if\"},{\"kind\":\"block\",\"type\":\"logic_compare\"},{\"kind\":\"block\",\"type\":\"logic_operation\"},{\"kind\":\"block\",\"type\":\"math_number\"},{\"kind\":\"block\",\"type\":\"math_arithmetic\"},{\"kind\":\"block\",\"type\":\"text\"},{\"kind\":\"block\",\"type\":\"text_join\"},{\"kind\":\"block\",\"type\":\"text_print\"},{\"kind\":\"block\",\"type\":\"variables_set\"},{\"kind\":\"block\",\"type\":\"variables_get\"}]}','{\"mustUse\":[\"if\",\"else if\",\"else\"],\"checks\":[{\"expr\":\"x<0 => print(\'Frío\')\"},{\"expr\":\"0<=x && x<=25 => print(\'Templado\')\"},{\"expr\":\"x>25 => print(\'Caliente\')\"}],\"tests\":[{\"vars\":{\"x\":-3},\"expectPrint\":\"Frío\"},{\"vars\":{\"x\":12},\"expectPrint\":\"Templado\"},{\"vars\":{\"x\":30},\"expectPrint\":\"Caliente\"}]}'),(10,1,'if-descuento-monto','Descuento por monto','Si total >= 100 imprime \'Descuento aplicado\', en caso contrario \'Sin descuento\'.','{\"competencias\":[\"if\",\"else\",\"comparadores (>=)\"],\"tiempo_sugerido_min\":5}','{\"kind\":\"flyoutToolbox\",\"contents\":[{\"kind\":\"block\",\"type\":\"controls_if\"},{\"kind\":\"block\",\"type\":\"logic_compare\"},{\"kind\":\"block\",\"type\":\"logic_operation\"},{\"kind\":\"block\",\"type\":\"math_number\"},{\"kind\":\"block\",\"type\":\"math_arithmetic\"},{\"kind\":\"block\",\"type\":\"text\"},{\"kind\":\"block\",\"type\":\"text_join\"},{\"kind\":\"block\",\"type\":\"text_print\"},{\"kind\":\"block\",\"type\":\"variables_set\"},{\"kind\":\"block\",\"type\":\"variables_get\"}]}','{\"mustUse\":[\"if\",\"else\"],\"checks\":[{\"expr\":\"total>=100 => print(\'Descuento aplicado\')\"},{\"expr\":\"total<100  => print(\'Sin descuento\')\"}],\"tests\":[{\"vars\":{\"x\":120},\"expectPrint\":\"Descuento aplicado\"},{\"vars\":{\"x\":80},\"expectPrint\":\"Sin descuento\"}]}'),(11,2,'sw-dia-semana','Día de la semana','Dado x ∈ [1..7], imprime el nombre del día (1=Lunes, …, 7=Domingo).','{\"competencias\":[\"switch\",\"case\",\"default\"],\"tiempo_sugerido_min\":6}','{\"kind\":\"flyoutToolbox\",\"contents\":[{\"kind\":\"label\",\"text\":\"Variables\"},{\"kind\":\"block\",\"type\":\"variables_get\",\"fields\":{\"VAR\":\"x\"}},{\"kind\":\"block\",\"type\":\"variables_set\",\"fields\":{\"VAR\":\"x\"},\"inputs\":{\"VALUE\":{\"block\":{\"type\":\"math_number\",\"fields\":{\"NUM\":0}}}}},{\"kind\":\"sep\",\"gap\":10},{\"kind\":\"label\",\"text\":\"Switch\"},{\"kind\":\"block\",\"type\":\"switch_root\"},{\"kind\":\"block\",\"type\":\"switch_case_line\"},{\"kind\":\"block\",\"type\":\"switch_default_line\"},{\"kind\":\"sep\",\"gap\":10},{\"kind\":\"label\",\"text\":\"Salida\"},{\"kind\":\"block\",\"type\":\"text\"},{\"kind\":\"block\",\"type\":\"text_print\"}]}','{\"mustUse\":[\"switch\",\"case\"],\"tests\":[{\"vars\":{\"x\":1},\"expectPrint\":\"Lunes\"},{\"vars\":{\"x\":4},\"expectPrint\":\"Jueves\"},{\"vars\":{\"x\":7},\"expectPrint\":\"Domingo\"}]}'),(12,2,'sw-calificacion-letra','Calificación en letras','Dado x ∈ {\\\"A\\\",\\\"B\\\",\\\"C\\\",\\\"D\\\",\\\"F\\\"}, imprime: A=Excelente, B=Notable, C=Aprobado, D=Insuficiente, F=Reprobado.','{\"competencias\":[\"switch\",\"case\",\"cadenas\"],\"tiempo_sugerido_min\":6}','{\"kind\":\"flyoutToolbox\",\"contents\":[{\"kind\":\"block\",\"type\":\"variables_set\"},{\"kind\":\"block\",\"type\":\"variables_get\"},{\"kind\":\"block\",\"type\":\"text\"},{\"kind\":\"block\",\"type\":\"text_print\"}]}','{\"mustUse\":[\"switch\",\"case\"],\"tests\":[{\"vars\":{\"x\":\"A\"},\"expectPrint\":\"Excelente\"},{\"vars\":{\"x\":\"C\"},\"expectPrint\":\"Aprobado\"},{\"vars\":{\"x\":\"F\"},\"expectPrint\":\"Reprobado\"}]}'),(13,2,'sw-rango-nota','Rango de nota','Dado x ∈ [0..10]: 10-9=“Sobresaliente”, 8-7=“Notable”, 6=“Aprobado”, otro=“Insuficiente”.','{\"competencias\":[\"switch\",\"case\",\"agrupación de casos\"],\"tiempo_sugerido_min\":7}','{\"kind\":\"flyoutToolbox\",\"contents\":[{\"kind\":\"block\",\"type\":\"variables_set\"},{\"kind\":\"block\",\"type\":\"variables_get\"},{\"kind\":\"block\",\"type\":\"math_number\"},{\"kind\":\"block\",\"type\":\"text_print\"}]}','{\"mustUse\":[\"switch\",\"case\"],\"tests\":[{\"vars\":{\"x\":10},\"expectPrint\":\"Sobresaliente\"},{\"vars\":{\"x\":8},\"expectPrint\":\"Notable\"},{\"vars\":{\"x\":6},\"expectPrint\":\"Aprobado\"},{\"vars\":{\"x\":3},\"expectPrint\":\"Insuficiente\"}]}'),(14,2,'sw-mes-estacion','Mes a estación','Dado x ∈ [1..12], imprime la estación (ej.: 12,1,2=Invierno; 3,4,5=Primavera; 6,7,8=Verano; 9,10,11=Otoño).','{\"competencias\":[\"switch\",\"case\",\"default\"],\"tiempo_sugerido_min\":6}','{\"kind\":\"flyoutToolbox\",\"contents\":[{\"kind\":\"block\",\"type\":\"variables_set\"},{\"kind\":\"block\",\"type\":\"variables_get\"},{\"kind\":\"block\",\"type\":\"math_number\"},{\"kind\":\"block\",\"type\":\"text_print\"}]}','{\"mustUse\":[\"switch\",\"case\"],\"tests\":[{\"vars\":{\"x\":1},\"expectPrint\":\"Invierno\"},{\"vars\":{\"x\":7},\"expectPrint\":\"Verano\"},{\"vars\":{\"x\":10},\"expectPrint\":\"Otoño\"}]}'),(15,2,'sw-menu-simple','Menú simple','Dado x ∈ {1,2,3}, imprime: 1=“Nuevo”, 2=“Guardar”, 3=“Salir”; otro=“Opción inválida”.','{\"competencias\":[\"switch\",\"case\",\"default\"],\"tiempo_sugerido_min\":5}','{\"kind\":\"flyoutToolbox\",\"contents\":[{\"kind\":\"block\",\"type\":\"variables_set\"},{\"kind\":\"block\",\"type\":\"variables_get\"},{\"kind\":\"block\",\"type\":\"math_number\"},{\"kind\":\"block\",\"type\":\"text_print\"}]}','{\"mustUse\":[\"switch\",\"case\"],\"tests\":[{\"vars\":{\"x\":1},\"expectPrint\":\"Nuevo\"},{\"vars\":{\"x\":2},\"expectPrint\":\"Guardar\"},{\"vars\":{\"x\":3},\"expectPrint\":\"Salir\"},{\"vars\":{\"x\":9},\"expectPrint\":\"Opción inválida\"}]}'),(16,3,'for-suma-1-a-x','Suma de 1 a x','Calcula la suma de 1 hasta x (inclusive) y la imprime.','{\"competencias\":[\"for\",\"acumuladores\"],\"tiempo_sugerido_min\":7}','{\"kind\":\"flyoutToolbox\",\"contents\":[{\"kind\":\"block\",\"type\":\"controls_for\"},{\"kind\":\"block\",\"type\":\"math_number\"},{\"kind\":\"block\",\"type\":\"variables_set\"},{\"kind\":\"block\",\"type\":\"variables_get\"},{\"kind\":\"block\",\"type\":\"math_arithmetic\"},{\"kind\":\"block\",\"type\":\"text_print\"}]}','{\"mustUse\":[\"for\"],\"tests\":[{\"vars\":{\"x\":5},\"expectPrint\":\"15\"},{\"vars\":{\"x\":1},\"expectPrint\":\"1\"}]}'),(17,3,'while-cuenta-regresiva','Cuenta regresiva','Imprime una cuenta regresiva desde x hasta 1 y al final imprime “Despegue!”.','{\"competencias\":[\"while\",\"decremento\",\"salida final\"],\"tiempo_sugerido_min\":6}','{\"kind\":\"flyoutToolbox\",\"contents\":[{\"kind\":\"block\",\"type\":\"controls_whileUntil\"},{\"kind\":\"block\",\"type\":\"logic_compare\"},{\"kind\":\"block\",\"type\":\"math_number\"},{\"kind\":\"block\",\"type\":\"variables_set\"},{\"kind\":\"block\",\"type\":\"variables_get\"},{\"kind\":\"block\",\"type\":\"text_print\"}]}','{\"mustUse\":[\"while\"],\"tests\":[{\"vars\":{\"x\":3},\"expectPrint\":\"Despegue!\"},{\"vars\":{\"x\":1},\"expectPrint\":\"Despegue!\"}]}'),(18,3,'do-ajustar-multiplo-3','Ajustar al múltiplo de 3','Partiendo de x, réstale 1 en cada iteración hasta llegar a un múltiplo de 3 (incluyendo x si ya lo es). Imprime el valor final.','{\"competencias\":[\"do…while\",\"condiciones de parada\"],\"tiempo_sugerido_min\":7}','{\"kind\":\"flyoutToolbox\",\"contents\":[{\"kind\":\"block\",\"type\":\"controls_whileUntil\"},{\"kind\":\"block\",\"type\":\"variables_set\"},{\"kind\":\"block\",\"type\":\"variables_get\"},{\"kind\":\"block\",\"type\":\"math_number\"},{\"kind\":\"block\",\"type\":\"math_arithmetic\"},{\"kind\":\"block\",\"type\":\"logic_compare\"},{\"kind\":\"block\",\"type\":\"logic_operation\"},{\"kind\":\"block\",\"type\":\"text_print\"}]}','{\"mustUse\":[\"do\",\"while\"],\"tests\":[{\"vars\":{\"x\":7},\"expectPrint\":\"6\"},{\"vars\":{\"x\":9},\"expectPrint\":\"9\"}]}'),(19,3,'for-factorial','Factorial','Calcula x! (factorial) para x ≥ 0 e imprime el resultado.','{\"competencias\":[\"for\",\"acumuladores\",\"caso base\"],\"tiempo_sugerido_min\":8}','{\"kind\":\"flyoutToolbox\",\"contents\":[{\"kind\":\"block\",\"type\":\"controls_for\"},{\"kind\":\"block\",\"type\":\"math_number\"},{\"kind\":\"block\",\"type\":\"variables_set\"},{\"kind\":\"block\",\"type\":\"variables_get\"},{\"kind\":\"block\",\"type\":\"math_arithmetic\"},{\"kind\":\"block\",\"type\":\"text_print\"}]}','{\"mustUse\":[\"for\"],\"tests\":[{\"vars\":{\"x\":5},\"expectPrint\":\"120\"},{\"vars\":{\"x\":0},\"expectPrint\":\"1\"}]}'),(20,3,'while-suma-pares','Suma de pares','Suma todos los números pares desde 0 hasta x (inclusive) e imprime el total.','{\"competencias\":[\"while\",\"módulo (pares) sin bloque %\",\"acumuladores\"],\"tiempo_sugerido_min\":8}','{\"kind\":\"flyoutToolbox\",\"contents\":[{\"kind\":\"block\",\"type\":\"controls_whileUntil\"},{\"kind\":\"block\",\"type\":\"logic_compare\"},{\"kind\":\"block\",\"type\":\"logic_operation\"},{\"kind\":\"block\",\"type\":\"math_number\"},{\"kind\":\"block\",\"type\":\"math_arithmetic\"},{\"kind\":\"block\",\"type\":\"variables_set\"},{\"kind\":\"block\",\"type\":\"variables_get\"},{\"kind\":\"block\",\"type\":\"text_print\"}]}','{\"mustUse\":[\"while\"],\"tests\":[{\"vars\":{\"x\":6},\"expectPrint\":\"12\"},{\"vars\":{\"x\":1},\"expectPrint\":\"0\"}]}');
/*!40000 ALTER TABLE `ejercicios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `encuestas`
--

DROP TABLE IF EXISTS `encuestas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `encuestas` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nivel_id` tinyint NOT NULL,
  `nombre` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `preguntas_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  PRIMARY KEY (`id`),
  KEY `nivel_id` (`nivel_id`),
  CONSTRAINT `encuestas_ibfk_1` FOREIGN KEY (`nivel_id`) REFERENCES `niveles` (`id`),
  CONSTRAINT `encuestas_chk_1` CHECK (json_valid(`preguntas_json`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `encuestas`
--

LOCK TABLES `encuestas` WRITE;
/*!40000 ALTER TABLE `encuestas` DISABLE KEYS */;
/*!40000 ALTER TABLE `encuestas` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `encuestas_likert`
--

LOCK TABLES `encuestas_likert` WRITE;
/*!40000 ALTER TABLE `encuestas_likert` DISABLE KEYS */;
INSERT INTO `encuestas_likert` VALUES (7,6,6,1,5,5,'Gran inicio para esta plataforma, estoy muy motivado en seguir adelante.','2025-10-23 06:22:42'),(8,6,7,1,4,4,'Gran ejercicio muy didáctico, espero siga avanzando así.','2025-10-23 06:33:53'),(9,6,8,1,3,3,'Voy mejorando, ya tengo nociones básicas, esta plataforma me esta ayudando mucho.','2025-10-23 06:43:34'),(10,6,9,1,2,2,'Ejercicio un poco difícil, pero voy avanzando, por temas personales no podre continuar en un tiempo.','2025-10-23 07:09:08'),(11,6,10,1,1,1,'Me aleje un poco de la plataforma, regreso poco a poco.','2025-10-23 07:16:33'),(12,6,11,2,5,5,'Muy buen ejercicio para iniciar este nuevo nivel, estoy muy motivado.','2025-10-23 07:56:17');
/*!40000 ALTER TABLE `encuestas_likert` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `eventos`
--

DROP TABLE IF EXISTS `eventos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `eventos` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint DEFAULT NULL,
  `tipo` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `datos_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `creado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_usuario_tipo_fecha` (`usuario_id`,`tipo`,`creado_en`),
  CONSTRAINT `eventos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `eventos_chk_1` CHECK (json_valid(`datos_json`))
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `eventos`
--

LOCK TABLES `eventos` WRITE;
/*!40000 ALTER TABLE `eventos` DISABLE KEYS */;
/*!40000 ALTER TABLE `eventos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `niveles`
--

DROP TABLE IF EXISTS `niveles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `niveles` (
  `id` tinyint NOT NULL,
  `nombre` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `posicion` tinyint NOT NULL,
  `requisitos_min_ejercicios` int NOT NULL DEFAULT '5',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  UNIQUE KEY `posicion` (`posicion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `niveles`
--

LOCK TABLES `niveles` WRITE;
/*!40000 ALTER TABLE `niveles` DISABLE KEYS */;
INSERT INTO `niveles` VALUES (1,'Principiante',1,5),(2,'Intermedio',2,5),(3,'Avanzado',3,5);
/*!40000 ALTER TABLE `niveles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `preferencias_usuario`
--

DROP TABLE IF EXISTS `preferencias_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `preferencias_usuario` (
  `usuario_id` bigint NOT NULL,
  `idioma` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'es',
  `modo_contraste` enum('normal','alto') COLLATE utf8mb4_unicode_ci DEFAULT 'normal',
  `escala_fuente` decimal(3,2) DEFAULT '1.00',
  `tipografia` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT 'system-ui',
  PRIMARY KEY (`usuario_id`),
  CONSTRAINT `preferencias_usuario_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `preferencias_usuario`
--

LOCK TABLES `preferencias_usuario` WRITE;
/*!40000 ALTER TABLE `preferencias_usuario` DISABLE KEYS */;
INSERT INTO `preferencias_usuario` VALUES (4,'es','normal',1.00,'Roboto'),(5,'es','normal',1.00,'system-ui');
/*!40000 ALTER TABLE `preferencias_usuario` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `progreso`
--

LOCK TABLES `progreso` WRITE;
/*!40000 ALTER TABLE `progreso` DISABLE KEYS */;
INSERT INTO `progreso` VALUES (19,6,6,NULL,NULL,78,'{\"bloques\":8}','var x;\n\n\nif (x >= 18) {\n  console.log(\'Mayor de edad\');\n} else {\n  console.log(\'Menor de edad\');\n}\n',1,1,'2025-10-23 06:22:12'),(20,6,7,NULL,NULL,196,'{\"bloques\":10}','var x;\n\n\nif (x % 2 == 0) {\n  console.log(\'Par\');\n} else {\n  console.log(\'Impar\');\n}\n',1,1,'2025-10-23 06:33:19'),(21,6,8,NULL,NULL,82,'{\"bloques\":8}','var x, y;\n\n\nif (x > y) {\n  console.log(x);\n} else {\n  console.log(y);\n}\n',1,1,'2025-10-23 06:42:53'),(22,6,9,NULL,NULL,150,'{\"bloques\":13}','var x;\n\n\nif (x < 0) {\n  console.log(\'Frío\');\n} else if (x <= 25) {\n  console.log(\'Templado\');\n} else {\n  console.log(\'Caliente\');\n}\n',1,1,'2025-10-23 07:08:33'),(23,6,10,NULL,NULL,58,'{\"bloques\":8}','var x;\n\n\nif (x >= 100) {\n  console.log(\'Descuento aplicado\');\n} else {\n  console.log(\'Sin descuento\');\n}\n',1,1,'2025-10-23 07:16:04'),(24,6,11,NULL,NULL,229,'{\"bloques\":30}','var x;\n\n\nswitch (x) {\n  case 1:\n  console.log(\'Lunes\');\n    break;\n  case 2:\n  console.log(\'Martes\');\n    break;\n  case 3:\n  console.log(\'Miercoles\');\n    break;\n  case 4:\n  console.log(\'Jueves\');\n    break;\n  case 5:\n  console.log(\'Viernes\');\n    break;\n  case 6:\n  console.log(\'Sabado\');\n    break;\n  case 7:\n  console.log(\'Domingo\');\n    break;\n}\n',1,1,'2025-10-23 07:55:56');
/*!40000 ALTER TABLE `progreso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `progreso_resumen`
--

DROP TABLE IF EXISTS `progreso_resumen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `progreso_resumen` (
  `usuario_id` int NOT NULL,
  `ejercicio_id` int NOT NULL,
  `exito` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`usuario_id`,`ejercicio_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `progreso_resumen`
--

LOCK TABLES `progreso_resumen` WRITE;
/*!40000 ALTER TABLE `progreso_resumen` DISABLE KEYS */;
INSERT INTO `progreso_resumen` VALUES (6,6,1),(6,7,1),(6,8,1),(6,9,1),(6,10,1),(6,11,1);
/*!40000 ALTER TABLE `progreso_resumen` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reglas_nivel`
--

DROP TABLE IF EXISTS `reglas_nivel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reglas_nivel` (
  `nivel_id` tinyint NOT NULL,
  `min_ejercicios_completados` int NOT NULL,
  `encuesta_requerida` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`nivel_id`),
  CONSTRAINT `reglas_nivel_ibfk_1` FOREIGN KEY (`nivel_id`) REFERENCES `niveles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reglas_nivel`
--

LOCK TABLES `reglas_nivel` WRITE;
/*!40000 ALTER TABLE `reglas_nivel` DISABLE KEYS */;
INSERT INTO `reglas_nivel` VALUES (1,2,1),(2,2,1),(3,2,0);
/*!40000 ALTER TABLE `reglas_nivel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `respuestas_encuesta`
--

DROP TABLE IF EXISTS `respuestas_encuesta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `respuestas_encuesta` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `encuesta_id` bigint NOT NULL,
  `usuario_id` bigint NOT NULL,
  `respuestas_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `creado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_usuario_encuesta` (`encuesta_id`,`usuario_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `respuestas_encuesta_ibfk_1` FOREIGN KEY (`encuesta_id`) REFERENCES `encuestas` (`id`),
  CONSTRAINT `respuestas_encuesta_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `respuestas_encuesta_chk_1` CHECK (json_valid(`respuestas_json`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `respuestas_encuesta`
--

LOCK TABLES `respuestas_encuesta` WRITE;
/*!40000 ALTER TABLE `respuestas_encuesta` DISABLE KEYS */;
/*!40000 ALTER TABLE `respuestas_encuesta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` tinyint NOT NULL,
  `nombre` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'admin'),(2,'estudiante');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sesiones_login`
--

DROP TABLE IF EXISTS `sesiones_login`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sesiones_login` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint NOT NULL,
  `ip` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_usuario` (`usuario_id`),
  CONSTRAINT `fk_sesiones_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sesiones_login`
--

LOCK TABLES `sesiones_login` WRITE;
/*!40000 ALTER TABLE `sesiones_login` DISABLE KEYS */;
INSERT INTO `sesiones_login` VALUES (49,4,'::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-23 06:05:10'),(50,4,'::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-23 06:06:07'),(51,5,'::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-23 06:15:22'),(52,5,'::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-23 06:16:18'),(53,6,'::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-23 06:20:28'),(54,6,'::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-23 06:20:49'),(55,5,'::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-23 06:23:04'),(56,6,'::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-23 06:25:31'),(57,6,'::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-23 06:25:50'),(58,5,'::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-23 06:26:18'),(59,6,'::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-23 06:30:00'),(60,5,'::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-23 06:38:52'),(61,6,'::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-23 06:41:27'),(62,5,'::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-23 06:43:59'),(63,6,'::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-23 07:05:59'),(64,5,'::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-23 07:09:30'),(65,6,'::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-23 07:12:29'),(66,5,'::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-23 07:14:25'),(67,6,'::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-23 07:15:03'),(68,5,'::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-23 07:17:00'),(69,6,'::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-23 07:43:43'),(70,5,'::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-23 07:45:07'),(71,6,'::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-23 07:45:44'),(72,5,'::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-23 07:46:49'),(73,6,'::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-23 07:47:45'),(74,5,'::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-23 07:51:29'),(75,6,'::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-23 07:52:04'),(76,5,'::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-25 01:19:03'),(77,6,'::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-25 01:21:16'),(78,5,'::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-25 01:42:31'),(79,6,'::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-25 01:51:57'),(80,5,'::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-25 01:52:55');
/*!40000 ALTER TABLE `sesiones_login` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tokens_recuperacion`
--

DROP TABLE IF EXISTS `tokens_recuperacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tokens_recuperacion` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expira_en` datetime NOT NULL,
  `usado` tinyint(1) DEFAULT '0',
  `creado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_token` (`token`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `tokens_recuperacion_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tokens_recuperacion`
--

LOCK TABLES `tokens_recuperacion` WRITE;
/*!40000 ALTER TABLE `tokens_recuperacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `tokens_recuperacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre_completo` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `correo` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contrasena_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol_id` tinyint NOT NULL DEFAULT '2',
  `nivel_actual_id` tinyint NOT NULL DEFAULT '1',
  `creado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `correo` (`correo`),
  KEY `rol_id` (`rol_id`),
  KEY `nivel_actual_id` (`nivel_actual_id`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `usuarios_ibfk_2` FOREIGN KEY (`nivel_actual_id`) REFERENCES `niveles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (4,'Kevin Sunuc','kevinsunuct@gmail.com','$2b$10$LKK6sC.ZUgEEtgkFWxTCuech717zAwbbAzQu95YzdFt58OJPNzUZi',2,3,'2025-10-23 06:04:36','2025-10-23 06:05:46'),(5,'Kevin Admin','heysel2030@hotmail.com','$2b$10$xcrjT.5wCUjoQ56MybnerOyKgUSIT/0Fd9XzE2.bGX50eL.YOQGz2',1,1,'2025-10-23 06:10:37','2025-10-23 06:14:57'),(6,'Fernando Chali','fernando29chali@gmail.com','$2b$10$nhTgXyDzRzMQ74FyVObGL.er1zEeN999E0OdhxSiFBgvMlLkZrniO',2,2,'2025-10-23 06:20:09','2025-10-23 07:16:04');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-24 20:03:41
