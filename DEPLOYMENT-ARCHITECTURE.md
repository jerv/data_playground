# Data Playground Deployment Architecture

This document explains the deployment architecture for the Data Playground application, which uses a split deployment approach with the frontend on Vercel and the backend on Render.com.

## Architecture Overview

```
                                 ┌─────────────────┐
                                 │                 │
                                 │  GitHub Repo    │
                                 │                 │
                                 └────────┬────────┘
                                          │
                                          │ CI/CD
                                          │
                 ┌─────────────────┐      │      ┌─────────────────┐
                 │                 │      │      │                 │
                 │  Vercel         │◄─────┴─────►│  Render.com     │
                 │  (Frontend)     │             │  (Backend)      │
                 │                 │             │                 │
                 └────────┬────────┘             └────────┬────────┘
                          │                               │
                          │                               │
                          │                               │
                          │                               │
                          ▼                               ▼
                 ┌─────────────────┐             ┌─────────────────┐
                 │                 │             │                 │
                 │  React App      │◄────API────►│  Express Server │
                 │                 │             │                 │
                 └─────────────────┘             └────────┬────────┘
                                                          │
                                                          │
                                                          │
                                                          ▼
                                                 ┌─────────────────┐
                                                 │                 │
                                                 │  MongoDB Atlas  │
                                                 │                 │
                                                 └─────────────────┘
```

## Components

### 1. Frontend (Vercel)

- **Technology**: React.js
- **Deployment Platform**: Vercel
- **Repository**: Same GitHub repository, focusing on the `webapp` directory
- **Environment Variables**:
  - `REACT_APP_API_URL`: Points to the Render.com backend API

### 2. Backend (Render.com)

- **Technology**: Node.js with Express
- **Deployment Platform**: Render.com
- **Repository**: Same GitHub repository, focusing on the `backend` directory
- **Environment Variables**:
  - `MONGODB_URI`: Connection string to MongoDB Atlas
  - `JWT_SECRET`: Secret for JWT authentication
  - `REGISTRATION_CODE`: Code required for new user registration
  - `PORT`: Port for the server to listen on (set by Render.com)
  - `NODE_ENV`: Set to "production"

### 3. Database (MongoDB Atlas)

- **Technology**: MongoDB
- **Deployment Platform**: MongoDB Atlas
- **Configuration**:
  - Network access configured to allow connections from Render.com
  - Database user with appropriate permissions

## Communication Flow

1. **User Access**:
   - User accesses the application via the Vercel URL
   - Vercel serves the static React application

2. **API Requests**:
   - React app makes API requests to the backend URL
   - Requests include authentication tokens for protected routes

3. **Data Storage**:
   - Backend processes requests and interacts with MongoDB Atlas
   - Data is stored and retrieved from MongoDB

## Benefits of This Architecture

1. **Specialized Platforms**:
   - Vercel is optimized for frontend applications
   - Render.com provides excellent support for Node.js backends

2. **Independent Scaling**:
   - Frontend and backend can scale independently based on demand

3. **Cost Efficiency**:
   - Both platforms offer generous free tiers for personal projects
   - Pay-as-you-grow model if usage increases

4. **Simplified Deployment**:
   - Each platform handles its specialized deployment process
   - Automatic deployments from GitHub

## Limitations

1. **Cold Starts**:
   - On free tiers, both services may experience cold starts after periods of inactivity

2. **Cross-Origin Requests**:
   - Requires proper CORS configuration since frontend and backend are on different domains

3. **Multiple Platforms to Manage**:
   - Need to manage deployments and configurations across multiple platforms

## Deployment Guides

For detailed deployment instructions, see:
- [VERCEL-DEPLOY.md](./VERCEL-DEPLOY.md) - Frontend deployment guide
- [RENDER-DEPLOY.md](./RENDER-DEPLOY.md) - Backend deployment guide 