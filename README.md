🌍 **GlobeStay**

GlobeStay is a full-stack web application inspired by Airbnb. It enables users to explore and book unique stays across the globe, as well as list their own properties for rent.

✨ **Features**

* List and browse rental properties with images and descriptions
* Filter listings based on location, price, and amenities
* View property locations on an integrated map
* Upload multiple images using Cloudinary
* User authentication (register, login, logout)
* Flash messages and server-side validations
* RESTful routing and modular MVC-based code structure

🛠️ **Tech Stack**

Frontend: HTML, EJS, Bootstrap
Backend: Node.js, Express.js
Database: MongoDB with Mongoose
Utilities: Cloudinary, Multer, Method-Override, Dotenv

🚀 **Getting Started**

1. Clone the repository:

   git clone [https://github.com/denish178/GlobeStay.git](https://github.com/denish178/GlobeStay.git)
   cd GlobeStay

2. Install dependencies:

   npm install

3. Configure environment variables:

   Create a `.env` file in the root directory and add the following keys:

   DB\_URL = your MongoDB Atlas connection string
   CLOUDINARY\_CLOUD\_NAME = your Cloudinary cloud name
   CLOUDINARY\_KEY = your Cloudinary API key
   CLOUDINARY\_SECRET = your Cloudinary API secret
   SECRET = your express-session secret

4. Start the application:

   npm start

Then, open your browser and go to: [http://localhost:3000](http://localhost:3000)

📁 **Project Structure**

GlobeStay/
├── models/ - Mongoose models for listings and users
├── routes/ - Express route handlers
├── views/ - EJS templates for rendering UI
├── public/ - Static files (CSS, JS, images)
├── cloudConfig.js - Cloudinary configuration
├── app.js - Main application file
└── README.md

🖼️ **Screenshots**

*(You can add UI screenshots here later.)*

🧠 **Future Enhancements**

* Booking calendar with date blocking
* Wishlist/favorite listings
* Host dashboard with analytics
* Review and rating system

🤝 **Acknowledgements**

Built as a learning project inspired by Airbnb, to practice full-stack web development using Node.js, Express, MongoDB, and Cloudinary.

Created with ❤️ by Denish Murawala
GitHub: [https://github.com/denish178](https://github.com/denish178)

Let me know if you'd like a Hindi-English version or want to add a live demo link.
