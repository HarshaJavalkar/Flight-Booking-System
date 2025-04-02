const jwt = require('jsonwebtoken');
const { authenticate } = require('../middlewares/authenticate');
const User = require('../models/User');

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../models/User');
jest.mock('../logger/logger', () => ({
  error: jest.fn(),
  info: jest.fn()
}));

describe('Authentication Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    
    req = {
      headers: {},
      body: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
  });

  // ---- Token Extraction Tests ----
  describe('Token Handling', () => {
    it('should extract token from Authorization header', async () => {
      // 1. Setup environment variable
      process.env.admin_jwt_ENCRYPT_KEY = 'test_admin_secret';
      
      // 2. Mock request with valid token
      req.headers.authorization = 'Bearer valid.token.here';
      
      // 3. Mock jwt.verify to return a decoded token
      jwt.verify.mockReturnValue({ email: 'admin@airline.com' });
      
      // 4. Mock database response
      User.findOne.mockResolvedValue({ 
        email: 'admin@airline.com', 
        role: 'admin' 
      });
  
      // 5. Execute middleware
      await authenticate(req, res, next, 'admin');
      
      // 6. Verify jwt.verify was called correctly
      expect(jwt.verify).toHaveBeenCalledWith(
        'valid.token.here',
        'test_admin_secret' // Now using the explicit test value
      );
      
      // 7. Verify middleware continues
      expect(next).toHaveBeenCalled();
    });
  });
  // ---- Role Validation Tests ----
  describe('Role-Based Access', () => {
    beforeEach(() => {
      // Reset all mocks and set default env vars
      jest.clearAllMocks();
      process.env.user_jwt_ENCRYPT_KEY = 'test_user_secret';
    });
  
    it('should validate user role with correct secret', async () => {
      // 1. Setup test data
      const mockUser = {
        email: 'user@example.com',
        role: 'user'
      };
  
      // 2. Configure request
      req = {
        headers: {
          authorization: 'Bearer user.token'
        },
        body: {}
      };
  
      // 3. Setup mocks
      jwt.verify.mockReturnValue({ email: mockUser.email });
      User.findOne.mockResolvedValue(mockUser);
  
      // 4. Execute middleware
      await authenticate(req, res, next, 'user');
  
      // 5. Verify expectations
      expect(jwt.verify).toHaveBeenCalledWith(
        'user.token',
        'test_user_secret'
      );
      expect(User.findOne).toHaveBeenCalledWith({
        email: mockUser.email
      });
      expect(next).toHaveBeenCalled();
    });
  });

  // ---- Error Scenarios ----
  describe('Error Handling', () => {
    beforeEach(() => {
      // Reset all mocks
      jest.clearAllMocks();
      process.env.user_jwt_ENCRYPT_KEY = 'test_secret';
    });
  
    it('should reject when user not found in DB', async () => {
      // 1. Setup test data
      const testEmail = 'nonexistent@user.com';
      
      // 2. Configure request with valid token
      req.headers.authorization = 'Bearer valid.token';
      
      // 3. Setup mocks
      jwt.verify.mockReturnValue({ email: testEmail }); // Valid token
      User.findOne.mockResolvedValue(null); // Simulate user not found
  
      // 4. Execute middleware
      await authenticate(req, res, next, 'user');
  
      // 5. Verify database query
      expect(User.findOne).toHaveBeenCalledWith({
        email: testEmail // Should query for the email from token
      });
  
      // 6. Verify error response
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User not found'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ---- Success Scenario ----
  describe('Successful Authentication', () => {
    it('should attach user to request and call next()', async () => {
      const mockUser = { 
        email: 'admin@airline.com', 
        role: 'admin',
        _id: '507f1f77bcf86cd799439011'
      };
      
      req.headers.authorization = 'Bearer valid.token';
      jwt.verify.mockReturnValue({ email: mockUser.email });
      User.findOne.mockResolvedValue(mockUser);

      await authenticate(req, res, next, 'admin');
      
      expect(req.body.user).toEqual(mockUser);
      expect(req.body.email).toBe(mockUser.email);
      expect(next).toHaveBeenCalled();
    });
  });
});