const express = require('express')
const app = express();
const db = require('./db');
require('dotenv').config();

const bodyParser = require('body-parser'); 
app.use(bodyParser.json()); // req.body
const PORT = process.env.PORT || 3000;


// Import the router files
const userRoutes = require('./routes/userRoutes');
const candidatRoutes = require('./routes/candidateRoutes');

// Use the routers

app.use('/user',userRoutes);
app.use('/candidate',candidatRoutes);



// Start the server
//const PORT = 3000;
app.listen(PORT,()=>{
    console.log('Listening on port 3000');
});