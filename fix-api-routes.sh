#!/bin/bash

# This script adds export const dynamic = 'force-dynamic' to all API route.ts files
# to ensure they work correctly with Next.js static site generation

# Set colors for console output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting API route configuration fix...${NC}"

# Find all API route.ts files
API_ROUTES=$(find ./src/app/api -name "route.ts")

# Counter for modified files
MODIFIED=0

for route in $API_ROUTES; do
  echo -e "Processing ${GREEN}$route${NC}"
  
  # Check if dynamic export already exists
  if grep -q "export const dynamic" "$route"; then
    echo -e "${YELLOW}Already has dynamic export, skipping...${NC}"
    continue
  fi
  
  # Add the dynamic export after imports or at the beginning if no imports
  if grep -q "^import" "$route"; then
    # Add after the last import statement
    sed -i '' -e '/^import.*$/!b;:a;n;/^import.*$/ba;i\
export const dynamic = "force-dynamic";
' "$route"
  else
    # Add at the beginning of the file
    sed -i '' -e '1s/^/export const dynamic = "force-dynamic";\n\n/' "$route"
  fi
  
  echo -e "${GREEN}Modified $route${NC}"
  MODIFIED=$((MODIFIED+1))
done

echo -e "${GREEN}Completed! Modified $MODIFIED API route files${NC}" 