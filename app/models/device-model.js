const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const znadevicesSchema = new Schema({
  device_id: { type: String, require: [true, 'A device id is require'] },
  device: { type: String, require: [true, 'A device name is require'] },
  metric: { type: String, require: [true, 'A metric value is require'] },
  unit: { type: String, default: 'Celsius' },
  value: { type: String, require: [true, 'A temperature value is require'] },
  door: { type: Boolean, default: false },
  zone: { type: String, default: 'Zone A' },
  country: { type: String, default: '' },
  city: { type: String, default: '' },
  location: { type: String, default: '' },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
}, { 
  collection: 'znadevices '
});

znadevicesSchema.plugin(uniqueValidator, { message: 'the {PATH} must be unique' });

module.exports = mongoose.model('Znadevices', znadevicesSchema);