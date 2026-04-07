require("dotenv").config();

const { createApp } = require("./app");
const { env } = require("./config/env");

const app = createApp();

app.listen(env.port, () => {
  console.log(`SkillChain backend listening on http://localhost:${env.port}`);
});
