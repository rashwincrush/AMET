#!/bin/bash

# Fix all UI component imports to use lowercase
find ./src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/ui/Button|@/components/ui/button|g'
find ./src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/ui/Card|@/components/ui/card|g'
find ./src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/ui/CardComponents|@/components/ui/card|g'
find ./src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/ui/Calendar|@/components/ui/calendar|g'
find ./src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/ui/Popover|@/components/ui/popover|g'
find ./src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/ui/Alert|@/components/ui/alert|g'
find ./src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/ui/Separator|@/components/ui/separator|g'
find ./src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/ui/Tabs|@/components/ui/tabs|g'
find ./src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/ui/Flex|@/components/ui/flex|g'
find ./src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/ui/Grid|@/components/ui/grid|g'
find ./src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/ui/Header|@/components/ui/header|g'
find ./src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/ui/Container|@/components/ui/container|g'
find ./src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/ui/Loading|@/components/ui/loading|g'
find ./src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/ui/PageHeader|@/components/ui/page-header|g'

# Fix auth provider imports
find ./src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/auth/AuthProvider|@/components/auth/AuthProvider|g'

echo "Fixed all import paths"
