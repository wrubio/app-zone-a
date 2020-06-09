const mqtt = require('mqtt');
const client = mqtt.connect('ws://fd01398c9f36.ngrok.io');
const topic = 'ZonaA';
const persitant = require('./app/worker/average');

// Database connection
require('./app/config/db/db');

// ================================================================
// Subscribe to broker topic
client.on('connect', () => {
  console.log('connected');
  client.subscribe(topic);
});

// ================================================================
// Call job to worker
client.on('message', (topic, data) => {
  message = JSON.parse(data);
  persitant(message);
});

client.on('error', (error) => {
  console.log(error);
});