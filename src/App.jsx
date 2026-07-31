/**
 * @file Root component for Memory Palace.
 *
 * Owns the two pieces of app-wide state - which room is open and which
 * home-screen panel is showing - and hosts the single hidden file input
 * that every image picker in the app reuses.
 */
import "@/App.css";
import { useState, useRef } from "react";

import HomeScreen from "@/model/main-screens/HomeScreen";
import NewRoomScreen from "@/model/main-screens/NewRoomScreen";
import LoadRoomScreen from "@/model/main-screens/LoadRoomScreen";

// States that the home page can be in
import HOME_STATES from "@/model/main-screens/States.jsx"

// 'RoomScreen.jsx' used for page 2 room logic under the primary if-statement
import RoomScreen from "@/model/room/RoomScreen.jsx";

import { saveImage, createRoom, updateRoomName, loadRoom, getAdjacentRoomId } from "@/db/db.js";



/**
 * Top-level app component.
 *
 * Renders the room screen when a room is active, otherwise the home
 * screen with its New/Load panels. All database access flows through the
 * handlers below rather than through the child screens.
 *
 * @returns {JSX.Element} The app UI.
 */
function App() {
  const [activeRoom, setActiveRoom] = useState(null);
  const [homeState, setHomeState] = useState(HOME_STATES.MAIN);
  //useState is a React Hook that establishes states to other components
  //activeRoom is the getter and setActiveRoom is the setter
  //null is the initial value here

  const [usePopup, setPopup] = useState(true);

  const imageInputRef = useRef(null);
  const imageCallbackRef = useRef(null);

  /**
   * Opens the shared hidden file input and registers who should receive
   * the chosen image.
   *
   * Passed down to any child that needs an image (new room backgrounds,
   * image ideas) so the app only ever has one file input in the DOM.
   *
   * @param {function({ file: File, imageId: number, imageSrc: string }): void}
   *   callback - Invoked once the user picks a file and it has been saved.
   * @returns {void}
   */
  function openImagePicker(callback) {
    imageCallbackRef.current = callback;
    imageInputRef.current.click();
  }

  /**
   * Change handler for the hidden file input.
   *
   * Persists the chosen file to the images table, hands the caller both the
   * new image id and a displayable URL, then clears the input so picking
   * the same file twice in a row still fires a change event.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} event - Change event from
   *   the file input.
   * @returns {Promise<void>} Resolves once the callback has run. Returns
   *   early if the user cancelled the dialog.
   */
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
  async function handleNewRoomClick(name, imageId, imgSrc) {
    setHomeState(HOME_STATES.MAIN);

    const id = await createRoom(name, imageId, imgSrc);

    setActiveRoom({
      id: id,
      name,
      imgSrc: imgSrc,
      ideas: [],
    });
  }

  /**
   * Opens a room the user selected on the Load Room screen.
   *
   * The room has already been read from the database by LoadRoomScreen, so
   * this just swaps it in and dismisses the panel.
   *
   * @param {LoadedRoom} data - Room and ideas to make active.
   * @returns {void}
   */
  function handleLoadRoomClick(data) {
    setHomeState(HOME_STATES.MAIN);
    setActiveRoom(data)
  }

  /**
   * Loads the neighboring room (+1 next, -1 previous, by room index)
   * and swaps it in as the active room. Does nothing if there's no
   * other saved room to switch to.
   * @param {number} direction - +1 for next room, -1 for previous room.
   */
  async function changeRoomByOffset(direction) {
    if (!activeRoom) {
      return;
    }

    const neighborId = await getAdjacentRoomId(activeRoom.id, direction);
    if (neighborId == null || neighborId === activeRoom.id) {
      return;
    }

    const neighborRoom = await loadRoom(neighborId);
    if (neighborRoom) {
      setActiveRoom(neighborRoom);
    }
  }

  /**
   * Calls setHomeState() to render certain screen components.
   * @param {number} button - state from STATES.
   */
  function handleHomeMainClick(button) {
    setHomeState(button);
  }


  /**
   * Leaves the current room and shows a home-screen panel.
   *
   * Any unsaved changes in the open room are dropped: saving is explicit,
   * so callers should confirm with the user before navigating away.
   *
   * @param {number} screen - Target state from HOME_STATES.
   * @returns {void}
   */
  function handleGoTo(screen) {
    setActiveRoom(null);
    setHomeState(screen);
  }

  /**
   * Merges changes into the active room's in-memory state.
   *
   * Only the room name is written straight through to the database, since
   * renaming has no separate save step. Idea edits stay in memory until the
   * user saves the room explicitly.
   *
   * @param {Partial<LoadedRoom>} changes - Fields to merge into the active
   *   room.
   * @returns {Promise<void>} Resolves once any name write has committed.
   */
  async function updateActiveRoom(changes) {
    const roomId = activeRoom.id;
    setActiveRoom((loadedRoom) => {
      if (loadedRoom === null) {
        return null;
      }
      return { ...loadedRoom, ...changes };
    })

    if (changes.name != undefined) {
      await updateRoomName(roomId, changes.name)
    }
  }

  let appScreen;

  //IMPORTANT!
  //here we check if the activeRoom has a real value
  //if so, it displays a new screen with a sentence containing the value - this is a placeholder for page 2
  //Here is where the core of our delegation will take place - we will need to call upon RoomScreen here and that's where the page 2 logic lies
  if (activeRoom) {
    appScreen = (
      <RoomScreen
        key={activeRoom.id}
        roomData={activeRoom}
        updateRoomData={updateActiveRoom}
        onGoHome={() => handleGoTo(HOME_STATES.MAIN)}
        openImagePicker={openImagePicker}
        onGoLoad={() => handleGoTo(HOME_STATES.LOAD)}
        onGoNew={() => handleGoTo(HOME_STATES.NEW)}
        onChangeRoom={changeRoomByOffset}
      />
    );
    // Home screen navigation, contains all main screen components and renders them based on homeState.
  } else {
    appScreen = (
      <div className="home">
        <h1 className="home-title">Memory Palace</h1>
        <p className="home-subtitle">Pick a Background Room</p>

        {/* Landing page, buttons to enable NewRoomScreen or LoadRoomScreen components */}
        <HomeScreen
          isOpen={homeState}
          openLoad={() => handleHomeMainClick(HOME_STATES.LOAD)}
          openNew={() => handleHomeMainClick(HOME_STATES.NEW)}
          usePopup={usePopup}
          setPopup={setPopup} />

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
