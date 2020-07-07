const mqtt = require('mqtt');
const client = mqtt.connect('ws://52.156.64.39'); // ws://localhost:3800
const clientImg = mqtt.connect('ws://52.156.64.39'); /// ws://localhost:3800
const clientVideo = mqtt.connect('ws://52.156.64.39'); // ws://localhost:3800
const topic = 'ZonaA';
const topicB = 'Image';
const topicC = 'Video';
const persitant = require('./app/worker/average');

// Database connection
require('./app/config/db/db');

// ================================================================
// Subscribe to broker topic
client.on('connect', () => {
  console.log('temp connected');
  client.subscribe(topic);
});

clientImg.on('connect', () => {
  console.log('img connected');
  // clientImg.subscribe(topicB);
});

clientVideo.on('connect', () => {
  console.log('Video connected');
  // clientVideo.subscribe(topicC);
});
// ================================================================
// Call job to worker
client.on('message', (topic, dataTemp) => {
  persitant.temp(JSON.parse(dataTemp));
});

clientImg.on('message', (topicB, dataImage) => {
  const data = JSON.parse(dataImage);
  persitant.image(data.data);
});


clientVideo.on('message', (topicC, dataImage) => {
  const data = JSON.parse(dataImage);
  persitant.video(data.data);
});

client.on('error', (error) => {
  console.log(error);
});