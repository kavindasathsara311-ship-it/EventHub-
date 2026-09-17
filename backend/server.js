const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Helper logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Root endpoint
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to EventHub REST API', status: 'running' });
});

// =========================================
// AUTH & USER ENDPOINTS
// =========================================

// POST /api/auth/register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = db.get('users').find({ email: normalizedEmail }).value();

  if (existingUser) {
    return res.status(400).json({ message: 'An account with this email already exists.' });
  }

  const newUser = {
    id: 'u_' + Date.now(),
    name: name.trim(),
    email: normalizedEmail,
    password, // Plain text for simplicity in demo
    role: role === 'organizer' ? 'organizer' : 'user'
  };

  db.get('users').push(newUser).write();

  const { password: _, ...userWithoutPassword } = newUser;
  return res.status(201).json({
    message: 'Registration successful',
    user: userWithoutPassword
  });
});

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = db.get('users').find({ email: normalizedEmail }).value();

  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const { password: _, ...userWithoutPassword } = user;
  return res.json({
    message: 'Login successful',
    user: userWithoutPassword
  });
});

// GET /api/users/:id
app.get('/api/users/:id', (req, res) => {
  const user = db.get('users').find({ id: req.params.id }).value();
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const { password: _, ...userWithoutPassword } = user;
  return res.json(userWithoutPassword);
});

// PUT /api/users/:id
app.put('/api/users/:id', (req, res) => {
  const user = db.get('users').find({ id: req.params.id }).value();
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const { name, email, password } = req.body || {};
  const updates = {};

  if (name && name.trim()) updates.name = name.trim();
  if (email && email.trim()) updates.email = email.toLowerCase().trim();
  if (password && password.trim()) updates.password = password.trim();

  db.get('users').find({ id: req.params.id }).assign(updates).write();

  const updatedUser = db.get('users').find({ id: req.params.id }).value();
  const { password: _, ...userWithoutPassword } = updatedUser;

  return res.json({
    message: 'Profile updated successfully',
    user: userWithoutPassword
  });
});

// =========================================
// EVENT ENDPOINTS
// =========================================

// GET /api/events
app.get('/api/events', (req, res) => {
  const { search, category, organizerId } = req.query;
  let events = db.get('events').value();

  if (category && category.trim() !== '' && category.toLowerCase() !== 'all') {
    events = events.filter(e => e.category && e.category.toLowerCase() === category.toLowerCase());
  }

  if (organizerId && organizerId.trim() !== '') {
    events = events.filter(e => e.organizerId === organizerId);
  }

  if (search && search.trim() !== '') {
    const query = search.toLowerCase().trim();
    events = events.filter(e =>
      (e.name && e.name.toLowerCase().includes(query)) ||
      (e.description && e.description.toLowerCase().includes(query)) ||
      (e.location && e.location.toLowerCase().includes(query)) ||
      (e.category && e.category.toLowerCase().includes(query))
    );
  }

  return res.json(events);
});

// GET /api/events/:id
app.get('/api/events/:id', (req, res) => {
  const event = db.get('events').find({ id: req.params.id }).value();
  if (!event) {
    return res.status(404).json({ message: 'Event not found.' });
  }
  return res.json(event);
});

// POST /api/events
app.post('/api/events', (req, res) => {
  const { name, image, description, date, time, location, category, price, totalSeats, organizerId } = req.body || {};

  if (!name || !date || !time || !location || !category || !totalSeats) {
    return res.status(400).json({ message: 'Name, date, time, location, category, and total seats are required.' });
  }

  const seatsNum = parseInt(totalSeats, 10);
  if (isNaN(seatsNum) || seatsNum <= 0) {
    return res.status(400).json({ message: 'Total seats must be a positive number.' });
  }

  const newEvent = {
    id: 'e_' + Date.now(),
    name: name.trim(),
    image: image && image.trim() ? image.trim() : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    description: description ? description.trim() : '',
    date,
    time,
    location: location.trim(),
    category: category.trim(),
    price: parseFloat(price) || 0,
    totalSeats: seatsNum,
    availableSeats: seatsNum,
    organizerId: organizerId || 'u1'
  };

  db.get('events').push(newEvent).write();
  return res.status(201).json({
    message: 'Event created successfully',
    event: newEvent
  });
});

