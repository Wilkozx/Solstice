import { check } from "@tauri-apps/plugin-updater";
import { toast } from "react-toastify";

export async function runUpdater() {
  try {
    const update = await check();

    if (!update) {
      return;
    }

    toast.info(
      <div>
        Update available! Version {update.version} is ready.
        <div style={{ marginTop: 8 }}>
          <button
            onClick={async () => {
              toast.dismiss(); // Remove toast
              await update.downloadAndInstall(event => {
                switch (event.event) {
                  case "Started":
                    console.log(
                      `Started downloading update (${event.data.contentLength ?? 0} bytes)`
                    );
                    break;
                  case "Progress":
                    console.log(`Downloaded ${event.data.chunkLength ?? 0} bytes`);
                    break;
                  case "Finished":
                    console.log("Update downloaded! Installing now...");
                    toast.success("Update installed! App will relaunch if configured.");
                    break;
                }
              });
            }}
            style={{ marginRight: 8 }}
          >
            Yes
          </button>
          <button onClick={() => toast.dismiss()}>Later</button>
        </div>
      </div>,
      { autoClose: false }
    );
  } catch (err) {
    toast.error("Update check failed: " + err);
    console.error(err);
  }
}
