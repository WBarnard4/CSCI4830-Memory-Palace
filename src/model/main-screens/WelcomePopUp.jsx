/**
 * @file Popup button and toggle button rendered in HomeScreen.
 *
 * Contains a popup with information on the App and how to use it.
 * Also contains a link to the source code and a button to close it.
 */
import "@/App.css";
import "./Popup.css"

/**
 * Welcome information popup.
 * 
 * Starts by displaying the welcome popup on first loading the app.
 * State is remembered as long as the app isn't reloaded,
 * so the popup only shows up on its own once.
 * 
 * @param {object} props
 * @param {boolean} props.use - State for popup and info button states.
 * @param {(boolean) => void} props.disable - Toggles between popup and info button states.
 * @returns {JSX.Element} The popup or info button UI.
 */
export default function WelcomePopUp({ use, disable }) {
    let popup;

    if (use) {
        popup = (
            <div className="popup">
                <div className="panel glass-surface">
                    <h1 className="text">Welcome to Memory Palace!</h1>
                    <p className="text">Memory Palace is a web application made to help with memorization!
                        The memory palace mnemonic technique guides users to associate important ideas with spatial locations, like a room.
                        The Memory Palace app translates that technique into a web experience where you can freely create Rooms and Ideas!
                    </p>
                    <table>
                        <thead>
                            <tr>
                                <th className="header">New Room</th>
                                <th>Load Room</th>
                                <th>Room Screen</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="text">Click New Room to create a new Room. Click on one of the four provided templates,
                                    or set the Room's name and background yourself.</td>
                                <td className="text">Click Load Room to load a Room you've previously created.
                                    Rooms are saved to the browser so you can access them even offline!
                                    Click Select to highlight multiple Rooms and then click Delete to permenantly remove them.</td>
                                <td className="text">Double click inside a Room to create a text or image Idea. Click on the idea to open its edit menu.
                                    Open the Menu at the top left to Save and Load Rooms, change backgrounds, and more.
                                    Open the Path Menu at the top right to view the order of all Ideas. Ideas can be reordered in their edit menu.
                                    Click Start to begin highlighting ideas, control the order with the arrows at the bottom.
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={3} className="header">Want to learn more? <a href="https://github.com/WBarnard4/CSCI4830-Memory-Palace" target="_blank"> Click to view our source code!</a></td>
                            </tr>
                        </tbody>
                    </table>
                    <button type="button" className="glass-surface glass-glow close-button glass-button" onClick={() => disable(false)}>Close</button>
                </div>
            </div>
        );
    } else {
        popup = (
            <div>
                <button
                    className="info-button glass-surface glass-glow glass-button"
                    onClick={() => disable(true)}
                    aria-label="Back to home"
                >
                    Info
                </button>
            </div>
        );
    }

    return (popup)
}