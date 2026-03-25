import express, { type Express } from "express";
import cors from "cors";
import path from "path";
import router from "./routes";

const app: Express = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ ANA TEST ENDPOINT (GET HATASI İÇİN)
app.get("/", (req, res) => {
  res.send("Falcızade API çalışıyor 🚀");
});

// ✅ /api/fal GET TEST (Tarayıcı hatası çözümü)
app.get("/api/fal", (req, res) => {
  res.json({
    message: "Burası POST endpoint. GET yerine POST kullan 👍",
  });
});

// API ROUTES (ASIL SİSTEM)
app.use("/api", router);

// Serve static files from the React app build directory
app.use(express.static(path.join(process.cwd(), "dist")));

// Catch all handler: send back React's index.html file for SPA routing
app.get("*", (req, res) => {
  res.sendFile(path.join(process.cwd(), "dist", "index.html"));
});

export default app;