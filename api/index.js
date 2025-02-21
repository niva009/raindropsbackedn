const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const dbConnection = require('../config/config'); // Ensure this path is correct
const userRouter = require('../Router/userrouter');
const categoryRouter = require('../Router/categoryrouter');
const productRouter = require('../Router/productrouter');
const wishlistRouter = require('../Router/wishlistrouter');
const bannerRouter = require('../Router/bannerRouter');
const cartRouter = require('../Router/cartRouter');
const addressRouter = require('../Router/addressRouter');
const couponRouter = require('../Router/couponRouter');
const orderRouter = require('../Router/orderRouter');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const authRoute = require('../Router/googleAuthRoutes');
const locationRoute = require('../Router/userLocation');
const smsRouter = require('../Router/smsRouter');
const vendorRouter = require("../Router/vendorStatusRouter");

dotenv.config();

const app = express();

// CORS Configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('uploads'));

// Database Connection
dbConnection();

// Base Route
app.get('/', (req, res) => {
  res.send('Server running correctly');
});

// Swagger Configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      description: 'List of API endpoints for the application',
      version: '1.0.0',
    },
    servers: [
      {
        url: '/api',
      },
    ],
  },
  apis: ['./Router/userrouter.js', './Router/categoryrouter.js', './Router/productrouter.js', './Router/wishlistrouter.js'], 
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routers
app.use('/api/auth', authRoute);
app.use('/api/user', userRouter);
app.use('/api/category', categoryRouter);
app.use('/api/product', productRouter);
app.use('/api/banner', bannerRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/coupon', couponRouter);
app.use('/api/order', orderRouter);
app.use('/api/sms', smsRouter);
app.use('/api/location', locationRoute);
app.use('/api/vendor', vendorRouter);

// Export the app as a Vercel function
module.exports = app;
