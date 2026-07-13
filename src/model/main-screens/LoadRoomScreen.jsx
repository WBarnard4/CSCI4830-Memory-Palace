import "@/App.css";
import HOME_STATES from "./States.jsx"
const STATES = HOME_STATES;

export default function LoadRoomScreen({isOpen, onClose}) {
    // If state is incorrect, do not render component
    if (isOpen != HOME_STATES.LOAD) return null;

    return (
        <div>
          <button
            className="room-button"
            onClick={onClose}
          >
            Home
          </button>
          <h1>TODO: Add Loading Functionality</h1>
        </div>
    );
}