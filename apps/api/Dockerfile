FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY ../shared /shared
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "run", "dev"]

