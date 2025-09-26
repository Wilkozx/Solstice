import { check } from '@tauri-apps/plugin-updater';

export async function runUpdater() {
  try {
    const update = await check();

    if (!update) {
      alert('You are already running the latest version!');
      return;
    }

    alert(`Update available! Version ${update.version} will be downloaded.`);

    await update.downloadAndInstall((event) => {
      switch (event.event) {
        case 'Started':
          alert(`Started downloading update (${event.data.contentLength ?? 0} bytes)`);
          break;
        case 'Progress':
          // Optional: You could show a progress bar here instead of an alert
          console.log(`Downloaded ${event.data.chunkLength ?? 0} bytes`);
          break;
        case 'Finished':
          alert('Update downloaded! Installing now...');
          break;
      }
    });

    alert('Update installed! The app will relaunch automatically if configured.');
  } catch (err) {
    alert('Update check failed: ' + err);
    console.error(err);
  }
}
