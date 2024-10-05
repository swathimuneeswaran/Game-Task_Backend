const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

// Initialize the app
const app = express();

// Middleware with specific CORS origin


app.use(cors());
app.use(bodyParser.json());
app.use(express.json());  // This allows Express to parse JSON in POST requests

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Use an environment variable for your DB connection string
  ssl: {
    rejectUnauthorized: false, // Include this if needed for cloud services
  },
});


// PostgreSQL Connection Pool
// const pool = new Pool({
//   user: 'postgres',
//   host: 'localhost',
//   database: 'game',
//   password: '12345678',
//   port: 5432,
// });

// Create the games table (run only once)
pool.query(`
  CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    player1Name VARCHAR(100),
    player2Name VARCHAR(100),
    rounds JSONB
  )
`, (err, res) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Games table created or already exists');
  }
});

// Routes
// Routes
app.post('/api/save-game', async (req, res) => {
    try {
      const { player1Name, player2Name, rounds } = req.body;
  
      if (!player1Name || !player2Name || !rounds || !Array.isArray(rounds)) {
        return res.status(400).send({ message: 'Invalid data' });
      }
  
      // Insert data into the database
      const query = `
        INSERT INTO games (player1Name, player2Name, rounds) 
        VALUES ($1, $2, $3) RETURNING *;
      `;
      const values = [player1Name, player2Name, JSON.stringify(rounds)]; // Convert rounds to JSON string
  
      const result = await pool.query(query, values);
      
      console.log("Game data inserted:", result.rows[0]); // Log the inserted game data
  
      // Send success response
      res.status(200).send({ message: 'Game saved successfully', game: result.rows[0] });
    } catch (error) {
      console.error('Error saving game:', error);
      res.status(500).send({ message: 'Internal server error' });
    }
  });
  

// Listen on a port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
