import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  runTransaction,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

const SEED_EVENTS = [
  {
    name: 'Tech Innovators Summit 2026',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    description: 'A premier gathering of technology leaders, developers, and visionaries discussing AI, Cloud, and the future of software.',
    date: '2026-10-15',
    time: '09:00 AM',
    location: 'Silicon Convention Center, San Francisco',
    category: 'Technology',
    price: 99,
    totalSeats: 200,
    availableSeats: 195,
    organizerId: 'u1'
  },
  {
    name: 'Summer Vibes Music Festival',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
    description: 'Experience live performances by top indie and electronic artists with interactive light shows, gourmet food trucks, and art.',
    date: '2026-11-20',
    time: '04:00 PM',
    location: 'Oceanfront Park, Miami',
    category: 'Music',
    price: 149,
    totalSeats: 500,
    availableSeats: 480,
    organizerId: 'u1'
  },
  {
    name: 'Global Leadership Forum',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
    description: 'Master essential leadership strategies, corporate innovation, and sustainable scaling in a high-impact one-day conference.',
    date: '2026-12-05',
    time: '10:00 AM',
    location: 'Grand Plaza Hotel, Chicago',
    category: 'Business',
    price: 199,
    totalSeats: 150,
    availableSeats: 150,
    organizerId: 'u1'
  },
  {
    name: 'Modern Design & Digital Art Expo',
    image: 'https://images.unsplash.com/photo-1531058240690-006c446962d8?w=800',
    description: 'Immerse yourself in cutting-edge digital art installations, 3D graphics showcases, and creative workshops.',
    date: '2026-12-18',
    time: '11:00 AM',
    location: 'Metropolitan Art Gallery, New York',
    category: 'Arts',
    price: 45,
    totalSeats: 100,
    availableSeats: 95,
    organizerId: 'u1'
  }
];

// ==========================================
// USER & AUTH SERVICES
// ==========================================

export const registerUserInFirestore = async (name, email, password, role = 'user') => {
  const normalizedEmail = email.toLowerCase().trim();
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('email', '==', normalizedEmail));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    throw new Error('An account with this email already exists.');
  }

  const newUserRef = doc(usersRef);
  const newUser = {
    id: newUserRef.id,
    name: name.trim(),
    email: normalizedEmail,
    password, // Demo auth
    role: role === 'organizer' ? 'organizer' : 'user',
    createdAt: new Date().toISOString()
  };

  await setDoc(newUserRef, newUser);
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

export const loginUserInFirestore = async (email, password) => {
  const normalizedEmail = email.toLowerCase().trim();
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('email', '==', normalizedEmail));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error('Invalid email or password.');
  }

  const userDoc = querySnapshot.docs[0];
  const userData = userDoc.data();

  if (userData.password !== password) {
    throw new Error('Invalid email or password.');
  }

  const { password: _, ...userWithoutPassword } = userData;
  return { ...userWithoutPassword, id: userDoc.id };
};

export const updateUserProfileInFirestore = async (userId, updates) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, updates);
  const updatedDoc = await getDoc(userRef);
  const data = updatedDoc.data();
  const { password: _, ...userWithoutPassword } = data;
  return { ...userWithoutPassword, id: updatedDoc.id };
};

// ==========================================
// EVENT SERVICES
// ==========================================

export const getEventsFromFirestore = async (search = '', category = 'All', organizerId = null) => {
  const eventsRef = collection(db, 'events');
  let querySnapshot = await getDocs(eventsRef);

  // Auto-seed default events if collection is empty
  if (querySnapshot.empty && (!search || !search.trim()) && (!category || category === 'All') && !organizerId) {
    console.log('Seeding initial events into Firestore...');
    for (const seed of SEED_EVENTS) {
      await addDoc(eventsRef, seed);
    }
    querySnapshot = await getDocs(eventsRef);
  }

  let events = querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data()
  }));

  if (category && category !== 'All') {
    events = events.filter((e) => e.category && e.category.toLowerCase() === category.toLowerCase());
  }

  if (organizerId) {
    events = events.filter((e) => e.organizerId === organizerId);
  }

  if (search && search.trim() !== '') {
    const q = search.toLowerCase().trim();
    events = events.filter(
      (e) =>
        (e.name && e.name.toLowerCase().includes(q)) ||
        (e.description && e.description.toLowerCase().includes(q)) ||
        (e.location && e.location.toLowerCase().includes(q)) ||
        (e.category && e.category.toLowerCase().includes(q))
    );
  }

  return events;
};

export const getEventByIdFromFirestore = async (eventId) => {
  const eventRef = doc(db, 'events', eventId);
  const eventSnap = await getDoc(eventRef);
  if (!eventSnap.exists()) {
    throw new Error('Event not found.');
  }
  return { id: eventSnap.id, ...eventSnap.data() };
};

export const createEventInFirestore = async (eventData) => {
  const eventsRef = collection(db, 'events');
  const seatsNum = parseInt(eventData.totalSeats, 10) || 0;

  const newEvent = {
    name: eventData.name.trim(),
    image: eventData.image && eventData.image.trim() ? eventData.image.trim() : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    description: eventData.description ? eventData.description.trim() : '',
    date: eventData.date,
    time: eventData.time,
    location: eventData.location.trim(),
    category: eventData.category.trim(),
    price: parseFloat(eventData.price) || 0,
    totalSeats: seatsNum,
    availableSeats: seatsNum,
    organizerId: eventData.organizerId || 'u1',
    createdAt: new Date().toISOString()
  };

  const docRef = await addDoc(eventsRef, newEvent);
  return { id: docRef.id, ...newEvent };
};

