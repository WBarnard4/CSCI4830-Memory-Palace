import "./App.css";
import { useState } from "react";

// States that the home page can be in
const HOME_MAIN = 0;
const HOME_LOAD = 1;
const HOME_NEW = 2;

// 'RoomScreen.jsx' used for page 2 room logic under the primary if-statement
import RoomScreen from "./RoomScreen.jsx";

function App() {
  const [activeRoom, setActiveRoom] = useState(null);
  const [homeState, setHomeState] = useState(HOME_MAIN);
  //useState is a React Hook that establishes states to other components
  //activeRoom is the getter and setActiveRoom is the setter
  //null is the initial value here
  function handleRoomClick(room) {
    //console.log(`${room} clicked — no room screen yet`);
    //this part was created early to test if the button selection works)

    setHomeState(HOME_MAIN);
    setActiveRoom(room);
    //here we set the active room to the one clicked
  }

  function handleHomeMainClick(button) {
    setHomeState(button);
  }
  if (activeRoom) {
    return (
      <RoomScreen
        activeRoom={activeRoom}
        onGoHome={() => handleRoomClick(null)}
      />
    );

    //IMPORTANT!
    //here we check if the activeRoom has a real value
    //if so, it displays a new screen with a sentence containing the value - this is a placeholder for page 2
    //Here is where the core of our delegation will take place - we will need to call upon RoomScreen here and that's where the page 2 logic lies
  }

  return (
    <div className="home">
      <h1>Memory Palace</h1>
      <p>Pick a Background Room</p>
      {/* Create a new room */}
      {homeState === HOME_NEW && (
        <div className="room-grid">
          <button
            className="room-button bedroom-button"
            onClick={() => handleRoomClick("Bedroom")}
          >
            Bedroom
          </button>
          <button
            className="room-button living-room-button"
            onClick={() => handleRoomClick("Living Room")}
          >
            Living Room
          </button>
          <button
            className="room-button kitchen-button"
            onClick={() => handleRoomClick("Kitchen")}
          >
            Kitchen
          </button>
          <button
            className="room-button bathroom-button"
            onClick={() => handleRoomClick("Bathroom")}
          >
            Restroom
          </button>
        </div>
      )}
      {/* Load previously made rooms */}
      {homeState === HOME_LOAD && (
        // TODO: Load in all previously made rooms
        <div>
          <button
            className="room-button"
            onClick={() => handleHomeMainClick(HOME_MAIN)}
          >
            Home
          </button>
          <h1>TODO: Add Loading Functionality</h1>
        </div>
      )}
      {/* Opening screen, choose to create a new room or load existing ones */}
      {homeState === HOME_MAIN && (
        <div className="room-grid">
          {/* TODO: Add new button class for home screen load/new categories */}
          <button
            className="room-button"
            onClick={() => handleHomeMainClick(HOME_LOAD)}
          >
            Load Room
          </button>
          <button
            className="room-button"
            onClick={() => handleHomeMainClick(HOME_NEW)}
          >
            New Room
          </button>
        </div>
      )}
    </div>
    //in leu of classes and next-screen logic, the buttons above only pass a string consisting of the name of clicked room. this is implemented in the handleRoomClick function
  );
}

export default App;
