# Phase 2 Testing Plan - Motorcycle Maintenance Tracker API

Replace the placeholder live URL with the Render URL before submitting.

Repository URL: PASTE-YOUR-GITHUB-REPO-LINK-HERE
Live API URL: PASTE-YOUR-RENDER-URL-HERE
Live Swagger Documentation: PASTE-YOUR-RENDER-URL-HERE/api-docs

## Test Setup in Swagger UI

1. Open Swagger UI at `/api-docs`.
2. Use `POST /api/auth/login` with one of the seed accounts.
3. Copy the returned JWT token.
4. Click the Authorize button in Swagger UI.
5. Enter the token as `Bearer YOUR_TOKEN` if Swagger asks for the full value. If Swagger automatically adds Bearer, enter only the token.

Seed credentials:

- Owner user: owner@example.com / Password123!
- Non-owner user: not-owner@example.com / Password123!
- Admin user: admin@example.com / Password123!

## Authentication Endpoints

### POST /api/auth/signup
Access Control: Public.

Success Case:
1. Click Try it out.
2. Use body: `{ "fullName": "New User", "email": "newuser@example.com", "password": "Password123!", "role": "USER" }`
3. Expect `201 Created` with user id, fullName, email, and role.

400 Bad Request:
1. Remove `email` from the request body.
2. Click Execute.
3. Expect `400 Bad Request`.

409 Conflict:
1. Use an existing email such as `owner@example.com`.
2. Click Execute.
3. Expect `409 Conflict`.

### POST /api/auth/login
Access Control: Public.

Success Case:
1. Use body: `{ "email": "owner@example.com", "password": "Password123!" }`
2. Expect `200 OK` with a JWT token and user object.

400 Bad Request:
1. Remove `password`.
2. Expect `400 Bad Request`.

401 Unauthorized:
1. Use the wrong password.
2. Expect `401 Unauthorized`.

## Motorcycle Endpoints

### POST /api/motorcycles
Access Control: Authenticated user. The created motorcycle belongs to the logged-in user.
Setup: Login as `owner@example.com` and authorize Swagger.

Success Case:
1. Use body: `{ "nickname": "Test Bike", "make": "Honda", "model": "CBR500R", "year": 2021, "vin": "TEST-VIN-100", "currentMileage": 1000 }`
2. Expect `201 Created` with the new motorcycle.

400 Bad Request:
1. Remove `nickname`.
2. Expect `400 Bad Request`.

401 Unauthorized:
1. Remove the JWT from Swagger Authorize.
2. Execute the request.
3. Expect `401 Unauthorized`.

409 Conflict:
1. Use an existing VIN such as `OWNER-HORNET-001`.
2. Expect `409 Conflict`.

### GET /api/motorcycles
Access Control: Authenticated user. Regular users see their own motorcycles. Admin sees all.
Setup: Login as `owner@example.com` and authorize Swagger.

Success Case:
1. Click Execute.
2. Expect `200 OK` with an array of motorcycles.

401 Unauthorized:
1. Remove JWT from Swagger Authorize.
2. Click Execute.
3. Expect `401 Unauthorized`.

### GET /api/motorcycles/{id}
Access Control: Owner of the motorcycle or admin.
Setup: Login as `owner@example.com` and authorize Swagger.

Success Case:
1. Use id `1`.
2. Expect `200 OK` with one motorcycle.

400 Bad Request:
1. Use id `-10`.
2. Expect `400 Bad Request`.

401 Unauthorized:
1. Remove JWT.
2. Use id `1`.
3. Expect `401 Unauthorized`.

403 Forbidden:
1. Login as `not-owner@example.com` and authorize Swagger.
2. Use id `1`, which belongs to the owner user.
3. Expect `403 Forbidden`.

404 Not Found:
1. Login as owner again.
2. Use id `9999`.
3. Expect `404 Not Found`.

### PUT /api/motorcycles/{id}
Access Control: Owner of the motorcycle or admin.
Setup: Login as `owner@example.com` and authorize Swagger.

Success Case:
1. Use id `1`.
2. Use body: `{ "nickname": "Updated Hornet", "make": "Honda", "model": "CB600F", "year": 2008, "vin": "OWNER-HORNET-001", "currentMileage": 18500 }`
3. Expect `200 OK` with the updated motorcycle.

400 Bad Request:
1. Remove `make`.
2. Expect `400 Bad Request`.

401 Unauthorized:
1. Remove JWT.
2. Execute the request.
3. Expect `401 Unauthorized`.

403 Forbidden:
1. Login as `not-owner@example.com`.
2. Try to update id `1`.
3. Expect `403 Forbidden`.

404 Not Found:
1. Login as owner.
2. Use id `9999`.
3. Expect `404 Not Found`.

409 Conflict:
1. Try to update motorcycle id `1` with VIN `NOTOWNER-NINJA-001`.
2. Expect `409 Conflict`.

### DELETE /api/motorcycles/{id}
Access Control: Owner of the motorcycle or admin.
Setup: Login as `owner@example.com` and authorize Swagger.

Success Case:
1. Create a new motorcycle first using POST.
2. Copy the new id.
3. Use that id in DELETE.
4. Expect `204 No Content`.

400 Bad Request:
1. Use id `-10`.
2. Expect `400 Bad Request`.

401 Unauthorized:
1. Remove JWT.
2. Execute the request.
3. Expect `401 Unauthorized`.

