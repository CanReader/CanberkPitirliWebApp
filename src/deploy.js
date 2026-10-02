import { execSync } from "node:child_process";
import { writeFileSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { config } from "dotenv";

// Credentials live in .env.deploy; plain .env is kept for non-secret vars.
config({ path: [".env.deploy", ".env"] });

const {
  HOSTINGER_HOST,
  HOSTINGER_USER,
  HOSTINGER_PASS,
  HOSTINGER_REMOTE_DIR
} = process.env;

if (!HOSTINGER_HOST || !HOSTINGER_USER || !HOSTINGER_PASS) {
  console.error("❌ Missing deployment environment variables. Check your .env file.");
  process.exit(1);
}

// Blog reactions API: its database credentials also come from .env.deploy
// and are written into dist/api/config.php only for the upload, then removed
// again so they never linger in the build folder.
const { DB_HOST, DB_NAME, DB_USER, DB_PASS, REACTIONS_SALT } = process.env;
const API_CONFIG = "dist/api/config.php";
const phpString = (v) => `'${String(v).replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;

if (DB_NAME && DB_USER && DB_PASS) {
  // A stable secret salt for hashing visitor IPs; derived from the database
  // password unless one is set explicitly.
  const salt = REACTIONS_SALT || createHash("sha256").update(`reactions|${DB_PASS}`).digest("hex");
  writeFileSync(
    API_CONFIG,
    `<?php\nreturn [\n` +
      `  'host' => ${phpString(DB_HOST || "localhost")},\n` +
      `  'name' => ${phpString(DB_NAME)},\n` +
      `  'user' => ${phpString(DB_USER)},\n` +
      `  'pass' => ${phpString(DB_PASS)},\n` +
      `  'salt' => ${phpString(salt)},\n` +
      `];\n`
  );
  console.log("Reactions API: config written for upload");
} else {
  console.warn("⚠ DB_NAME / DB_USER / DB_PASS not set in .env.deploy: reactions will show without counts");
}

console.log(`Checking connection to: ${HOSTINGER_HOST}`);

const lftpCmd = [
  'set ssl:verify-certificate no',
  'set sftp:auto-confirm yes',
  `mirror -R --delete --verbose dist/ ${HOSTINGER_REMOTE_DIR}`,
  'bye'
].join('; ');

const fullCommand = `lftp -u "${HOSTINGER_USER}","${HOSTINGER_PASS}" ${HOSTINGER_HOST} -e "${lftpCmd}"`;

try {
  execSync(fullCommand, { stdio: "inherit", shell: "/bin/bash" });
  console.log("✅ Deployment successful!");
} catch (error) {
  console.error("❌ Deployment failed:", error.message);
  process.exitCode = 1;
} finally {
  rmSync(API_CONFIG, { force: true });
}

