FROM node:18 AS build

WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Use npm ci for more deterministic builds
RUN npm ci

# Copy the rest of the code
COPY . .

# Copy production env file
COPY .env.production .env

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]