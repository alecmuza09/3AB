#!/bin/bash

# ============================================
# Script de Migración de Base de Datos
# 3A Branding - Supabase
# ============================================

set -e

echo "🚀 Iniciando migración de base de datos..."
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que las variables de entorno estén configuradas
if [ -z "$DATABASE_URL" ]; then
  echo -e "${YELLOW}⚠️  DATABASE_URL no está configurada${NC}"
  echo "Por favor, configura DATABASE_URL en tu archivo .env.local"
  echo "Formato: postgresql://postgres:[password]@db.ecamhibpenoruquwftqe.supabase.co:5432/postgres"
  exit 1
fi

# Verificar que psql esté instalado
if ! command -v psql &> /dev/null; then
  echo -e "${RED}❌ psql no está instalado${NC}"
  echo "Por favor, instala PostgreSQL client tools"
  exit 1
fi

echo -e "${GREEN}✅ Variables de entorno configuradas${NC}"
echo ""

# Ejecutar schema.sql
echo -e "${YELLOW}📝 Ejecutando schema.sql...${NC}"
psql "$DATABASE_URL" -f supabase/schema.sql

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Schema creado exitosamente${NC}"
else
  echo -e "${RED}❌ Error al ejecutar schema.sql${NC}"
  exit 1
fi

echo ""

# Ejecutar rls-policies.sql
echo -e "${YELLOW}🔐 Ejecutando políticas RLS...${NC}"
psql "$DATABASE_URL" -f supabase/rls-policies.sql

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Políticas RLS configuradas exitosamente${NC}"
else
  echo -e "${RED}❌ Error al ejecutar rls-policies.sql${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}🎉 Migración completada exitosamente!${NC}"
echo ""
echo "Próximos pasos:"
echo "1. Verifica las tablas en el Dashboard de Supabase"
echo "2. Configura el almacenamiento de archivos si es necesario"
echo "3. Prueba la conexión desde tu aplicación"

