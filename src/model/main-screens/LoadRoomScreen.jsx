import "@/App.css";
import { LoadRoomData } from "@/utils/LoadRoomData.jsx"
import HOME_STATES from "./States.jsx"
import { useState, useEffect, useRef } from "react";
import { getAllRooms, deleteRoom } from "@/db/db.js";
const STATES = HOME_STATES;

export default function LoadRoomScreen({ isOpen, onClose, onCloseLoad }) {
  const [rooms, setRooms] = useState([]);
  const [viewableRooms, setViewableRooms] = useState([]);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const searchInputRef = useRef(null);


  useEffect(() => {
    async function loadRooms() {
      if (isOpen !== STATES.LOAD) {
        return;
      }

      const loadedRooms = await getAllRooms();
      setRooms(loadedRooms);
      setViewableRooms(loadedRooms);
      setSelectMode(false);
      setSelectedIds([]);

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

  function toggleSelectMode() {
    setSelectMode(!selectMode);
    setSelectedIds([]);
  }

  function toggleSelected(roomId) {
    setSelectedIds((current) =>
      current.includes(roomId)
        ? current.filter((id) => id !== roomId)
        : [...current, roomId]
    );
  }

  async function deleteSelected() {
    if (selectedIds.length === 0) {
      return;
    }

    const label = selectedIds.length === 1 ? "room" : "rooms";
    const confirmed = window.confirm(
      `Delete ${selectedIds.length} ${label}? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    for (const roomId of selectedIds) {
      await deleteRoom(roomId);
    }

    setRooms((current) => current.filter((r) => !selectedIds.includes(r.id)));
    setViewableRooms((current) => current.filter((r) => !selectedIds.includes(r.id)));
    setSelectMode(false);
    setSelectedIds([]);
  }

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
        placeholder="Search rooms..."
        defaultValue=""
        onChange={updateSearch}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.target.blur();
          }
        }}
      />
      <button
        className="back-button glass-surface glass-glow glass-ripple glass-button"
        onClick={onClose}
        aria-label="Back to home"
      >
        &#8592;
      </button>

      <div className="load-room-toolbar">
        <button
          className="glass-surface glass-glow glass-button glass-ripple"
          onClick={clearSearch}
        >
          Clear Search
        </button>

        {!selectMode ? (
          <button
            className="glass-surface glass-glow glass-button glass-ripple"
            onClick={toggleSelectMode}
          >
            Select
          </button>
        ) : (
          <>
            <button
              className="load-delete-button glass-surface glass-glow glass-button glass-ripple"
              onClick={deleteSelected}
              disabled={selectedIds.length === 0}
            >
              Delete ({selectedIds.length})
            </button>

            <button
              className="glass-surface glass-glow glass-button glass-ripple"
              onClick={toggleSelectMode}
            >
              Cancel
            </button>
          </>
        )}
      </div>

      <div className="load-room-grid">
        {viewableRooms.map((room) => (
          <button
            key={room.id}
            className={
              "load-room-card glass-surface glass-glow glass-button" +
              (selectMode && selectedIds.includes(room.id) ? " selected" : "")
            }
            onClick={() =>
              selectMode ? toggleSelected(room.id) : exportRoomData(room.id)
            }
          >
            <span
              className="load-room-thumb"
              style={{
                backgroundImage: !room.imgSrc || room.imgSrc === "none" ? "none" : `url("${room.imgSrc}")`,
              }}
            />
            <span className="load-room-name">{room.name}</span>
          </button>
        ))}
      </div>

      {rooms.length === 0 && <p>No saved rooms yet.</p>}
    </div>
  );
}
