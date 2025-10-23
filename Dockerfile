# Use Node.js 18 Alpine
FROM node:18-alpine

# Install dependencies for building
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Copy package.json first
COPY package.json ./

# Install dependencies without lockfile to avoid sync issues
RUN npm install

# Copy source code
COPY . .

# Set environment variables for build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --omit=dev

# Expose port
EXPOSE 3000

# Set runtime environment
ENV PORT=3000

# Start the application
CMD ["npm", "start"]
