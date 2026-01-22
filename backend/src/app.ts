import express from 'express';
import cors from 'cors';
import admissionRoutes from './modules/admission/admission.routes';

const app = express();

// Global Middlewares
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : ['*'];

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Debug Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', JSON.stringify(req.headers));
    next();
});

// Routes
app.use('/api/admission', admissionRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', phase: '0' });
});

export default app;
