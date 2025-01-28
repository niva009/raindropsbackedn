const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const dbConnection = require('./config/config');
const userRouter = require('./Router/userrouter');
const categoryRouter = require('./Router/categoryrouter');
const productRouter = require('./Router/productrouter');
const wishlistRouter = require('./Router/wishlistrouter');
const bannerRouter = require('./Router/bannerRouter');
const cartRouter = require('./Router/cartRouter');
const addressRouter = require('./Router/addressRouter');
const couponRouter = require('./Router/couponRouter');
const orderRouter = require('./Router/orderRouter');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const authRoute = require('./Router/googleAuthRoutes');
const locationRoute = require('./Router/userLocation')
const smsRouter = require('./Router/smsRouter');
const vendorRouter = require("./Router/vendorStatusRouter");

dotenv.config();

const app = express();
const port = process.env.PORT || 5555;

// CORS Configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'], // Allow frontend origins
  credentials: true, // Allow cookies or authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
}));

// Ensure OPTIONS requests are handled
app.options('*', cors());

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
        url: 'http://localhost:5555',
      },
    ],
  },
  apis: ['./Router/userrouter.js', './Router/categoryrouter.js', './Router/productrouter.js', './Router/wishlistrouter.js'], 
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routers
app.use('/auth', authRoute);
app.use('/api', userRouter);
app.use('/api', categoryRouter);
app.use('/api', productRouter);
app.use('/api', bannerRouter);
app.use('/api', wishlistRouter);
app.use('/api', cartRouter);
app.use('/api', addressRouter);
app.use('/api', couponRouter);
app.use('/api', orderRouter);
app.use('/api', smsRouter);
app.use('/api', locationRoute);
app.use('/api', vendorRouter);

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
