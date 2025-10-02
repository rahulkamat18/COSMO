const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Socket.io for real-time features
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Simulate real-time alerts
  setTimeout(() => {
    socket.emit('new_alert', {
      title: 'Disease Alert',
      message: 'Avian Flu detected 25km from your farm',
      severity: 'high'
    });
  }, 5000);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoints (simplified for demo)
app.get('/api/farms', (req, res) => {
  res.json({
    farms: [
      { id: 1, name: 'Sunny Acres Farm', type: 'poultry', riskLevel: 'low' },
      { id: 2, name: 'Green Valley Pigs', type: 'pig', riskLevel: 'medium' }
    ]
  });
});

app.get('/api/alerts', (req, res) => {
  res.json({
    alerts: [
      { id: 1, title: 'Biosecurity Check Due', message: 'Monthly inspection needed', severity: 'medium' },
      { id: 2, title: 'Training Reminder', message: 'Complete biosecurity training', severity: 'low' }
    ]
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Digital Farm Management Portal running on http://localhost:${PORT}`);
  console.log('📱 Features: Real-time alerts, Interactive dashboard, Mobile responsive');
});
