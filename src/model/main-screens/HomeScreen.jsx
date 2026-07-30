/**
 * @file Landing page rendered first by App.jsx.
 *
 * Houses two buttons to transition to LoadRoomScreen and NewRoomScreen.
 * Also houses the WelcomePopUp to toggle it on or off.
 */

import "@/App.css";
import HOME_STATES from "./States.jsx"
import WelcomePopUp from "./WelcomePopUp";

/**
 * Landing page screen.
 * 
 * Renders when isOpen is set to MAIN, otherwise returns null.
 * 
 * @param {object} props
 * @param {number} props.isOpen - Passed from App to enable or disable component.
 * @param {() => void} props.openLoad - Callback to enable LoadRoomScreen component in App.
 * @param {() => void} props.openNew - Callback to enable NewRoomScreen component in App.
 * @param {boolean} props.usePopup - Displays either the WelcomePopUp's main display or button.
 * @param {(boolean) => void} props.setPopup - Callback to toggle WelcomePopUp's state.
 *  
 * @returns {JSX.Element} The room buttons and welcome popup UI.
 */
export default function HomeScreen({ isOpen, openLoad, openNew, usePopup, setPopup }) {
    // If state is incorrect, do not render component
    if (isOpen != HOME_STATES.MAIN) return null;

    return (
        <div>

            <div className="room-grid menu-transition-panel menu-transition-content" style={{ "--menu-content-open-delay": "0ms" }}>
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
            <WelcomePopUp use={usePopup} disable={setPopup} />
        </div>
    );
}
