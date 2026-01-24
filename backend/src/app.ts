import express from 'express';
import cors from 'cors';
import admissionRoutes from './modules/admission/admission.routes';
import adminRoutes from './modules/admin/admin.routes';

const app = express();

// Global Middlewares
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim())
    : ["http://localhost:5173", "http://localhost:5174"];

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow server-to-server or curl requests (no origin)
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error("Not allowed by CORS"));
        },
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "X-Requested-With"
        ],
        credentials: true,
        optionsSuccessStatus: 200
    })
);

// Explicitly handle OPTIONS preflight for all routes
app.options("*", cors());

app.use(express.json());

// Debug Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', JSON.stringify(req.headers));
    next();
});

// Routes
app.use('/api/admission', admissionRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', phase: '0' });
});

export default app;
