const Redis = require("ioredis");
const Queue = require('bull');
const fs = require('fs');
const Device = require('../models/device-model');
const osu = require('node-os-utils');
const im = require('imagemagick');


const average = new Queue('worker', 'redis://13.77.173.249:6379');
const resizeImg2k = new Queue('img2k', 'redis://13.77.173.249:6379');
const resizeImg4k = new Queue('img4k', 'redis://13.77.173.249:6379');
const resizeImg8k = new Queue('img8k', 'redis://13.77.173.249:6379');

// ================================================================
// Redis connection
const REDIS_PORT = process.env.PORT || 6379;
const redis = new Redis({
  port: REDIS_PORT,
  host: "13.77.173.249",
  db: 0,
  retryStrategy: function(times) {
    return Math.min(Math.exp(times), 20000);
  }
});


// ================================================================
// Show cpu and memory current values
async function showPerformanceMetris() {
  const cpu = osu.cpu;
  const mem = osu.mem;

  const cpuResult = await cpu.usage().then(res => res);
  const memResult = await mem.used().then(res => res);
  console.log('RESULTADOS DE METRICAS DE RENDIMIENTO');
  console.log('CPU: ', cpuResult);
  console.log('RAM: ', memResult);
  console.log('======================================');

  setTimeout(() => {
    return showPerformanceMetris();
  }, 10000);
}
showPerformanceMetris();
// ================================================================
// Resize image 
function resizeImage(imgResize) {
  return new Promise((resolve, reject) => {
    const size = [1920, 3840, 7860];

    im.resize({
      srcPath: __dirname + '/img.jpeg',
      dstPath: 'kittens-small.jpg',
      width:   size[imgResize],
    }, function(err, stdout, stderr){
      if (err) return reject(err);
      console.log('resized kittens.jpg to fit within 7680x7680px');
      return resolve({ok: true});
    });
  });
}
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
  return new Promise(async (resolve, reject) => {
    Device.findOne({device_id : device.id}, async (error, result) => {
      if (error) return reject (error);
      
      if (result){
        await setDoorStatus(device);
        // console.log('UPDATE:', device.id);
        result.value = device.value;
        result.save((err, savedDevice) => {
          return err ? reject(err) : resolve(savedDevice);
        });
      } else {
        // console.log('NUEVO:', device.id);
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
resizeImg2k.process(async (job) => {
  return resizeImage(+job.data).then();
});
resizeImg4k.process(async (job) => {
  return resizeImage(+job.data).then();
});
resizeImg8k.process(async (job) => {
  return resizeImage(+job.data).then();
});
// ================================================================
// Save object in redis key (sensor_data:*) after job end
average.on('completed', async (job) => {
  // console.log('complete:', job.returnvalue.device);
});
resizeImg2k.on('completed', async (job) => {
  console.log('complete:', job.returnvalue);
});
resizeImg4k.on('completed', async (job) => {
  console.log('complete:', job.returnvalue);
});
resizeImg8k.on('completed', async (job) => {
  console.log('complete:', job.returnvalue);
});

// ================================================================
// Asign new jobs after recive new message to Redis
async function averageJob(device) {
  average.add(device);
  // resizeImg2k.add(0);
  // resizeImg4k.add(1);
  // resizeImg8k.add(2);
}

module.exports = averageJob;