import dotenv from "dotenv";
dotenv.config();


import express from 'express'

import cloudinary from "cloudinary";
import cors from 'cors';
import compression from "compression";
import connectDataBase from './config/connectDataBase.js'
import { errorMiddleware } from './error/error.js'
import agentRoutes from './routes/agent.routes.js'
import adminRoutes from './routes/admin.routes.js'
import userRoutes from './routes/user.routes.js'
import leadRoutes from './routes/lead.routes.js'
import leadPaymentRoutes from './routes/lead.payment.routes.js'
import newsRoutes from './routes/news.routes.js'
import contactRoutes from './routes/contact.routes.js'
import axios from 'axios';

dotenv.config()

const app = express()

// Middleware
app.use(compression());
app.use(express.json({ limit: "1gb" }));
app.use(express.urlencoded({ extended: true, limit: "1gb" }));

app.use(
    cors(
        {
            origin: [
                "http://localhost:5173",
                "http://localhost:5174",
                "https://immify.vercel.app",
                "https://syolo-immigrate.vercel.app",
                "https://immify.in",
                "https://admin.immify.in",
                "https://www.immify.in",
                "https://www.admin.immify.in"
            ],
            // methods: ["GET", "POST", "PUT", "DELETE"],
            methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            credentials: true,
        }
    )
);



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

// Routes
app.use('/api/v1/agent', agentRoutes)
app.use('/api/v1/admin', adminRoutes)
app.use('/api/v1/user', userRoutes)
app.use('/api/v1/leads', leadRoutes)
app.use('/api/v1/payment', leadPaymentRoutes)
app.use('/api/v1/news', newsRoutes)
app.use('/api/v1/contact', contactRoutes)



app.post('/taxi', async (req, res) => {
    const CASHFREE_API_URL = 'https://api.cashfree.com/pg/orders';
    const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
    const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;

    const {
        payload
    } = req.body;


    try {
        const response = await axios.post(CASHFREE_API_URL, payload, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-version': '2023-08-01',
                'x-client-id': CASHFREE_APP_ID,
                'x-client-secret': CASHFREE_SECRET_KEY,
            },
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Cashfree API error:', error.response?.data || error.message);
        res.status(500).json({ message: 'Cashfree order creation failed', error: error.response?.data || error.message });
    }
});

app.get('/', (req, res) => {
    res.send('User Service is running')
})
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP' })
})



app.use(errorMiddleware);

const startServer = async () => {
  await connectDataBase();

  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
};

startServer();


