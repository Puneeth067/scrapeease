#!/bin/bash

echo "🚀 Deploying ScrapeEase to production..."

# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy with zero downtime
docker-compose -f docker-compose.prod.yml up -d

# Clean up old images
docker image prune -f

echo "✅ Deployment completed!"