# API_DOCS.md
<!----------------------------------------------------------->

## Auth Endpoints
------------------
### POST /auth/request-otp
Request a 6-digit OTP to email.  
Used for **registration** and **forgot password**.  

Body:
{
  "email": "user@mail.com"
}

---------------------------------------------

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

---------------------------------------------

### POST /auth/login
Login using email or username.  
Returns JWT access token.  

Body:
{
  "login": "email_or_username",
  "password": "password"
}

---------------------------------------------

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

---------------------------------------------

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

<!----------------------------------------------------------->

## Admin Endpoints (JWT + Role = ADMIN)
---------------------------------------
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

---------------------------------------------

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

---------------------------------------------
## Category Endpoints

### POST /categories
Create a new category.
Only admin token allowed.  

Headers:
Authorization: Bearer <ADMIN_JWT_TOKEN>
Content-Type: multipart/form-data

Body:
key: name   → value: Pizza
key: image  → value: <select image file>

---------------------------------------------

### PUT /categories/:id
Update category name and/or image.
Only admin token allowed.  

Headers:
Authorization: Bearer <ADMIN_JWT_TOKEN>
Content-Type: multipart/form-data

Body (form-data):
key: name   → value: Burgers
key: image  → value: <select new image file>

---------------------------------------------

### DELETE /categories/:id
Delete a category.
Only admin token allowed. 

Headers:
Authorization: Bearer <ADMIN_JWT_TOKEN>

---------------------------------------------

### GET /categories
Get all categories.
Accessible by customer, cashier, delivery, admin.

Headers:
Authorization: Bearer <JWT_TOKEN>

---------------------------------------------

## Food Endpoints

### GET /food
Get all food items.
Accessible by all logged-in users.

Headers:
Authorization: Bearer <JWT_TOKEN>

---------------------------------------------

### POST /food
Create a food item (Admin only).

Headers:
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data

Body (form-data):
**with image**
key: name              → Chicken Pizza
key: shortDescription  → Tasty pizza
key: longDescription   → Full description
key: ingredients       → cheese, chicken
key: price             → 1200
key: type              → halal
key: categoryId        → <category_id>
key: categoryName      → Pizza
key: image             → <select image file>

**Without Image**
Body:
{
  "name": "food name",
  "shortDescription": "short",
  "longDescription": "Full description",
  "ingredients": ["cheese", "chicken"],
  "price": 1200,
  "type": "halal",
  "categoryId": "<category_id>"
}

---------------------------------------------

### PUT /food/:id
Update food item (Admin only).

Headers:
Authorization: Bearer <JWT_TOKEN>

Body:
{

}

---------------------------------------------

### DELETE /food/:id
Delete food item (Admin only).

Headers:
Authorization: Bearer <JWT_TOKEN>

---------------------------------------------
## Beverage Endpoints

### GET /beverages
Get all beverage items.  
Accessible by customer, cashier, delivery, admin**.

Headers:
Authorization: Bearer <JWT_TOKEN>

---------------------------------------------

### GET /beverages/:id
Get a single beverage by ID.  
Accessible by **customer, cashier, delivery, admin**.

Headers:
Authorization: Bearer <JWT_TOKEN>

---------------------------------------------

### POST /beverages
Create a beverage item (**Admin only**).

Headers:
Authorization: Bearer <ADMIN_JWT_TOKEN>

Content-Type:
- application/json **OR**
- multipart/form-data (if uploading image)

#### With Image (multipart/form-data)

Body (form-data):
key: name              → Coca Cola  
key: shortDescription  → Soft drink  
key: longDescription   → Carbonated soft drink  
key: ingredients       → [Carbonated water, sugar, caffeine]  
key: type              → non-alcoholic  
key: categoryId        → <category_id>  
key: sizes             → [{"size":"330ml","price":1.2},{"size":"500ml","price":2.5}]  
key: image             → <select image file>

#### Without Image (Raw JSON)

Body:
{
  "name": "Coca Cola",
  "shortDescription": "Soft drink",
  "longDescription": "Carbonated soft drink",
  "ingredients": ["Carbonated water", "Sugar", "Caffeine"],
  "type": "non-alcoholic",
  "categoryId": "<category_id>",
  "sizes": [
    { "size": "330ml", "price": 1.2 },
    { "size": "500ml", "price": 2.5 }
  ]
}

---------------------------------------------

## ads Endpoints

### GET /ads
Get all ads.
Accessible by all logged-in users.

Headers:
Authorization: Bearer <JWT_TOKEN>

---------------------------------------------

## POST /ads
Create a ads (Admin only).

Headers:
Authorization: Bearer <JWT_TOKEN>

Body (form-data):
image: file
title: "Weekend Offer" ***optional***
endDate: 2026-02-01 ***optional***

---------------------------------------------

### PUT /ads/:id
Update ads (Admin only).

Headers:
Authorization: Bearer <JWT_TOKEN>

---------------------------------------------

### DELETE /ads/:id
Delete ads (Admin only).

Headers:
Authorization: Bearer <JWT_TOKEN>

---------------------------------------------

<!----------------------------------------------------------->

## Users Endpoints (JWT Protected)

### GET /users
Get all users.  
Requires JWT token.  
Response excludes passwords.

Headers:
Authorization: Bearer <JWT_TOKEN>

---------------------------------------------

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

---------------------------------------------

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

---------------------------------------------

### POST /users/delete-account
Delete Account using current password.  
User must be logged in.

Headers:
Authorization: Bearer <JWT_TOKEN>

Body:
{
  "currentPassword": "Pass@1234",
  "reason": "I no longer need this app"
}

---------------------------------------------

### PUT /users/profile-images
PUT upload profile image

Headers:
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data

Body:
key=image, value=<select from device>

---------------------------------------------

### GET /categories
Get all categories.
Accessible by customer, cashier, delivery, admin.

Headers:
Authorization: Bearer <JWT_TOKEN>

---------------------------------------------

### GET /food
Get all food items.
Accessible by all logged-in users.

Headers:
Authorization: Bearer <JWT_TOKEN>

---------------------------------------------