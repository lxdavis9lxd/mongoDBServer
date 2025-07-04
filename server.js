const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const os = require('os');
require('dotenv').config();

const app = express();
const PORT = 5001;

// Middleware
app.use(bodyParser.json());

// Middleware to check API key
const API_KEY = process.env.API_KEY;

// Debugging: Log the loaded API key from the environment
console.log('Loaded API Key from .env:', API_KEY);

// Remove API key check on startup
// Comment out the middleware for API key validation
// app.use((req, res, next) => {
//   console.log('Received API Key:', req.headers['x-api-key']);
//   const apiKey = req.headers['x-api-key'];
//   if (apiKey !== API_KEY) {
//     return res.status(403).json({ message: 'Forbidden: Invalid API Key' });
//   }
//   next();
// });
// mongodb+srv://lxdavis9lxd:<db_password>@cluster0.kjlacwu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
// MongoDB Connection
mongoose.connect('mongodb+srv://lxdavis9lxd:Mynameissora99@cluster0.kjlacwu.mongodb.net/mongoDB?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define a Mongoose Schema and Model
const itemSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
});

const Item = mongoose.model('Item', itemSchema);

// CRUD Endpoints

// Add a default route to handle the root URL
app.get('/', (req, res) => {
  res.send('Welcome to the MongoDB Server API!');
});

// Ensure the correct Content-Type header is set for JSON requests
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Configure CORS for all routes
app.use(cors({
  origin: '*', // Allow all origins
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization,x-api-key'
}));

// Serve static files from the current directory
app.use(express.static(__dirname));

// Add a middleware to log all requests and responses
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Request Headers:', req.headers);
  
  // Capture the original send method
  const originalSend = res.send;
  
  // Override the send method
  res.send = function(body) {
    console.log(`Response Status: ${res.statusCode}`);
    // Call the original send method
    return originalSend.call(this, body);
  };
  
  next();
});

// Test endpoint to verify authorization
app.get('/auth-test', (req, res) => {
  console.log('Auth test called with headers:', req.headers);
  res.json({ message: 'Authorization test successful', headers: req.headers });
});

// Create
app.post('/items', async (req, res) => {
  console.log('POST /items called with body:', req.body);
  if (!req.body.name || !req.body.quantity) {
    return res.status(400).json({ message: 'Name and quantity are required.' });
  }
  try {
    const newItem = new Item(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    console.error('Error in POST /items:', error.message);
    res.status(400).json({ message: error.message });
  }
});

// Read All
app.get('/items', async (req, res) => {
  console.log('GET /items called');
  try {
    const items = await Item.find();
    console.log('Retrieved items from MongoDBv1:', items);
    res.json(items);
  } catch (error) {
    console.error('Error in GET /items:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Read One
app.get('/items/:id', async (req, res) => {
  console.log(`GET /items/${req.params.id} called`);
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    console.error(`Error in GET /items/${req.params.id}:`, error.message);
    res.status(400).json({ message: 'Invalid ID format' });
  }
});

// Update
app.put('/items/:id', async (req, res) => {
  console.log(`PUT /items/${req.params.id} called with body:`, req.body);
  if (!req.body.name && !req.body.quantity) {
    return res.status(400).json({ message: 'At least one field (name or quantity) is required.' });
  }
  try {
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedItem) return res.status(404).json({ message: 'Item not found' });
    res.json(updatedItem);
  } catch (error) {
    console.error(`Error in PUT /items/${req.params.id}:`, error.message);
    res.status(400).json({ message: 'Invalid ID format or update error' });
  }
});

// Delete
app.delete('/items/:id', async (req, res) => {
  console.log(`DELETE /items/${req.params.id} called`);
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted' });
  } catch (error) {
    console.error(`Error in DELETE /items/${req.params.id}:`, error.message);
    res.status(400).json({ message: 'Invalid ID format' });
  }
});

// Start Server
const host = os.hostname();
app.listen(PORT, () => {
  console.log(`Server running on http://${host}:${PORT}`);
});
