# Vercel Clone

This project simulates a simplified version of Vercel's deployment process using React for the frontend, Node.js and Express for backend APIs, and Cloudflare R2 (or any S3-compatible storage) for storing and serving the deployed projects.  It allows users to deploy a frontend application from a GitHub repository.

## Architecture

The system consists of three main components:

1. **Frontend (port 3000):** A React application where users provide the GitHub repository URL. This component triggers the deployment process.
2. **Upload Server (port 3000):**  This server handles the cloning of the GitHub repository, uploads the project files to R2 storage, and queues a build job using Redis.
3. **Deploy Server (runs continuously):**  This server listens for build jobs from the Redis queue, downloads the project files from R2, builds the project, and uploads the built artifacts back to R2.
4. **Request Server (port 3001):** Serves the deployed projects based on the hostname.

## Installation

### Prerequisites

- Node.js and npm (or yarn)
- Redis server running locally
- Cloudflare R2 account (or any S3-compatible storage) with appropriate credentials configured as environment variables.

### Frontend

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Upload Server (vercel-upload)

1. Navigate to the `vercel-upload` directory:
   ```bash
   cd vercel-upload
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Deploy Server (vercel-deploy)

1. Navigate to the `vercel-deploy` directory:
   ```bash
   cd vercel-deploy
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Request Server (vercel-request)

1. Navigate to the `vercel-request` directory:
   ```bash
   cd vercel-request
   ```
2. Install dependencies:
   ```bash
   npm install
   ```


## Run Locally

1. **Start Redis:** Ensure your Redis server is running.

2. **Environment Variables:**
    * Create a `.env` file in each of the `vercel-upload`, `vercel-deploy`, and `vercel-request` directories. Add the following environment variables, replacing the placeholders with your actual R2 credentials:

   ```
   S3_ACCESS_KEY_ID=<your-r2-access-key-id>
   S3_SECRET_ACCESS_KEY=<your-r2-secret-access-key>
   S3_ENDPOINT=<your-r2-endpoint>  (e.g., https://<your-account>.r2.cloudflarestorage.com)
   ```

3. **Start the Upload Server:**
   ```bash
   cd vercel-upload
   npm run dev
   ```

4. **Start the Deploy Server:**
   ```bash
   cd vercel-deploy
   npm run dev
   ```

5. **Start the Request Server:**
   ```bash
   cd vercel-request
   npm run dev
   ```

6. **Start the Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

7. Open your browser and go to `http://localhost:5173/`.


## API Routes and Dummy JSON Responses

### Upload Server

**POST /deploy**

**Request (dummy):**

```json
{
  "repoUri": "https://github.com/your-username/your-repo-name"
}
```

**Response (dummy):**

```json
{
  "id": "a1b2c3d4"
}
```


**GET /status**

**Request (dummy):**

```
?id=a1b2c3d4
```

**Response (dummy):**

```json
{
  "status": "deployed" 
}
```
Possible status values: `"uploaded"`, `"building"`, `"deployed"`.


### Request Server

**GET /***

This route serves the static files of the deployed application from R2 storage. The subdomain of the request is used to determine which project to serve.  No specific JSON response is applicable here, as this server delivers static HTML, CSS, and JavaScript files.  Instead, it responds with the content of the requested file.


## Project Description

This project provides a simplified platform for deploying frontend applications. It demonstrates a fundamental workflow for automated deployments, including cloning from GitHub, building the project, storing artifacts on a cloud storage service, and serving them based on unique subdomains.  It's a valuable example for learning about continuous deployment principles and interacting with cloud storage using the AWS SDK.
```
