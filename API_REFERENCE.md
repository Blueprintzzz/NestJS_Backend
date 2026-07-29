# TFX Tour — API Reference

**Base URL:** `http://localhost:3001`  
**Swagger UI:** `http://localhost:3001/api`

---

## Authentication

All protected endpoints require a Bearer token in the `Authorization` header.

```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

| Token | Lifetime |
|-------|----------|
| `accessToken` | 15 minutes |
| `refreshToken` | 7 days |

**Roles:** `TOURIST` · `DRIVER` · `ADMIN`  
**User statuses:** `ACTIVE` · `INACTIVE` · `SUSPENDED`

---

## 1. Auth `/auth`

### POST `/auth/register`
**Auth:** Public

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

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| email | string | ✅ | valid email |
| password | string | ✅ | min 8 chars |
| firstName | string | ✅ | — |
| lastName | string | ✅ | — |
| phone | string | ❌ | — |
| role | `TOURIST` \| `DRIVER` | ❌ | default: TOURIST. ADMIN cannot self-register |

**Response `201`:**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": {
    "id": "uuid",
    "email": "jane@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "phone": null,
    "role": "TOURIST",
    "status": "ACTIVE",
    "avatar": null,
    "createdAt": "2026-07-29T00:00:00.000Z",
    "updatedAt": "2026-07-29T00:00:00.000Z"
  }
}
```

---

### POST `/auth/login`
**Auth:** Public

**Body:**
```json
{
  "email": "jane@example.com",
  "password": "Password123!"
}
```

**Response `200`:** Same shape as `/auth/register` response.

---

### POST `/auth/refresh`
**Auth:** Public

**Body:**
```json
{
  "refreshToken": "eyJ..."
}
```

**Response `200`:**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

---

### POST `/auth/logout`
**Auth:** JWT

**Body:**
```json
{
  "refreshToken": "eyJ..."
}
```
> Omit `refreshToken` to invalidate **all** sessions for the user.

**Response `204`:** No content.

---

### GET `/auth/me`
**Auth:** JWT  
**Body:** none

**Response `200`:** User object (no password field).

---

### PATCH `/auth/me`
**Auth:** JWT

**Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+94771234567",
  "avatar": "https://cdn.example.com/avatar.jpg"
}
```
All fields optional.

**Response `200`:** Updated user object.

---

### PATCH `/auth/change-password`
**Auth:** JWT

**Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!"
}
```

**Response `204`:** No content. All refresh tokens invalidated.

---

### POST `/auth/driver-profile`
**Auth:** JWT + role `DRIVER`

**Body:**
```json
{
  "licenseNumber": "DL-001234",
  "licenseExpiry": "2028-12-31",
  "experience": 5,
  "bio": "Professional driver with 5 years experience."
}
```

| Field | Type | Required |
|-------|------|----------|
| licenseNumber | string | ✅ |
| licenseExpiry | ISO date string | ✅ |
| experience | integer ≥ 0 | ❌ |
| bio | string | ❌ |

**Response `201`:** DriverProfile object.

---

### GET `/auth/driver-profile`
**Auth:** JWT + role `DRIVER`  
**Response `200`:** DriverProfile object.

---

### PATCH `/auth/driver-profile`
**Auth:** JWT + role `DRIVER`

**Body:** Any subset of `{ licenseNumber, licenseExpiry, experience, bio }`

**Response `200`:** Updated DriverProfile object.

---

## 2. Users `/users`
> All endpoints require JWT + role `ADMIN`

### GET `/users`
**Query params:**

| Param | Type | Example |
|-------|------|---------|
| role | `TOURIST` \| `DRIVER` \| `ADMIN` | `?role=DRIVER` |
| status | `ACTIVE` \| `INACTIVE` \| `SUSPENDED` | `?status=ACTIVE` |
| search | string | `?search=john` |
| page | integer (default: 1) | `?page=2` |
| limit | integer (default: 20) | `?limit=10` |

**Response `200`:**
```json
{
  "data": [ { ...user } ],
  "total": 42,
  "page": 1,
  "limit": 20,
  "pages": 3
}
```

---

### GET `/users/:id`
**Response `200`:** Single user object (includes `driverProfile` if role is DRIVER).

