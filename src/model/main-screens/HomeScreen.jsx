import "@/App.css";
import HOME_STATES from "./States.jsx"

export default function HomeScreen({ isOpen, openLoad, openNew }) {
    // If state is incorrect, do not render component
    if (isOpen != HOME_STATES.MAIN) return null;

    return (
        <div className="room-grid menu-transition-panel menu-transition-content" style={{"--menu-content-open-delay": "0ms"}}>
            {/* TODO: Add new button class for home screen load/new categories */}

            {/* Enable LoadRoomScreen component */}
            <button
                className="room-button glass-surface glass-glow glass-button"
                onClick={openLoad}
            >
                Load Room
            </button>

            {/* Enable NewRoomScreen component */}
            <button
                className="room-button glass-surface glass-glow glass-button"
                onClick={openNew}
            >
                New Room
            </button>
        </div>
    );
}
