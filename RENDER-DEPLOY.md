# Deploying the Backend to Render.com

This guide provides step-by-step instructions for deploying the Data Playground backend to Render.com.

## Prerequisites

1. A [Render.com account](https://render.com/signup) (free tier is sufficient)
2. A [MongoDB Atlas account](https://www.mongodb.com/cloud/atlas/register) (free tier is sufficient)
3. Your code pushed to a GitHub repository

## Step 1: Set up MongoDB Atlas

1. Create a free MongoDB Atlas account if you don't have one
2. Create a new cluster (the free tier M0 is sufficient)
3. Set up database access:
   - Create a database user with password authentication
   - Note down the username and password
4. Set up network access:
   - Add `0.0.0.0/0` to allow access from anywhere
5. Get your connection string:
   - Go to "Connect" > "Connect your application"
   - Copy the connection string (it will look like `mongodb+srv://username:password@cluster.mongodb.net/`)
   - Replace `<username>` and `<password>` with your database user credentials

## Step 2: Deploy to Render.com

### Option 1: Manual Setup

1. Log in to [Render.com](https://render.com)
2. Click "New" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: data-playground-backend (or any name you prefer)
   - **Root Directory**: backend
   - **Environment**: Node
   - **Region**: Choose the region closest to your users
   - **Branch**: main (or your default branch)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string (you can generate one with `openssl rand -base64 32`)
   - `REGISTRATION_CODE`: Your registration code for new users
   - `NODE_ENV`: production
   - `PORT`: 8080
6. Click "Create Web Service"

### Option 2: Using render.yaml (Blueprint)

1. Make sure the `render.yaml` file is in your repository
2. Log in to [Render.com](https://render.com)
3. Click "New" and select "Blueprint"
4. Connect your GitHub repository
5. Render will automatically detect the `render.yaml` file and set up the service
6. You'll need to manually add the secret environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `REGISTRATION_CODE`
7. Click "Apply" to create the service

## Step 3: Verify Deployment

1. Once deployed, Render will provide a URL for your service (e.g., `https://data-playground-backend.onrender.com`)
2. Test the API by visiting `https://your-service-url/api/health`
3. You should see a JSON response indicating the server is running

## Step 4: Update Frontend Configuration

1. Update your frontend to use the new backend URL:
   - In your frontend code, set the API URL to your Render.com service URL
   - For local development, you can continue using your local backend

## Troubleshooting

- **Build Failures**: Check the build logs for specific errors
- **Connection Issues**: Make sure your MongoDB Atlas connection string is correct
- **CORS Errors**: Ensure your backend CORS configuration allows requests from your frontend domain
- **Startup Errors**: Check the logs for any errors during application startup

## Free Tier Limitations

On Render's free tier:
- Your service will spin down after 15 minutes of inactivity
- The first request after inactivity may take up to 30 seconds to respond
- You get 750 hours of runtime per month

For a personal project with minimal traffic, these limitations should not be a problem. 