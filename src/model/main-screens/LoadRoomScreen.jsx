import "@/App.css";
import {LoadRoomData} from "@/utils/LoadRoomData.jsx"
import HOME_STATES from "./States.jsx"
const STATES = HOME_STATES;

export default function LoadRoomScreen({isOpen, onClose, onCloseLoad}) {
    // If state is incorrect, do not render component
    if (isOpen != HOME_STATES.LOAD) return null;

    function exportRoomData() {
      var id = null;  // TODO: Get id or something from user input to determine which Room to load
      roomData = LoadRoomData(id);
      onCloseLoad(roomData);
    }

    return (
        <div>
          <button
            className="room-button"
            onClick={onClose}
          >
            Home
          </button>
          <button
            className="room-button"
            onClick={exportRoomData}
          >
            Load Room
          </button>
          <h1>TODO: Add Loading Functionality</h1>
        </div>
    );
}