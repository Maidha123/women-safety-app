# 1. Node.js ka image use karein
FROM node:18

# 2. App directory banayein
WORKDIR /app

# 3. Dependencies copy aur install karein
COPY package*.json ./
RUN npm install

# 4. Baaki saara code copy karein
COPY . .

# 5. Hugging Face default port 7860 use karta hai
ENV PORT=7860
EXPOSE 7860

# 6. App start karne ki command
CMD ["npm", "start"]