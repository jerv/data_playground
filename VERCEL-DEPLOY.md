# Deploying the Frontend to Vercel

This guide provides step-by-step instructions for deploying the Data Playground frontend to Vercel, now that the backend is running on Render.com.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup) (free tier is sufficient)
2. Your backend already deployed on Render.com
3. Your code pushed to a GitHub repository

## Step 1: Update Environment Configuration

Before deploying, make sure your frontend is configured to connect to your Render.com backend:

1. Update the `.env.production` file in the webapp directory:
   ```
   REACT_APP_API_URL=https://your-backend-service.onrender.com/api
   GENERATE_SOURCEMAP=false
   ```
2. Replace `your-backend-service` with your actual Render.com service URL
3. Commit and push these changes to your GitHub repository

## Step 2: Deploy to Vercel

### Option 1: Using the Vercel Dashboard

1. Log in to [Vercel](https://vercel.com)
2. Click "Add New" > "Project"
3. Connect your GitHub repository
4. Configure the project:
   - Framework Preset: Create React App
   - Root Directory: ./
   - Build Command: `cd webapp && npm install && npm run build`
   - Output Directory: webapp/build
5. Click "Deploy"

### Option 2: Using the Vercel CLI

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```
2. Log in to Vercel:
   ```bash
   vercel login
   ```
3. Navigate to your project directory and deploy:
   ```bash
   vercel
   ```
4. Follow the prompts to configure your deployment

## Step 3: Verify Deployment

1. Once deployed, Vercel will provide a URL for your frontend (e.g., `https://data-playground.vercel.app`)
2. Test the application by visiting this URL
3. Try logging in and interacting with your data to ensure the frontend is properly connected to the backend

## Step 4: Link from Your Personal Website

Once deployed, you can link to your app from your personal website:

1. Add a link on your personal website:
   ```html
   <a href="https://data-playground.vercel.app">Data Playground Demo</a>
   ```

## Custom Domain (Optional)

If you want to use a subdomain of your personal website:

1. In Vercel, go to your project settings > Domains
2. Add your custom domain (e.g., `app.jeremyvenegas.com`)
3. Follow Vercel's instructions to configure DNS settings

## Troubleshooting

- **CORS Issues**: If you encounter CORS errors, make sure your backend is configured to accept requests from your Vercel domain
- **API Connection Errors**: Double-check that the REACT_APP_API_URL is correctly set to your Render.com backend URL
- **Build Failures**: Check that all dependencies are properly listed in package.json files

## Free Tier Limitations

On Vercel's free tier:
- You get unlimited personal projects
- Serverless functions have limited execution time
- There are bandwidth limitations, but they're generous for personal projects

For a personal project with minimal traffic, these limitations should not be a problem. 