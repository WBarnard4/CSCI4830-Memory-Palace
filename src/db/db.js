/**
 * @file Dexie (IndexedDB) data layer for Memory Palace.
 *
 * Everything that touches persistent storage lives here so the React
 * components never talk to IndexedDB directly. Rooms own ideas, and both
 * rooms and ideas may reference a stored image blob by id.
 */
import Dexie from "dexie";

/**
 * A room as it is stored in the `rooms` table.
 *
 * @typedef {Object} RoomRecord
 * @property {number} id - Auto-incremented primary key.
 * @property {string} name - User-facing room name.
 * @property {?number} imageId - Key into the `images` table for a
 *   user-uploaded background, or null when a preset background is used.
 * @property {?string} imgSrc - Asset URL for a preset background, or null
 *   when the background comes from `imageId`.
 */

/**
 * An idea (note, image, etc.) placed inside a room, as stored in the
 * `ideas` table.
 *
 * @typedef {Object} IdeaRecord
 * @property {number} id - Auto-incremented primary key.
 * @property {number} roomId - Id of the owning room (indexed).
 * @property {string} type - Idea variant, e.g. "note" or "image".
 * @property {number} x - Horizontal position within the room.
 * @property {number} y - Vertical position within the room.
 * @property {?number} w - Width, or null if unset.
 * @property {?number} h - Height, or null if unset.
 * @property {?number} r - Rotation, or null if unset.
 * @property {?string} title - Idea title, or null if unset.
 * @property {?string} text - Idea body text, or null if unset.
 * @property {?number} imageId - Key into the `images` table, or null.
 */

/**
 * A room plus its ideas, shaped for the UI rather than for storage.
 * `imgSrc` is always ready to hand to an <img>: for custom backgrounds it
 * is a freshly minted blob URL, for presets it is the stored asset URL.
 *
 * @typedef {Object} LoadedRoom
 * @property {number} id - Room id.
 * @property {string} name - Room name.
 * @property {?number} imageId - Stored image key, or null for presets.
 * @property {?string} imgSrc - Displayable background URL, or null.
 * @property {IdeaRecord[]} ideas - Every idea belonging to this room.
 */

/**
 * The single app-wide Dexie database handle.
 *
 * @type {Dexie}
 */
export const db = new Dexie("MemoryPalaceDB");

db.version(1).stores({
  rooms: "++id, name",          // imageId lives on the object, no index needed
  ideas: "++id, roomId",        // roomId indexed so you can query ideas per room
  images: "++id",                // name + data (Blob) stored, not indexed
  changes: "++id, roomId, index", // for the undo/redo history
});

/**
 * Stores an image file as a blob in the `images` table.
 *
 * The File object is handed to Dexie as-is; File extends Blob, so
 * IndexedDB persists the bytes rather than a path.
 *
 * @param {File} file - Image chosen by the user.
 * @returns {Promise<number>} Id of the newly created image record. Keep
 *   this on the owning room or idea to look the image up later.
 */
export async function saveImage(file) {
  //console.log("saveImage called with:", file.name);
  const id = await db.images.add({
    name: file.name,
    data: file, // File is a Blob — Dexie stores it as-is
  });
  return id;
}

/**
 * Builds a displayable object URL for a stored image.
 *
 * Note that each call creates a new blob URL; the browser holds it until
 * the page unloads (see the URL.revokeObjectURL note at the bottom of
 * this file).
 *
 * @param {number} imageId - Id returned by {@link saveImage}.
 * @returns {Promise<?string>} An object URL, or null if the id is stale
 *   or the image record was deleted.
 */
export async function getImageUrl(imageId) {
  const record = await db.images.get(imageId);
  if (!record) {
    return null; // image was deleted or id is stale
  }
  return URL.createObjectURL(record.data);
}

/**
 * Inserts a new room record.
 *
 * A room has either a stored background (`imageId`) or a preset one
 * (`imgSrc`); the unused one is normalized to null.
 *
 * @param {string} name - User-facing room name.
 * @param {?number} [imageId] - Stored image key for a custom background.
 * @param {?string} [imgSrc] - Asset URL for a preset background.
 * @returns {Promise<number>} Id of the newly created room.
 */
export async function createRoom(name, imageId, imgSrc) {
  return await db.rooms.add({
    name: name,
    imageId: imageId ?? null,
    imgSrc: imgSrc ?? null,
  });
}

/**
 * Fetches every saved room for the Load Room screen, newest first.
 *
 * Each room is returned with a `imgSrc` that is ready to render: custom
 * backgrounds get a fresh blob URL minted from the stored image, presets
 * fall back to the asset URL already on the record.
 *
 * @returns {Promise<RoomRecord[]>} Rooms ordered newest-first (ids
 *   auto-increment, so a higher id means a later creation).
 */
export async function getAllRooms() {
  // Newest first: ids auto-increment, so a higher id means the
  // room was created later.
  const rooms = await db.rooms.orderBy("id").reverse().toArray();
  for (let i = 0; i < rooms.length; i++) {
    const imageId = rooms[i].imageId ?? null;
    // Custom backgrounds: mint a fresh blob URL from the stored image.
    // Preset backgrounds have no imageId, so fall back to the stored asset URL.
    const imgSrc = imageId ? await getImageUrl(imageId) : (rooms[i].imgSrc ?? null);
    rooms[i] = {
      ...rooms[i],
      imageId: imageId,
      imgSrc: imgSrc,
    }
  }
  return rooms;
}

