/**
 * @file Main page that renders Room and Idea information.
 *
 * Contains functionality for updating Room and Ideas,
 * using Menu, and using Path systems.
 */
import { useState, useRef, useEffect } from "react";
import { Menu } from "@/model/menu/Menu.jsx"
import { PathMenu } from "./path/PathMenu.jsx"
import { PathNav } from "./path/PathNav.jsx"
import { Idea } from "./idea/Idea.jsx";
import { getImageUrl, saveRoom } from "@/db/db.js";

const BASE_VIEWPORT_DIMENSIONS = {
  width: 1920,
  height: 1080,
}

/**
 * Primary Room screen.
 * 
 * Renders user generated Ideas and provides functionality to
 * manipulate them and the Room or to return to previous screens.
 * @param {object} props 
 * @param {object} props.roomData - Object containing Room data like name and background image.
 * @param {object} props.updateRoomData - Callback to update Room data object
 * @param {object} props.openImagePicker - Callback to open image picker from App.
 * @param {object} props.onGoHome - Callback to enable HomeScreen compoment in App.
 * @param {object} props.onGoLoad - Callback to enable LoadRoomScreen compoment in App.
 * @param {object} props.onGoNew - Callback to enable NewRoomScreen compoment in App.
 * @param {object} props.onChangeRoom - Callback to set active Room to neighboring Room.
 * 
 * @returns {JSX.Element} The Room, Idea, Menu, and Path UI elements.
 */
