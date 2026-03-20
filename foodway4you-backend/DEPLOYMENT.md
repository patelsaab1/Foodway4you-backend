# Deployment Guide for FoodWay4You Backend

This guide provides step-by-step instructions for deploying your FoodWay4You backend to various platforms.

## 🚀 Quick Deployment Options

### 1. Railway (Recommended for Beginners)
Railway provides the easiest deployment experience with automatic builds and database provisioning.

**Steps:**
1. Visit [Railway.app](https://railway.app)
2. Connect your GitHub account
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your foodway4you-backend repository
5. Railway will auto-detect it's a Node.js app
6. Add environment variables from `.env.production` template
7. Railway will automatically deploy on every push to main branch

**Pros:**
- Free tier available
- Automatic builds
- Built-in database
- Custom domains
- SSL certificates

### 2. Heroku
Heroku is a mature platform with excellent documentation.

**Steps:**
1. Install Heroku CLI: `npm install -g heroku`
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Add MongoDB: `heroku addons:create mongolab:sandbox`
5. Set environment variables:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secret-key
   # Add all other variables from .env.production
   ```
6. Deploy: `git push heroku main`

**Pros:**
- Well-documented
- Add-ons ecosystem
- Easy scaling

### 3. DigitalOcean App Platform
Great for more control and better performance.

**Steps:**
1. Create DigitalOcean account
2. Go to App Platform
3. Connect GitHub repository
4. Configure environment variables
5. Deploy

## 🐳 Docker Deployment

### Local Docker Deployment

**Build and run with Docker Compose:**
```bash
# Copy production environment file
cp .env.production .env

# Update environment variables in .env
# Build and start services
docker-compose up -d

# Check logs
docker-compose logs -f app
```

### Production Docker Deployment

**Build custom image:**
```bash
# Build image
docker build -t foodway4you-backend .

# Run container
docker run -d \
  --name foodway4you-app \
  -p 5000:5000 \
  --env-file .env.production \
  foodway4you-backend
```

## ☁️ Cloud Provider Deployment

### AWS EC2 Deployment

**Setup EC2 Instance:**
1. Launch EC2 instance (Ubuntu 20.04+)
2. Connect via SSH
3. Install Node.js and MongoDB
4. Clone repository and setup application

**Automated Setup Script:**
```bash
#!/bin/bash
# Save as setup.sh and run on EC2

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2
sudo npm install -g pm2

# Clone and setup app
git clone https://github.com/your-username/foodway4you-backend.git
cd foodway4you-backend
npm install

# Create production environment
cp .env.production .env
# Edit .env with your production values

# Start with PM2
pm2 start server.js --name foodway4you
pm2 save
pm2 startup
```

### Google Cloud Platform

**Using Cloud Run:**
1. Install Google Cloud SDK
2. Build and push Docker image:
   ```bash
   gcloud builds submit --tag gcr.io/your-project/foodway4you-backend
   ```
3. Deploy to Cloud Run:
   ```bash
   gcloud run deploy foodway4you-backend \
     --image gcr.io/your-project/foodway4you-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

## 🔧 Environment Variables Setup

### Production Environment Variables

Copy `.env.production` to `.env` and update these critical values:

```bash
# Database - Use MongoDB Atlas for production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/foodway4you

# JWT - Generate a strong secret key
JWT_SECRET=$(openssl rand -base64 32)

# Cloudinary - Sign up at cloudinary.com
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Razorpay - Get from razorpay.com dashboard
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret

# Firebase - Create project at firebase.google.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=your-private-key

# Email - Use Gmail App Password or SMTP service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Google Maps - Get from Google Cloud Console
GOOGLE_MAPS_API_KEY=your-maps-api-key
```

## 🔒 Security Checklist

Before deploying to production:

- [ ] Use strong JWT secret (minimum 32 characters)
- [ ] Enable MongoDB authentication
- [ ] Use HTTPS (SSL/TLS certificates)
- [ ] Set up rate limiting
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets
- [ ] Enable logging and monitoring
- [ ] Set up backup strategy
- [ ] Configure firewall rules
- [ ] Use strong passwords for all services

## 📊 Monitoring & Logging

### PM2 Monitoring
```bash
# Monitor app performance
pm2 monit

# View logs
pm2 logs foodway4you

# Generate startup script
pm2 startup
```

### Health Checks
The application includes a health check endpoint:
```bash
curl https://your-domain.com/health
```

## 🔄 Continuous Deployment

### GitHub Actions
The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that:
- Runs tests on every push
- Performs linting checks
- Deploys to production on main branch push

### Webhook Deployment
For custom deployment pipelines:
1. Set up webhook endpoint in your server
2. Configure GitHub webhook in repository settings
3. Create deployment script that pulls latest code and restarts service

## 🆘 Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Find process using port 5000
sudo lsof -i :5000
# Kill process
sudo kill -9 PID
```

**MongoDB Connection Issues:**
- Check MongoDB service status
- Verify connection string
- Check firewall rules

**Memory Issues:**
```bash
# Check memory usage
free -h
# Check PM2 memory usage
pm2 list
```

**Permission Issues:**
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
```

### Getting Help

If you encounter issues:
1. Check application logs: `pm2 logs`
2. Verify environment variables
3. Test database connectivity
4. Check firewall and security groups
5. Review deployment platform documentation

## 📞 Support

For deployment support:
- Check the [README.md](README.md) for basic setup
- Review platform-specific documentation
- Create an issue in the GitHub repository

---

**Happy Deploying! 🚀**