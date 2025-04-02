const { bookFlight } = require('../Services/flight-booking-system/book_flight_ticket');
const Flight = require('../models/Flight');
const Booking = require('../models/Booking');
const logger = require('../logger/logger');
const client = require('../redisClient');

// Mock dependencies
jest.mock('../models/Flight');
jest.mock('../models/Booking');
jest.mock('../logger/logger');
jest.mock('../redisClient', () => ({
    del: jest.fn().mockResolvedValue(1), // Mock successful cache deletion
    connect: jest.fn().mockResolvedValue(true), // Mock connection
    on: jest.fn((event, callback) => {
        if (event === 'ready') callback(); // Simulate ready event
    })
}));

describe('Flight Booking Service', () => {


    let req, res, mockFlight, mockBooking;
    beforeAll(() => {
        // Silence Redis connection errors during tests
        client.on.mockImplementation((event, handler) => {
            if (event === 'error') {
                // Don't actually log errors
                handler = jest.fn();
            }
        });
    });
    afterAll(async () => {
        // Clean up Redis mocks
        jest.restoreAllMocks();
    });



    beforeEach(() => {
        jest.clearAllMocks();
        client.del.mockClear();
        client.connect.mockClear();
        // Mock flight data

        mockFlight = {
            flightNumber: 'AA123',
            seats: {
                availableSeats: 100,
                seatMap: {
                    economy: {
                        available: 80,
                        total: 100,
                        cancelledSeats: []
                    }
                }
            },
            save: jest.fn().mockResolvedValue(true)
        };

        // 2. Setup COMPLETE mock booking with passengers array
        mockBooking = {
            _id: 'booking123',
            email: 'test@example.com',
            passengers: [], // Initialize empty array
            save: jest.fn().mockImplementation(function () {
                // When save is called, return the booking with passengers
                return Promise.resolve({
                    ...this,
                    passengers: this.passengers || [] // Ensure passengers exists
                });
            })
        };

        // 3. Make Booking constructor return our mock
        Booking.mockImplementation((params) => {
            mockBooking.passengers = params.passengers; // Capture assigned passengers
            return mockBooking;
        });

        // Mock request
        req = {
            body: {
                seatType: 'economy',
                passengers: [
                    { name: 'Passenger 1' },
                    { name: 'Passenger 2' }
                ],
                flight: mockFlight,
                flightNumber: 'AA123',
                user: {
                    email: 'test@example.com'
                }
            }
        };

        // Mock response
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Mock Flight.findOne
        Flight.findOne.mockResolvedValue(mockFlight);
    });

    describe('Seat Assignment', () => {
        it('should assign seats correctly for regular passengers', async () => {
            req.body.passengers = [{ name: 'P1' }, { name: 'P2' }];
            mockFlight.seats.seatMap.economy.available = 10;

            await bookFlight(req, res);

            const assignedPassengers = mockBooking.passengers;
            expect(assignedPassengers).toHaveLength(2);
            expect(assignedPassengers[0].seatNumber).toMatch(/^\d{1,2}[A-D]$/);
            expect(assignedPassengers[0].passengerNumber).toMatch(/^PN\w{8}$/);
        });

        it('should assign cancelled seats to last passengers', async () => {
            req.body.passengers = [{ name: 'P1' }, { name: 'P2' }];
            mockFlight.seats.seatMap.economy.cancelledSeats = ['5C', '6D'];

            await bookFlight(req, res);

            const assignedPassengers = mockBooking.passengers;
            expect(assignedPassengers[1].seatNumber).toBe('6D');
        });

        it('should return error when not enough seats', async () => {
            req.body.passengers = Array(10).fill().map((_, i) => ({ name: `Passenger ${i}` }));
            mockFlight.seats.seatMap.economy.available = 5; // Only 5 seats available
            
            await bookFlight(req, res);
            
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
              error: "Not enough available seats"
            });
            expect(mockBooking.save).not.toHaveBeenCalled();
          });
    });

    describe('Booking Creation', () => {
        it('should create booking with correct details', async () => {
            await bookFlight(req, res);

            expect(Booking).toHaveBeenCalledWith({
                email: 'test@example.com',
                seatType: 'economy',
                flightNumber: 'AA123',
                passengers: expect.any(Array),
                status: 'confirmed',
                bookingNo: expect.stringMatching(/^BK\w{8}$/)
            });
            expect(mockBooking.save).toHaveBeenCalled();
        });

    
    });

    describe('Flight Updates', () => {
        it('should update available seat counts', async () => {
            const initialAvailable = mockFlight.seats.seatMap.economy.available;
            req.body.passengers = [{ name: 'P1' }, { name: 'P2' }];

            await bookFlight(req, res);

            expect(mockFlight.seats.seatMap.economy.available)
                .toBe(initialAvailable - 2);
            expect(mockFlight.save).toHaveBeenCalled();
        });

        it('should remove used cancelled seats', async () => {
            req.body.passengers = [{ name: 'P1' }, { name: 'P2' }];
            mockFlight.seats.seatMap.economy.cancelledSeats = ['5C', '6D'];

            await bookFlight(req, res);

            expect(mockFlight.seats.seatMap.economy.cancelledSeats)
                .toHaveLength(0);
        });
    });

    describe('Cache Management', () => {
        it('should clear flight cache after booking', async () => {
            await bookFlight(req, res);

            expect(client.del).toHaveBeenCalledWith(
                `passengers:${req.body.flightNumber}`
            );
            expect(logger.info).toHaveBeenCalledWith(
                expect.stringContaining('Redis cache cleared')
            );
        });
    });

    describe('Success Response', () => {
        it('should return 201 with booking details', async () => {
            await bookFlight(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Flight booked successfully',
                booking: mockBooking
            });
        });
    });
});