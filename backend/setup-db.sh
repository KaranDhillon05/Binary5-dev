#!/bin/bash
# Q-Shield Database Setup Script

echo "🛡️  Q-Shield Database Setup"
echo "=========================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}This script will help you set up the PostgreSQL database for Q-Shield.${NC}"
echo ""
echo "You'll need to know your PostgreSQL password for the 'postgres' user."
echo "If you just installed PostgreSQL, you may need to set it up first."
echo ""

# Prompt for password
read -sp "Enter PostgreSQL password for user 'postgres': " PGPASSWORD
echo ""

export PGPASSWORD

# Test connection
echo -e "\n${YELLOW}Testing PostgreSQL connection...${NC}"
if psql -U postgres -h localhost -c "SELECT version();" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Connected to PostgreSQL successfully!${NC}"
else
    echo -e "${RED}✗ Failed to connect to PostgreSQL.${NC}"
    echo ""
    echo "Troubleshooting steps:"
    echo "1. Make sure PostgreSQL is running"
    echo "2. Check your password"
    echo "3. Try running: /Library/PostgreSQL/18/bin/psql -U postgres"
    echo ""
    exit 1
fi

# Create database
echo -e "\n${YELLOW}Creating database 'qshield'...${NC}"
if psql -U postgres -h localhost -c "CREATE DATABASE qshield;" 2>&1 | grep -q "already exists"; then
    echo -e "${YELLOW}Database 'qshield' already exists, skipping creation.${NC}"
else
    echo -e "${GREEN}✓ Database 'qshield' created successfully!${NC}"
fi

# Run schema
echo -e "\n${YELLOW}Running schema migrations...${NC}"
if psql -U postgres -h localhost -d qshield -f src/db/schema.sql > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Schema created successfully!${NC}"
else
    echo -e "${RED}✗ Failed to create schema.${NC}"
    exit 1
fi

# Update .env file
echo -e "\n${YELLOW}Updating .env file...${NC}"
if [ -f .env ]; then
    # Update DATABASE_URL in .env
    sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=postgresql://postgres:${PGPASSWORD}@localhost:5432/qshield|" .env
    echo -e "${GREEN}✓ .env file updated!${NC}"
else
    echo -e "${RED}✗ .env file not found!${NC}"
    exit 1
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Database setup complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "You can now start the backend with:"
echo "  npm run dev"
echo ""
