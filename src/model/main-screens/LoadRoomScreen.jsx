/**
 * @file Handles opening existing Rooms from the database.
 *
 * Renders Rooms as selectable cards and provides
 * search functionality through them.
 */

import "@/App.css";
import { LoadRoomData } from "@/utils/LoadRoomData.jsx"
import HOME_STATES from "./States.jsx"
import { useState, useEffect, useRef } from "react";
import { getAllRooms, deleteRoom } from "@/db/db.js";
const STATES = HOME_STATES;

/**
 * Room loading screen.
 * 
 * Renders when isOpen is set to LOAD, otherwise returns null.
 * 
 * @param {object} props
 * @param {number} props.isOpen - Passed from App to enable or disable component.
 * @param {() => void} props.onClose - Callback to enable HomeScreen component in App.
 * @param {() => void} props.onCloseLoad - Callback to enable HomseScreen compoment and set selected Room to active.
 
 * @returns {JSX.Element} The Room cards and selection buttons.
 */
export default function LoadRoomScreen({ isOpen, onClose, onCloseLoad }) {
  const [rooms, setRooms] = useState([]);
  const [viewableRooms, setViewableRooms] = useState([]);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const searchInputRef = useRef(null);


  useEffect(() => {
    /**
     * Queries all Room data and displays it on screen.
     * 
     * Runs when screen is enabled.
     */
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

  /**
  * Clears value in Search room button.
  * 
  * Runs when Clear Search button is clicked.
  * Rerenders the available Rooms list.
  */
  function clearSearch() {
    setViewableRooms(rooms);

    if (searchInputRef.current) {
      searchInputRef.current.value = "";
    }
  }

  /**
  * Updates database Room search condition based on passed value.
  * 
  * Runs whenever Search rooms field is updated with text.
  * @param {*} event - The search term to use.
  */
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

  /**
  * Enables Delete and Cancel buttons as well as Room selection.
  * 
  * Runs when Select is clicked, prevents loading Room by clicking card.
  * Instead, card is highlighted for deletion.
  */
  function toggleSelectMode() {
    setSelectMode(!selectMode);
    setSelectedIds([]);
  }

  /**
  * Toggles card to be deleted.
  * 
  * Runs when Room card is clicked during Select Mode.
  * Can be clicked again to untoggle.
  */
  function toggleSelected(roomId) {
    setSelectedIds((current) =>
      current.includes(roomId)
        ? current.filter((id) => id !== roomId)
        : [...current, roomId]
    );
  }

  /**
  * Removes Room from database and rerenders available Rooms.
  * 
  * Runs when Delete is clicked while at least one card is selected.
  * Prompts a confirmation popup and disables Select Mode on clicking.
  */
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

  /**
  * Passes RoomData into App to be rendered.
  * 
  * Runs when Room card is clicked.
  */
  async function exportRoomData(id) {
    const roomData = await LoadRoomData(id);
    if (!roomData) return; // stale or missing id — do nothing rather than open a broken room
    onCloseLoad(roomData);
  }

  return (
    <div>
      <input
        ref={searchInputRef}
        className="search-input glass-glow glass-surface"
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
        className="back-button glass-surface glass-glow glass-button"
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
              "room-card glass-surface glass-glow glass-button" +
              (selectMode && selectedIds.includes(room.id) ? " selected" : "")
            }
            onClick={() =>
              selectMode ? toggleSelected(room.id) : exportRoomData(room.id)
            }
          >
            <span
              className="room-card-thumb"
              style={{
                backgroundImage: !room.imgSrc || room.imgSrc === "none" ? "none" : `url("${room.imgSrc}")`,
              }}
            />
            <span className="room-card-name">{room.name}</span>
          </button>
        ))}
      </div>

      {rooms.length === 0 && <p>No saved rooms yet.</p>}
    </div>
  );
}
