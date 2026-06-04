require("dotenv").config();

const { createApp } = require("./app");
const { env } = require("./config/env");

// Entry point for the local dev API server used during local development and watch restarts.
const app = createApp();

app.listen(env.port, () => {
  console.log(`SkillChain backend listening on http://localhost:${env.port}`);
});