export default function RoomScreen({ roomData, updateRoomData, openImagePicker, onGoHome, onGoLoad, onGoNew, onChangeRoom }) {  // state which stores ideas
  const [ideas, setIdeas] = useState(roomData.ideas ?? []);
  const [popupPosition, setPopupPosition] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupClosing, setPopupClosing] = useState(false);

  // order is just the ideas array order for now, no reordering yet
  const [pathActive, setPathActive] = useState(false);
  const [pathIndex, setPathIndex] = useState(0);


  const [backgroundDimensions, setBackgroundDimensions] = useState({
    width: 1920,
    height: 1080,
  });

  const [baseRoomDimensions, setBaseRoomDimensions] = useState({
    width: 1920,
    height: 1080,
  });
  const [roomDimensions, setRoomDimensions] = useState({
    width: 1920,
    height: 1080,
  });
  const [roomScale, setRoomScale] = useState(1);

  // Reference for calculating boundaries
  const roomRef = useRef(null);

  // Sets the background dimensions to match the background image whenever the background changes.
  useEffect(() => {
    if (!roomData.imgSrc || roomData.imgSrc === "none") {
      return;
    }

    const image = new Image();

    image.onload = () => {
      setBackgroundDimensions({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };

    image.src = roomData.imgSrc;
  }, [roomData.imgSrc]);

  /**
   * Call openImagePicker to change and update Room's background image.
   * 
   * Runs when Menu's Choose Background button is clicked.
   */
  function pickBackgroundImage() {
    openImagePicker(({ imageId, imageSrc }) => {
      updateRoomData({
        imgSrc: imageSrc,
        imageId: imageId,
      });
    });
  }

  /**
   * Creates a new Image Idea and prompts the user to pick an image.
   * 
   * Runs when the Idea Menu's Image button is clicked.
   */
  function pickIdeaImage() {
    if (!popupPosition) {
      return;
    }

    const currentPopupPosition = popupPosition;

    openImagePicker(({ imageId, imageSrc }) => {
      const newIdea = {
        id: Date.now(),
        type: "image",
        x: currentPopupPosition.x,
        y: currentPopupPosition.y,
        title: "New Image Idea",
        imageId: imageId,
        imageSrc: imageSrc,
        highlighted: false,
      };

      setIdeas((currentIdeas) => [...currentIdeas, newIdea]);
      closePopup();
    });
  }
  // On mount: loaded image ideas have dead session URLs — mint fresh ones from their stored blobs
  useEffect(() => {
    async function refreshImageUrls() {
      const refreshed = await Promise.all(
        ideas.map(async (idea) => {
          if (idea.type !== "image" || !idea.imageId) return idea;
          const freshUrl = await getImageUrl(idea.imageId);
          return { ...idea, imageSrc: freshUrl };
        })
      );
      setIdeas(refreshed);
    }
    refreshImageUrls();
  }, []); // empty array = run once, when the room opens

  // Recalculate the room dimensions on background or window dimension changes.
  useEffect(() => {
    function getContainedDimensions(containerWidth, containerHeight) {
      // Find the min scale to keep the background on the screen
      const widthScale = containerWidth / backgroundDimensions.width;
      const heightScale = containerHeight / backgroundDimensions.height;
      const scale = widthScale < heightScale ? widthScale : heightScale;

      return {
        width: backgroundDimensions.width * scale,
        height: backgroundDimensions.height * scale,
      };
    }

    /**
     * Find the dimensions in the baseline viewport.
     */
    function updateRoomDimensions() {
      const newBaseRoomDimensions = getContainedDimensions(
        BASE_VIEWPORT_DIMENSIONS.width,
        BASE_VIEWPORT_DIMENSIONS.height
      );

      // Find the dimensions in the current viewport.
      const newRoomDimensions = getContainedDimensions(
        window.innerWidth,
        window.innerHeight
      );

      // Compare the current dimensions against the baseline dimensions.
      const newRoomScale = newRoomDimensions.width / newBaseRoomDimensions.width;

      setBaseRoomDimensions(newBaseRoomDimensions);
      setRoomDimensions(newRoomDimensions);
      setRoomScale(newRoomScale);
    }

    updateRoomDimensions();

    window.addEventListener("resize", updateRoomDimensions);

    return () => {
      window.removeEventListener("resize", updateRoomDimensions);
    };
  }, [backgroundDimensions]);

  // clamp path state if ideas get added/deleted mid-walk
  useEffect(() => {
    if (!pathActive) return;

    if (ideas.length === 0) {
      setPathActive(false);
      setPathIndex(0);
      return;
    }

    if (pathIndex > ideas.length - 1) {
      setPathIndex(ideas.length - 1);
    }
  }, [ideas, pathActive, pathIndex]);

  /**
   * Update Room's database entry with any changes.
   * 
   * Runs when Menu's Save Room button is clicked.
   */
  async function handleSave() {
    const roomId = await saveRoom(roomData, ideas);
    roomData.id = roomId; // first save: room now has a DB identity; re-saves reuse it
  }

  /**
   * Starts the process to close Idea and Menu popups.
   * 
   * Runs when new Ideas are created or the popup is clicked off of.
   */
  function closePopup() {
    if (!popupOpen || popupClosing) {
      return;
    }
    setPopupClosing(true);
  }

  /**
   * Updates states related to popup when its done closing.
   * 
   * Runs when popup animation ends.
   */
  function finishPopupAnimation(event) {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.animationName === "menu-panel-close") {
      setPopupOpen(false);
      setPopupPosition(null)
      setPopupClosing(false);
    }
  }

  /**
   * Creates a new Text Idea.
   * 
   * Runs when the Idea Menu's Text button is clicked.
   */
  async function addTextIdea() {
    if (!popupPosition) {
      return;
    }

    const newIdea = {
      id: Date.now(),
      type: "text",
      x: popupPosition.x,
      y: popupPosition.y,
      title: "New Text Idea",
      text: "",
      highlighted: false,
    };



    setIdeas([...ideas, newIdea]);
    closePopup();
  }

  /**
   * Updates the current Idea's data.
   * 
   * Runs when the Idea Menu's form is submitted.
   */
  function updateIdea(newInfo) {
    let current = [...ideas];
    let index = current.findIndex(info => info.id === newInfo.id);
    current[index] = newInfo;
    setIdeas(current);
  }

  /**
   * Deletes the current Idea.
   * 
   * Runs when the Idea Menu's Delete button is clicked.
   */
  function deleteIdea(id) {
    let current = [...ideas];
    let index = current.findIndex(info => info.id === id);
    if (index != -1) {
      current.splice(index, 1);
      setIdeas(current);
    }
  }

  /** Swaps an idea one step earlier in the ideas/path order. */
  function moveIdeaBack(id) {
    setIdeas((prev) => {
      const index = prev.findIndex((idea) => idea.id === id);
      if (index <= 0) return prev; // already first
      const updated = [...prev];
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
      return updated;
    });
  }

  /** Swaps an idea one step later in the ideas/path order. */
  function moveIdeaForward(id) {
    setIdeas((prev) => {
      const index = prev.findIndex((idea) => idea.id === id);
      if (index === -1 || index >= prev.length - 1) return prev; // already last
      const updated = [...prev];
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
      return updated;
    });
  }
 
  /**
    * Begins walking the memory path, starting at the first idea.
    * Does nothing if the room has no ideas to walk through.
    */
  function startPath() {
    if (ideas.length === 0) return;
    setPathActive(true);
    setPathIndex(0);
  }

  /** Ends the active memory path walk. */
  function stopPath() {
    setPathActive(false);
  }

  /** Advances the path to the next idea, clamped to the last idea. */
  function nextPathStep() {
    setPathIndex((i) => Math.min(i + 1, ideas.length - 1));
  }

  /** Moves the path back to the previous idea, clamped to the first idea. */
  function prevPathStep() {
    setPathIndex((i) => Math.max(i - 1, 0));
  }

  // whichever idea the path is currently sitting on, if any
  const currentPathId =
    pathActive && ideas.length > 0
      ? ideas[Math.min(pathIndex, ideas.length - 1)].id
      : null;

  // CORE CHANGE: The math for placing the idea
  const handleDoubleClick = (e) => {
    // Prevent placing ideas if we clicked directly on the "Home" button
    if (e.target.tagName.toLowerCase() === "button") return;

    if (!roomRef.current) return;

    // If the popup is already visible, do not move it
    if (popupPosition != null) {
      return;
    }

    // Set the popup to the cursor position
    const rect = roomRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    console.log(ideas);
    setPopupOpen(true);
    setPopupPosition({ x, y });
  };

  /**
   * Updates Room name in database.
   * 
   * Runs when Menu's name field is updated.
   * @param {string} name - Name to update to.
   */
  function updateRoomName(name) {
    updateRoomData({ name: name });
  }

  return (
    <div className="room-viewport">
      {/* Menu Icon that implements most room switching and saving features */}
      {/* TODO: Add change reporting. */}
      <div style={{ position: "relative", zIndex: 100 }}>
        <Menu
          saveRoom={handleSave}
          loadRoom={onGoLoad}
          newRoom={onGoNew}
          setBackgroundImage={pickBackgroundImage}
          undo={() => null}
          redo={() => null}
          goHome={onGoHome}
          areChanges={() => true}
          menuName={roomData.name}
          updateMenuName={updateRoomName}
          changeRoom={onChangeRoom}
        />
      </div>

      {/* path menu, top right - order is just insertion order for now */}
      <div style={{ position: "relative", zIndex: 100 }}>
        <PathMenu
          ideas={ideas}
          pathActive={pathActive}
          pathIndex={pathIndex}
          onStart={startPath}
          onNext={nextPathStep}
          onPrev={prevPathStep}
          onStop={stopPath}
        />
      </div>

      {/* Wrapper div to make the browser layout treat a room as the correct size and allow popups to overflow*/}
      <div
        className="room-wrapper"
        style={{
          width: `${roomDimensions.width}px`,
          height: `${roomDimensions.height}px`,
          overflow: "visible",
        }}
      >
        <div
          ref={roomRef}
          className="room"
          onDoubleClick={handleDoubleClick}
          onClick={closePopup}
          style={{
            width: `${baseRoomDimensions.width}px`,
            height: `${baseRoomDimensions.height}px`,
            backgroundImage: !roomData.imgSrc || roomData.imgSrc === "none" ? "none" : `url("${roomData.imgSrc}")`,
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            position: "relative",
            overflow: "hidden",
            transform: `scale(${roomScale})`,
            transformOrigin: "top left",

          }}
        >

          {/* CORE CHANGE: Drawing the ideas from our memory onto the screen */}
          {ideas.map((idea, index) => {
            // highlighted (manual or path) always wins, otherwise earlier
            // in the order sits above later ones
            const isHighlighted = idea.highlighted || idea.id === currentPathId;
            const baseZ = ideas.length - index;
            const zIndex = isHighlighted ? 1000 + baseZ : baseZ;

            return (
              <Idea
                id={idea.id}
                type={idea.type}
                x={idea.x}
                y={idea.y}
                w={idea.w}
                h={idea.h}
                r={idea.r}
                title={idea.title}
                text={idea.text}
                imageId={idea.imageId}
                imageSrc={idea.imageSrc}
                highlighted={idea.highlighted}
                pathHighlighted={idea.id === currentPathId}
                pathActive={pathActive}
                zIndex={zIndex}
                updateIdea={updateIdea}
                deleteIdea={deleteIdea}
                moveIdeaBack={moveIdeaBack}
                moveIdeaForward={moveIdeaForward}
                isFirst={index === 0}
                isLast={index === ideas.length - 1}
                openImagePicker={openImagePicker}
                roomRef={roomRef}
                roomBaseDimensions={baseRoomDimensions}
                key={idea.id}>
              </Idea>
            );
          })}
        </div>

        {/* Popup on double click */}
        {popupOpen && (
          <div
            className={"glass-surface menu-transition-panel menu-transition-from-center" + (popupClosing ? " menu-transition-closing" : "")}
            onAnimationEnd={finishPopupAnimation}
            style={{
              position: "absolute",
              left: `${popupPosition.x}%`,
              top: `${popupPosition.y}%`,
              transform: "translate(-50%, -50%)",
              border: "2px solid white",
              width: "150px",
              height: "100px",
              boxSizing: "border-box",
              borderRadius: "8px",
              padding: "1rem",
              zIndex: 9,
              color: "black",
              boxShadow: "0 4px 8px rgba(0,0,0,0.4)",
            }}
            onDoubleClick={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="menu-transition-content">
              <button
                className="glass-button glass-surface glass-glow"
                style={{
                  borderRadius: "4px",
                }}
                onClick={closePopup}
              >
                X
              </button>

              <div
                style={{ marginTop: "1rem" }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="glass-button glass-surface glass-glow glass-button"
                  style={{
                    borderRadius: "4px",
                  }}
                  onClick={addTextIdea}
                >
                  Text
                </button>
                <button
                  className="glass-button glass-surface glass-glow glass-button"
                  style={{
                    borderRadius: "4px",
                  }}
                  onClick={pickIdeaImage}
                >
                  Image
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* prev/next widget, bottom center so it doesn't fight with the two corner menus */}
      <PathNav
        active={pathActive}
        pathIndex={pathIndex}
        total={ideas.length}
        onPrev={prevPathStep}
        onNext={nextPathStep}
      />
    </div >
  );
}
