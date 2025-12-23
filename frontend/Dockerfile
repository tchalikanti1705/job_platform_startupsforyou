# Frontend Dockerfile - React
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package.json yarn.lock* ./

# Install dependencies
RUN yarn install --frozen-lockfile || yarn install

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start the development server
CMD ["yarn", "start"]
