#!/bin/bash

# Fix imports for UI components
find ./src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/ui/Card|@/components/ui/card|g'
find ./src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/ui/CardComponents|@/components/ui/card|g'

# Fix auth provider imports
find ./src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/auth/AuthProvider|@/components/auth/AuthProvider|g'

# Fix other UI component imports
find ./src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/ui/Button|@/components/ui/button|g'
find ./src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/ui/Calendar|@/components/ui/calendar|g'
find ./src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/ui/Popover|@/components/ui/popover|g'
find ./src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/ui/Alert|@/components/ui/alert|g'
find ./src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/ui/Separator|@/components/ui/separator|g'
find ./src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/ui/Tabs|@/components/ui/tabs|g'

# Make the script executable
chmod +x fix-component-imports.sh
