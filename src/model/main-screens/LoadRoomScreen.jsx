import "@/App.css";
import {LoadRoomData} from "@/utils/LoadRoomData.jsx"
import HOME_STATES from "./States.jsx"
import { useState, useEffect } from "react";
import { getAllRooms } from "@/db/db.js";
const STATES = HOME_STATES;

export default function LoadRoomScreen({isOpen, onClose, onCloseLoad}) {
    // If state is incorrect, do not render component
    if (isOpen != HOME_STATES.LOAD) return null;
  const [rooms, setRooms] = useState([]);

useEffect(() => {
  if (isOpen !== STATES.LOAD) return; // only fetch when this screen is actually showing
  getAllRooms().then(setRooms);
}, [isOpen]);
   async function exportRoomData(id) {
  const roomData = await LoadRoomData(id);
  if (!roomData) return; // stale or missing id — do nothing rather than open a broken room
  onCloseLoad(roomData);
}

    return (
      <div>
        <button className="room-button" onClick={onClose}>
          Home
        </button>

        {rooms.map((room) => (
          <button
            key={room.id}
            className="room-button"
            onClick={() => exportRoomData(room.id)}
          >
            {room.name}
          </button>
        ))}

        {rooms.length === 0 && <p>No saved rooms yet.</p>}
      </div>
    );
}