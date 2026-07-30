// return object containing Room data to be used in RoomFactory. Called by RoomFactory.
import { loadRoom } from "@/db/db.js";

/**
 * Thin wrapper over the data layer's loadRoom().
 *
 * Exists so screens can import room loading from utils rather than
 * reaching into the database module directly.
 *
 * @param {number} id - Id of the room to load.
 * @returns {Promise<?Object>} The room with its ideas, or null if no room
 *   has that id.
 */
export const LoadRoomData = async (id) => {
  // Loads from database and fills into roomData shape
  return await loadRoom(id);
};