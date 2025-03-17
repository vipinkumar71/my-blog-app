# Blog Platform with Next.js and Authentication

A full-featured blog platform built with Next.js, NextAuth.js, Prisma, and PostgreSQL. This application allows users to register, log in, create, edit, delete, and view blog posts.

## Features

- **Authentication & Authorization**

  - User registration and login
  - JWT-based authentication with NextAuth.js
  - Protected routes for authenticated users
  - Social login with GitHub and Google (requires API keys)

- **Blog Management**

  - Create, edit, and delete blog posts
  - Publish/unpublish functionality
  - Rich text editing
  - Image support via placeholder images

- **Modern UI**

  - Responsive design with TailwindCSS
  - Mobile-friendly interface
  - Clean and intuitive user experience

- **Performance Optimized**
  - Server-side rendering for blog post pages
  - Static site generation for blog listing
  - Optimized images with next/image
  - Fast page transitions

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL with Prisma ORM
- **State Management**: Zustand
- **Styling**: TailwindCSS
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/blog-platform.git
   cd blog-platform
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:

   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/blog_db?schema=public"
   NEXTAUTH_SECRET="your-nextauth-secret-key"
   NEXTAUTH_URL="http://localhost:3000"

   # Optional OAuth providers
   GITHUB_ID=your_github_client_id
   GITHUB_SECRET=your_github_client_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. Set up the database:

   ```bash
   npx prisma migrate dev --name init
   ```

5. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following database schema:

- **User**: Stores user information and authentication details
- **Post**: Stores blog post content, publication status, and author reference
- **Account**: Stores OAuth account information (for NextAuth.js)
- **Session**: Stores user session information (for NextAuth.js)
- **VerificationToken**: Stores email verification tokens (for NextAuth.js)

## Deployment

This application can be easily deployed to Vercel:

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Set up the environment variables
4. Deploy

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
