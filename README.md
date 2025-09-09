# 🎬 FluxPlay - Video Streaming Platform

A high-performance, scalable backend API for a modern video streaming platform inspired by YouTube. Built with cutting-edge technologies, FluxPlay delivers a robust foundation for video content creators and viewers alike. The platform features real-time video processing, advanced user engagement tools, and a comprehensive social ecosystem that enables seamless content discovery and community building.

## 🚀 Features

### Core Functionality

#### Video Managemen

- **Real-time Analytics**: View count tracking, engagement metrics, and performance insights.

#### Comprehensive User System

- **Secure Authentication**: JWT-based authentication with refresh token rotation for enhanced security
- **Profile Customization**: Rich user profiles with avatars, cover images, and customizable bios
- **Channel Management**: Professional channel setup with subscriber analytics and content organization
- **Multi-device Support**: Seamless authentication across devices with session management

#### Social Engagement Features

- **Interactive Comments**: Threaded comments with like/dislike functionality and moderation tools
- **Community Building**: Subscription system
- **Content Discovery**: Advanced search algorithms with filters for videos, and channel

#### Content Organization

- **Playlists**: Create, organize, and share playlists with collaborative editing
- **Watch History**: Tracking with privacy
- **Favorites System**: Like/unlike videos with personalized collections

### Technical Functionality

#### 🔧 Architecture & Performance

- **RESTful API Design**: Clean, intuitive endpoints following best practices
- **Scalable Database**: MongoDB with Mongoose ODM for flexible data modeling
- **Performance Optimization**: Aggregation pipelines, indexing, and query optimization
- **Response Optimization**: Efficient API responses with pagination support

#### 🛡️ Security & Authentication

- **JWT Authentication**: Secure token-based authentication with automatic refresh
- **Password Security**: bcrypt hashing
- **CORS Protection**: Configurable cross-origin resource sharing policies
- **Input Validation**: Comprehensive request validation and sanitization
- **File Upload Security**: Secure file handling with type validation and size limits

#### ☁️ Cloud & Storage

- **Cloudinary Integration**: Seamless video and image storage with automatic optimization
- **Multi-format Support**: Handle various video and image formats with automatic conversion

#### 📊 Monitoring & Error Handling

- **Error Handling**: Centralized error management with detailed logging
- **Database Performance**: Optimized queries with aggregation pipelines
- **Health Checks**: System health monitoring and automated recovery

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **File Upload**: Multer
- **Password Hashing**: bcrypt
- **Development**: Nodemon, Prettier

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB database
- Cloudinary account for file storage

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd chai-backend
   ```
2. **Install dependencies**

   ```bash
   npm install
   ```
3. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:

   ```env
   PORT=8000
   MONGODB_URI=your_mongodb_connection_string
   CORS_ORIGIN=http://localhost:5173

   # JWT Configuration
   ACCESS_TOKEN_SECRET=your_access_token_secret
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_EXPIRY=10d

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```
4. **Start the development server**

   ```bash
   npm run dev
   ```

The server will start on `http://localhost:8000`

## 🚀 Frontend github link: `https://github.com/salimshaddy18/fluxplayfrontend`

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Most endpoints require authentication via the `Authorization` header or cookies.

**Protected Routes**: Include the JWT token in the request header:

```
Authorization: Bearer <your_jwt_token>
```

## 🆘 Support

For support and questions, please open an issue in the repository.
