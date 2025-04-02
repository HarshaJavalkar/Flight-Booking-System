# Flight Booking System

## Overview
The Flight Booking System is a web-based application that allows users to book and manage their flight tickets. The system supports user authentication, flight scheduling, ticket booking, modification, and cancellation. It also leverages Redis for caching and utilizes clustering to enhance performance.

## Features
- **User Authentication**: Users can register and log in to receive an authentication token.
- **Admin Authentication**: Admins can log in to manage flights and schedules.
- **Flight Management**: Admins can create flights, defining schedules and seat availability.
- **Ticket Booking**: Users can book available seats dynamically.
- **Ticket Cancellation**: Users can cancel tickets, making the seat available for others.
- **Seat Modification**: Users can modify their seat bookings, validating requests, canceling the old seat, and updating the booking.
- **Redis Caching**: Used to cache flight ticket views for better performance.
- **Clustering**: The system scales using the Node.js cluster module.
- **Unit Testing**: Extensive unit test coverage ensures reliability and stability.

## Installation

### Prerequisites
- Node.js (latest LTS version recommended)
- Redis (for caching)
- MongoDB (for database)

### Setup
1. Clone the repository:
   ```sh
   git clone <repository-url>
   cd flight-booking-system
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up environment variables in a `.env` file:
   ```plaintext
   MONGO_URI=<your-mongodb-connection-string>
   REDIS_HOST=<redis-host>
   REDIS_PORT=<redis-port>
   JWT_SECRET=<your-secret-key>
   ```

## Running the Application
To start the application, run:
```sh
npm run start
```

## Running Tests
To execute unit tests with coverage:
```sh
npm test -- --coverage
```

## API Documentation
Refer to the Postman collection for detailed API endpoints and request examples.

[Postman Collection Documentation](https://documenter.getpostman.com/view/20847091/2sB2cSfNGz)

## Database Schema
### 1. User Schema
- User ID
- Name
- Email
- Password (hashed)
- Role (User/Admin)

### 2. Flight Schema
- Flight ID
- Flight Number
- Origin
- Destination
- Departure Time
- Arrival Time
- Total Seats
- Available Seats

### 3. Booking Schema
- Booking ID
- User ID (Reference to User Schema)
- Flight ID (Reference to Flight Schema)
- Seat Number
- Booking Status (Confirmed, Cancelled)

## Functionality Workflow
1. **User Registration & Authentication**:
   - Users create an account and log in to receive a JWT token.
   - Admins log in with their credentials to manage flights.

2. **Flight Creation (Admin Only)**:
   - Admins create flights with schedules and available seats.

3. **Booking a Ticket**:
   - Users select an available flight and book a seat dynamically.

4. **Cancelling a Ticket**:
   - Users can cancel their ticket, making the seat available again.

5. **Modifying a Booking**:
   - Users can change their seat; the system cancels the old seat and assigns a new one.

6. **Performance Optimization**:
   - Redis caches flight ticket views to reduce database load.
   - Clustering is used to scale the application efficiently.

## Contribution
Feel free to contribute! Open an issue or submit a pull request with your improvements.

## License
This project is licensed under the MIT License.
