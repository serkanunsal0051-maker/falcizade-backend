const express = require("express");
const path = require("path");

const app = express();

// ❗ STATIC KALDIRMADIK AMA ALTA ALACAĞIZ

// ✅ PRIVACY (ÖNCE YAKALA!)
app.get("/privacy", (req, res) => {
  res.send(`
    <h1>Privacy Policy</h1>
    <p>This application uses Google AdMob to display ads.</p>
    <p>AdMob may collect and use device identifiers and usage data.</p>
    <p>No personal data is stored.</p>
    <p>Google Privacy Policy: https://policies.google.com/privacy</p>
  `);
});

// ✅ TERMS
app.get("/terms", (req, res) => {
  res.send(`
    <h1>Terms of Use</h1>
    <p>This app is for entertainment purposes only.</p>
  `);
});

// 🔥 STATIC EN ALTA
app.use(express.static(__dirname));

// Ana sayfa
app.get("/", (req, res) => {
  res.send("Falcızade API çalışıyor 🔥");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server çalışıyor 🚀");
});
