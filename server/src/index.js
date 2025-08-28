require('dotenv').config();

// API bootstrap
const express = require('express');
const connectDB = require('./utils/db');
const cors = require('cors');

const healthRoute = require('./routes/health.route');
const sessionRoute = require('./routes/session.route');
const resumeRoute = require('./routes/resume.route');

const app = express();
const PORT = process.env.PORT || 4000;

connectDB();

app.use(express.json());

app.use(cors()); 

app.get('/', (req, res) => {
    res.send('Smart AI resume maker backend is running');
});

app.use('/api/health', healthRoute);
app.use('/api/session', sessionRoute);
app.use('/api/resume', resumeRoute);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});