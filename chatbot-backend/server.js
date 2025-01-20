const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize SQLite Database
const db = new sqlite3.Database("chatbot.db", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database.");
    // Ensure the 'messages' table exists
    db.run(
      `CREATE TABLE IF NOT EXISTS messages (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         user_message TEXT,
         bot_response TEXT
       )`,
      (err) => {
        if (err) {
          console.error("Error creating table:", err.message);
        } else {
          console.log("Messages table is ready.");
        }
      }
    );
  }
});

// Root Endpoint
app.get("/", (req, res) => {
  res.send("Chatbot backend is running!");
});

// Endpoint to handle user messages and bot responses
app.post("/api/message", (req, res) => {
  const { userMessage } = req.body; // Extract userMessage from request body

  if (!userMessage) {
    return res.status(400).json({ error: "User message is required." });
  }

  console.log("User Message:", userMessage); // Debugging log for user message

  // Example bot logic
  let botResponse = "I don't understand. Please rephrase!";

  if (userMessage.toLowerCase() === "hello") {
    botResponse = "Hi there! How can I assist you?";
  } else if (userMessage.toLowerCase() === "tell me a joke") {
    botResponse =
      "Why don’t scientists trust atoms? Because they make up everything!";
  }

  console.log("Bot Response:", botResponse); // Debugging log for bot response

  // Save the message and bot response to the database
  db.run(
    "INSERT INTO messages (user_message, bot_response) VALUES (?, ?)",
    [userMessage, botResponse],
    function (err) {
      if (err) {
        console.error("Error saving message:", err.message);
        return res.status(500).json({ error: "Failed to save message." });
      }
      res.json({ botResponse }); // Send bot response back to the client
    }
  );
});

// Endpoint to fetch chat history
app.get("/api/history", (req, res) => {
  db.all("SELECT * FROM messages", [], (err, rows) => {
    if (err) {
      console.error("Error fetching history:", err.message);
      return res.status(500).json({ error: "Failed to fetch chat history." });
    }
    res.json(rows); // Send the chat history as JSON
  });
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
