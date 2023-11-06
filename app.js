const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

const rootDir = require("./util/path");

const PORT = 3000;
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(rootDir, "views")));

app.use("/add-record", (req, res) => {
  res.sendFile(path.join(rootDir, "views", "addRecord.html"));
});
app.use("/user", (req, res) => {
  res.sendFile(path.join(rootDir, "views", "user.html"));
});
app.use("/admin", (req, res) => {
  res.sendFile(path.join(rootDir, "views", "admin.html"));
});
app.use("/edit-record", (req, res) => {
  res.sendFile(path.join(rootDir, "views", "editRecord.html"));
});
app.use("/view-record", (req, res) => {
  res.sendFile(path.join(rootDir, "views", "viewRecord.html"));
});
app.use("/set-bill", (req, res) => {
  res.sendFile(path.join(rootDir, "views", "setBill.html"));
});
app.post("/get-abi", function (req, res) {
  const filePath = path.join(rootDir, "abi.txt");
  res.sendFile(filePath);
});
app.post("/get-cont-addr", function (req, res) {
  const filePath = path.join(rootDir, "contract_addr.txt");
  res.sendFile(filePath);
});
app.get("/", (req, res) => {
  res.sendFile(path.join(rootDir, "views", "connect.html"));
});
app.listen(PORT);
