# Deploying to Vercel

This guide will help you deploy your Data Playground application to Vercel's free tier.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup) (free tier is sufficient)
2. A [MongoDB Atlas account](https://www.mongodb.com/cloud/atlas/register) (free tier is sufficient)
3. [GitHub account](https://github.com/join) (to push your code)

## Step 1: Set up MongoDB Atlas

1. Create a free MongoDB Atlas account if you don't have one
2. Create a new cluster (the free tier M0 is sufficient)
3. Set up database access:
   - Create a database user with password authentication
   - Note down the username and password
4. Set up network access:
   - Add `0.0.0.0/0` to allow access from anywhere (or use Vercel's IP ranges if you prefer)
5. Get your connection string:
   - Go to "Connect" > "Connect your application"
   - Copy the connection string (it will look like `mongodb+srv://username:password@cluster.mongodb.net/`)
   - Replace `<username>` and `<password>` with your database user credentials

## Step 2: Push Your Code to GitHub

1. Create a new GitHub repository
2. Push your code to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git push -u origin main
   ```

## Step 3: Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and sign in
2. Click "Add New" > "Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: (leave as is, it's in vercel.json)
   - Output Directory: (leave as is, it's in vercel.json)
5. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string (you can generate one with `openssl rand -base64 32`)
   - `REGISTRATION_CODE`: Your registration code for new users
6. Click "Deploy"

## Step 4: Link to Your Personal Website

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

- **Database Connection Issues**: Make sure your MongoDB Atlas connection string is correct and the IP access is properly configured
- **API Errors**: Check Vercel logs for any backend errors
- **Build Failures**: Check that all dependencies are properly listed in package.json files

## Local Development After Deployment

To continue local development:

1. Use the local MongoDB instance for development
2. Keep the `.env` file updated with your local settings
3. Use the `.env.production` file for production settings

Remember that changes pushed to your GitHub repository will automatically trigger a new deployment on Vercel if you've set up continuous deployment. 