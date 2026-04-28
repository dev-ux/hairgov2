// routes/booking.routes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { authenticate, isHairdresser, isClient } = require('../middleware/auth.middleware');
const { validateBooking } = require('../validators/booking.validator');

router.use(function(req, res, next) {
  res.header('Access-Control-Allow-Headers', 'x-access-token, Origin, Content-Type, Accept');
  next();
});

// Routes publiques
router.post('/public', bookingController.createBookingPublic);
router.get('/', bookingController.findAllPublic);
router.post('/', validateBooking, bookingController.createBooking);
router.get('/nearby-hairdressers', bookingController.getNearbyHairdressers);
router.get('/estimate-price', bookingController.estimatePrice);

// Routes nommées AVANT /:id pour éviter le shadowing
router.get('/client', authenticate, isClient, bookingController.getClientBookings);
router.get('/client/history', authenticate, isClient, bookingController.getClientHistory);
router.get('/hairdresser/history', authenticate, isHairdresser, bookingController.getHairdresserHistory);
router.get('/hairdresser/pending', authenticate, isHairdresser, bookingController.getPendingBookings);

// Routes avec paramètre dynamique
router.get('/:id', authenticate, bookingController.getBookingDetails);
router.put('/:id/accept', authenticate, isHairdresser, bookingController.acceptBooking);
router.put('/:id/reject', authenticate, isHairdresser, bookingController.rejectBooking);
router.put('/:id/start', authenticate, isHairdresser, bookingController.startBooking);
router.put('/:id/complete', authenticate, isHairdresser, bookingController.completeBooking);
router.put('/:id/cancel', authenticate, bookingController.cancelBooking);
router.put('/:id/request-extension', authenticate, isHairdresser, bookingController.requestExtension);
router.post('/:id/rate', authenticate, isClient, bookingController.rateHairdresser);
router.get('/:id/track', authenticate, bookingController.trackHairdresser);
router.delete('/:id', authenticate, bookingController.deleteBooking);

module.exports = router;
