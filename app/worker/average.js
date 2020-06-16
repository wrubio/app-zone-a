const Redis = require("ioredis");
const Queue = require('bull');
const average = new Queue('worker');
const Device = require('../models/device-model');

// ================================================================
// Redis connection
const REDIS_PORT = process.env.PORT || 6379;
const redis = new Redis({
  port: REDIS_PORT,
  host: "52.151.60.105",
  db: 0,
  retryStrategy: function(times) {
    return Math.min(Math.exp(times), 20000);
  }
});
// ================================================================
// Creation of object with sensor values and average of temperature
function setDoorStatus(device) {
  return new Promise((resolve, reject) => {
    const currTemperature = parseFloat(device.value);
    
    Device.findOne({device_id : device.id}, (err, result) => {
      if (err) return reject(err);
      
      result.door = currTemperature > 16 ? true : false;
      result.save((err, savedDevice) => {
        return err ? reject(err) : resolve(true);
      });
    });
  });
}
// ================================================================
// Creation of object with sensor values and average of temperature
function averageProcess(device) {
  return new Promise((resolve, reject) => {
    Device.findOne({device_id : device.id}, async (error, result) => {
      if (error) return reject (error);
      
      if (result){
        await setDoorStatus(device);
        console.log('UPDATE:', device.id);
        result.value = device.value;
        result.save((err, savedDevice) => {
          return err ? reject(err) : resolve(savedDevice);
        });
      } else {
        console.log('NUEVO:', device.id);
        const newDevice = new Device({
          device_id: device.id,
          device: device.device,
          metric: device.pollutant,
          unit: device.unit,
          value: device.value,
          zone: device.zone,
          country: device.country,
          city: device.city,
          location: device.location,
        });
        
        newDevice.save(async (err, savedDevice) => {
          if (err) return reject(err);

          await setDoorStatus(device);
          
          return resolve(savedDevice);
        });
      }
    });
  });
}

// ================================================================
// Method to process the queue job
average.process(async (job) => {
  return averageProcess(job.data).then();
});

// ================================================================
// Save object in redis key (sensor_data:*) after job end
average.on('completed', async (job) => {
  console.log('complete:', job.returnvalue.device);
});

// ================================================================
// Asign new jobs after recive new message to Redis
async function averageJob(device) {
  average.add(device);
}

module.exports = averageJob;