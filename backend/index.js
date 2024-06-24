const express = require("express");
const session = require("express-session");
const passport = require("passport");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const app = express();
require("dotenv").config;
require("./auth/auth");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({ secret: process.env.SESSION_SECRET }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, "..", "frontend")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// auth middleware
function isLoggedIn(req, res, next) {
  req.user
    ? next()
    : res.status(401).json({
        msg: " not logged in",
      });
}
//multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const Id = req.user._id;
    const currentPath = "./uploads/" + Id;
    if (!fs.existsSync(currentPath)) {
      fs.mkdirSync(currentPath, { recursive: true });
      cb(null, currentPath);
    }

    cb(null, currentPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "..", "frontend", "index.html");
  res.sendFile(filePath);
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/protected",
    failureRedirect: "/error",
  })
);

app.get("/protected", isLoggedIn, (req, res) => {
  const mainPagePath = path.join(__dirname, "..", "frontend", "mainPage.html");
  res.sendFile(mainPagePath);
});

app.post("/uploadImage", isLoggedIn, upload.single("image"), (req, res) => {
  console.log(req.file);
  console.log(req.body);
  console.log(req.user);
  res.status(200).json({
    msg: "your cropped image was uploaded",
    id: req.user._id,
  });
});
app.get("/myImages/:userId", isLoggedIn, (req, res) => {
  const userId = req.params.userId.slice(1, req.params.userId.length);
  const dirPath = path.join(__dirname, "uploads", userId);
  console.log(fs.existsSync(dirPath));
  console.log(dirPath);
  if (fs.existsSync(dirPath)) {
    fs.readdir(dirPath, (err, files) => {
      if (err) {
        return res.status(500).json({ msg: "unable to list files" });
      }
      const fileData = files.map((filename) => {
        const filePath = path.join(dirPath, filename);
        const fileContent = fs.readFileSync(filePath, { encoding: "base64" });
        return {
          filename: filename,
          data: `data:image/png;base64,${fileContent}`,
        };
      });
      res.json({ files: fileData });
    });
  } else {
    return res.status(404).json({
      msg: "you have not uploaded any cropped images",
    });
  }
});
app.get("/error", (req, res) => {
  res.send("you were not authenticated properly ");
});
app.get("/getUserId", isLoggedIn, (req, res) => {
  res.json({
    userId: req.user._id,
  });
});
app.listen(4000, () => {
  console.log("listening at 4000");
});
