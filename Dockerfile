# ==== Building Stage ================================================

# ---- Base Node ----------
# Create the image based on the official latest 8.x LTS image from Dockerhub
FROM node:carbon-alpine as base

# Change directory so that our commands run inside this new directory
WORKDIR /app

# Copy dependency definitions
COPY package.json .
COPY . .

#
# ---- Dependencies ----
FROM base AS dependencies
# install node packages
RUN npm install --only=production 
# copy production node_modules aside
RUN cp -R node_modules prod_node_modules
# install ALL node_modules, including 'devDependencies'
RUN npm install

#
# ---- Test ----------
FROM dependencies AS test

# Unit test and coverage
RUN npm run test:coverage
# Test for vulnerability
# RUN npm audit


#
# ---- Release -------
FROM base AS release
# copy production node_modules
COPY --from=dependencies /app/prod_node_modules ./node_modules

EXPOSE 8080
CMD ["npm", "start"]
