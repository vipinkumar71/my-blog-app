# Next.js Blog Platform

A modern blog platform built with Next.js, MongoDB, and NextAuth.js. This application allows users to create, edit, delete, and publish blog posts with a clean, responsive UI.

![Next.js Blog Platform](https://picsum.photos/seed/nextjs-blog/800/400)

## Features

- 📝 Create, edit, and delete blog posts
- 👤 User authentication with credentials or social providers
- 👁️ Public blog with post details
- 📱 Responsive design that works on mobile and desktop
- 🔒 Protected routes and API endpoints
- 🌓 Dark mode compatibility

## Tech Stack

- **Frontend**: Next.js 15+, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB
- **Authentication**: NextAuth.js
- **Database**: MongoDB with Mongoose

## Prerequisites

- Node.js 18.17 or later
- MongoDB (local installation or MongoDB Compass or Atlas)
- npm or yarn

## Getting Started

### Installation

1. Clone the repository:

```bash
git clone  git@github.com:vipinkumar71/my-blog-app.git
cd my-blog-app
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:

```bash
# Copy the example environment file
cp .env.example .env
```

4. Update the `.env` file with your configuration:

```
# Database connection
MONGODB_URI="mongodb://localhost:27017/blog_db"

# NextAuth configuration
NEXTAUTH_URL="http://localhost:3000"

# Generate a secure random string for NEXTAUTH_SECRET
# Run this command and copy the output to your .env file:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
NEXTAUTH_SECRET="your-generated-secret-key-here"

# Optional: Add social provider credentials if using
# GITHUB_ID=""
# GITHUB_SECRET=""
# GOOGLE_CLIENT_ID=""
# GOOGLE_CLIENT_SECRET=""
```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
my-blog-app/
├── public/               # Static assets
├── src/
│   ├── app/              # App router pages and layouts
│   │   ├── api/          # API routes
│   │   ├── auth/         # Authentication pages
│   │   ├── blog/         # Blog pages
│   │   ├── create/       # Create post page
│   │   ├── dashboard/    # User dashboard
│   │   ├── edit/         # Edit post page
│   │   ├── profile/      # User profile pages
│   ├── components/       # Reusable React components
│   │   ├── providers/    # Context providers
│   ├── lib/              # Utility functions
│   │   ├── auth/         # Authentication utilities
│   │   ├── mongodb.js    # MongoDB connection
│   ├── models/           # Mongoose models
│   ├── store/            # Global state management
├── .env.example          # Example environment variables
├── .gitignore            # Git ignore file
├── next.config.js        # Next.js configuration
├── package.json          # Project dependencies
├── README.md             # Project documentation
├── tailwind.config.js    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Authentication

This application uses NextAuth.js for authentication. By default, it supports:

1. **Credential authentication** (email/password)
2. **GitHub authentication** (requires GitHub OAuth credentials)
3. **Google authentication** (requires Google OAuth credentials)

To enable social login providers, add your OAuth credentials to the `.env` file.

## Database Models

The application uses Mongoose with MongoDB. The main models are:

- **User**: Handles user data and authentication
- **Post**: Manages blog post content and metadata

## Deployment

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

Follow these steps:

1. Push your code to a Git repository
2. Import the project to Vercel
3. Add your environment variables in the Vercel dashboard
4. Deploy

### Other Hosting Options

You can also deploy this application on any hosting provider that supports Node.js:

1. Build the application:

```bash
npm run build
# or
yarn build
```

2. Start the production server:

```bash
npm start
# or
yarn start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [MongoDB](https://www.mongodb.com/)
- [NextAuth.js](https://next-auth.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vercel](https://vercel.com/)