export const updateEventInFirestore = async (eventId, eventData) => {
  const eventRef = doc(db, 'events', eventId);
  const eventSnap = await getDoc(eventRef);

  if (!eventSnap.exists()) {
    throw new Error('Event not found.');
  }

  const currentEvent = eventSnap.data();
  const updates = {};

  if (eventData.name !== undefined) updates.name = eventData.name.trim();
  if (eventData.image !== undefined) updates.image = eventData.image.trim();
  if (eventData.description !== undefined) updates.description = eventData.description.trim();
  if (eventData.date !== undefined) updates.date = eventData.date;
  if (eventData.time !== undefined) updates.time = eventData.time;
  if (eventData.location !== undefined) updates.location = eventData.location.trim();
  if (eventData.category !== undefined) updates.category = eventData.category.trim();
  if (eventData.price !== undefined) updates.price = parseFloat(eventData.price) || 0;

  if (eventData.totalSeats !== undefined) {
    const newTotal = parseInt(eventData.totalSeats, 10);
    if (!isNaN(newTotal) && newTotal > 0) {
      const bookedSeats = (currentEvent.totalSeats || 0) - (currentEvent.availableSeats || 0);
      updates.totalSeats = newTotal;
      updates.availableSeats = Math.max(0, newTotal - bookedSeats);
    }
  }

  await updateDoc(eventRef, updates);
  const updatedSnap = await getDoc(eventRef);
  return { id: updatedSnap.id, ...updatedSnap.data() };
};

export const deleteEventInFirestore = async (eventId) => {
  const eventRef = doc(db, 'events', eventId);
  await deleteDoc(eventRef);

  // Also update associated bookings to cancelled
  const bookingsRef = collection(db, 'bookings');
  const q = query(bookingsRef, where('eventId', '==', eventId));
  const querySnapshot = await getDocs(q);

  for (const bDoc of querySnapshot.docs) {
    await updateDoc(doc(db, 'bookings', bDoc.id), { status: 'cancelled' });
  }

  return true;
};

// ==========================================
// BOOKING SERVICES
// ==========================================

export const createBookingInFirestore = async (bookingData) => {
  const { eventId, userId, attendeeName, attendeeEmail, seats } = bookingData;
  const seatsRequested = parseInt(seats, 10);

  const eventRef = doc(db, 'events', eventId);
  const bookingsRef = collection(db, 'bookings');

  let resultBooking = null;

  await runTransaction(db, async (transaction) => {
    const eventSnap = await transaction.get(eventRef);

    if (!eventSnap.exists()) {
      throw new Error('Event not found.');
    }

    const event = eventSnap.data();
    if (event.availableSeats < seatsRequested) {
      throw new Error(`Not enough seats available. Only ${event.availableSeats} seat(s) remaining.`);
    }

    const totalPrice = seatsRequested * parseFloat(event.price || 0);
    const newAvailableSeats = event.availableSeats - seatsRequested;

    const newBookingRef = doc(bookingsRef);
    const newBooking = {
      id: newBookingRef.id,
      eventId,
      userId,
      attendeeName: attendeeName.trim(),
      attendeeEmail: attendeeEmail.toLowerCase().trim(),
      seats: seatsRequested,
      totalPrice,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    transaction.update(eventRef, { availableSeats: newAvailableSeats });
    transaction.set(newBookingRef, newBooking);

    resultBooking = newBooking;
  });

  return resultBooking;
};

export const getUserBookingsFromFirestore = async (userId) => {
  const bookingsRef = collection(db, 'bookings');
  const q = query(bookingsRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);

  const bookings = [];
  for (const docSnap of querySnapshot.docs) {
    const booking = { id: docSnap.id, ...docSnap.data() };
    if (booking.eventId) {
      try {
        const eventRef = doc(db, 'events', booking.eventId);
        const eventSnap = await getDoc(eventRef);
        booking.event = eventSnap.exists() ? { id: eventSnap.id, ...eventSnap.data() } : null;
      } catch (err) {
        booking.event = null;
      }
    }
    bookings.push(booking);
  }

  return bookings;
};

export const cancelBookingInFirestore = async (bookingId) => {
  const bookingRef = doc(db, 'bookings', bookingId);

  await runTransaction(db, async (transaction) => {
    const bookingSnap = await transaction.get(bookingRef);

    if (!bookingSnap.exists()) {
      throw new Error('Booking not found.');
    }

    const booking = bookingSnap.data();
    if (booking.status === 'cancelled') {
      throw new Error('Booking is already cancelled.');
    }

    const eventRef = doc(db, 'events', booking.eventId);
    const eventSnap = await transaction.get(eventRef);

    if (eventSnap.exists()) {
      const event = eventSnap.data();
      const restoredSeats = (event.availableSeats || 0) + booking.seats;
      transaction.update(eventRef, { availableSeats: restoredSeats });
    }

    transaction.update(bookingRef, { status: 'cancelled' });
  });

  return true;
};

export const getEventBookingsFromFirestore = async (eventId) => {
  const bookingsRef = collection(db, 'bookings');
  const q = query(bookingsRef, where('eventId', '==', eventId));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data()
  }));
};
