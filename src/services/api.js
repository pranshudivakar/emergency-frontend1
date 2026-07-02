// import axios from "axios";

// const API = axios.create({
//   baseURL: "http://localhost:5000",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// export default API;

import axios from "axios";

const API = axios.create({
  baseURL: "https://emergency-backend-5.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;