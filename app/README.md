# Expense Tracker App

A full-stack expense tracking application built with Supabase, React, and Node.js. This project uses Vercel for local development and deployment.

This project uses [`vercel dev`](https://vercel.com/docs/cli/dev) to emulate both the frontend and serverless functions locally. To get started, you'll need a free Vercel account and to link the project to your own Vercel workspace.

---

## 🚀 Features

- User authentication (Supabase)
- CRUD operations on expenses
- Pagination, filtering, and sorting
- Expense Visualization with Recharts
- Row Level Security (RLS) using Supabase policies
- Secure API routes with token verification

---

## 📦 Technologies Used

- React
- Supabase
- Node.js (API routes)
- Vercel (for local + production deployment)

---

## 🔧 Getting Started

Follow the steps below to run the project on your local machine using `vercel dev`.

### 1. Clone the repository

```bash
git clone https://github.com/nicolaschen2293/expenseTracker.git
cd expenseTracker
```

### 3. Set up Vercel

```bash
# Make Install vercel for development environment
npm install -g vercel
```
- **Create a Vercel account**

Sign up at [https://vercel.com/signup](https://vercel.com/signup)  
(You can use GitHub, GitLab, Bitbucket, or email to sign in.)

- **Log into Vercel CLI**

```bash
vercel login
# Enter email or Github account when prompted

# go to /app and install dependencies
cd app
npm install

# go back to root
cd ..

vercel dev
# Select your Vercel scope (personal or team)
# Choose to create new project or use an existing one
# Accept default settings unless you know otherwise
# Start the development server
# Install any missing dependencies with

npm install --save-dev "missing-dependency-name"
```

- **Alternatively, you can use the deployed app on Vercel: https://expense-tracker-wheat-tau.vercel.app/ for testing**

### 4. Environment variables

For testing purposes, .env file is provided in the repository, along with the Supabase Anon Key and Supabase URL.

### 5. Log In / Sign Up into the app

Use the following developer account or sign up to create an account:

email   : dev@developer.com
password: dev123

Keep in mind that this account will not be able to use the "forgot password" feature as it is not a real email. A valid email needs to be used in order for Supabase to send a reset-password link.

# Author

Developed by Nicolas Chen as an assignment for a Full-Stack Engineer Role in Samsung Research indonesia