---

### PATCH `/users/:id/status`

**Body:**
```json
{
  "status": "SUSPENDED"
}
```
Values: `ACTIVE` · `INACTIVE` · `SUSPENDED`

**Response `200`:** Updated user object.

---

### DELETE `/users/:id`
**Response `204`:** No content.

---

### GET `/users/:id/bookings`
**Query params:** Same as `GET /bookings` (status, paymentStatus, startDate, endDate, page, limit)

**Response `200`:** Paginated bookings.

---

## 3. Bookings `/bookings`
> All endpoints require JWT

### POST `/bookings`
**Auth:** JWT + role `TOURIST` or `DRIVER`

**Body:**
```json
{
  "tourPackageId": "uuid",
  "vehicleId": "uuid",
  "startDate": "2026-09-01",
  "endDate": "2026-09-07",
  "numberOfPassengers": 2,
  "advancePayment": 500.00,
  "specialRequests": "Vegetarian meals preferred",
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

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| tourPackageId | UUID | ✅ | — |
| vehicleId | UUID | ❌ | — |
| startDate | ISO date | ✅ | must be future |
| endDate | ISO date | ✅ | must be after startDate |
| numberOfPassengers | integer | ✅ | min 1 |
| advancePayment | number | ❌ | positive |
| specialRequests | string | ❌ | — |
| passengers | array | ✅ | min 1 item |
| passengers[].passengerName | string | ✅ | — |
| passengers[].email | string | ✅ | valid email |
| passengers[].phone | string | ✅ | — |
| passengers[].dateOfBirth | ISO date | ✅ | — |
| passengers[].passportNumber | string | ❌ | — |

**Response `201`:** Booking object with `passengers` and `payments` arrays.

---

### GET `/bookings`
**Auth:** JWT + role `ADMIN`

**Query params:**

| Param | Values |
|-------|--------|
| status | `PENDING` \| `CONFIRMED` \| `CANCELLED` \| `COMPLETED` |
| paymentStatus | `NOT_PAID` \| `PARTIAL` \| `PAID` |
| startDate | ISO date |
| endDate | ISO date |
| page | integer (default: 1) |
| limit | integer (default: 10) |

**Response `200`:** Paginated bookings.

---

### GET `/bookings/user`
**Auth:** JWT + role `TOURIST` or `DRIVER`  
**Query params:** Same as above.  
**Response `200`:** Paginated bookings for the current user.

---

### GET `/bookings/:id`
**Auth:** JWT  
**Response `200`:** Single booking with passengers and payments.

---

### PATCH `/bookings/:id`
**Auth:** JWT

**Body:**
```json
{
  "vehicleId": "uuid",
  "startDate": "2026-09-02",
  "endDate": "2026-09-08",
  "numberOfPassengers": 3,
  "advancePayment": 800.00,
  "specialRequests": "Gluten-free meals"
}
```
All fields optional. Cannot update COMPLETED or CANCELLED bookings.

---

### DELETE `/bookings/:id`
**Auth:** JWT + role `ADMIN`  
**Response `204`:** No content.

---

### POST `/bookings/:id/cancel`
**Auth:** JWT  
**Body:** none  
**Response `200`:** Updated booking with status `CANCELLED`.

---

### POST `/bookings/:id/passengers`
**Auth:** JWT

**Body:**
```json
{
  "passengerName": "John Doe",
  "email": "john@example.com",
  "phone": "+94771234568",
  "dateOfBirth": "1992-03-20",
  "passportNumber": "P9876543"
}
```

**Response `201`:** New passenger object.

---

### DELETE `/bookings/:id/passengers/:passengerId`
**Auth:** JWT  
**Response `204`:** No content.

---

### POST `/bookings/:id/payments`
**Auth:** JWT

**Body:**
```json
{
  "amount": 250.00,
  "paymentMethod": "CARD",
  "paymentDate": "2026-08-01",
  "transactionId": "TXN-001234"
}
```

| Field | Type | Required | Values |
|-------|------|----------|--------|
| amount | number | ✅ | positive, ≤ remainingAmount |
| paymentMethod | enum | ✅ | `CARD` \| `BANK_TRANSFER` \| `CASH` \| `ONLINE` |
| paymentDate | ISO date | ✅ | — |
| transactionId | string | ❌ | — |

**Response `201`:** Payment object.

---

### GET `/bookings/:id/payments`
**Auth:** JWT  
**Response `200`:** Array of payment objects.

---

## 4. Packages `/packages`

### GET `/packages`
**Auth:** Public

**Query params:**

| Param | Type | Values |
|-------|------|--------|
| category | enum | `ADVENTURE` \| `NATURE` \| `ROMANTIC` \| `WILDLIFE` \| `FAMILY` \| `CULTURAL` \| `BEACH` \| `LUXURY` |
| minPrice | number | — |
| maxPrice | number | — |
| minDuration | integer | days |
| maxDuration | integer | days |
| page | integer | default: 1 |
| limit | integer | default: 10 |

---

### GET `/packages/featured`
**Auth:** Public  
**Response `200`:** Array of featured packages.

---

### GET `/packages/category/:category`
**Auth:** Public  
**Params:** `category` — one of the 8 enum values above.  
**Query:** `page`, `limit`

---

### GET `/packages/:id`
**Auth:** Public  
**Response `200`:** Package with `itineraries` and `inclusions` arrays.

---

### POST `/packages`
**Auth:** JWT + role `DRIVER` or `ADMIN`

**Body:**
```json
{
  "name": "Hill Country Explorer",
  "description": "A 5-day journey through misty mountains and tea plantations.",
  "category": "NATURE",
  "duration": 5,
  "basePrice": 1200.00,
  "highlights": ["Ella Rock hike", "Tea factory tour", "Nine Arch Bridge"],
  "bestSeason": "December to April",
  "maxCapacity": 12,
  "images": ["https://cdn.example.com/pkg1.jpg"]
}
```

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| name | string | ✅ | min 3 chars |
| description | string | ✅ | min 10 chars |
| category | enum | ✅ | see above |
| duration | integer | ✅ | min 1 (days) |
| basePrice | number | ✅ | positive |
| highlights | string[] | ✅ | — |
| bestSeason | string | ✅ | — |
| maxCapacity | integer | ✅ | min 1 |
| images | string[] | ✅ | — |

---

### PATCH `/packages/:id`
**Auth:** JWT + role `DRIVER` or `ADMIN`  
**Body:** Any subset of create fields.

---

### DELETE `/packages/:id`
**Auth:** JWT + role `ADMIN`  
**Response `204`:** No content.

---

### POST `/packages/:id/itinerary`
**Auth:** JWT

**Body:**
```json
{
  "day": 1,
  "title": "Arrival & Colombo City Tour",
  "description": "Check-in and explore Colombo highlights.",
  "attractions": "Gangaramaya Temple, Galle Face Green"
}
```

---

### PATCH `/packages/:id/itinerary/:day`
**Auth:** JWT  
**Body:** Any subset of itinerary fields.

---

### POST `/packages/:id/inclusions`
**Auth:** JWT

**Body:**
```json
{
  "inclusion": "Breakfast daily",
  "type": "MEAL"
}
```
`type` values: `MEAL` · `TRANSPORT` · `ACCOMMODATION` · `ACTIVITY`

---

### POST `/packages/:id/feature`
**Auth:** JWT + role `ADMIN`  
**Body:** none  
**Response `200`:** Package marked as featured.

---

### POST `/packages/:id/deactivate`
**Auth:** JWT  
**Body:** none

---

## 5. Reviews `/reviews`

### POST `/reviews`
**Auth:** JWT + role `TOURIST`

**Body:**
```json
{
  "bookingId": "uuid",
  "rating": 5,
  "title": "Unforgettable experience",
  "description": "The guides were professional and the scenery was breathtaking.",
  "images": ["https://cdn.example.com/review1.jpg"]
}
```

| Field | Rules |
|-------|-------|
| bookingId | UUID of a completed booking |
| rating | integer 1–5 |
| title | 3–200 chars |
| description | 10–2000 chars |
| images | optional array of URLs |

---

### GET `/reviews`
**Auth:** Public

**Query params:** `rating`, `bookingId`, `status`, `page`, `limit`

---

### GET `/reviews/:id`
**Auth:** Public

---

### PATCH `/reviews/:id`
**Auth:** JWT

**Body:**
```json
{
  "rating": 4,
  "title": "Updated title",
  "description": "Updated description."
}
```

---

### DELETE `/reviews/:id`
**Auth:** JWT + role `ADMIN`  
**Response `204`:** No content.

---

### POST `/reviews/:id/approve`
**Auth:** JWT + role `ADMIN`  
**Body:** none

---

### POST `/reviews/:id/reject`
**Auth:** JWT + role `ADMIN`  
**Body:** none

---

### POST `/reviews/:id/helpful`
**Auth:** Public  
**Body:** none  
**Response `200`:** Review with incremented `helpful` count.

---

### GET `/packages/:packageId/reviews`
**Auth:** Public

---

### GET `/users/:userId/reviews`
**Auth:** Public

---

## 6. Inquiries `/inquiries`

### POST `/inquiries`
**Auth:** Public

**Body:**
```json
{
  "name": "John Silva",
  "email": "john@example.com",
  "phone": "+94771234567",
  "subject": "Booking inquiry for September",
  "message": "I would like to know more about the Hill Country package.",
  "category": "BOOKING"
}
```

| Field | Rules |
|-------|-------|
| name | min 2 chars |
| email | valid email |
| phone | string |
| subject | min 3 chars |
| message | min 10 chars |
| category | `BOOKING` \| `GENERAL` \| `COMPLAINT` \| `SUGGESTION` |

---

### GET `/inquiries`
**Auth:** JWT + role `ADMIN`

**Query params:**

| Param | Values |
|-------|--------|
| status | `NEW` \| `RESPONDED` \| `CLOSED` |
| priority | `LOW` \| `MEDIUM` \| `HIGH` |
| category | `BOOKING` \| `GENERAL` \| `COMPLAINT` \| `SUGGESTION` |
| assignedToAdminId | UUID |
| page / limit | integers |

---

### GET `/inquiries/:id`
**Auth:** JWT + role `ADMIN`

---

### PATCH `/inquiries/:id`
**Auth:** JWT + role `ADMIN`

**Body:**
```json
{
  "status": "RESPONDED",
  "priority": "HIGH",
  "assignedToAdminId": "uuid"
}
```

---

### POST `/inquiries/:id/respond`
**Auth:** JWT + role `ADMIN`

**Body:**
```json
{
  "response": "Thank you for your inquiry. The package is available in September."
}
```

---

### GET `/inquiries/:id/responses`
**Auth:** JWT + role `ADMIN`

---

### POST `/inquiries/:id/close`
**Auth:** JWT + role `ADMIN`  
**Body:** none

---

### DELETE `/inquiries/:id`
**Auth:** JWT + role `ADMIN`  
**Note:** Only `NEW` status inquiries can be deleted.  
**Response `204`:** No content.

---

## 7. Vehicles `/vehicles`

### POST `/vehicles`
**Auth:** JWT + role `DRIVER` or `ADMIN`

**Body:**
```json
{
  "name": "Toyota HiAce",
  "type": "VAN",
  "capacity": 14,
  "pricePerDay": 150.00,
  "registrationNumber": "CAB-1234",
  "images": ["https://cdn.example.com/hiace.jpg"],
  "features": ["AC", "WiFi", "USB Charging"],
  "description": "Comfortable van for group tours."
}
```

| Field | Required | Values |
|-------|----------|--------|
| name | ✅ | min 2 chars |
| type | ✅ | `CAR` \| `SUV` \| `VAN` \| `MINIBUS` \| `LUXURY` |
| capacity | ✅ | integer min 1 |
| pricePerDay | ✅ | positive number |
| registrationNumber | ✅ | unique |
| images | ❌ | string array |
| features | ❌ | string array |
| description | ❌ | — |

---

### GET `/vehicles`
**Auth:** Public

**Query params:** `type`, `minCapacity`, `maxPrice`, `page`, `limit`

---

### GET `/vehicles/recommendations`
**Auth:** Public

**Query params:**
```
?numberOfTravelers=4&budget=1000&tripDays=5
```

---

### GET `/vehicles/type/:type`
**Auth:** Public  
**Params:** `type` — `CAR` · `SUV` · `VAN` · `MINIBUS` · `LUXURY`  
**Query:** `page`, `limit`

---

### POST `/vehicles/check-availability`
**Auth:** Public

**Body:**
```json
{
  "startDate": "2026-09-01",
  "endDate": "2026-09-07",
  "vehicleType": "VAN"
}
```

---

### GET `/vehicles/:id`
**Auth:** Public

---

### GET `/vehicles/:id/availability`
**Auth:** Public  
**Response `200`:** 30-day availability calendar array.

---

### POST `/vehicles/:id/reserve`
**Auth:** Public *(internal use)*

**Body:**
```json
{
  "bookingId": "uuid",
  "startDate": "2026-09-01",
  "endDate": "2026-09-07"
}
```

---

### PATCH `/vehicles/:id`
**Auth:** JWT + role `DRIVER` or `ADMIN`  
**Body:** Any subset of create fields (except `registrationNumber`).

---

### DELETE `/vehicles/:id`
**Auth:** JWT + role `ADMIN`  
**Response `204`:** No content.

---

## 8. Districts `/districts`

### GET `/districts`
**Auth:** Public  
**Query:** `search`, `page`, `limit`

---

### GET `/districts/featured`
**Auth:** Public

---

### GET `/districts/:id`
**Auth:** Public  
**Response `200`:** District with nested `attractions` array.

---

### POST `/districts`
**Auth:** JWT + role `ADMIN`

**Body:**
```json
{
  "name": "Kandy",
  "description": "The cultural capital of Sri Lanka.",
  "weatherInfo": { "avgTemp": "22°C", "rainfall": "moderate" },
  "bestVisitingSeason": "December to April",
  "latitude": 7.2906,
  "longitude": 80.6337,
  "coverImage": "https://cdn.example.com/kandy.jpg",
  "featured": true
}
```

---

### PATCH `/districts/:id`
**Auth:** JWT + role `ADMIN`  
**Body:** Any subset of create fields + `status?`

---

### DELETE `/districts/:id`
**Auth:** JWT + role `ADMIN`  
**Response `204`:** No content.

---

### POST `/districts/:id/featured`
**Auth:** JWT + role `ADMIN`

**Body:**
```json
{ "featured": true }
```

---

## 9. Attractions `/attractions`

### GET `/attractions`
**Auth:** Public  
**Query:** `districtId`, `category`, `search`, `page`, `limit`

---

### GET `/attractions/district/:districtId`
**Auth:** Public

---

### GET `/attractions/category/:category`
**Auth:** Public  
**Params:** `category` — `TEMPLE` · `BEACH` · `MOUNTAIN` · `WATERFALL` · `HISTORIC` · `WILDLIFE`

---

### GET `/attractions/:id`
**Auth:** Public

---

### POST `/attractions`
**Auth:** JWT + role `ADMIN`

**Body:**
```json
{
  "name": "Sigiriya Rock Fortress",
  "description": "Ancient rock fortress and palace ruins.",
  "districtId": "uuid",
  "category": "HISTORIC",
  "images": ["https://cdn.example.com/sigiriya.jpg"],
  "travelTips": "Visit early morning to avoid crowds.",
  "estimatedVisitingTime": "3-4 hours",
  "latitude": 7.9570,
  "longitude": 80.7603,
  "openingHours": "07:00 - 17:30",
  "entryFee": 30.00
}
```

| Field | Required |
|-------|----------|
| name | ✅ min 2 chars |
| description | ✅ |
| districtId | ✅ UUID |
| category | ✅ enum |
| travelTips | ✅ |
| estimatedVisitingTime | ✅ |
| latitude / longitude | ✅ |
| images | ❌ |
| openingHours | ❌ |
| entryFee | ❌ |

---

### PATCH `/attractions/:id`
**Auth:** JWT + role `ADMIN`  
**Body:** Any subset of create fields.

---

### DELETE `/attractions/:id`
**Auth:** JWT + role `ADMIN`  
**Response `204`:** No content.

---

## 10. Categories `/categories`

### GET `/categories`
**Auth:** Public

---

### GET `/categories/:category`
**Auth:** Public  
**Params:** `category` — category name string

---

### POST `/categories`
**Auth:** Public *(no guard — add ADMIN guard if needed)*

**Body:**
```json
{
  "name": "Cultural Tours",
  "description": "Explore temples, heritage sites and traditions.",
  "icon": "🏛️",
  "color": "#C8A96E",
  "featured": true
}
```

---

## 11. Experiences `/experiences`

### GET `/experiences`
**Auth:** Public  
**Query:** `category`, `search`, `page`, `limit`

---

### GET `/experiences/featured`
**Auth:** Public

---

### GET `/experiences/:id`
**Auth:** Public

---

### POST `/experiences`
**Auth:** JWT + role `ADMIN`

**Body:**
```json
{
  "name": "White Water Rafting",
  "description": "Thrilling rafting experience on the Kelani River.",
  "category": "ADVENTURE",
  "price": 75.00,
  "duration": "3 hours",
  "image": "https://cdn.example.com/rafting.jpg",
  "images": ["https://cdn.example.com/rafting1.jpg"],
  "location": "Kitulgala",
  "districtId": "uuid",
  "featured": false
}
```

| Field | Required | Values |
|-------|----------|--------|
| name | ✅ | min 2 chars |
| description | ✅ | — |
| category | ✅ | `ADVENTURE` \| `NATURE` \| `CULTURAL` \| `RELAXATION` \| `FAMILY` \| `ROMANTIC` |
| price | ✅ | number |
| duration | ✅ | string e.g. "3 hours" |
| image | ❌ | — |
| images | ❌ | string array |
| location | ❌ | — |
| districtId | ❌ | UUID |
| featured | ❌ | boolean |

---

### PATCH `/experiences/:id`
**Auth:** JWT + role `ADMIN`  
**Body:** Any subset of create fields + `status?`

---

### DELETE `/experiences/:id`
**Auth:** JWT + role `ADMIN`  
**Response `204`:** No content.

---

### POST `/experiences/:id/feature`
**Auth:** JWT + role `ADMIN`  
**Body:** none  
**Response `200`:** Experience with `featured: true`.

---

## Common Response Shapes

### Paginated response
```json
{
  "data": [ { ...item } ],
  "total": 100,
  "page": 1,
  "limit": 10,
  "pages": 10
}
```

### Error responses
```json
{ "statusCode": 400, "message": "Validation error details", "error": "Bad Request" }
{ "statusCode": 401, "message": "Unauthorized" }
{ "statusCode": 403, "message": "Access denied. Requires one of: [ADMIN]" }
{ "statusCode": 404, "message": "Booking abc-123 not found" }
{ "statusCode": 409, "message": "Email already registered" }
```

---

## Enum Reference

| Enum | Values |
|------|--------|
| UserRole | `TOURIST` · `DRIVER` · `ADMIN` |
| UserStatus | `ACTIVE` · `INACTIVE` · `SUSPENDED` |
| BookingStatus | `PENDING` · `CONFIRMED` · `CANCELLED` · `COMPLETED` |
| PaymentStatus | `NOT_PAID` · `PARTIAL` · `PAID` |
| PaymentMethod | `CARD` · `BANK_TRANSFER` · `CASH` · `ONLINE` |
| PackageCategory | `ADVENTURE` · `NATURE` · `ROMANTIC` · `WILDLIFE` · `FAMILY` · `CULTURAL` · `BEACH` · `LUXURY` |
| InclusionType | `MEAL` · `TRANSPORT` · `ACCOMMODATION` · `ACTIVITY` |
| VehicleType | `CAR` · `SUV` · `VAN` · `MINIBUS` · `LUXURY` |
| ExperienceCategory | `ADVENTURE` · `NATURE` · `CULTURAL` · `RELAXATION` · `FAMILY` · `ROMANTIC` |
| AttractionCategory | `TEMPLE` · `BEACH` · `MOUNTAIN` · `WATERFALL` · `HISTORIC` · `WILDLIFE` |
| ReviewStatus | `PENDING` · `APPROVED` · `REJECTED` |
| InquiryStatus | `NEW` · `RESPONDED` · `CLOSED` |
| InquiryPriority | `LOW` · `MEDIUM` · `HIGH` |
| InquiryCategory | `BOOKING` · `GENERAL` · `COMPLAINT` · `SUGGESTION` |
