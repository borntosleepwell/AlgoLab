# Step 1: Build the React application
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . ./
RUN npm run build

# Step 2: Serve the application using Nginx
FROM nginx:alpine
# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*
# Copy static assets from builder stage
COPY --from=build /app/dist /usr/share/nginx/html
# Copy custom nginx config for React Router and Cloud Run (port 8080)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cloud Run expects the container to listen on port 8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
