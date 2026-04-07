const express = require("express");
const cors = require("cors");
const routes = require("./routes");

function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
    })
  );
  app.use(express.json());

  app.get("/", (_req, res) => {
    res.json({
      name: "SkillChain AI API",
      version: "v1",
      message: "Repository analysis and certification services are initializing.",
    });
  });

  app.use("/api/v1", routes);

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
  });

  return app;
}

module.exports = { createApp };
