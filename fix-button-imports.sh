#!/bin/bash

# Script to fix Button import casing issues

# Find all files with the incorrect import
find /Users/ashwin/My\ projects/Alumni/From\ Scratch/alumni-management-system -type f -name "*.tsx" -exec grep -l "@/components/ui/button" {} \; > files_to_fix.txt

# Replace the imports in each file
while IFS= read -r file; do
  echo "Fixing imports in $file"
  sed -i '' 's|@/components/ui/button|@/components/ui/Button|g' "$file"
done < files_to_fix.txt

# Clean up
rm files_to_fix.txt

echo "Import casing fixes complete!"
