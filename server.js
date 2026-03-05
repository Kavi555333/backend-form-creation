// const express = require('express');
// const snowflake = require('snowflake-sdk');
// const cors = require('cors');
// const bodyParser = require('body-parser');

// const app = express();
// const port = 5000;

// app.use(cors()); // Enable CORS for all routes
// app.use(bodyParser.json()); // Parse JSON bodies

// // Snowflake connection options (add your credentials here later)
// const connectionOptions = {
//   account: 'your_snowflake_account', // e.g., 'abc123.us-east-1'
//   username: 'your_username',
//   password: 'your_password',
//   warehouse: 'your_warehouse',
//   database: 'your_database',
//   schema: 'your_schema'
// };

// // POST endpoint to handle signup data
// app.post('/api/signup', async (req, res) => {
//   const { username, email, password } = req.body;

//   // Basic validation (expand as needed)
//   if (!username || !email || !password) {
//     return res.status(400).json({ error: 'Missing required fields' });
//   }

//   try {
//     const connection = snowflake.createConnection(connectionOptions);
//     await connection.connectAsync(); // Connect to Snowflake

//     // SQL INSERT statement (assume table 'users' with columns username, email, password)
//     const statement = await connection.execute({
//       sqlText: 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
//       binds: [username, email, password] // Use binds to prevent SQL injection
//     });

//     await connection.destroy(); // Close connection
//     res.status(200).json({ message: 'Signup successful!' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to insert data' });
//   }
// });

// app.listen(port, () => {
//   console.log(`Backend running on http://localhost:${port}`);
// }); 

// ############################# Save Data to MongoDB ##################################################################3

// const express = require('express');
// const snowflake = require('snowflake-sdk');
// const cors = require('cors');
// const bodyParser = require('body-parser');

// const app = express();
// const port = 5000;

// app.use(cors());                    // Allow requests from localhost:3000 (React)
// app.use(bodyParser.json());         // Parse JSON request bodies

// // ────────────────────────────────────────────────
// //   !!! REPLACE THESE WITH YOUR REAL VALUES !!!
// //   Best: use environment variables (dotenv)
// // ────────────────────────────────────────────────
// const connectionOptions = {
//   account:   'your_snowflake_account',     // e.g. xy12345.us-east-1
//   username:  'your_username',
//   password:  'your_password',
//   warehouse: 'your_warehouse_name',
//   database:  'your_database_name',
//   schema:    'your_schema_name',           // usually PUBLIC or your custom schema
//   // role:   'your_role',                  // optional – add if needed
// };

// // POST /api/signup – receives data from React form
// app.post('/api/signup', async (req, res) => {
//   const data = req.body;

//   // List of required fields (match frontend validation)
//   const requiredFields = [
//     'firstName', 'lastName', 'email', 'phone',
//     'address', 'city', 'state', 'zip', 'diagnosis'
//   ];

//   // Check missing required fields
//   const missing = requiredFields.filter(field => !data[field] || data[field].trim() === '');
//   console.log("missing:",missing);

//   if (missing.length > 0) {
//     return res.status(400).json({
//       error: 'Missing required fields',
//       missingFields: missing
//     });
//   }

