import { loadRoom } from "@/db/db.js";

export const LoadRoomData = async (id) => {
  // Loads from database and fills into roomData shape
  return await loadRoom(id);
};