# Development stage
FROM node:20.18.0-alpine AS development

WORKDIR /usr/src/app

# Copy package files
COPY --chown=root:root package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of the app files
COPY --chown=root:root . .

# Set environment variables for hot reload
ENV NODE_ENV=development

# Build stage
FROM node:20.18.0-alpine AS build

WORKDIR /usr/src/app

# Copy necessary files for the build
COPY --chown=root:root package.json yarn.lock ./

# Copy node_modules from development
COPY --chown=root:root --from=development /usr/src/app/node_modules ./node_modules

# Copy app files and build the app
COPY --chown=root:root . .
RUN yarn build

# Install only production dependencies
RUN yarn install --production --frozen-lockfile

# Production stage
FROM node:20.18.0-slim AS production

# Install required build dependencies for isolate
RUN apt-get update && apt-get install -y \
  libcap-dev \
  asciidoc \
  build-essential \
  pkg-config \
  libsystemd-dev \
  git \
  gcc \
  g++ \
  make \
  openjdk-17-jdk \
  libxml2-utils \
  --no-install-recommends && \
  apt-get clean && rm -rf /var/lib/apt/lists/*

# Clone and build isolate
RUN git clone https://github.com/ioi/isolate.git && \
  cd isolate && \
  make install && \
  rm -rf /isolate

WORKDIR /usr/src/app
# Copy the built app and node_modules from the build stage
COPY --chown=root:root --from=build /usr/src/app/dist ./dist
COPY --chown=root:root --from=build /usr/src/app/node_modules ./node_modules

# Set the node user for running the app
USER root

# Expose the port
EXPOSE 3002

# Start the app with nodemon
CMD ["node", "dist/server.js"]
