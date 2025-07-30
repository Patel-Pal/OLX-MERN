
# Full Stack MERN + Stripe + Socket.io Application

This is a full-stack web application built using the MERN stack (MongoDB, Express, React, Node.js) with added functionalities such as:

- Real-time chat with **Socket.IO**
- Secure **Stripe** payment integration
- Authentication using **JWT** and **bcrypt**
- Cloudinary for image uploads
- Frontend using **React 19**, **Tailwind CSS**, **Bootstrap**, and **Formik/Yup**

---

## 🚀 Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB (with Mongoose)
- Socket.IO
- Stripe API
- Cloudinary
- dotenv
- bcryptjs
- jsonwebtoken
- multer
- cors

### Frontend
- React 19
- TypeScript
- Vite
- React Router v7
- Tailwind CSS & Bootstrap 5
- Chart.js with react-chartjs-2
- Formik & Yup
- react-toastify, react-icons, lucide-react
- socket.io-client
- jspdf

---

## 📦 Installation

### 1. Clone the repository
```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Install backend dependencies
```bash
cd be
npm install
```

### 3. Install frontend dependencies
```bash
cd ../fe
npm install
```

---

## 🧪 Scripts

### Backend
```bash
npm run dev     # with nodemon
```

### Frontend
```bash
npm run dev     # start frontend server with Vite
npm run build   # build production
```

---

## 💳 Stripe Integration

This app uses [Stripe](https://stripe.com) for secure payment processing.

You need to add your **Stripe public and secret keys** in `.env`:
```env
STRIPE_SECRET_KEY=your_secret_key
STRIPE_PUBLISHABLE_KEY=your_publishable_key
```

---

## 🧠 Features

- User Authentication (JWT-based)
- Buyer-Seller Chat (via WebSocket)
- Role-based dashboards
- Wishlist and Cart system
- Orders with approval/rejection flow
- Admin panel with:
  - User and product management
  - Revenue analytics
- Responsive UI
- Analytics via Chart.js
- PDF export with jsPDF

---

## 🖼 Image Uploads

Using [Cloudinary](https://cloudinary.com) for storing product/user images.

---

## 🔐 .env Sample

For Backend (`be/.env`):
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
STRIPE_SECRET_KEY=your_stripe_secret
```

---

## 📊 Admin Analytics

Admin dashboard includes:
- Total Buyers/Sellers/Products
- Seller-wise Revenue
- Total Revenue
- Charts (Bar, Pie, Line)

---

## 📜 License

This project is licensed under the ISC License.
