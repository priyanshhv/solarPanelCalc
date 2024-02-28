// index.js
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');

const app = express();

// Enable CORS
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(`mongodb+srv://nopenoppp:${process.env.DB_PASSWORD}@cluster0.ip2z7hj.mongodb.net/solar`, {    
  useNewUrlParser: true,
  useUnifiedTopology: true,
  
});

const db = mongoose.connection;

// Create a schema
const solarSchema = new mongoose.Schema({
  state: String,
  localSolPower: Number,
  localSolArrRate: Number
});

const Solar = mongoose.model('Solar', solarSchema);

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
  Solar.updateMany(
  { localSolPower: { $type: "decimal" } },
  { $set: { "localSolPower": { $trunc: { $multiply: ["$localSolPower", 10] } } } }
)
});

// Routes
app.get('/api/state/:stateName',cors(),async (req, res) => {
  const { stateName } = req.params;

  try {
    const solarData = await Solar.findOne({ state: stateName });
    if (!solarData) {
      return res.status(404).json({ message: 'Page not found' });
    }
    res.json(solarData);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

app.post('/api/solar',cors(),async (req, res) => {
  //console.log("post request came");

  const { state, localSolPower,localSolArrRate } = req.body;

  try {
    let solarData = await Solar.findOne({ state });
    if (solarData) {
      return res.status(400).json({ message: 'Page already exists' });
    }

    solarData = new Solar({ state, localSolPower,localSolArrRate  });
    await solarData.save();
    res.status(201).json({ message: 'Page created successfully', solarData: solarData });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});


const PORT =  5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
