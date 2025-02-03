# 📧 NormalHuman: AI-Powered Email Client

## 🌟 Overview

NormalHuman is an email client that integrates AI technologies to revolutionize your email experience. By leveraging the Gemini API, the application provides intelligent email assistance without compromising your data privacy by sending emails to external services.

## 🚀 Key Features

- **AI-Powered Email Assistance**

  - Autocomplete emails using AI
  - Generate intelligent email responses with Gemini API
  - Enhance productivity with writing suggestions

- **Comprehensive Email Management**

  - Send and receive emails effortlessly
  - Advanced email search functionality
  - Multi-account support

- **User Experience**
  - Dark/Light theme toggle
  - Secure authentication
  - Intuitive and responsive design

## 🛠 Frameworks used

Next.js, Prisma, Tailwind CSS, Gemini API, TypeScript , Aurinko, Clerk

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18+ recommended)
- npm or Yarn
- Git

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/blackpanther26/normalhuman
cd normalhuman
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the root directory and add the environment variables from the `.env.example` file.

### 4. Database Setup

```bash
npx prisma generate
npx prisma migrate dev
```

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

# Deployment

The application is deployed on Vercel : [NormalHuman](https://normalhuman-two.vercel.app/)
