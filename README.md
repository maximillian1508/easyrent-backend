# EasyRent Backend

A robust Node.js/Express backend API for managing rental properties, applications, contracts, and payments.

## Overview

EasyRent Backend provides a comprehensive REST API for property rental management, handling everything from user authentication to payment processing, contract management, and maintenance requests.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **Email**: Nodemailer
- **Payment Processing**: Stripe
- **Security**: Helmet, bcryptjs
- **Session Management**: express-session with connect-mongo
- **Scheduled Jobs**: node-cron
- **Monitoring**: Prometheus (prom-client)
- **PDF Generation**: pdf-lib

## Features

- **Authentication & Authorization**
  - User registration with email verification
  - JWT-based authentication
  - Password hashing with bcryptjs
  - Session management

- **User Management**
  - User profiles (Landlord/Tenant roles)
  - Profile updates
  - User data management

- **Property Management**
  - Create, read, update, delete properties
  - Image upload via Cloudinary
  - Property search and filtering

- **Application System**
  - Rental application submissions
  - Application status tracking
  - Application approval/rejection workflow

- **Contract Management**
  - Digital contract generation
  - Contract signing
  - PDF contract generation

- **Payment Processing**
  - Stripe integration for secure payments
  - Transaction history
  - Payment tracking and receipts

- **Complaint/Maintenance System**
  - Submit maintenance requests
  - Track complaint status
  - Complaint resolution workflow

- **Automated Tasks**
  - Scheduled cron jobs for recurring tasks
  - Automated notifications

- **Monitoring**
  - Prometheus metrics for API monitoring
  - Database query tracking
  - Performance metrics

## Project Structure

```
.
├── config/              # Configuration files
│   ├── cloudinary.js    # Cloudinary setup
│   ├── databaseSetup.js # MongoDB connection
│   └── nodemailerConfig.js # Email configuration
├── controllers/         # Request handlers
├── middleware/          # Express middleware
│   ├── errorHandler.js  # Global error handling
│   └── metrics.js       # Prometheus metrics
├── models/              # Mongoose schemas
├── routes/              # API route definitions
│   ├── authRoute.js
│   ├── userRoute.js
│   ├── propertyRoute.js
│   ├── applicationRoute.js
│   ├── contractRoute.js
│   ├── transactionRoute.js
│   └── complaintRoute.js
├── utils/               # Utility functions
│   └── cronJobs.js      # Scheduled tasks
├── uploads/             # Temporary file uploads
├── server.js            # Application entry point
└── package.json
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Cloudinary account
- Stripe account
- SMTP server for emails

## Installation

1. Navigate to the backend directory:
```bash
cd easyrent-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/easyrent
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/easyrent

# JWT & Session
JWT_SECRET=your_jwt_secret_key_here
SECRET=your_session_secret_here
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3004

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@easyrent.com

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3004
```

## Available Scripts

### `npm run dev`

Runs the server in development mode with nodemon for auto-reloading.
Server will run on the port specified in `.env` (default: 5000).

### `npm start`

Runs the server in production mode.

### `npm test`

Placeholder for running tests (to be implemented).

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:id` - Get user by ID (admin)

### Properties
- `GET /api/properties` - Get all properties
- `GET /api/properties/:id` - Get property by ID
- `POST /api/properties` - Create new property (landlord)
- `PUT /api/properties/:id` - Update property (landlord)
- `DELETE /api/properties/:id` - Delete property (landlord)

### Applications
- `GET /api/applications` - Get user applications
- `GET /api/applications/:id` - Get application by ID
- `POST /api/applications` - Submit new application
- `PUT /api/applications/:id` - Update application status (landlord)

### Contracts
- `GET /api/contracts` - Get user contracts
- `GET /api/contracts/:id` - Get contract by ID
- `POST /api/contracts` - Create new contract (landlord)
- `PUT /api/contracts/:id/sign` - Sign contract (tenant)
- `GET /api/contracts/:id/pdf` - Download contract PDF

### Transactions
- `GET /api/transactions` - Get user transactions
- `POST /api/transactions` - Create payment intent
- `POST /api/transactions/webhook` - Stripe webhook handler

### Complaints
- `GET /api/complaints` - Get user complaints
- `GET /api/complaints/:id` - Get complaint by ID
- `POST /api/complaints` - Submit new complaint
- `PUT /api/complaints/:id` - Update complaint status (landlord)

### Metrics
- `GET /metrics` - Prometheus metrics endpoint

## Database Models

- **User**: User accounts with role-based access
- **Property**: Rental property listings
- **Application**: Rental applications
- **Contract**: Digital rental contracts
- **Transaction**: Payment transactions
- **Complaint**: Maintenance requests

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- HTTP security headers with Helmet
- CORS configuration
- Session encryption
- Input validation
- SQL injection prevention (via Mongoose)
- XSS protection

## File Uploads

Files are uploaded to Cloudinary for storage. Multer is used for handling multipart/form-data.

Supported file types:
- Images: JPG, PNG, GIF
- Documents: PDF

## Email Notifications

Nodemailer is configured to send:
- Email verification
- Password reset
- Application status updates
- Contract signing notifications
- Payment confirmations

## Cron Jobs

Scheduled tasks run via node-cron:
- Contract expiration reminders
- Payment due notifications
- Database cleanup tasks

## Monitoring

Prometheus metrics are exposed at `/metrics` endpoint for monitoring:
- HTTP request duration
- Request count by route and method
- Database query performance
- Error rates

## Error Handling

Global error handler middleware catches and formats errors:
- Development: Full stack traces
- Production: Sanitized error messages
- Logged errors for debugging

## Development

### Code Formatting

This project uses Biome for code formatting:

```bash
npx biome format --write .
```

### Database Seeding

(To be implemented - add seed scripts if needed)

## Docker Support

### Development
```bash
docker build -f Dockerfile.dev -t easyrent-backend:dev .
docker run -p 5000:5000 --env-file .env easyrent-backend:dev
```

### Production
```bash
docker build -f Dockerfile.prod -t easyrent-backend:latest .
docker run -p 5000:5000 --env-file .env easyrent-backend:latest
```

## Deployment

### Environment Variables

Ensure all required environment variables are set in your production environment.

### Database Migrations

Mongoose will automatically create collections. Ensure MongoDB is accessible from your production environment.

### SSL/TLS

In production, use a reverse proxy (nginx) to handle SSL/TLS termination.

## Troubleshooting

### Database Connection Issues
- Verify MongoDB is running
- Check MongoDB URI format
- Ensure network access for MongoDB Atlas

### Email Not Sending
- Verify SMTP credentials
- Check email provider settings
- Enable "Less secure app access" for Gmail (or use App Password)

### Cloudinary Upload Failures
- Verify API credentials
- Check file size limits
- Ensure file type is supported

## Contributing

1. Create a feature branch
2. Make your changes
3. Test all endpoints
4. Submit a pull request

## License

ISC

## Related Projects

- [EasyRent Frontend](../easyrent-frontend/README.md) - React frontend application
