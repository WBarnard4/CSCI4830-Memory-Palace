import "@/App.css";
import { LoadRoomData } from "@/utils/LoadRoomData.jsx"
import HOME_STATES from "./States.jsx"
import { useState, useEffect, useRef } from "react";
import { getAllRooms } from "@/db/db.js";
const STATES = HOME_STATES;

export default function LoadRoomScreen({ isOpen, onClose, onCloseLoad }) {
  const [rooms, setRooms] = useState([]);
  const [viewableRooms, setViewableRooms] = useState([]);
  const searchInputRef = useRef(null);


  useEffect(() => {
    async function loadRooms() {
      if (isOpen !== STATES.LOAD) {
        return;
      }

      const loadedRooms = await getAllRooms();
      setRooms(loadedRooms);
      setViewableRooms(loadedRooms);

      if (searchInputRef.current) {
        searchInputRef.current.value = "";
      }
    }

    loadRooms();
  }, [isOpen]);

  function clearSearch() {
    setViewableRooms(rooms);

    if (searchInputRef.current) {
      searchInputRef.current.value = "";
    }
  }

  function updateSearch(event) {
    const searchString = event.target.value.trim().toLowerCase();

    // if (event.key === "Enter") {
    //   event.target.blur();
    //   return;
    // }

    if (searchString === "") {
      setViewableRooms(rooms);
      return
    }

    const newRooms = rooms.filter((room) =>
      room.name.toLowerCase().includes(searchString)
    );

    setViewableRooms(newRooms);
  }

  // If state is incorrect, do not render component
  if (isOpen != HOME_STATES.LOAD) return null;

  async function exportRoomData(id) {
    const roomData = await LoadRoomData(id);
    if (!roomData) return; // stale or missing id — do nothing rather than open a broken room
    onCloseLoad(roomData);
  }

  return (
    <div>
      <input
        ref={searchInputRef}
        className="search-input"
        type="text"
        defaultValue=""
        onChange={updateSearch}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.target.blur();
          }
        }}
      />
      <button className="search-clear-button" onClick={clearSearch}>
        Clear Search
      </button>

      <button className="room-button" onClick={onClose}>
        Home
      </button>

      {viewableRooms.map((room) => (
        <button
          key={room.id}
          className="room-button"
          onClick={() => exportRoomData(room.id)}
          style={{
            backgroundImage: !room.imgSrc || room.imgSrc === "none" ? "none" : `url("${room.imgSrc}")`,
          }}

        >
          {room.name}
        </button>
      ))}

      {rooms.length === 0 && <p>No saved rooms yet.</p>}
    </div>
  );
}
