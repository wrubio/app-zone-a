# specify a base image
FROM node:12.16.1-alpine

# Set the working direco¡tory
WORKDIR /usr/app

# install some dependecies
COPY ./package.json ./
RUN apk --no-cache add g++ gcc libgcc libstdc++ linux-headers make python
RUN npm install --quiet node-gyp -g
RUN npm install

# copy projects files
COPY ./ ./

# expose port
EXPOSE 1883

# default command
CMD ["npm", "start"]