403 Forbidden:
1. Login as `not-owner@example.com`.
2. Try to delete id `1`.
3. Expect `403 Forbidden`.

404 Not Found:
1. Login as owner.
2. Use id `9999`.
3. Expect `404 Not Found`.

## Service Record Endpoints

### POST /api/service-records
Access Control: Owner of the parent motorcycle or admin.
Setup: Login as `owner@example.com` and authorize Swagger.

Success Case:
1. Use body: `{ "motorcycleId": 1, "title": "Spark Plug Check", "serviceDate": "2026-04-10T12:00:00.000Z", "mileage": 18500, "cost": 20, "notes": "Checked plugs" }`
2. Expect `201 Created`.

400 Bad Request:
1. Remove `title`.
2. Expect `400 Bad Request`.

401 Unauthorized:
1. Remove JWT.
2. Expect `401 Unauthorized`.

403 Forbidden:
1. Login as `not-owner@example.com`.
2. Use `motorcycleId: 1`.
3. Expect `403 Forbidden`.

404 Not Found:
1. Login as owner.
2. Use `motorcycleId: 9999`.
3. Expect `404 Not Found`.

### GET /api/service-records
Access Control: Authenticated user. Regular users see their own records. Admin sees all.
Setup: Login as owner and authorize Swagger.

Success Case: Execute and expect `200 OK` with an array.
401 Unauthorized: Remove JWT and expect `401 Unauthorized`.

### GET /api/service-records/{id}
Access Control: Owner of the parent motorcycle or admin.
Success: Login as owner, use id `1`, expect `200 OK`.
400: Use id `-10`, expect `400 Bad Request`.
401: Remove JWT, expect `401 Unauthorized`.
403: Login as not-owner, use id `1`, expect `403 Forbidden`.
404: Login as owner, use id `9999`, expect `404 Not Found`.

### PUT /api/service-records/{id}
Access Control: Owner of the parent motorcycle or admin.
Success: Login as owner, use id `1`, body `{ "motorcycleId": 1, "title": "Updated Oil Change", "serviceDate": "2026-04-01T12:00:00.000Z", "mileage": 18300, "cost": 70, "notes": "Updated notes" }`, expect `200 OK`.
400: Remove `title`, expect `400 Bad Request`.
401: Remove JWT, expect `401 Unauthorized`.
403: Login as not-owner and update id `1`, expect `403 Forbidden`.
404: Use id `9999`, expect `404 Not Found`.

### DELETE /api/service-records/{id}
Access Control: Owner of the parent motorcycle or admin.
Success: Create a new service record, delete its id, expect `204 No Content`.
400: Use id `-10`, expect `400 Bad Request`.
401: Remove JWT, expect `401 Unauthorized`.
403: Login as not-owner and delete id `1`, expect `403 Forbidden`.
404: Use id `9999`, expect `404 Not Found`.

## Maintenance Reminder Endpoints

### POST /api/maintenance-reminders
Access Control: Owner of the parent motorcycle or admin.
Setup: Login as owner and authorize Swagger.

Success Case:
1. Use body: `{ "motorcycleId": 1, "taskName": "Tire Inspection", "intervalMiles": 1000, "intervalMonths": 2, "dueMileage": 19500, "dueDate": "2026-06-01T12:00:00.000Z", "status": "ACTIVE" }`
2. Expect `201 Created`.

400 Bad Request: Remove `taskName`, expect `400 Bad Request`.
401 Unauthorized: Remove JWT, expect `401 Unauthorized`.
403 Forbidden: Login as not-owner and use `motorcycleId: 1`, expect `403 Forbidden`.
404 Not Found: Use `motorcycleId: 9999`, expect `404 Not Found`.

### GET /api/maintenance-reminders
Access Control: Authenticated user. Regular users see their own reminders. Admin sees all.
Success: Login as owner, execute, expect `200 OK` with an array.
401: Remove JWT, expect `401 Unauthorized`.

### GET /api/maintenance-reminders/{id}
Access Control: Owner of the parent motorcycle or admin.
Success: Login as owner, use id `1`, expect `200 OK`.
400: Use id `-10`, expect `400 Bad Request`.
401: Remove JWT, expect `401 Unauthorized`.
403: Login as not-owner and use id `1`, expect `403 Forbidden`.
404: Use id `9999`, expect `404 Not Found`.

### PUT /api/maintenance-reminders/{id}
Access Control: Owner of the parent motorcycle or admin.
Success: Login as owner, use id `1`, body `{ "motorcycleId": 1, "taskName": "Updated Chain Service", "intervalMiles": 500, "intervalMonths": 1, "dueMileage": 19500, "dueDate": "2026-05-01T12:00:00.000Z", "status": "ACTIVE" }`, expect `200 OK`.
400: Remove `taskName`, expect `400 Bad Request`.
401: Remove JWT, expect `401 Unauthorized`.
403: Login as not-owner and update id `1`, expect `403 Forbidden`.
404: Use id `9999`, expect `404 Not Found`.

### DELETE /api/maintenance-reminders/{id}
Access Control: Owner of the parent motorcycle or admin.
Success: Create a new reminder, delete its id, expect `204 No Content`.
400: Use id `-10`, expect `400 Bad Request`.
401: Remove JWT, expect `401 Unauthorized`.
403: Login as not-owner and delete id `1`, expect `403 Forbidden`.
404: Use id `9999`, expect `404 Not Found`.
