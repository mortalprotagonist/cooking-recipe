const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

const corsOptions = {
    origin: 'http://localhost:5173', 
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json()); 

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "dbms_project"
});

db.connect((err) => {
    if (err) {
        console.error("Error connecting to MySQL:", err);
        return;
    }
    console.log("Connected to MySQL");
});

app.get('/signup', (req, res) => {
    res.send("BACKEND API");
});

app.get('/profile', (req, res) => {
    res.send("BACKEND API");
});

app.get('/login', (req, res) => {
    res.send("BACKEND API");
});


app.get('/', (req, res) => {
    res.send("BACKEND API");
});



app.post('/signup', (req, res) => {
    console.log("Received data:", req.body);

    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    const values = [
        req.body.name,
        req.body.email,
        req.body.password
    ];

    db.query(sql, values, (err, data) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }
        const user = {
            id: data.insertId,
            name: req.body.name,
            email: req.body.email
        };
        return res.json({ message: "User registered successfully", user: user });    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
    const values = [email, password];

    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('Login error:', err);
            return res.status(500).json({ success: false, message: 'An error occurred while logging in' });
        }

        if (results.length > 0) {
            const user = results[0]; 
            return res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
        } else {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    });
});

app.get('/recipes', (req, res) => {
    const sql = `
      SELECT recipes.id, recipes.title, recipes.description, users.name AS user_name
      FROM recipes
      JOIN users ON recipes.user_id = users.id
    `;
  
    db.query(sql, (err, results) => {
      if (err) {
        console.error("Error fetching recipes:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }
      res.json(results);
    });
});

  app.get('/user-recipes', (req, res) => {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }
  
    const sql = `
      SELECT recipes.id, recipes.title, recipes.description, users.name AS user_name
      FROM recipes
      JOIN users ON recipes.user_id = users.id
      WHERE recipes.user_id = ?
    `;
  
    db.query(sql, [userId], (err, results) => {
      if (err) {
        console.error("Error fetching user recipes:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }
      res.json(results); 
    });
  });
  

  app.post('/recipes', (req, res) => {
    const { title, description, userId, ingredients } = req.body; 

    if (!title || !description || !userId || !ingredients) {
        return res.status(400).json({ message: "Title, description, userId, and ingredients are required" });
    }

    const sql = "INSERT INTO recipes (title, description, user_id, ingredients) VALUES (?, ?, ?, ?)";
    const values = [title, description, userId, ingredients]; 

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error adding recipe:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }
        res.status(201).json({ id: result.insertId, title, description, userId, ingredients });
    });
});

app.get('/recipes/:id', (req, res) => {
    const recipeId = req.params.id;
    const sql = `
      SELECT recipes.*, users.name AS author_name
      FROM recipes
      JOIN users ON recipes.user_id = users.id
      WHERE recipes.id = ?`;
    
    db.query(sql, [recipeId], (err, results) => {
      if (err) {
        console.error("Error fetching recipe details:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }
      res.json(results[0]); 
    });
  });
  
    app.post('/favorites', (req, res) => {
    const { userId, recipeId } = req.body;

    if (!userId || !recipeId) {
        return res.status(400).json({ message: 'User ID and Recipe ID are required' });
    }

    const sql = "INSERT INTO favorites (user_id, recipe_id) VALUES (?, ?)";
    const values = [userId, recipeId];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error adding to favorites:", err);
            return res.status(500).json({ message: 'Database error', error: err });
        }

        res.status(201).json({ message: 'Recipe added to favorites', favoriteId: result.insertId });
    });
});


app.get('/favorites', (req, res) => {
    const userId = req.query.userId;

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    const sql = `
        SELECT recipes.id, recipes.title, recipes.description, users.name AS user_name
        FROM favorites
        JOIN recipes ON favorites.recipe_id = recipes.id
        JOIN users ON recipes.user_id = users.id
        WHERE favorites.user_id = ?
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Error fetching favorites:", err);
            return res.status(500).json({ message: 'Database error', error: err });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No favorites found for this user' });
        }

        res.json(results);
    });
});

app.delete('/favorites', (req, res) => {
    const { userId, recipeId } = req.body;
  
    const query = 'DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?';
    
    db.query(query, [userId, recipeId], (error, results) => {
      if (error) {
        console.error('Error removing favorite:', error);
        return res.status(500).send('Internal Server Error');
      }
  
      res.status(200).send('Favorite removed successfully');
    });
  });

  app.post('/recipes/:id/comments', (req, res) => {
    const recipeId = req.params.id;
    const { user_id, comment } = req.body; 
    const sql = 'INSERT INTO comments (recipe_id, user_id, comment) VALUES (?, ?, ?)'; 
    const values = [recipeId, user_id, comment];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error adding comment:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }
        res.status(201).json({ id: result.insertId, recipeId, user_id, comment });
    });
});

  

app.get('/recipes/:id/comments', (req, res) => {
    const recipeId = req.params.id;
    const sql = `
        SELECT comments.*, users.name AS user_name 
        FROM comments 
        JOIN users ON comments.user_id = users.id 
        WHERE comments.recipe_id = ?
    `; 
    db.query(sql, [recipeId], (err, results) => {
        if (err) {
            console.error("Error fetching comments:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }
        res.json(results); 
    });
});

app.get('/recipes/:id', (req, res) => {
    const recipeId = req.params.id;
    const sql = `
      SELECT r.*, a.name AS author_name 
      FROM recipes r
      JOIN authors a ON r.author_id = a.id 
      WHERE r.id = ?`;
    
    db.query(sql, [recipeId], (err, results) => {
      if (err) {
        console.error("Error fetching recipe details:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }
      res.json(results[0]); 
    });
  });
  
  

app.listen(8082, () => {
    console.log("Server is running on port 8082");
});
