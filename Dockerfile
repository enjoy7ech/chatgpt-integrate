from node:16-slim

workdir /app
copy . .
run npm i serve -g && npm i && npm run build

cmd ["serve", "-l", "8080", "./dist"]
expose 8080


