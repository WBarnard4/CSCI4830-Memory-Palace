import "@/App.css";
import HOME_STATES from "./States.jsx"
const STATES = HOME_STATES;

export default function NewRoomScreen({isOpen, onClose}) {
    // If state is incorrect, do not render component
    if (isOpen != HOME_STATES.NEW) return null;

    return (
        <div className="room-grid">
            {/* set activeRoom to Bedroom, rendering it in App.jsx */}
            <button
                className="room-button bedroom-button"
                onClick={() => onClose("Bedroom")}
            >
                Bedroom
            </button>

            {/* set activeRoom to Living Room, rendering it in App.jsx */}
            <button
                className="room-button living-room-button"
                onClick={() => onClose("Living Room")}
            >
                Living Room
            </button>

            {/* set activeRoom to Kitchen, rendering it in App.jsx */}
            <button
                className="room-button kitchen-button"
                onClick={() => onClose("Kitchen")}
            >
                Kitchen
            </button>

            {/* set activeRoom to Bathroom, rendering it in App.jsx */}
            <button
                className="room-button bathroom-button"
                onClick={() => onClose("Bathroom")}
            >
                Bathroom
            </button>

            {/* TODO: Prompt for name and image source(open file explorer) */}
            <button
                className="room-button"
                onClick={() => {
                    var name;
                    var imgSrc;
                    onCloseNew(name, imgSrc);
                }}
            >
                Add New Room
            </button>
        </div>
    );
}