const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = 5000;

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

// MongoDB Connection
mongoose.connect('mongodb+srv://lxdavis9lxd:Mynameissora99@cluster0.kjlacwu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
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

// Create
app.post('/items', async (req, res) => {
  console.log('POST /items called with body:', req.body);
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
    console.log('Retrieved items from MongoDB:', items);
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
    res.status(500).json({ message: error.message });
  }
});

// Update
app.put('/items/:id', async (req, res) => {
  console.log(`PUT /items/${req.params.id} called with body:`, req.body);
  try {
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedItem) return res.status(404).json({ message: 'Item not found' });
    res.json(updatedItem);
  } catch (error) {
    console.error(`Error in PUT /items/${req.params.id}:`, error.message);
    res.status(400).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
