# FoodWay4You Backend

A comprehensive food delivery backend API built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Management**: Registration, authentication, and role-based access control
- **Restaurant Management**: Restaurant profiles, menu management, and availability
- **Order Management**: Order placement, tracking, and status updates
- **Payment Integration**: Razorpay payment gateway integration
- **Delivery System**: Real-time delivery tracking and partner management
- **Notifications**: Push notifications via Firebase
- **Reviews & Ratings**: Customer feedback system
- **Admin Dashboard**: Comprehensive admin panel
- **Real-time Updates**: Socket.io integration for live updates

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer with Cloudinary storage
- **Payments**: Razorpay integration
- **Maps**: Google Maps API
- **Notifications**: Firebase Cloud Messaging
- **Logging**: Winston logger
- **Validation**: Express Validator

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/foodway4you-backend.git
cd foodway4you-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/foodway4you

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Razorpay (for payments)
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Firebase (for notifications)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_PRIVATE_KEY=your-firebase-private-key

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Google Maps
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### 4. Run the Application

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Health Check
```
GET /health
```

### Authentication Endpoints
```
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/refresh-token
POST /auth/forgot-password
POST /auth/reset-password
```

### Restaurant Endpoints
```
GET /restaurants
GET /restaurants/:id
POST /restaurants (Restaurant/Admin)
PUT /restaurants/:id (Restaurant/Admin)
DELETE /restaurants/:id (Admin)
```

### Menu Endpoints
```
GET /menu/restaurant/:restaurantId
POST /menu (Restaurant/Admin)
PUT /menu/:id (Restaurant/Admin)
DELETE /menu/:id (Restaurant/Admin)
```

### Order Endpoints
```
GET /orders
POST /orders
GET /orders/:id
PUT /orders/:id/status
```

### Payment Endpoints
```
POST /payments/create-order
POST /payments/verify
GET /payments/history
```

## 🧪 Testing

### Postman Collection

We have provided a comprehensive Postman collection for testing all APIs:

1. **Collection**: `postman/FoodWay4You.postman_collection.json`
2. **Environment**: `postman/FoodWay4You.local.postman_environment.json`

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Option 1: Deploy to Heroku

1. **Create Heroku App**
```bash
heroku create your-app-name
```

2. **Add MongoDB Addon**
```bash
heroku addons:create mongolab:sandbox
```

3. **Set Environment Variables**
```bash
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret
# Add all other required environment variables
```

4. **Deploy**
```bash
git push heroku main
```

### Option 2: Deploy to Railway

1. **Connect GitHub Repository** on Railway dashboard
2. **Set Environment Variables** in Railway dashboard
3. **Deploy** automatically on push to main branch

### Option 3: Deploy to DigitalOcean

1. **Create Droplet** with Node.js
2. **Install MongoDB** on the server
3. **Clone Repository**
```bash
git clone https://github.com/your-username/foodway4you-backend.git
cd foodway4you-backend
```

4. **Install PM2** for process management
```bash
npm install -g pm2
```

5. **Start Application**
```bash
pm2 start server.js --name foodway4you
pm2 save
pm2 startup
```

### Option 4: Deploy with Docker

1. **Build Docker Image**
```bash
docker build -t foodway4you-backend .
```

2. **Run Container**
```bash
docker run -p 5000:5000 --env-file .env foodway4you-backend
```

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `PORT` | Server port (default: 5000) | No |
| `NODE_ENV` | Environment (development/production) | Yes |
| `CLOUDINARY_*` | Cloudinary credentials for file uploads | Yes |
| `RAZORPAY_*` | Razorpay payment gateway credentials | Yes |
| `FIREBASE_*` | Firebase credentials for notifications | Yes |
| `SMTP_*` | Email service credentials | Yes |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key | Yes |

## 📝 Scripts

```bash
# Development
npm run dev          # Start with nodemon

# Production
npm start            # Start server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format code with Prettier

# Testing
npm test             # Run tests
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Bug Reports

If you find a bug, please create an issue with:
- Clear description of the bug
- Steps to reproduce
- Expected behavior
- Screenshots (if applicable)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **FoodWay4You Team** - Initial work

## 🙏 Acknowledgments

- Express.js framework
- MongoDB community
- All contributors and supporters

---

**Made with ❤️ by FoodWay4You Team**