FROM node:12 AS builder
WORKDIR /root/app
COPY package.json .
COPY package-lock.json .
RUN npm set progress=false
RUN npm ci --only=production
RUN npm cache verify
COPY . .

FROM gcr.io/distroless/nodejs
COPY --from=builder /root/app /
EXPOSE 8080
CMD ["app.js"]
#TODO: https://learnk8s.io/blog/smaller-docker-images