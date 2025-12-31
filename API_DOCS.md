# API_DOCS.md

## Auth Endpoints

### POST /auth/request-otp
Request a 6-digit OTP to email.  
Used for **registration** and **forgot password**.  

Body:
{
  "email": "user@mail.com"
}

---

### POST /auth/register
Register new customer after OTP verification.  

Body:
{
  "email": "user@mail.com",
  "username": "username",
  "password": "password",
  "firstname": "First",
  "lastname": "Last",
  "phone": "0771234567",
  "otp": "123456"
}

---

### POST /auth/login
Login using email or username.  
Returns JWT access token.  

Body:
{
  "login": "email_or_username",
  "password": "password"
}

---

### POST /auth/forgot-password
Reset password using OTP (user not logged in).  

Steps:
1. Call `/auth/request-otp`
2. User receives OTP by email
3. Call this endpoint with OTP and new password

Body:
{
  "email": "user@mail.com",
  "otp": "123456",
  "newPassword": "newPassword123"
}

---

### POST /auth/change-password
Change password for logged-in user.  
Requires **JWT token**.  

Headers:
Authorization: Bearer <JWT_TOKEN>

Body:
{
  "currentPassword": "oldPassword",
  "newPassword": "newPassword123"
}

---

## Admin Endpoints (JWT + Role = ADMIN)

### POST /admin/create-cashier
Create cashier account.  
Only admin token allowed.  

Headers:
Authorization: Bearer <ADMIN_JWT_TOKEN>

Body:
{
  "username": "cashier01",
  "email": "cashier@mail.com",
  "password": "password123"
}

---

### POST /admin/create-delivery
Create delivery account.  
Only admin token allowed.  

Headers:
Authorization: Bearer <ADMIN_JWT_TOKEN>

Body:
{
  "username": "delivery01",
  "email": "delivery@mail.com",
  "password": "password123",
  "firstname": "Name",
  "phone": "0771234567"
}

---

## Users Endpoints (JWT Protected)

### GET /users
Get all users.  
Requires JWT token.  
Response excludes passwords.

Headers:
Authorization: Bearer <JWT_TOKEN>

---

### PUT /users/update-profile
Update logged-in user profile.  
Username and email cannot be changed.  

Headers:
Authorization: Bearer <JWT_TOKEN>

Body:
{
  "firstname": "First",
  "lastname": "Last",
  "phone": "0771234567",
  "dob": "1999-01-01",
  "salutation": "Mr"
}

---

### POST /auth/change-password
Change password using current password.  
User must be logged in.

Headers:
Authorization: Bearer <JWT_TOKEN>

Body:
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123"
}