import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/api/process';

export async function runUpdater() {
  try {
    const update = await check();
    if (update) {
      console.log(
        `Found update ${update.version} from ${update.date} with notes: ${update.body}`
      );

      let downloaded = 0;
      let contentLength = 0;

      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            contentLength = event.data.contentLength;
            console.log(`Started downloading ${contentLength} bytes`);
            break;
          case 'Progress':
            downloaded += event.data.chunkLength;
            console.log(`Downloaded ${downloaded} of ${contentLength}`);
            break;
          case 'Finished':
            console.log('Download finished');
            break;
        }
      });

      console.log('Update installed, relaunching app...');
      await relaunch();
    } else {
      console.log('No update available');
    }
  } catch (err) {
    console.error('Update check failed:', err);
  }
}
