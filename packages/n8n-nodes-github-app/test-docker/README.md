# Docker Testing Environment

This directory contains Docker configuration for testing the GitHub App custom node locally.

## Prerequisites

- Docker and Docker Compose installed
- The node must be built before running Docker (`npm run build` from parent directory)

## Quick Start

1. Build the node:
   ```bash
   cd ..
   npm install
   npm run build
   ```

2. Start n8n with the custom node:
   ```bash
   cd test-docker
   docker-compose up --build
   ```

3. Access n8n at http://localhost:5678
   - Username: `admin`
   - Password: `admin`

4. The GitHub App node should appear in the nodes panel

## Rebuild After Changes

If you make changes to the node:

```bash
# Stop the container
docker-compose down

# Rebuild the node
cd ..
npm run build

# Restart the container
cd test-docker
docker-compose up --build
```

## Clean Up

To remove all containers and volumes:

```bash
docker-compose down -v
```
