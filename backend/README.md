# API Documentation

## Setup
1. `npm install`
2. `npx prisma generate`
3. Ensure `.env` has `DATABASE_URL` (MongoDB) and optional `JWT_SECRET`.
4. `npm run dev`

## Roles
- ADMIN
- CUSTOMER
- COORDINATOR
- TECHNICIAN

## Endpoints

### Auth
- `POST /api/auth/register` - { username, password, name, phone, email, role? }
- `POST /api/auth/login` - { username, password }
- `GET /api/auth/me` - Get current user profile

### Users (Admin/Coordinator)
- `GET /api/users?role=...`
- `PUT /api/users/:id` - { name, phone, email, password } (Admin or Self)
- `DELETE /api/users/:id` (Admin)

### Bookings/Queues
- `POST /api/bookings` - { appointmentDate, location, details } (Customer)
- `GET /api/bookings` - List bookings (Filtered by role: Customer sees own, Tech sees assigned, Admin sees all)
- `PUT /api/bookings/:id` - Update status or assign.
  - Coordinator: Assign `technicianId`, set status `CONFIRMED`, `ASSIGNED`.
  - Technician: Set status `COMPLETED`, `RESCHEDULED`, `NOT_FOUND_CUSTOMER`.
  - Customer: `CANCELLED`, or update details.
- `GET /api/bookings/stats` - (Admin) Get counts.
