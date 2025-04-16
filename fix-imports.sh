#!/bin/bash

# Find all files that import card.tsx and replace with Card.tsx
grep -rl "@/components/ui/Card" . | while read file; do
    sed -i '' 's|@/components/ui/Card|@/components/ui/Card|g' "$file"
done

# Find all files that import cardComponents.tsx and replace with CardComponents.tsx
grep -rl "@/components/ui/CardComponents" . | while read file; do
    sed -i '' 's|@/components/ui/CardComponents|@/components/ui/CardComponents|g' "$file"
done
