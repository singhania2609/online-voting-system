const express = require('express')
const app = express();
const path = require('path');
const db = require('./db');
require('dotenv').config();

const bodyParser = require('body-parser'); 
app.use(bodyParser.json()); // req.body

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html for base route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/index.html'));
});

const PORT = process.env.PORT || 3000;


// Import the router files
const userRoutes = require('./routes/userRoutes');
const candidatRoutes = require('./routes/candidateRoutes');

// Use the routers
app.use('/user',userRoutes);
app.use('/candidate',candidatRoutes);

app.use('/uploads', express.static('uploads'));




// Start the server
//const PORT = 3000;
app.listen(PORT,()=>{
    console.log('Listening on port 3000');
}); 