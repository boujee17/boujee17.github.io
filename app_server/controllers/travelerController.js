const path = require('path');
const trips = require(path.join(__dirname, '../../data/trips.json'));

exports.listTrips = (req, res) => {
  res.render('travelers', {
    title: 'Upcoming Trips | Travlr',
    trips
  });
};

exports.tripDetail = (req, res) => {
  const trip = trips.find(t => t.code === req.params.code);
  if (!trip) {
    return res.status(404).render('404', { title: 'Trip Not Found | Travlr' });
  }
  res.render('trip', { title: `${trip.name} | Travlr`, trip });
};
