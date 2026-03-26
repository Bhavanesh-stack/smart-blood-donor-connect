# Smart Blood Donor Connect 🩸

A full-stack, real-time web application prototype designed to bridge the gap between blood donors and recipients. The platform uses location-based tracking and interactive maps to help recipients find the nearest compatible blood donors quickly during emergencies.

## 🚀 Features

- **User Authentication:** Secure registration and login for Donors and Recipients using JWT (JSON Web Tokens).
- **Role-Based Dashboards:** Unique interfaces tailored specifically for blood donors vs. recipients.
- **Location Matching:** Real-time distance calculation (Haversine formula) to match recipients with the closest available donors.
- **Interactive Map Visualization:** Built with **Leaflet.js**, including marker clustering and custom avatars plotted directly on the map.
- **Blood Requests:** Recipients can search for a specific blood group by radius and instantly send requests. Donors receive live updates.

## 🛠️ Tech Stack

**Frontend:**
- HTML5
- Tailwind CSS (via CDN)
- Vanilla JavaScript (ES6+)
- Leaflet.js (Map rendering logic)

**Backend:**
- Node.js & Express.js (REST API Server)
- lowdb (File-based JSON database for prototype)
- bcryptjs (Password hashing)
- jsonwebtoken (Authentication)

---

## 💻 Local Setup Instructions

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Start the local server:**
   \`\`\`bash
   npm start
   \`\`\`
   
   *This will run the Express backend and serve the frontend files at `http://localhost:5000`.*

---

## ☁️ How to push changes to GitHub

Now that your repository is set up, whenever you make changes to your code, you need to save those changes to GitHub. Here is the step-by-step process you will follow every time:

### Step 1: Stage the changed files
This command tells Git to track all the files you have added, deleted, or modified.
\`\`\`bash
git add .
\`\`\`

### Step 2: Commit the changes
This saves a local snapshot of your project. Be sure to write a descriptive message so you remember what you changed!
\`\`\`bash
git commit -m "Describe your changes here for example: Fixed login bug"
\`\`\`

### Step 3: Push to GitHub
This uploads your local snapshot directly to your remote GitHub repository for the world to see.
\`\`\`bash
git push
\`\`\`

*(Note: Since you've already run `git push -u origin master` once today, you now only need to type `git push` going forward!)*
