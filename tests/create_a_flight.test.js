const { createFlight } = require('../Services/flight-booking-system/create_a_flight');
const Flight = require('../models/Flight');
const request = require('supertest');
const express = require('express');
const { authenticate } = require('../middlewares/authenticate');
const { flightLimit } = require('../rate-limit');
// Mock dependencies
jest.mock('../models/Flight');
jest.mock('../middlewares/authenticate');
jest.mock('../rate-limit');

describe('Flight Creation Service', () => {
  let app;
  let mockFlight;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());

    // Setup mock flight
    mockFlight = {
      _id: '507f1f77bcf86cd799439011',
      flightNumber: 'AA123',
      departure: new Date(),
      save: jest.fn().mockResolvedValue(true)
    };
    Flight.mockImplementation(() => mockFlight);

    // Setup mock middleware
    authenticate.mockImplementation((req, res, next) => next());
    flightLimit.mockImplementation((req, res, next) => next());
  });

  describe('POST /create-a-flight', () => {
    it('should create a flight successfully (admin)', async () => {
      // Setup route with all middleware
      app.post(
        '/create-a-flight',
        flightLimit,
        (req, res, next) => authenticate(req, res, next, 'admin'),
        createFlight
      );

      const flightData = {
        flightNumber: 'AA123',
        departure: new Date().toISOString(),
        origin: 'JFK',
        destination: 'LAX'
      };

      const response = await request(app)
        .post('/create-a-flight')
        .set('Authorization', 'Bearer validAdminToken')
        .send(flightData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Flight schedule created');
      expect(Flight).toHaveBeenCalledWith(flightData);
      expect(mockFlight.save).toHaveBeenCalled();
    });

    it('should reject flight creation with invalid data', async () => {
      app.post('/create-a-flight', createFlight);

      mockFlight.save.mockRejectedValueOnce(new Error('Validation failed'));

      const response = await request(app)
        .post('/create-a-flight')
        .send({ invalid: 'data' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should enforce rate limiting', async () => {
      // Mock rate limit to reject
      flightLimit.mockImplementationOnce((req, res) => 
        res.status(429).json({ error: 'Too many requests' })
      );

      app.post(
        '/create-a-flight',
        flightLimit,
        (req, res, next) => authenticate(req, res, next, 'admin'),
        createFlight
      );

      const response = await request(app)
        .post('/create-a-flight')
        .set('Authorization', 'Bearer validAdminToken')
        .send({ flightNumber: 'AA123' });

      expect(response.status).toBe(429);
      expect(response.body.error).toBe('Too many requests');
    });

    it('should enforce admin authentication', async () => {
      // Mock authentication to reject
      authenticate.mockImplementationOnce((req, res) => 
        res.status(401).json({ message: 'Unauthorized' })
      );

      app.post(
        '/create-a-flight',
        (req, res, next) => authenticate(req, res, next, 'admin'),
        createFlight
      );

      const response = await request(app)
        .post('/create-a-flight')
        .set('Authorization', 'Bearer invalidToken')
        .send({ flightNumber: 'AA123' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('createFlight service function', () => {
    it('should handle service function directly', async () => {
      const req = {
        body: {
          flightNumber: 'AA123',
          departure: new Date().toISOString()
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await createFlight(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Flight schedule created',
        flight: mockFlight
      });
    });

    it('should handle errors in service function', async () => {
      const req = { body: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const error = new Error('Test error');
      mockFlight.save.mockRejectedValueOnce(error);

      await createFlight(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Test error' });
    });
  });
});