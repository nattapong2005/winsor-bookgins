import express from 'express';
import { createBooking, getBookings, updateBooking, getBookingStats, searchBookingsByPhone, deleteBooking } from '../controllers/bookingController.js';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public Route
router.get('/search/:phone', searchBookingsByPhone);

router.use(authenticateToken); // All booking routes BELOW this require auth

router.post('/', authorizeRole(['CUSTOMER', 'ADMIN', 'COORDINATOR']), upload.single('image'), createBooking);
router.get('/', getBookings);
router.put('/:id', updateBooking);
router.delete('/:id', deleteBooking);
router.get('/stats', authorizeRole(['ADMIN']), getBookingStats);

export default router;
