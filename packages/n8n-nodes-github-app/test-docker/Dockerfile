FROM n8nio/n8n:latest

USER root

# Copy the custom node files to the node user's home directory
COPY dist/nodes /home/node/.n8n/custom/nodes
COPY dist/credentials /home/node/.n8n/custom/credentials
COPY package.json /home/node/.n8n/custom/package.json

# Install node dependencies
WORKDIR /home/node/.n8n/custom
RUN npm install --production

# Fix permissions for node user
RUN chown -R node:node /home/node/.n8n

# Set working directory back
WORKDIR /data

USER node
