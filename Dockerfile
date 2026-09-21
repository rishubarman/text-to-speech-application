# ---- Stage 1: build the React frontend ----
FROM node:22 AS frontend-build

WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ---- Stage 2: build the Spring Boot backend (with the frontend bundled in) ----
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY pom.xml .
COPY src ./src

# Spring Boot serves anything in resources/static at "/"
COPY --from=frontend-build /frontend/dist ./src/main/resources/static

RUN mvn clean package -DskipTests

# ---- Stage 3: run ----
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

CMD ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]