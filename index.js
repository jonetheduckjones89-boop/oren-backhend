import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import routes from "./routes.js";

// Load env vars
dotenv.config();

const app = express();

// Security: Helmet for HTTP headers
app.use(helmet());

// Security: Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." }
});
app.use(limiter);

// Security: CORS
// In production, set ALLOWED_ORIGIN to your frontend URL (e.g., https://oren.clinic)
const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";
app.use(cors({
    origin: allowedOrigin,
    methods: ["POST", "GET", "OPTIONS"], // Only allow necessary methods
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Validation: Request Size Limit (Prevents large payload DoS)
app.use(express.json({ limit: "10kb" }));

// Routes
app.use("/api", routes);

// Health Check for Render & Monitoring
app.get("/", (req, res) => {
    res.status(200).json({
        status: "ok",
        service: "OREN backend",
        environment: process.env.NODE_ENV
    });
});
app.get("/health", (req, res) => { // Keep /health as an alias
    res.status(200).json({
        status: "ok",
        service: "OREN backend",
        environment: process.env.NODE_ENV
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: "Not Found" });
});

// Global Error Handler (Catch-all)
app.use((err, req, res, next) => {
    console.error("Unhandle Express Error:", err);
    if (res.headersSent) {
        return next(err);
    }
    res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`OREN backend running securely on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
