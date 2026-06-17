#!/bin/sh
set -e

# Apply any pending migrations before the app starts. For a stricter separated
# deploy pipeline, run this as its own release step instead and drop it here.
echo "Applying database migrations..."
npx prisma migrate deploy

exec "$@"