//   // Optional: extra server-side email format check
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!emailRegex.test(data.email)) {
//     return res.status(400).json({ error: 'Invalid email format' });
//   }

//   // consent should be "on" when checked (HTML checkbox default behavior)
//   if (data.consent !== 'on') {
//     return res.status(400).json({ error: 'Consent is required' });
//   }

//   // Prepare values for INSERT (in the same order as columns below)
//   const values = [
//     data.firstName.trim(),
//     data.lastName.trim(),
//     data.email.trim(),
//     data.phone.trim(),
//     data.address.trim(),
//     data.apartment ? data.apartment.trim() : null,   // optional field
//     data.city.trim(),
//     data.state.trim(),
//     data.zip.trim(),
//     data.diagnosis,                                 // "yes" or "no"
//     data.consent === 'on' ? true : false,           // store as boolean
//     new Date().toISOString()                        // submission timestamp
//   ];

//   try {
//     const connection = snowflake.createConnection(connectionOptions);

//     // Better error handling on connect
//     await new Promise((resolve, reject) => {
//       connection.connect((err, conn) => {
//         if (err) reject(err);
//         else resolve(conn);
//       });
//     });

//     // ─────────────────────────────────────────────────────────────
//     //   SQL – adjust column names / table name to match your table
//     // ─────────────────────────────────────────────────────────────
//     const sql = `
//       INSERT INTO signups (
//         first_name,
//         last_name,
//         email,
//         phone,
//         address,
//         apartment,
//         city,
//         state,
//         zip_code,
//         diagnosed,
//         consent_given,
//         submitted_at
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;

//     await connection.execute({
//       sqlText: sql,
//       binds: values,
//       complete: (err, stmt, rows) => {
//         if (err) throw err;
//       }
//     });

//     // Clean up
//     connection.destroy();

//     // Success response
//     res.status(200).json({
//       message: 'Sign-up recorded successfully. Thank you!'
//     });

//   } catch (err) {
//     console.error('Signup error:', err);

//     let errorMessage = 'Failed to save data. Please try again later.';
    
//     // Optional: give friendlier message for known Snowflake errors
//     if (err.message?.includes('Insufficient privileges')) {
//       errorMessage = 'Database permission issue. Contact administrator.';
//     } else if (err.message?.includes('does not exist')) {
//       errorMessage = 'Table does not exist. Please create it first.';
//     }

//     res.status(500).json({ error: errorMessage });
//   }
// });

// // Start server
// app.listen(port, () => {
//   console.log(`Backend server running → http://localhost:${port}`);
//   console.log('Ready to receive form submissions at /api/signup');
// });




// ############################################## Save Data to SQL   ####################################


// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const Database = require('better-sqlite3');
// const path = require('path');

// const app = express();
// const port = 5000;

// // Database file will be created automatically in project folder
// const dbPath = path.join(__dirname, 'signups.db');
// const db = new Database(dbPath, { verbose: console.log });

// // Create table if it doesn't exist (runs only once)
// db.exec(`
//   CREATE TABLE IF NOT EXISTS signups (
//     id            INTEGER PRIMARY KEY AUTOINCREMENT,
//     first_name    TEXT NOT NULL,
//     last_name     TEXT NOT NULL,
//     email         TEXT NOT NULL,
//     phone         TEXT NOT NULL,
//     address       TEXT NOT NULL,
//     apartment     TEXT,
//     city          TEXT NOT NULL,
//     state         TEXT NOT NULL,
//     zip           TEXT NOT NULL,
//     diagnosis     TEXT NOT NULL CHECK(diagnosis IN ('yes', 'no')),
//     consent_given INTEGER NOT NULL CHECK(consent_given IN (0,1)),
//     submitted_at  TEXT NOT NULL DEFAULT (datetime('now'))
//   );

//   CREATE UNIQUE INDEX IF NOT EXISTS idx_email ON signups(email);
// `);

// app.use(cors());
// app.use(bodyParser.json());

// // POST /api/signup
// app.post('/api/signup', (req, res) => {
//   const data = req.body;

//   // Required fields check (same as before)
//   const requiredFields = [
//     'firstName', 'lastName', 'email', 'phone',
//     'address', 'city', 'state', 'zip', 'diagnosis'
//   ];

//   const missing = requiredFields.filter(field =>
//     !data[field] || String(data[field]).trim() === ''
//   );

//   if (missing.length > 0) {
//     return res.status(400).json({
//       error: 'Missing required fields',
//       missingFields: missing
//     });
//   }

//   // Email format
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!emailRegex.test(data.email)) {
//     return res.status(400).json({ error: 'Invalid email format' });
//   }

//   // Consent
//   if (data.consent !== 'on') {
//     return res.status(400).json({ error: 'Consent is required' });
//   }

//   try {
//     // Prepare data
//     const insert = db.prepare(`
//       INSERT INTO signups (
//         first_name, last_name, email, phone, address, apartment,
//         city, state, zip, diagnosis, consent_given, submitted_at
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `);

//     insert.run(
//       data.firstName.trim(),
//       data.lastName.trim(),
//       data.email.trim().toLowerCase(),
//       data.phone.trim(),
//       data.address.trim(),
//       data.apartment ? data.apartment.trim() : null,
//       data.city.trim(),
//       data.state.trim(),
//       data.zip.trim(),
//       data.diagnosis,
//       1,                               // consent_given = true
//       new Date().toISOString()
//     );

//     res.status(201).json({
//       message: 'Sign-up recorded successfully. Thank you!'
//     });

//   } catch (err) {
//     console.error('Signup error:', err);

//     let errorMessage = 'Failed to save data. Please try again.';

//     if (err.code === 'SQLITE_CONSTRAINT') {
//       if (err.message.includes('UNIQUE')) {
//         errorMessage = 'This email is already registered.';
//       } else if (err.message.includes('CHECK')) {
//         errorMessage = 'Invalid value in diagnosis or consent.';
//       }
//     }

//     res.status(500).json({ error: errorMessage });
//   }
// });

// app.listen(port, () => {
//   console.log(`Backend running → http://localhost:${port}`);
//   console.log(`SQLite database: ${dbPath}`);
//   console.log('Ready for form submissions at /api/signup');
// });



// ######################### code to connect snowflake from Claude #################
// ============================================================
// server.js — Fispar Form Backend
// Replaces: better-sqlite3 (local file)
// With:     snowflake-sdk (cloud database)
//
// Setup:
//   npm uninstall better-sqlite3
//   npm install snowflake-sdk dotenv express-rate-limit
//
// Create .env file in same folder (see bottom of this file)
// ============================================================

// require('dotenv').config();

// const express    = require('express');
// const cors       = require('cors');
// const bodyParser = require('body-parser');
// const snowflake  = require('snowflake-sdk');
// const rateLimit  = require('express-rate-limit');

// const app  = express();
// const port = process.env.PORT || 5000;

// // ── 1. Snowflake Connection ────────────────────────────────
// // Uses your account identifier: XFDYYMV-VV44976
// const connection = snowflake.createConnection({
//   account:   process.env.SNOWFLAKE_ACCOUNT,    // XFDYYMV-VV44976
//   username:  process.env.SNOWFLAKE_USERNAME,   // ACCOUNTADMIN or FISPAR_APP_USER
//   password:  process.env.SNOWFLAKE_PASSWORD,   // Your password
//   database:  process.env.SNOWFLAKE_DATABASE,   // FISPAR_DB
//   schema:    process.env.SNOWFLAKE_SCHEMA,     // FORMS
//   warehouse: process.env.SNOWFLAKE_WAREHOUSE,  // COMPUTE_WH
// });

// // ── 2. Connect to Snowflake on startup ────────────────────
// connection.connect((err, conn) => {
//   if (err) {
//     console.error('❌ Snowflake connection failed:', err.message);
//     console.error('Check your .env credentials!');
//     process.exit(1); // Stop server if DB connection fails
//   }
//   console.log('✅ Snowflake connected successfully!');
//   console.log(`   Account:   ${process.env.SNOWFLAKE_ACCOUNT}`);
//   console.log(`   Database:  ${process.env.SNOWFLAKE_DATABASE}`);
//   console.log(`   Schema:    ${process.env.SNOWFLAKE_SCHEMA}`);
//   console.log(`   Warehouse: ${process.env.SNOWFLAKE_WAREHOUSE}`);
// });

// // ── Helper: Run Snowflake query as Promise ─────────────────
// // Converts Snowflake's callback style → async/await
// function runQuery(sqlText, binds = []) {
//   return new Promise((resolve, reject) => {
//     connection.execute({
//       sqlText,
//       binds,
//       complete: (err, stmt, rows) => {
//         if (err) reject(err);
//         else resolve(rows);
//       },
//     });
//   });
// }

// // ── 3. Middleware ──────────────────────────────────────────

// // CORS — only allow your frontend domain
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//   methods: ['POST', 'GET'],
//   allowedHeaders: ['Content-Type'],
// }));

// // Body parser
// app.use(bodyParser.json());

// // Rate limiter — prevents spam/abuse
// // Max 10 signup attempts per IP per 15 minutes
// const signupLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 10,
//   message: {
//     error: 'Too many signup attempts from this IP. Please try again in 15 minutes.'
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// // ── 4. Health Check Route ──────────────────────────────────
// // Visit http://localhost:5000/health to verify server is running
// app.get('/health', async (req, res) => {
//   try {
//     await runQuery('SELECT CURRENT_TIMESTAMP() AS now');
//     res.json({
//       status: 'ok',
//       database: 'snowflake connected ✅',
//       timestamp: new Date().toISOString(),
//     });
//   } catch (err) {
//     res.status(500).json({
//       status: 'error',
//       database: 'snowflake disconnected ❌',
//       error: err.message,
//     });
//   }
// });

// // ── 5. POST /api/signup ────────────────────────────────────
// // Receives form data from SignUpForm.tsx → saves to Snowflake
// app.post('/api/signup', signupLimiter, async (req, res) => {
//   const data = req.body;

//   // ── 5a. Required fields validation ──────────────────────
//   // Matches exactly your SignUpForm.tsx field names
//   const requiredFields = [
//     'firstName', 'lastName', 'email', 'phone',
//     'address', 'city', 'state', 'zip', 'diagnosis'
//   ];

//   const missing = requiredFields.filter(
//     field => !data[field] || String(data[field]).trim() === ''
//   );

//   if (missing.length > 0) {
//     return res.status(400).json({
//       error: 'Missing required fields',
//       missingFields: missing,
//     });
//   }

//   // ── 5b. Email format validation ─────────────────────────
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!emailRegex.test(data.email)) {
//     return res.status(400).json({ error: 'Invalid email format' });
//   }

//   // ── 5c. Diagnosis validation ─────────────────────────────
//   if (!['yes', 'no'].includes(data.diagnosis)) {
//     return res.status(400).json({ error: 'Diagnosis must be yes or no' });
//   }

//   // ── 5d. Consent validation ───────────────────────────────
//   // Frontend checkbox sends 'on' when checked
//   if (data.consent !== 'on') {
//     return res.status(400).json({ error: 'Consent is required' });
//   }

//   // ── 5e. Get client IP ─────────────────────────────────────
//   const ipAddress =
//     req.headers['x-forwarded-for']?.split(',')[0] ||
//     req.socket?.remoteAddress ||
//     'unknown';

//   // ── 5f. Insert into Snowflake ─────────────────────────────
//   try {
//     await runQuery(
//       `INSERT INTO FISPAR_DB.FORMS.SIGNUPS (
//         FIRST_NAME,
//         LAST_NAME,
//         EMAIL,
//         PHONE,
//         ADDRESS,
//         APARTMENT,
//         CITY,
//         STATE,
//         ZIP,
//         DIAGNOSIS,
//         CONSENT_GIVEN,
//         IP_ADDRESS
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         data.firstName.trim(),
//         data.lastName.trim(),
//         data.email.trim().toLowerCase(),  // always store lowercase email
//         data.phone.trim(),
//         data.address.trim(),
//         data.apartment ? data.apartment.trim() : null,  // optional field
//         data.city.trim(),
//         data.state.trim(),
//         data.zip.trim(),
//         data.diagnosis,                   // 'yes' or 'no'
//         true,                             // consent_given = true (already validated above)
//         ipAddress,
//       ]
//     );

//     // ── Success response → SweetAlert success in frontend
//     console.log(`✅ New signup: ${data.email} at ${new Date().toISOString()}`);
//     return res.status(201).json({
//       message: 'Sign-up recorded successfully. Thank you!',
//     });

//   } catch (err) {
//     console.error('❌ Snowflake insert error:', err);

//     // Handle duplicate email
//     if (err.message && err.message.includes('unique')) {
//       return res.status(409).json({
//         error: 'This email is already registered.',
//       });
//     }

//     // Generic server error
//     return res.status(500).json({
//       error: 'Failed to save data. Please try again later.',
//     });
//   }
// });

// // ── 6. Start Server ────────────────────────────────────────
// app.listen(port, () => {
//   console.log('');
//   console.log('🚀 Fispar Backend Server Running!');
//   console.log(`   URL:      http://localhost:${port}`);
//   console.log(`   Endpoint: http://localhost:${port}/api/signup`);
//   console.log(`   Health:   http://localhost:${port}/health`);
//   console.log('');
// });

// // ── Graceful shutdown ──────────────────────────────────────
// process.on('SIGINT', () => {
//   console.log('\n🛑 Shutting down server...');
//   connection.destroy((err) => {
//     if (err) console.error('Error closing Snowflake connection:', err);
//     else console.log('✅ Snowflake connection closed.');
//     process.exit(0);
//   });
// });


// ##################### code for commiting form data to SnowFlake ################################

// ============================================================
// server.js — Fispar Backend (Complete — All 3 Forms)
// Routes:
//   POST /api/signup      → FISPAR_DB.FORMS.SIGNUPS
//   POST /api/survey      → FISPAR_DB.FORMS.SURVEY_RESPONSES
//   POST /api/enrollment  → FISPAR_DB.FORMS.PATIENT_ENROLLMENTS
//   GET  /health          → connection check
// ============================================================

require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const bodyParser = require('body-parser');
const snowflake  = require('snowflake-sdk');
const rateLimit  = require('express-rate-limit');

const app  = express();
const port = process.env.PORT || 5000;

// ── 1. Snowflake Connection ────────────────────────────────
const connection = snowflake.createConnection({
  account:   process.env.SNOWFLAKE_ACCOUNT,
  username:  process.env.SNOWFLAKE_USERNAME,
  password:  process.env.SNOWFLAKE_PASSWORD,
  database:  process.env.SNOWFLAKE_DATABASE,
  schema:    process.env.SNOWFLAKE_SCHEMA,
  warehouse: process.env.SNOWFLAKE_WAREHOUSE,
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Snowflake connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ Snowflake connected successfully!');
  console.log(`   Account:   ${process.env.SNOWFLAKE_ACCOUNT}`);
  console.log(`   Database:  ${process.env.SNOWFLAKE_DATABASE}`);
  console.log(`   Schema:    ${process.env.SNOWFLAKE_SCHEMA}`);
  console.log(`   Warehouse: ${process.env.SNOWFLAKE_WAREHOUSE}`);
  console.log('');
  console.log('📋 Active Routes:');
  console.log('   POST /api/signup      → SIGNUPS table');
  console.log('   POST /api/survey      → SURVEY_RESPONSES table');
  console.log('   POST /api/enrollment  → PATIENT_ENROLLMENTS table');
  console.log('   GET  /health          → connection check');
});

// ── Helper: Snowflake query as Promise ─────────────────────
function runQuery(sqlText, binds = []) {
  return new Promise((resolve, reject) => {
    connection.execute({
      sqlText,
      binds,
      complete: (err, stmt, rows) => {
        if (err) reject(err);
        else resolve(rows);
      },
    });
  });
}

// ── Helper: Get client IP ──────────────────────────────────
function getIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

// ── 2. Middleware ──────────────────────────────────────────
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:5173',
//   methods: ['POST', 'GET'],
//   allowedHeaders: ['Content-Type'],
// }));

// app.use(bodyParser.json()); 

app.use(cors({
  origin: function (origin, callback) {
    // Strip trailing slash for comparison
    const allowed = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://form-creation-pi.vercel.app',
      process.env.FRONTEND_URL?.replace(/\/$/, ''), // removes trailing slash
    ].filter(Boolean);

    // Allow requests with no origin (Postman, health checks)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/$/, '');

    if (allowed.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      console.error(`❌ CORS blocked origin: ${origin}`);
      callback(new Error(`CORS policy: origin ${origin} not allowed`));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: false,
}));

// ✅ Handle preflight OPTIONS requests explicitly
app.options('*', cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many requests. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── 3. GET /health ─────────────────────────────────────────
app.get('/health', async (req, res) => {
  try {
    await runQuery('SELECT CURRENT_TIMESTAMP() AS now');
    res.json({
      status: 'ok',
      database: 'snowflake connected ✅',
      routes: ['/api/signup', '/api/survey', '/api/enrollment'],
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// ══════════════════════════════════════════════════════════
// ROUTE 1 — POST /api/signup
// Form:  SignUpForm.tsx
// Table: FISPAR_DB.FORMS.SIGNUPS
// ══════════════════════════════════════════════════════════
app.post('/api/signup', limiter, async (req, res) => {
  const data = req.body;

  const required = ['firstName','lastName','email','phone','address','city','state','zip','diagnosis'];
  const missing  = required.filter(f => !data[f] || String(data[f]).trim() === '');
  if (missing.length > 0)
    return res.status(400).json({ error: 'Missing required fields', missingFields: missing });

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    return res.status(400).json({ error: 'Invalid email format' });

  if (!['yes','no'].includes(data.diagnosis))
    return res.status(400).json({ error: 'Diagnosis must be yes or no' });

  if (data.consent !== 'on')
    return res.status(400).json({ error: 'Consent is required' });

  try {
    await runQuery(
      `INSERT INTO FISPAR_DB.FORMS.SIGNUPS (
        FIRST_NAME, LAST_NAME, EMAIL, PHONE,
        ADDRESS, APARTMENT, CITY, STATE, ZIP,
        DIAGNOSIS, CONSENT_GIVEN, IP_ADDRESS
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.firstName.trim(),
        data.lastName.trim(),
        data.email.trim().toLowerCase(),
        data.phone.trim(),
        data.address.trim(),
        data.apartment ? data.apartment.trim() : null,
        data.city.trim(),
        data.state.trim(),
        data.zip.trim(),
        data.diagnosis,
        true,
        getIP(req),
      ]
    );
    console.log(`✅ [SIGNUP] ${data.email} at ${new Date().toISOString()}`);
    return res.status(201).json({ message: 'Sign-up recorded successfully. Thank you!' });

  } catch (err) {
    console.error('❌ [SIGNUP]', err.message);
    if (err.message?.includes('unique'))
      return res.status(409).json({ error: 'This email is already registered.' });
    return res.status(500).json({ error: 'Failed to save data. Please try again.' });
  }
});

// ══════════════════════════════════════════════════════════
// ROUTE 2 — POST /api/survey
// Form:  FeedbackModal.tsx
// Table: FISPAR_DB.FORMS.SURVEY_RESPONSES
// Payload: { whoAreYou, howHeard, visitReason, nextAction }
// ══════════════════════════════════════════════════════════
app.post('/api/survey', limiter, async (req, res) => {
  const data = req.body;

  const required = ['whoAreYou','howHeard','visitReason','nextAction'];
  const missing  = required.filter(f => !data[f] || String(data[f]).trim() === '');
  if (missing.length > 0)
    return res.status(400).json({ error: 'Missing survey answers', missingFields: missing });

  try {
    await runQuery(
      `INSERT INTO FISPAR_DB.FORMS.SURVEY_RESPONSES (
        WHO_ARE_YOU, HOW_HEARD, VISIT_REASON, NEXT_ACTION, IP_ADDRESS
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        data.whoAreYou.trim(),
        data.howHeard.trim(),
        data.visitReason.trim(),
        data.nextAction.trim(),
        getIP(req),
      ]
    );
    console.log(`✅ [SURVEY] Response saved at ${new Date().toISOString()}`);
    return res.status(201).json({ message: 'Survey response recorded. Thank you!' });

  } catch (err) {
    console.error('❌ [SURVEY]', err.message);
    return res.status(500).json({ error: 'Failed to save survey. Please try again.' });
  }
});

// ══════════════════════════════════════════════════════════
// ROUTE 3 — POST /api/enrollment
// Form:  EnrollmentPage.tsx
// Table: FISPAR_DB.FORMS.PATIENT_ENROLLMENTS
// Payload: { firstName, lastName, dob, gender,
//            city, state, zip, phone, language }
// ══════════════════════════════════════════════════════════
app.post('/api/enrollment', limiter, async (req, res) => {
  const data = req.body;

  const required = ['firstName','lastName','dob','gender','city','state','zip','phone','language'];
  const missing  = required.filter(f => !data[f] || String(data[f]).trim() === '');
  if (missing.length > 0)
    return res.status(400).json({ error: 'Missing required fields', missingFields: missing });

  const dobRegex = /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])-\d{4}$/;
  if (!dobRegex.test(data.dob))
    return res.status(400).json({ error: 'Date of birth must be MM-DD-YYYY format' });

  try {
    await runQuery(
      `INSERT INTO FISPAR_DB.FORMS.PATIENT_ENROLLMENTS (
        FIRST_NAME, LAST_NAME, DOB, GENDER,
        CITY, STATE, ZIP, PHONE, LANGUAGE, IP_ADDRESS
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.firstName.trim(),
        data.lastName.trim(),
        data.dob.trim(),
        data.gender.toLowerCase(),
        data.city.trim(),
        data.state.trim(),
        data.zip.trim(),
        data.phone.trim(),
        data.language.toLowerCase(),
        getIP(req),
      ]
    );
    console.log(`✅ [ENROLLMENT] ${data.firstName} ${data.lastName} at ${new Date().toISOString()}`);
    return res.status(201).json({ message: 'Enrollment recorded successfully. Thank you!' });

  } catch (err) {
    console.error('❌ [ENROLLMENT]', err.message);
    return res.status(500).json({ error: 'Failed to save enrollment. Please try again.' });
  }
});

// ── 4. Start Server ────────────────────────────────────────
app.listen(port, () => {
  console.log('');
  console.log('🚀 Fispar Backend Server Running!');
  console.log(`   URL:    http://localhost:${port}`);
  console.log(`   Health: http://localhost:${port}/health`);
  console.log('');
});

// ── Graceful shutdown ──────────────────────────────────────
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  connection.destroy((err) => {
    if (err) console.error('Error:', err);
    else console.log('✅ Snowflake connection closed.');
    process.exit(0);
  });
});




