import "@/App.css";
import { useState } from "react";

import HomeScreen from "@/model/main-screens/HomeScreen";
import NewRoomScreen from "@/model/main-screens/NewRoomScreen";
import LoadRoomScreen from "@/model/main-screens/LoadRoomScreen";

// States that the home page can be in
import HOME_STATES from "@/model/main-screens/States.jsx"

// 'RoomScreen.jsx' used for page 2 room logic under the primary if-statement
import RoomScreen from "@/model/room/RoomScreen.jsx";

import RoomFactory from "@/utils/RoomFactory.jsx";

function App() {
  const [activeRoom, setActiveRoom] = useState(null);
  const [homeState, setHomeState] = useState(HOME_STATES.MAIN);
  //useState is a React Hook that establishes states to other components
  //activeRoom is the getter and setActiveRoom is the setter
  //null is the initial value here

  /** 
   * Sets state back to MAIN and renders a RoomScreen based on the name.
   * @param {string} roomData - Name of the Room, passed to setActiveRoom().
  */
  function handleNewRoomClick(name, imgSrc) {
    setHomeState(HOME_STATES.MAIN);
    var roomData = {
      name: name,
      imgSrc: imgSrc,
      type: "New"
    }
    setActiveRoom(roomData);
  }

  function handleTemplateRoomClick(name) {
    setHomeState(HOME_STATES.MAIN);
    var roomData = {
      name: name,
      type: "Template"
    }
    setActiveRoom(roomData)
  }

  function handleLoadRoomClick(data) {
    setHomeState(HOME_STATES.MAIN);
    setActiveRoom(data)
  }

  /**
   * Calls setHomeState() to render certain screen components.
   * @param {number} button - state from STATES.
   */
  function handleHomeMainClick(button) {
    setHomeState(button);
  }


  function handleGoTo(screen) {
    setActiveRoom(null);
    setHomeState(screen);
  }


  //IMPORTANT!
  //here we check if the activeRoom has a real value
  //if so, it displays a new screen with a sentence containing the value - this is a placeholder for page 2
  //Here is where the core of our delegation will take place - we will need to call upon RoomScreen here and that's where the page 2 logic lies
  if (activeRoom) {
    return (
      <RoomScreen
        roomData={activeRoom}
        onGoHome={() => handleGoTo(HOME_STATES.MAIN)}
        onGoLoad={() => handleGoTo(HOME_STATES.LOAD)}
        onGoNew={() => handleGoTo(HOME_STATES.NEW)}
      />
    );
  }

  // Default return, contains all main screen components and renders them based on homeState.
  return (
    <div className="home">
      <h1>Memory Palace</h1>
      <p>Pick a Background Room</p>

      {/* Landing page, buttons to enable NewRoomScreen or LoadRoomScreen components */}
      <HomeScreen
        isOpen={homeState}
        openLoad={() => handleHomeMainClick(HOME_STATES.LOAD)}
        openNew={() => handleHomeMainClick(HOME_STATES.NEW)} />

      {/* Create a new room */}
      <NewRoomScreen
        isOpen={homeState}
        onClose={handleTemplateRoomClick}
        onCloseNew={handleNewRoomClick} />

      {/* Load previously made rooms */}
      <LoadRoomScreen
        isOpen={homeState}
        onClose={() => handleHomeMainClick(HOME_STATES.MAIN)}
        onCloseLoad={handleLoadRoomClick} />
    </div>
  );
}

export default App;
