// app_api/controllers/trips.controller.js
const Trip = require('../models/trips.model');

// GET /api/trips
exports.tripsList = async (req, res, next) => {
  try {
    const docs = await Trip.find().sort({ start: 1 }).lean();
    res.json(docs);
  } catch (err) {
    next(err);
  }
};

// GET /api/trips/:tripCode
exports.tripsReadOne = async (req, res, next) => {
  try {
    const trip = await Trip.findByTripCode(req.params.tripCode);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    res.json(trip);
  } catch (err) {
    next(err);
  }
};


// POST /api/trips
exports.tripsCreate = async (req, res, next) => {
  try {
    const doc = await Trip.create(req.body);
    res.status(201).json(doc);
  } catch (err) {
    if (err.code === 11000) { // duplicate tripCode
      err.status = 409;
      err.publicMessage = 'Trip code already exists';
    }
    next(err);
  }
};

// PUT /api/trips/:tripCode
exports.tripsUpdateOne = async (req, res, next) => {
  try {
    const trip = await Trip.findByTripCode(req.params.tripCode);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    Object.assign(trip, req.body);
    await trip.save();
    res.json(trip);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/trips/:tripCode
exports.tripsDeleteOne = async (req, res, next) => {
  try {
    const trip = await Trip.findByTripCode(req.params.tripCode);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    await trip.deleteOne();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};