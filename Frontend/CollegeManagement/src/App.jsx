import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Event form states
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");

  // Registration form states
  const [showRegModal, setShowRegModal] = useState(false);
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regEventId, setRegEventId] = useState(null);
  const [regMessage, setRegMessage] = useState("");

  // Fetch events
  useEffect(() => {
    fetch("http://localhost:5000/events")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch events");
        return res.json();
      })
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Open modal (Add / Edit Event)
  const openModal = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setName(event.name);
      setDate(event.date);
    } else {
      setEditingEvent(null);
      setName("");
      setDate("");
    }
    setShowModal(true);
  };

  // Save Event
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !date) {
      alert("Please fill in both fields");
      return;
    }

    const method = editingEvent ? "PUT" : "POST";
    const url = editingEvent
      ? `http://localhost:5000/events/${editingEvent.id}`
      : "http://localhost:5000/events";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, date }),
      });

      if (!res.ok) throw new Error("Failed to save event");
      const savedEvent = await res.json();

      if (editingEvent) {
        setEvents(events.map((e) => (e.id === savedEvent.id ? savedEvent : e)));
      } else {
        setEvents([...events, savedEvent]);
      }
      setShowModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete Event
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/events/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete event");
      setEvents(events.filter((e) => e.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  // Open Registration Modal
  const openRegistration = (eventId) => {
    setRegEventId(eventId);
    setRegName("");
    setRegEmail("");
    setRegMessage("");
    setShowRegModal(true);
  };

  // Handle Registration
  const handleRegistration = async (e) => {
    e.preventDefault();

    if (!regName || !regEmail) {
      setRegMessage("⚠️ Please enter name and email");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: regEventId,
          name: regName,
          email: regEmail,
        }),
      });
      

      const result = await res.json();

      if (result.success) {
        setRegMessage("✅ Registered successfully!");
        // Auto-close modal after 1.5 seconds
        setTimeout(() => setShowRegModal(false), 1500);
      } else {
        setRegMessage("❌ " + result.message);
      }
    } catch (err) {
      setRegMessage("❌ Registration failed!");
      console.error(err);
    }
  };

  if (loading) return <p>Loading events...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div>
      <h1>🎉 Upcoming Events</h1>

      {/* Events Grid */}
      <div className="events-grid">
        {events.map((event) => (
          <div key={event.id} className="card">
            <h3>{event.name}</h3>
            <p>{event.date}</p>

            <div className="actions">
              <button className="edit" onClick={() => openModal(event)}>✏️ Edit</button>
              <button className="delete" onClick={() => handleDelete(event.id)}>🗑 Delete</button>
              <button className="apply" onClick={() => openRegistration(event.id)}>📝 Apply</button>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Add Button */}
      <button className="add-btn" onClick={() => openModal()}>➕ Add Event</button>

      {/* Event Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingEvent ? "Edit Event" : "Add Event"}</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Event Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <div className="actions">
                <button type="button" className="cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="save">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {showRegModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Register for Event</h2>
            <form onSubmit={handleRegistration}>
              <input
                type="text"
                placeholder="Your Name"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
              />
              <input
                type="email"
                placeholder="Your Email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
              />
              <div className="actions">
                <button type="button" className="cancel" onClick={() => setShowRegModal(false)}>Cancel</button>
                <button type="submit" className="save">Apply</button>
              </div>
            </form>
            {regMessage && <p style={{ marginTop: "10px" }}>{regMessage}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
