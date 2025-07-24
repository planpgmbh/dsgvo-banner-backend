FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
# Copy backend files
COPY . ./backend
RUN npm install
# Expose the port the app runs on
EXPOSE 3001
# Start the backend server
CMD ["npm", "run", "backend"]
