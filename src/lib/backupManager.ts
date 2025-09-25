import { copyFile, readDir, remove, BaseDirectory } from "@tauri-apps/plugin-fs";
import { appDataDir, join } from "@tauri-apps/api/path";

const DB_NAME = "sunbed.db";
const WAL_FILES = ["sunbed.db-wal", "sunbed.db-shm"]; // optional, only if they exist

function getTodayString() {
  const date = new Date();
  return date.toLocaleDateString("en-GB").split("/").join("-"); // DD-MM-YYYY
}

export async function fileExists(path: string, baseDir: BaseDirectory) {
  try {
    await readDir(path, { baseDir });
    return true;
  } catch {
    return false;
  }
}

export async function backupDatabase() {
  const dbDir = await appDataDir();
  const today = getTodayString();

  // no backup on same day 
  const backupDbPath = await join(dbDir, `backup-${today}.db`);
  console.log(backupDbPath)
  try {
    await copyFile(DB_NAME, `backup-${today}.db`, {
      fromPathBaseDir: BaseDirectory.AppData,
      toPathBaseDir: BaseDirectory.AppData,
    });
    console.log("Backup completed for:", today);
  } catch (err) {
    console.log("Backup already exists or failed:", err);
    return;
  }

  // backup wal if exist, just encase recent changes aren't yet saved gracefully
  for (const walFile of WAL_FILES) {
    const dest = `${walFile}-${today}`;
    try {
      await copyFile(walFile, dest, {
        fromPathBaseDir: BaseDirectory.AppData,
        toPathBaseDir: BaseDirectory.AppData,
      });
    } catch {
      // if not exist IGNORE
    }
  }
}

export async function cleanupBackups(maxBackups = 15) {
  try {
    const dbDir = await appDataDir();
    const files = await readDir(dbDir, { baseDir: BaseDirectory.AppData });

    const backups = files
      .filter(f => f.name && f.name.startsWith("backup-"))
      .sort((a, b) => (a.name! > b.name! ? -1 : 1)); // newest first

    for (let i = maxBackups; i < backups.length; i++) {
      const name = backups[i].name!;
      await remove(name, { baseDir: BaseDirectory.AppData });
      console.log(`Removed old backup: ${name}`);
    }
  } catch (err) {
    console.error("Cleanup failed:", err);
  }
}
