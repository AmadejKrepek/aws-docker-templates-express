FROM node:15-alpine

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY tsconfig.json ./
# Copy everything inside src folder
COPY src ./src

CMD ["apidoc -i src/routes/ -o doc/"]

#Install all of the application’s dependencies
RUN npm install
#Builds the project inside the image
RUN npm run build


# Bundle app source (Then we just copy the rest, which concludes our build)
COPY . .

EXPOSE 8000
CMD [ "node", "built/server.js" ]