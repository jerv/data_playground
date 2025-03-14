# Split Deployment Strategy

This guide outlines how to deploy the Data Playground application using a split deployment strategy, with the frontend on Vercel and the backend on Render.com.

## Why Split Deployment?

Vercel is optimized for frontend applications, while Render.com provides excellent support for Node.js backend services. This approach leverages the strengths of both platforms.

## Step 1: Deploy Backend to Render.com

1. Create a free account on [Render.com](https://render.com)
2. Click "New" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: data-playground-backend
   - **Root Directory**: backend
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string
   - `REGISTRATION_CODE`: Your registration code
   - `PORT`: 8080 (Render uses this port by default)
   - `NODE_ENV`: production
6. Click "Create Web Service"

## Step 2: Update Frontend Configuration

1. Update the `.env.production` file in the webapp directory:
   ```
   REACT_APP_API_URL=https://your-backend-service-name.onrender.com/api
   GENERATE_SOURCEMAP=false
   ```
2. Replace `your-backend-service-name` with the actual URL of your Render.com service

## Step 3: Deploy Frontend to Vercel

1. Go to [Vercel](https://vercel.com) and sign in
2. Click "Add New" > "Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: Create React App
   - Root Directory: ./
   - Build Command: `cd webapp && npm install && npm run build`
   - Output Directory: webapp/build
5. Click "Deploy"

## Step 4: Link from Your Personal Website

Once deployed, you can link to your app from your personal website:

1. Get your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
2. Add a link on your personal website:
   ```html
   <a href="https://your-app.vercel.app">Data Playground Demo</a>
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

## Local Development After Deployment

To continue local development:

1. Use the local MongoDB instance for development
2. Keep the `.env` file updated with your local settings
3. Use the `.env.production` file for production settings

Remember that changes pushed to your GitHub repository will automatically trigger new deployments on both Vercel and Render.com if you've set up continuous deployment. 