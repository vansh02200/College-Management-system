const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../Data/events.json');

// Load events from file
function getEvents() {
    if (!fs.existsSync(filePath)) {
        return [];
    }
    const jsonData = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(jsonData || "[]");
}

// Save events to file
function saveEvents(events) {
    fs.writeFileSync(filePath, JSON.stringify(events, null, 2), "utf-8");
}

// Initialize events array from file
let events = getEvents();

// GET ALL EVENTS
router.get('/', (req, res) => {
    try {
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: "Something went wrong while fetching events" });
    }
});

// GET THE EVENT BY ID
router.get('/:id', (req, res) => {
    try {
        const event = events.find(e => e.id === parseInt(req.params.id));

        if (!event) {
            return res.status(404).send("Event not found");
        }

        res.json(event);
    } catch (err) {
        res.status(500).json({ error: "Something went wrong while fetching the event" });
    }
});

// ADD A NEW EVENT
router.post('/', (req, res) => {
    try {
        const newEvent = {
            id: events.length ? events[events.length - 1].id + 1 : 1, // safer id assignment
            name: req.body.name,
            date: req.body.date
        };

        events.push(newEvent);
        saveEvents(events);   // Save to file
        res.status(201).json(newEvent);
    } catch (err) {
        res.status(500).json({ error: "Something went wrong while adding the event" });
    }
});

// SEARCH EVENT
router.get('/search', (req, res) => {
    try {
        const { name, date } = req.query; // query parameters

        let results = events;

        if (name) {
            const nameLower = name.toLowerCase();
            results = results.filter(event => event.name.toLowerCase().includes(nameLower));
        }

        if (date) {
            results = results.filter(event => event.date === date);
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No matching events found" });
        }

        res.json(results);
    } catch (err) {
        res.status(500).json({ error: "Something went wrong while searching events" });
    }
});



// UPDATE EVENT
router.put('/:id', (req, res) => {
    try {
        const event = events.find(e => e.id === parseInt(req.params.id));
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }

        event.name = req.body.name || event.name;
        event.date = req.body.date || event.date;

        saveEvents(events);   // Save after update
        res.json(event);
    } catch (err) {
        res.status(500).json({ error: "Something went wrong while updating the event" });
    }
});

// DELETE EVENT
router.delete('/:id', (req, res) => {
    try {
        let events = getEvents(); // reload fresh from file each time
        const id = Number(req.params.id);
        const index = events.findIndex(e => Number(e.id) === id);

        if (index === -1) {
            return res.status(404).json({ error: "Event not found" });
        }

        const deletedEvent = events.splice(index, 1);
        saveEvents(events);   // Save after delete
        res.json({ message: "Event deleted successfully", deletedEvent });
    } catch (err) {
        res.status(500).json({ error: "Something went wrong while deleting the event" });
    }
});


module.exports = router;