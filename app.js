// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');

// Initialize the Express app
const app = express();
const port = 3000;

// Set up body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set up session middleware
app.use(session({
    secret: 'mysecretkey',
    resave: false,
    saveUninitialized: true
}));

// Load the users data from the JSON file
let users = [];
fs.readFile('users.json', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
    } else {
        users = JSON.parse(data);
    }
});

// Home page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Registration page
app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/register.html');
});

// Registration endpoint
app.post('/register', (req, res) => {
    const { firstName, lastName, username, password, email } = req.body;
    
    // Check if username already exists
    if (users.some(user => user.username === username)) {
        return res.send('Username already exists!');
    }
    
    // Create a new user object
    const newUser = {
        firstName,
        lastName,
        username,
        password,
        email
    };
    
    // Add the new user to the users array
    users.push(newUser);
    
    // Save the updated users data to the JSON file
    fs.writeFile('users.json', JSON.stringify(users), (err) => {
        if (err) {
            console.error(err);
        }
    });
    
    res.redirect('/');
});

// Login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // Find the user with the given username and password
    const user = users.find(user => user.username === username && user.password === password);
    
    if (user) {
        // Store the user data in the session
        req.session.user = user;
        res.redirect('/dashboard');
    } else {
        res.send('Invalid username or password!');
    }
});

// Dashboard page
app.get('/dashboard', (req, res) => {
    // Check if the user is logged in
    if (!req.session.user) {
        return res.redirect('/');
    }
    
    res.send(`Welcome ${req.session.user.username}!<br><a href="/logout">Logout</a>`);
});

// Logout endpoint
app.get('/logout', (req, res) => {
    // Destroy the session
    req.session.destroy();
    res.redirect('/');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
