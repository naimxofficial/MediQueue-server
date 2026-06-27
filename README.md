# 🖥️ MediQueue — Server

> **The REST API powering the MediQueue tutor booking platform.**

This is the Express.js backend for MediQueue. It handles all tutor listings, session bookings, cancellations, and CRUD operations — connected to a MongoDB database and deployed on Vercel.

🌐 **Live API:** [https://mediqueue-server-beta.vercel.app/](https://mediqueue-server-beta.vercel.app/)

🖥️ **Frontend:** [https://mediqueue-puce.vercel.app/](https://mediqueue-puce.vercel.app/)

---

## 🔌 API Endpoints

### Tutors
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/tutors` | Get all tutors — supports `?search=`, `?startDate=`, `?endDate=` |
| `GET` | `/tutors/:id` | Get a single tutor by ID |
| `GET` | `/featured` | Get 6 featured tutors for the homepage |
| `PATCH` | `/tutors/:id/decrease-slot` | Decrease available slot count by 1 after booking |

### My Tutors
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/my-tutors` | Get all tutor listings created by the logged-in user |
| `POST` | `/my-tutors` | Add a new tutor listing |
| `PUT` | `/my-tutors/:id` | Update an existing tutor listing |
| `DELETE` | `/my-tutors/:id` | Delete a tutor listing |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/bookings` | Get all bookings for the logged-in user |
| `POST` | `/bookings` | Create a new session booking |
| `PATCH` | `/bookings/:id/cancel` | Cancel a booking by ID |

---

## ✨ Features

| Feature | Details |
|--------|---------|
| 🔍 **Search & Filter** | Filter tutors by name (regex, case-insensitive) and registration date range |
| 📅 **Slot Management** | Automatically decrements available slots when a session is booked |
| ❌ **Session Cancellation** | Marks booking as cancelled with a `cancelledAt` timestamp |
| 🧹 **Data Sanitization** | Parses `totalSlot`, `hourlyRate`, and `experience` as correct numeric types on save |
| 🌐 **CORS Enabled** | Accepts cross-origin requests from the frontend |
| 📨 **Automatic Email** | Automatically email sends after creating registering on the website |

---

## 🛠️ Built With

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![dotenv](https://img.shields.io/badge/dotenv-ECD53F?style=flat&logo=dotenv&logoColor=black)
![Nodemailer](https://img.shields.io/badge/Nodemailer-6-4B8505?logo=nodedotjs)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=flat&logo=vercel&logoColor=white)

---

## ⚙️ Environment Variables

Create a `.env` file in the root:

```env
PORT=
MONGODB_URI=
BETTER_AUTH_URL=
CLIENT_URL=
EMAIL_USER=
EMAIL_PASS=
```
