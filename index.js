import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 8000;

/* ================================
   Middleware
================================ */

app.use(cors({
    origin: "http://localhost:3000", // your frontend
    credentials: true
}));

app.use(express.json());

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
   Start Server
================================ */

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