// PUT /api/events/:id
app.put('/api/events/:id', (req, res) => {
  const event = db.get('events').find({ id: req.params.id }).value();
  if (!event) {
    return res.status(404).json({ message: 'Event not found.' });
  }

  const { name, image, description, date, time, location, category, price, totalSeats, availableSeats } = req.body || {};
  const updates = {};

  if (name !== undefined) updates.name = name.trim();
  if (image !== undefined) updates.image = image.trim();
  if (description !== undefined) updates.description = description.trim();
  if (date !== undefined) updates.date = date;
  if (time !== undefined) updates.time = time;
  if (location !== undefined) updates.location = location.trim();
  if (category !== undefined) updates.category = category.trim();
  if (price !== undefined) updates.price = parseFloat(price) || 0;

  if (totalSeats !== undefined) {
    const newTotal = parseInt(totalSeats, 10);
    if (!isNaN(newTotal) && newTotal > 0) {
      const bookedSeats = event.totalSeats - event.availableSeats;
      updates.totalSeats = newTotal;
      updates.availableSeats = Math.max(0, newTotal - bookedSeats);
    }
  }

  if (availableSeats !== undefined) {
    const newAvailable = parseInt(availableSeats, 10);
    if (!isNaN(newAvailable) && newAvailable >= 0) {
      updates.availableSeats = newAvailable;
    }
  }

  db.get('events').find({ id: req.params.id }).assign(updates).write();
  const updatedEvent = db.get('events').find({ id: req.params.id }).value();

  return res.json({
    message: 'Event updated successfully',
    event: updatedEvent
  });
});

// DELETE /api/events/:id
app.delete('/api/events/:id', (req, res) => {
  const event = db.get('events').find({ id: req.params.id }).value();
  if (!event) {
    return res.status(404).json({ message: 'Event not found.' });
  }

  // Delete event
  db.get('events').remove({ id: req.params.id }).write();

  // Cancel associated bookings
  const bookings = db.get('bookings').filter({ eventId: req.params.id }).value();
  bookings.forEach(b => {
    db.get('bookings').find({ id: b.id }).assign({ status: 'cancelled' }).write();
  });

  return res.json({ message: 'Event deleted successfully.' });
});

// GET /api/events/:id/bookings
app.get('/api/events/:id/bookings', (req, res) => {
  const bookings = db.get('bookings').filter({ eventId: req.params.id }).value();
  return res.json(bookings);
});

// =========================================
// BOOKING ENDPOINTS
// =========================================

// POST /api/bookings
app.post('/api/bookings', (req, res) => {
  const { eventId, userId, attendeeName, attendeeEmail, seats } = req.body || {};

  if (!eventId || !userId || !attendeeName || !attendeeEmail || !seats) {
    return res.status(400).json({ message: 'All booking fields are required.' });
  }

  const seatsRequested = parseInt(seats, 10);
  if (isNaN(seatsRequested) || seatsRequested <= 0) {
    return res.status(400).json({ message: 'Seats must be a positive number.' });
  }

  const event = db.get('events').find({ id: eventId }).value();
  if (!event) {
    return res.status(404).json({ message: 'Event not found.' });
  }

  if (event.availableSeats < seatsRequested) {
    return res.status(400).json({
      message: `Not enough seats available. Only ${event.availableSeats} seat(s) remaining.`
    });
  }

  const totalPrice = seatsRequested * parseFloat(event.price || 0);

  const newBooking = {
    id: 'b_' + Date.now(),
    eventId,
    userId,
    attendeeName: attendeeName.trim(),
    attendeeEmail: attendeeEmail.toLowerCase().trim(),
    seats: seatsRequested,
    totalPrice,
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };

  // Decrement available seats
  const newAvailableSeats = event.availableSeats - seatsRequested;
  db.get('events').find({ id: eventId }).assign({ availableSeats: newAvailableSeats }).write();

  // Insert booking
  db.get('bookings').push(newBooking).write();

  return res.status(201).json({
    message: 'Booking confirmed successfully!',
    booking: newBooking,
    event: db.get('events').find({ id: eventId }).value()
  });
});

// GET /api/bookings/user/:userId
app.get('/api/bookings/user/:userId', (req, res) => {
  const bookings = db.get('bookings').filter({ userId: req.params.userId }).value();

  // Attach event details to each booking
  const populatedBookings = bookings.map(b => {
    const event = db.get('events').find({ id: b.eventId }).value();
    return {
      ...b,
      event: event || null
    };
  });

  return res.json(populatedBookings);
});

// PUT /api/bookings/:id/cancel
app.put('/api/bookings/:id/cancel', (req, res) => {
  const booking = db.get('bookings').find({ id: req.params.id }).value();

  if (!booking) {
    return res.status(404).json({ message: 'Booking not found.' });
  }

  if (booking.status === 'cancelled') {
    return res.status(400).json({ message: 'Booking is already cancelled.' });
  }

  // Restore available seats on event
  const event = db.get('events').find({ id: booking.eventId }).value();
  if (event) {
    const restoredSeats = event.availableSeats + booking.seats;
    db.get('events').find({ id: event.id }).assign({ availableSeats: restoredSeats }).write();
  }

  // Update booking status
  db.get('bookings').find({ id: booking.id }).assign({ status: 'cancelled' }).write();
  const updatedBooking = db.get('bookings').find({ id: booking.id }).value();

  return res.json({
    message: 'Booking cancelled successfully and seats restored.',
    booking: updatedBooking
  });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`EventHub Express Backend running on port ${PORT}`);
});
