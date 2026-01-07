
# Pizza Casa - Backend

Bcakend for the Pizza Casa mobile app, built using NestJS with TypeScript.

## Running Locally
### 1. Clone the Repository

```bash
git clone <repository-url>
cd pizza-casa-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Update the values in `.env` as needed for your environment.

####for the nodemailer email and password
```bash
You must create an App Password:

- Go to Google Account → Security

- Enable 2-Step Verification (if not enabled)

- Go to App Passwords

- Select:

-- App: Pizza Casa

-- Device: Other → name it “Pizza Casa”

Copy the generated 16-character password

Paste it in .env as EMAIL_PASS
```

### 4. Run the Application

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

Refer the **API_DOCS.md** file for all the api endpoints 