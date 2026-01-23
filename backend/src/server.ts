import app from './app';
import dotenv from 'dotenv';
import { Server } from 'http';

dotenv.config();

const PORT = process.env.PORT || 3003;

let server: Server;

function startServer() {
    try {
        server = app.listen(PORT, () => {
            console.log(`[BOOT] Backend server running on port ${PORT}`);
            console.log(`[BOOT] Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`[BOOT] Phase: 0 (Admission Module Active)`);
        });

        // Handle server errors (like EADDRINUSE)
        server.on('error', (error: any) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`[FATAL] Port ${PORT} is already in use.`);
                console.error(`[FIX] Please kill the process on port ${PORT} or change the PORT in .env`);
                process.exit(1);
            } else {
                console.error(`[FATAL] Server error:`, error);
                process.exit(1);
            }
        });

    } catch (error) {
        console.error(`[FATAL] Failed to start server:`, error);
        process.exit(1);
    }
}

// Graceful Shutdown
const shutdown = () => {
    console.log('\n[SHUTDOWN] Signal received. Closing HTTP server...');
    if (server) {
        server.close(() => {
            console.log('[SHUTDOWN] HTTP server closed.');
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('[CRITICAL] Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

startServer();
