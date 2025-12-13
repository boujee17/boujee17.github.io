// app_api/models/trips.model.js
const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    tripCode:   { type: String, required: true, unique: true, uppercase: true, trim: true },
    name:       { type: String, required: true, trim: true },
    length:     { type: Number, required: true, min: 1 },
    start:      { type: Date, required: true },
    resort:     { type: String, required: true, trim: true },
    perPerson:  { type: Number, required: true, min: 0 },
    image:      { type: String, default: '' },
    description:{ type: String, default: '' },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  }
);

// Ensure index exists even if collection pre-existed
tripSchema.index({ tripCode: 1 }, { unique: true });

// Helper: normalize lookups by tripCode
tripSchema.statics.findByTripCode = function (code) {
  return this.findOne({
    tripCode: String(code || '').toUpperCase().trim(),
  });
};

module.exports = mongoose.model('Trip', tripSchema);
