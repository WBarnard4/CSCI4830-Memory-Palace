import "@/App.css";
import { useState, useRef } from "react";

import HomeScreen from "@/model/main-screens/HomeScreen";
import NewRoomScreen from "@/model/main-screens/NewRoomScreen";
import LoadRoomScreen from "@/model/main-screens/LoadRoomScreen";

// States that the home page can be in
import HOME_STATES from "@/model/main-screens/States.jsx"

// 'RoomScreen.jsx' used for page 2 room logic under the primary if-statement
import RoomScreen from "@/model/room/RoomScreen.jsx";

import RoomFactory from "@/utils/RoomFactory.jsx";

import { saveImage } from "@/db/db.js";



function App() {
  const [activeRoom, setActiveRoom] = useState(null);
  const [homeState, setHomeState] = useState(HOME_STATES.MAIN);
  //useState is a React Hook that establishes states to other components
  //activeRoom is the getter and setActiveRoom is the setter
  //null is the initial value here

  const imageInputRef = useRef(null);
  const imageCallbackRef = useRef(null);

  function openImagePicker(callback) {
    imageCallbackRef.current = callback;
    imageInputRef.current.click();
  }

  async function handleImageSelected(event) {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    const imageId = await saveImage(file);
    const imageSrc = URL.createObjectURL(file);

    if (imageCallbackRef.current !== null) {
      imageCallbackRef.current({
        file,
        imageId,
        imageSrc,
      });
    }

    imageCallbackRef.current = null;
    event.target.value = "";
  }

  /** 
   * Sets state back to MAIN and renders a RoomScreen based on the name.
   * @param {string} roomData - Name of the Room, passed to setActiveRoom().
  */
  function handleNewRoomClick(name, imgSrc) {
    setHomeState(HOME_STATES.MAIN);
    setActiveRoom({ id: null, name, imgSrc: imgSrc, ideas: [], type: "New" });
  }

  // NOTE: Unsure what type is used for, but new room logic is adjusted to always have "New" information.
  // function handleTemplateRoomClick(name, imgSrc) {
  //   setHomeState(HOME_STATES.MAIN);
  //   setActiveRoom({ id: null, name, imgSrc: imgSrc, ideas: [], type: "Template" });
  // }

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

  function updateActiveRoom(changes) {
    setActiveRoom((loadedRoom) => {
      if (loadedRoom === null) {
        return null;
      }
      return { ...loadedRoom, ...changes };
    })


    // TODO: Update in DB
  }

  let appScreen;

  //IMPORTANT!
  //here we check if the activeRoom has a real value
  //if so, it displays a new screen with a sentence containing the value - this is a placeholder for page 2
  //Here is where the core of our delegation will take place - we will need to call upon RoomScreen here and that's where the page 2 logic lies
  if (activeRoom) {
    appScreen = (
      <RoomScreen
        roomData={activeRoom}
        updateRoomData={updateActiveRoom}
        onGoHome={() => handleGoTo(HOME_STATES.MAIN)}
        openImagePicker={openImagePicker}
        onGoLoad={() => handleGoTo(HOME_STATES.LOAD)}
        onGoNew={() => handleGoTo(HOME_STATES.NEW)}
      />
    );
    // Home screen navigation, contains all main screen components and renders them based on homeState.
  } else {
    appScreen = (
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
          onClose={handleNewRoomClick}
          onGoHome={() => handleHomeMainClick(HOME_STATES.MAIN)}
          openImagePicker={openImagePicker} />

        {/* Load previously made rooms */}
        <LoadRoomScreen
          isOpen={homeState}
          onClose={() => handleHomeMainClick(HOME_STATES.MAIN)}
          onCloseLoad={handleLoadRoomClick} />
      </div>
    );
  }

  return (
    <>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleImageSelected}
      />

      {appScreen}
    </>
  );

}

export default App;