/**
 * Finds the room adjacent to the given room in the saved-room list
 * (same newest-first order as getAllRooms) and returns its id.
 *
 * @param {number} currentRoomId - id of the room currently open.
 * @param {number} direction - +1 for next room, -1 for previous room.
 * @returns {Promise<number|null>} the neighbor room's id, or null if
 *   there is no other room to switch to.
 */
export async function getAdjacentRoomId(currentRoomId, direction) {
  const rooms = await db.rooms.orderBy("id").reverse().toArray();
  if (rooms.length <= 1) {
    return null;
  }

  const currentIndex = rooms.findIndex((room) => room.id === currentRoomId);
  if (currentIndex === -1) {
    return null;
  }

  // Wrap around so +/- keeps cycling through the room list.
  const nextIndex = (currentIndex + direction + rooms.length) % rooms.length;
  return rooms[nextIndex].id;
}

/**
 * Renames a room in place, leaving its ideas and background untouched.
 *
 * @param {number} roomId - Id of the room to rename.
 * @param {string} roomName - New name. Callers should validate it first
 *   with isValidRoomName() from utils/RoomValidation.js.
 * @returns {Promise<void>} Resolves once the update is committed.
 */
export async function updateRoomName(roomId, roomName) {
  await db.rooms.update(roomId, {
    name: roomName,
  });
}

/**
 * Persists a room and its ideas as a single explicit save.
 *
 * Runs in one read/write transaction so a failure part-way through cannot
 * leave a room with half its ideas. The room is created if it has no id
 * yet, otherwise updated. Ideas are synced destructively: every existing
 * idea for this room is deleted and rewritten from the passed-in state,
 * which keeps the table in step with deletions made in the UI.
 *
 * @param {Object} roomData - Current room state from the UI.
 * @param {?number} roomData.id - Existing room id, or null on first save.
 * @param {string} roomData.name - Room name.
 * @param {?number} [roomData.imageId] - Stored background image key.
 * @param {?string} [roomData.imgSrc] - Preset background asset URL.
 * @param {IdeaRecord[]} ideas - Every idea currently in the room. Ideas
 *   omitted from this array are dropped from the database.
 * @returns {Promise<number>} Id of the saved room (newly minted on the
 *   first save, unchanged afterwards).
 */
export async function saveRoom(roomData, ideas) {
  return db.transaction("rw", db.rooms, db.ideas, db.images, async () => {
    let roomId = roomData.id;

    // First save: room doesn't exist in the DB yet
    if (roomId == null) {
      roomId = await createRoom(roomData.name, roomData.imageId, roomData.imgSrc);
    } else {
      await db.rooms.update(roomId, {
        name: roomData.name,
        imageId: roomData.imageId ?? null,
        imgSrc: roomData.imgSrc ?? null,
      });
    }

    // Sync ideas: wipe this room's old records, rewrite from current state
    await db.ideas.where("roomId").equals(roomId).delete();
    for (const idea of ideas) {
      await db.ideas.add({
        roomId,
        type: idea.type,
        x: idea.x,
        y: idea.y,
        w: idea.w ?? null,
        h: idea.h ?? null,
        r: idea.r ?? null,
        title: idea.title ?? null,
        text: idea.text ?? null,
        imageId: idea.imageId ?? null,
      });
    }

    return roomId;
  });
}
/**
 * Deletes a room along with its ideas and any image blobs it owns.
 *
 * Runs in one transaction so a room is never left orphaned from its
 * ideas. Images are safe to hard-delete here because they are never
 * shared: every pick from the image picker writes a new record.
 *
 * @param {number} roomId - Id of the room to delete.
 * @returns {Promise<void>} Resolves when the delete is committed. Resolves
 *   without doing anything if no room has that id.
 */
export async function deleteRoom(roomId) {
  return db.transaction("rw", db.rooms, db.ideas, db.images, async () => {
    const room = await db.rooms.get(roomId);
    if (!room) {
      return;
    }

    const ideas = await db.ideas.where("roomId").equals(roomId).toArray();

    // Clean up stored image blobs owned by this room. Images are
    // never shared between rooms (every pick creates a new record),
    // so deleting them here cannot break other rooms.
    const imageIds = ideas
      .map((idea) => idea.imageId)
      .filter((imageId) => imageId != null);

    if (room.imageId != null) {
      imageIds.push(room.imageId);
    }

    if (imageIds.length > 0) {
      await db.images.bulkDelete(imageIds);
    }

    await db.ideas.where("roomId").equals(roomId).delete();
    await db.rooms.delete(roomId);
  });
}

/**
 * Loads a single room and its ideas, shaped for the room screen.
 *
 * @param {number} roomId - Id of the room to open.
 * @returns {Promise<?LoadedRoom>} The room with its ideas and a
 *   displayable `imgSrc`, or null if no room has that id.
 */
export async function loadRoom(roomId) {
  const room = await db.rooms.get(roomId);
  if (!room) return null;

  const ideas = await db.ideas.where("roomId").equals(roomId).toArray();
  const imageId = room.imageId ?? null;
  const imgSrc = imageId ? await getImageUrl(imageId) : (room.imgSrc ?? null);

  return {
    id: room.id,
    name: room.name,
    imageId: imageId,
    imgSrc,
    ideas,
  };
}


//URL.revokeObjectURL() may need to be called when the image is no longer needed, but this is not implemented yet. The URL will be revoked when the page is closed, so it is not a huge issue.



// TEMP: lets us query from the browser console - use "await db.images.toArray()" in console to see all images, or "await db.images.get(1)" to get the image with id 1, etc.
window.db = db; 
