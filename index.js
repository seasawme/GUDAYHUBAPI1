const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const path = require('path');
const user = require("./Routes/User");
const login = require("./Routes/login")
const post = require("./Routes/post")
const freelancer = require("./Routes/freelancer")
const applicant = require("./Routes/applicant")
const employer = require("./Routes/employer")
const conversation = require("./Routes/conversations")
const message = require("./Routes/messages")
const PostHistory = require("./Routes/postHistory")
const hired = require("./Routes/hired")
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');
const language = require("./Routes/language");
const Complaint = require("./Routes/Complaint");
const Offer = require("./Routes/offer");
const testimony = require("./Routes/testimony");
const admin = require("./Routes/admin");



// Initialize i18next
i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    backend: {
      loadPath: path.join(__dirname, 'locales/{{lng}}/translation.json')
    }
  });

app.use(middleware.handle(i18next));
mongoose
  .connect(process.env.URL)
  .then(() => console.log("Success, MongoDB connected"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


app.use("/user", user);
app.use("/login", login)
app.use("/post", post)
app.use("/freelancer", freelancer)
app.use("/applicant", applicant)
app.use("/employer", employer)
app.use("/conversations", conversation)
app.use("/messages", message)
app.use("/PostHistory", PostHistory)
app.use("/hired", hired)
app.use("/language", language)
app.use("/Complaint", Complaint)
app.use("/Offer", Offer)
app.use("/testimony", testimony)
app.use("/admin", admin)

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
