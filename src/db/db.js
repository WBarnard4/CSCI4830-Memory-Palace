import Dexie from "dexie";

export const db = new Dexie("MemoryPalaceDB");

db.version(1).stores({
  rooms: "++id, name",          // imageId lives on the object, no index needed
  ideas: "++id, roomId",        // roomId indexed so you can query ideas per room
  images: "++id",                // name + data (Blob) stored, not indexed
  changes: "++id, roomId, index", // for the undo/redo history
});

export async function saveImage(file) {
  //console.log("saveImage called with:", file.name);
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

export async function createRoom(name, imageId, imgSrc) {
  return await db.rooms.add({
    name: name,
    imageId: imageId ?? null,
    imgSrc: imgSrc ?? null,
  });
}

export async function getAllRooms() {
  const rooms = await db.rooms.toArray();
  for (let i = 0; i < rooms.length; i++) {
    const imageId = rooms[i].imageId ?? null;
    const imgSrc = imageId ? await getImageUrl(imageId) : null;
    rooms[i] = {
      ...rooms[i],
      imageId: imageId,
      imgSrc: imgSrc,
    }
  }
  return rooms;
}

export async function updateRoomName(roomId, roomName) {
  await db.rooms.update(roomId, {
    name: roomName,
  });
}

export async function saveRoom(roomData, ideas) {
  return db.transaction("rw", db.rooms, db.ideas, db.images, async () => {
    let roomId = roomData.id;

    // First save: room doesn't exist in the DB yet
    if (roomId == null) {
      roomId = createRoom(roomData.name, roomData.imageId, roomData.imgSrc);
    } else {
      await db.rooms.update(roomId, {
        name: roomData.name,
        imageId: roomData.imageId ?? null,
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
        text: idea.text ?? null,
        imageId: idea.imageId ?? null,
      });
    }

    return roomId;
  });
}
export async function loadRoom(roomId) {
  const room = await db.rooms.get(roomId);
  if (!room) return null;

  const ideas = await db.ideas.where("roomId").equals(roomId).toArray();
  const imageId = room.imageId ?? null;
  const imgSrc = imageId ? await getImageUrl(imageId) : null;

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
