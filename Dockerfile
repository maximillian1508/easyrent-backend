# Dockerfile for development environment
# Pulling an existing image from docker hub
FROM node:20-alpine3.17 AS development

# Set a working directory in a container
WORKDIR /app

# Copy the package.json file from local directory into container current directory
COPY package.json .

# Run this command to install dependencies
RUN npm install

# Run this command to install nodemon in a global development environment
RUN npm install -g nodemon

# Copy whole files from local directory into container current directory
COPY . ./

EXPOSE 4001

# Run this command to start the application
CMD ["npm", "run", "dev"]

# Dockerfile for staging environement
FROM node:20-alpine3.17 AS staging

WORKDIR /app

COPY package.json .

RUN npm install --only=production

COPY --from=development /app ./

EXPOSE 4001

CMD ["npm", "start"]
