import { execSync } from "node:child_process";
import "dotenv/config";

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
  process.exit(1);
}

