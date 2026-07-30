# TFX Tour — Complete API Reference

**Base URL:** `http://localhost:3001`
**Swagger UI:** `http://localhost:3001/api`

---

## Global Headers

Every **protected** endpoint needs:
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

Public endpoints need only `Content-Type: application/json` when sending a body.

| Token | Lifetime |
|-------|----------|
| `accessToken` | 15 min |
| `refreshToken` | 7 days |

**Roles:** `TOURIST` · `DRIVER` · `ADMIN`
**User statuses:** `ACTIVE` · `INACTIVE` · `SUSPENDED`

---

## 1. Auth `/auth`

### POST `/auth/register` — Public
Register a new TOURIST or DRIVER account. ADMIN cannot self-register.

**Body:**
```json
{
  "email": "jane@example.com",
  "password": "Password123!",
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "+94771234567",
  "role": "TOURIST"
}
```
| Field | Required | Rule |
|-------|----------|------|
| email | ✅ | valid email |
| password | ✅ | min 8 chars |
| firstName | ✅ | — |
| lastName | ✅ | — |
| phone | ❌ | — |
| role | ❌ | `TOURIST` or `DRIVER`, default `TOURIST` |

**Response `201`:**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": { "id": "uuid", "email": "jane@example.com", "role": "TOURIST", "status": "ACTIVE", ... }
}
```

---

### POST `/auth/login` — Public

**Body:**
```json
{ "email": "jane@example.com", "password": "Password123!" }
```
**Response `200`:** Same shape as `/auth/register` — `{ accessToken, refreshToken, user }`.

---

### POST `/auth/refresh` — Public
Exchange a valid refresh token for a new token pair.

**Body:**
```json
{ "refreshToken": "eyJ..." }
```
**Response `200`:** `{ accessToken, refreshToken }`

---

### POST `/auth/logout` — JWT
Invalidates the provided refresh token. Omit `refreshToken` to invalidate all sessions.

**Body:** `{ "refreshToken": "eyJ..." }` *(optional)*
**Response `204`:** No content.

---

### GET `/auth/me` — JWT
Returns the currently authenticated user (no password field).

**Response `200`:** User object.

---

### PATCH `/auth/me` — JWT
Update profile fields.

**Body:**
```json
{ "firstName": "Jane", "lastName": "Smith", "phone": "+94771234567", "avatar": "https://..." }
```
All fields optional. **Response `200`:** Updated user.

---

### PATCH `/auth/change-password` — JWT

**Body:**
```json
{ "currentPassword": "OldPass123!", "newPassword": "NewPass456!" }
```
**Response `204`:** All refresh tokens invalidated.

---

### POST `/auth/driver-profile` — JWT + DRIVER
Create the driver's professional profile (one-time).

**Body:**
```json
{ "licenseNumber": "DL-001234", "licenseExpiry": "2028-12-31", "experience": 5, "bio": "5 years experience." }
```
| Field | Required |
|-------|----------|
| licenseNumber | ✅ |
| licenseExpiry | ✅ ISO date |
| experience | ❌ integer ≥ 0 |
| bio | ❌ |

**Response `201`:** DriverProfile object.

---

### GET `/auth/driver-profile` — JWT + DRIVER
Returns current driver's profile. **Response `200`.**

---

### PATCH `/auth/driver-profile` — JWT + DRIVER
Update any subset of `{ licenseNumber, licenseExpiry, experience, bio }`. **Response `200`.**

---

## 2. Users `/users` — JWT + ADMIN (all endpoints)

### GET `/users`
List all users with optional filters.

**Query:** `?role=DRIVER&status=ACTIVE&search=john&page=1&limit=20`

**Response `200`:** `{ data[], total, page, limit, pages }`

---

### GET `/users/:id`
Single user. Includes `driverProfile` if role is DRIVER. **Response `200`.**

---

### PATCH `/users/:id/status`

**Body:** `{ "status": "SUSPENDED" }` — values: `ACTIVE · INACTIVE · SUSPENDED`
**Response `200`:** Updated user.

---

### DELETE `/users/:id`
**Response `204`.**

---

### GET `/users/:id/bookings`
All tour bookings for a user.
**Query:** `?status=CONFIRMED&paymentStatus=PAID&page=1&limit=10`
**Response `200`:** Paginated bookings.

---

## 3. Bookings `/bookings` — All require JWT

### POST `/bookings` — JWT + TOURIST only
Create a standard tour package booking.

**Body:**
```json
{
  "tourPackageId": "uuid",
  "vehicleId": "uuid",
  "startDate": "2026-09-01",
  "endDate": "2026-09-07",
  "numberOfPassengers": 2,
  "advancePayment": 500.00,
  "specialRequests": "Vegetarian meals",
  "passengers": [
    {
      "passengerName": "Jane Doe",
      "email": "jane@example.com",
      "phone": "+94771234567",
      "dateOfBirth": "1990-05-15",
      "passportNumber": "N1234567"
    }
  ]
}
```
| Field | Required | Rule |
|-------|----------|------|
| tourPackageId | ✅ | UUID |
| vehicleId | ❌ | UUID |
| startDate | ✅ | future date |
| endDate | ✅ | after startDate |
| numberOfPassengers | ✅ | min 1 |
| advancePayment | ❌ | positive |
| specialRequests | ❌ | — |
| passengers | ✅ | min 1 item |

**Response `201`:** Booking with `passengers[]` and `payments[]`.

---

### GET `/bookings` — JWT + ADMIN
**Query:** `?status=PENDING&paymentStatus=NOT_PAID&startDate=2026-09-01&endDate=2026-09-30&page=1&limit=10`
**Response `200`:** Paginated bookings.

---

### GET `/bookings/user` — JWT + TOURIST or DRIVER
Own bookings. **Query:** same filters. **Response `200`:** Paginated.

---

### GET `/bookings/:id` — JWT
Single booking. **Response `200`.**

---

### PATCH `/bookings/:id` — JWT
Update mutable fields. Cannot edit COMPLETED or CANCELLED bookings.

**Body:** any subset of `{ vehicleId, startDate, endDate, numberOfPassengers, advancePayment, specialRequests }`

---

### DELETE `/bookings/:id` — JWT + ADMIN. **Response `204`.**

---

### POST `/bookings/:id/cancel` — JWT. **Body:** none. **Response `200`.**

---

### POST `/bookings/:id/passengers` — JWT

**Body:** `{ passengerName, email, phone, dateOfBirth, passportNumber? }`
**Response `201`:** Passenger object.

---

### DELETE `/bookings/:id/passengers/:passengerId` — JWT. **Response `204`.**

---

### POST `/bookings/:id/payments` — JWT

**Body:**
```json
{ "amount": 250.00, "paymentMethod": "CARD", "paymentDate": "2026-08-01", "transactionId": "TXN-001" }
```
`paymentMethod` values: `CARD · BANK_TRANSFER · CASH · ONLINE`
**Response `201`:** Payment object.

---

### GET `/bookings/:id/payments` — JWT. **Response `200`:** Array of payments.

---

## 4. Packages `/packages`

### GET `/packages` — Public
**Query:** `?category=NATURE&minPrice=500&maxPrice=2000&minDuration=3&maxDuration=7&page=1&limit=10`

Categories: `ADVENTURE · NATURE · ROMANTIC · WILDLIFE · FAMILY · CULTURAL · BEACH · LUXURY`

---

### GET `/packages/featured` — Public. Array of featured packages.

---

### GET `/packages/category/:category` — Public. **Query:** `page, limit`.

---

### GET `/packages/:id` — Public. Returns package with `itineraries[]` and `inclusions[]`.

---

### POST `/packages` — JWT + DRIVER or ADMIN

**Body:**
```json
{
  "name": "Hill Country Explorer",
  "description": "5-day journey through tea plantations.",
  "category": "NATURE",
  "duration": 5,
  "basePrice": 1200.00,
  "highlights": ["Ella Rock", "Nine Arch Bridge"],
  "bestSeason": "December to April",
  "maxCapacity": 12,
  "images": ["https://cdn.example.com/pkg.jpg"]
}
```
All fields required. **Response `201`.**

---

### PATCH `/packages/:id` — JWT + DRIVER or ADMIN. Any subset of create fields.

---

### DELETE `/packages/:id` — JWT + ADMIN. **Response `204`.**

---

### POST `/packages/:id/itinerary` — JWT

**Body:** `{ "day": 1, "title": "Arrival", "description": "...", "attractions": "Gangaramaya Temple" }`

---

### PATCH `/packages/:id/itinerary/:day` — JWT. Any subset.

---

### POST `/packages/:id/inclusions` — JWT

**Body:** `{ "inclusion": "Breakfast daily", "type": "MEAL" }`
`type` values: `MEAL · TRANSPORT · ACCOMMODATION · ACTIVITY`

---

### POST `/packages/:id/feature` — JWT + ADMIN. No body. Marks package as featured.

---

### POST `/packages/:id/deactivate` — JWT + ADMIN. No body.

---

## 5. Reviews `/reviews`

### POST `/reviews` — JWT + TOURIST

**Body:**
```json
{
  "bookingId": "uuid",
  "rating": 5,
  "title": "Unforgettable experience",
  "description": "Professional guides and breathtaking scenery.",
  "images": ["https://cdn.example.com/review.jpg"]
}
```
| Field | Rule |
|-------|------|
| bookingId | UUID of a completed booking |
| rating | integer 1–5 |
| title | 3–200 chars |
| description | 10–2000 chars |
| images | ❌ optional |

---

### GET `/reviews` — Public. **Query:** `?rating=5&bookingId=uuid&status=APPROVED&page=1&limit=10`

---

### GET `/reviews/:id` — Public.

---

### PATCH `/reviews/:id` — JWT + TOURIST
**Body:** `{ rating?, title?, description? }`

---

### DELETE `/reviews/:id` — JWT + ADMIN. **Response `204`.**

---

### POST `/reviews/:id/approve` — JWT + ADMIN. No body.

---

### POST `/reviews/:id/reject` — JWT + ADMIN. No body.

---

### POST `/reviews/:id/helpful` — Public. Increments helpful count.

---

### GET `/packages/:packageId/reviews` — Public.

---

### GET `/users/:userId/reviews` — Public.

---

## 6. Inquiries `/inquiries`

### POST `/inquiries` — Public

**Body:**
```json
{
  "name": "John Silva",
  "email": "john@example.com",
  "phone": "+94771234567",
  "subject": "Inquiry about Hill Country package",
  "message": "I would like more details about availability.",
  "category": "BOOKING"
}
```
| Field | Rule |
|-------|------|
| name | min 2 |
| email | valid email |
| phone | string |
| subject | min 3 |
| message | min 10 |
| category | `BOOKING · GENERAL · COMPLAINT · SUGGESTION` |

---

### GET `/inquiries` — JWT + ADMIN
**Query:** `?status=NEW&priority=HIGH&category=BOOKING&assignedToAdminId=uuid&page=1&limit=10`

---

### GET `/inquiries/:id` — JWT + ADMIN.

---

### PATCH `/inquiries/:id` — JWT + ADMIN
**Body:** `{ "status": "RESPONDED", "priority": "HIGH", "assignedToAdminId": "uuid" }` — all optional.

---

### POST `/inquiries/:id/respond` — JWT + ADMIN
**Body:** `{ "response": "Thank you for your inquiry..." }`

---

### GET `/inquiries/:id/responses` — JWT + ADMIN.

---

### POST `/inquiries/:id/close` — JWT + ADMIN. No body.

---

### DELETE `/inquiries/:id` — JWT + ADMIN. Only `NEW` status. **Response `204`.**

---

## 7. Vehicle Models `/vehicle-models`
Lookup table of vehicle makes/models grouped by type. Seeded with 20 models (Alto, Fortuner, HiAce, etc.).

### GET `/vehicle-models` — Public
**Query:** `?type=SUV` (optional)
**Response `200`:** Array of `{ id, name, type, createdAt, updatedAt }`.

---

### GET `/vehicle-models/type/:type` — Public
**Param:** `type` — `CAR · SUV · VAN · MINIBUS · LUXURY`
**Response `200`:** Array of models for that type.

---

### GET `/vehicle-models/:id` — Public. Single model.

---

### POST `/vehicle-models` — JWT + ADMIN
**Body:**
```json
{ "name": "Hilux", "type": "SUV" }
```
**Response `201`:** New model.

---

### PATCH `/vehicle-models/:id` — JWT + ADMIN
**Body:** `{ "name"?: string, "type"?: VehicleType }` — any subset.

---

### DELETE `/vehicle-models/:id` — JWT + ADMIN. **Response `204`.**

---
