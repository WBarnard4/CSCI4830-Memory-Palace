import "@/App.css";
import HOME_STATES from "./States.jsx"

export default function HomeScreen({isOpen, openLoad, openNew}) {
    // If state is incorrect, do not render component
    if (isOpen != HOME_STATES.MAIN) return null;
    
    return (
            <div className="room-grid">
                {/* TODO: Add new button class for home screen load/new categories */}

                {/* Enable LoadRoomScreen component */}
                <button
                    className="room-button"
                    onClick={openLoad}
                >
                    Load Room
                </button>

                {/* Enable NewRoomScreen component */}
                <button
                    className="room-button"
                    onClick={openNew}
                >
                    New Room
                </button>
            </div>
    );
}