const express = require("express");
const healthRoutes = require("./health.routes");
const authRoutes = require("./auth.routes");
const projectRoutes = require("./project.routes");
const verifyRoutes = require("./verify.routes");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/projects", projectRoutes);
router.use("/verify", verifyRoutes);

module.exports = router;
