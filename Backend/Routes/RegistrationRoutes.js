const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const filePath = path.join(__dirname, "../Data/registration.json");

// Middleware just for this router (handles JSON + form submissions)
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Handle registration
router.post("/", (req, res) => {
    console.log("Incoming body:", req.body); // 🔎 Debugging log

    let registrations = [];
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, "utf-8");
        registrations = JSON.parse(data || "[]");
    }

    const { eventId, name, email } = req.body;

    // Validate required fields
    if (!eventId || !name || !email) {
        return res.json({
            success: false,
            message: "Missing eventId, name, or email"
        });
    }

    // Check for duplicate registration
    const alreadyRegistered = registrations.find(
        (reg) => reg.email === email && reg.eventId === eventId
    );

    if (alreadyRegistered) {
        return res.json({
            success: false,
            message: "User already registered for this event"
        });
    }

    const newReg = {
        id: registrations.length > 0 ? registrations[registrations.length - 1].id + 1 : 1,
        eventId,
        name,
        email
    };

    registrations.push(newReg);

    fs.writeFileSync(filePath, JSON.stringify(registrations, null, 2), "utf-8");

    res.json({ success: true, data: newReg });
});

// Fetch all registrations
router.get("/", (req, res) => {
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, "utf-8");
        const registrations = JSON.parse(data || "[]");
        return res.json(registrations);
    }
    res.json([]);
});

module.exports = router;
