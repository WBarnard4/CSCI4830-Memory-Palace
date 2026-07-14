import Dexie from "dexie";

export const db = new Dexie("MemoryPalaceDB");

db.version(1).stores({
  rooms:   "++id, name",          // imageId lives on the object, no index needed
  ideas:   "++id, roomId",        // roomId indexed so you can query ideas per room
  images:  "++id",                // name + data (Blob) stored, not indexed
  changes: "++id, roomId, index", // for the undo/redo history
});
export async function saveImage(file) {
    console.log("saveImage called with:", file.name);
  const id = await db.images.add({
    name: file.name,
    data: file, // File is a Blob — Dexie stores it as-is
  });
  return id;
}
export async function getImageUrl(imageId) {
  const record = await db.images.get(imageId);
  if (!record) {
    return null; // image was deleted or id is stale
  }
  return URL.createObjectURL(record.data);
}

//URL.revokeObjectURL() may need to be called when the image is no longer needed, but this is not implemented yet. The URL will be revoked when the page is closed, so it is not a huge issue.

// TEMP test — comment out after verifying
//saveImage(new File(["hello"], "test.txt")).then((id) => console.log("saved image id:", id));

window.db = db; // TEMP: lets us query from the browser console