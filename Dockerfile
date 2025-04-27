# Use Node.js as base image for frontend
FROM node:18-alpine AS frontend-builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy frontend source code
COPY . .

# Build the Next.js app
RUN npm run build

# Use Python for backend
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy built frontend
COPY --from=frontend-builder /app/.next ./.next
COPY --from=frontend-builder /app/public ./public
COPY --from=frontend-builder /app/package.json ./package.json
COPY --from=frontend-builder /app/node_modules ./node_modules

# Copy backend code
COPY backend ./backend

# Install backend dependencies
RUN cd backend && pip install -r requirements.txt

# Create necessary directories
RUN mkdir -p backend/data/documents

# Expose ports
EXPOSE 3000 8000

# Create startup script
RUN echo '#!/bin/bash\nnpm start & cd backend && uvicorn main:app --host 0.0.0.0 --port 8000' > start.sh && chmod +x start.sh

# Start both services
CMD ["./start.sh"]
