# 🩸 Smart Blood Donor Connect

A real-time blood donor matching platform that connects donors with recipients using location-based matching.

## Features

- **Donor Registration** — Register as a blood donor with your blood group, location, and availability
- **Recipient Search** — Search for compatible donors by blood type and proximity
- **Interactive Map** — View nearby donors on a Leaflet.js / OpenStreetMap map
- **Blood Requests** — Recipients can raise urgent blood requests
- **Real-time Notifications** — Donors receive incoming requests via polling (every 10s)
- **Accept/Reject** — Donors can accept or decline blood requests
- **Profile Management** — Update availability, phone, city, donation history

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, Tailwind CSS (CDN), Vanilla JS |
| Backend | Node.js, Express.js |
| Database | lowdb (JSON file-based) |
| Maps | Leaflet.js + OpenStreetMap |
| Auth | JWT + bcryptjs |
| Location | Browser Geolocation API + Haversine formula |

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Or start production server
npm start
```

Open [http://localhost:5000](http://localhost:5000) in your browser.

## Test Credentials

| Email | Password | Role |
|-------|----------|------|
| ravi@test.com | (hashed in seed) | Donor |

> Register a new account to test the full flow.

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login user |
| GET | `/api/donors/search` | No | Search donors by blood group & location |
| GET | `/api/donors/profile` | Yes | Get donor profile |
| PATCH | `/api/donors/availability` | Yes | Toggle availability |
| PATCH | `/api/donors/profile` | Yes | Update donor profile |
| POST | `/api/requests` | Yes | Create blood request |
| GET | `/api/requests/my` | Yes | Get recipient's requests |
| GET | `/api/requests/incoming` | Yes | Get donor's incoming requests |
| PATCH | `/api/requests/:id/respond` | Yes | Accept/reject request |
| PATCH | `/api/requests/:id/fulfill` | Yes | Mark request as fulfilled |

## License

MIT
