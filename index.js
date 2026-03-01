import express from "express";
import cors from "cors";
import portfolioRoutes from "./routes/portfolioRoutes.js";
import simulationRoutes from "./routes/simulationRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import savedRoutes from "./routes/savedRoutes.js";
import { initializeDatabase } from "./db/database.js";

const app = express();
const PORT = process.env.PORT || 8000;

/* ================================
   Middleware
================================ */

app.use(cors({
    origin: "http://localhost:3000", // your frontend
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

/* ================================
   API Routes
================================ */
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/simulation", simulationRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/users", userRoutes);
app.use("/api/saved", savedRoutes);

/* ================================
   Health Check Route
================================ */

app.get("/", (req, res) => {
    res.send("Stock Portfolio Risk Analyzer Express Backend is running 🚀");
});

/* ================================
   Test Connection Route
================================ */

app.post("/test", (req, res) => {
    res.json({
        success: true,
        message: "Backend connection successful"
    });
});

/* ================================
   Login Route (After Firebase)
================================ */

app.post("/auth/login", (req, res) => {
    const { email, uid } = req.body;

    if (!email || !uid) {
        return res.status(400).json({
            success: false,
            message: "Missing user data"
        });
    }

    // Later you can store user in DB here

    res.json({
        success: true,
        message: "User authenticated successfully",
        user: {
            email,
            uid
        }
    });
});

/* ================================
   Start Server & Database
================================ */

initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`✅ Server running on http://localhost:${PORT}`);
        console.log(`💾 SQLite Database Mounted Successfully.`);
    });
});
