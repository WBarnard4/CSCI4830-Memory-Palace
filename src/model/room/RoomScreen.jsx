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

export default function RoomScreen({ roomData, updateRoomData, openImagePicker, onGoHome, onGoLoad, onGoNew }) {
  // state which stores ideas
  const [ideas, setIdeas] = useState(roomData.ideas ?? []);
  const [popupPosition, setPopupPosition] = useState(null);

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

  function pickBackgroundImage() {
    openImagePicker(({ imageId, imageSrc }) => {
      updateRoomData({
        imgSrc: imageSrc,
        backgroundImageId: imageId,
      });
    });
  }

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
        imageId: imageId,
        imageSrc: imageSrc,
        highlighted: false,
      };

      setIdeas((currentIdeas) => [...currentIdeas, newIdea]);
      setPopupPosition(null);
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

    function updateRoomDimensions() {
      // Find the dimensions in the baseline viewport.
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

  async function handleSave() {
    const roomId = await saveRoom(roomData, ideas);
    roomData.id = roomId; // first save: room now has a DB identity; re-saves reuse it
  }

  function closePopup() {
    setPopupPosition(null);
  }

  async function addTextIdea() {
    if (!popupPosition) {
      return;
    }

    const newIdea = {
      id: Date.now(),
      type: "text",
      x: popupPosition.x,
      y: popupPosition.y,
      text: "New Idea",
      highlighted: false,
    };



    setIdeas([...ideas, newIdea]);
    setPopupPosition(null);
  }

  function updateIdea(newInfo) {
    let current = [...ideas];
    let index = current.findIndex(info => info.id === newInfo.id);
    current[index] = newInfo;
    setIdeas(current);
  }

  function deleteIdea(id) {
    let current = [...ideas];
    let index = current.findIndex(info => info.id === id);
    if (index != -1) {
      current.splice(index, 1);
      setIdeas(current);
    }
  }

  function moveIdeaBack(id) {
    setIdeas((prev) => {
      const index = prev.findIndex((idea) => idea.id === id);
      if (index <= 0) return prev; // already first
      const updated = [...prev];
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
      return updated;
    });
  }

  function moveIdeaForward(id) {
    setIdeas((prev) => {
      const index = prev.findIndex((idea) => idea.id === id);
      if (index === -1 || index >= prev.length - 1) return prev; // already last
      const updated = [...prev];
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
      return updated;
    });
  }

  function startPath() {
    if (ideas.length === 0) return;
    setPathActive(true);
    setPathIndex(0);
  }

  function stopPath() {
    setPathActive(false);
  }

  function nextPathStep() {
    setPathIndex((i) => Math.min(i + 1, ideas.length - 1));
  }

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
    setPopupPosition({ x, y });
  };

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
                text={idea.text}
                imageId={idea.imageId}
                imageSrc={idea.imageSrc}
                highlighted={idea.highlighted}
                pathHighlighted={idea.id === currentPathId}
                zIndex={zIndex}
                updateIdea={updateIdea}
                deleteIdea={deleteIdea}
                moveIdeaBack={moveIdeaBack}
                moveIdeaForward={moveIdeaForward}
                isFirst={index === 0}
                isLast={index === ideas.length - 1}
                openImagePicker={openImagePicker}
                key={idea.id}>
              </Idea>
            );
          })}
        </div>

        {/* Popup on double click */}
        {popupPosition && (
          <div
            style={{
              position: "absolute",
              left: `${popupPosition.x}%`,
              top: `${popupPosition.y}%`,
              transform: "translate(-50%, -50%)",
              backgroundColor: "white",
              border: "2px solid black",
              borderRadius: "8px",
              padding: "1rem",
              zIndex: 9,
              color: "black",
              boxShadow: "0 4px 8px rgba(0,0,0,0.4)",
            }}
            onDoubleClick={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={closePopup}>X</button>

            <div
              style={{ marginTop: "1rem" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={addTextIdea}>Text</button>
              <button onClick={pickIdeaImage}>Image</button>
            </div>
          </div>
        )}
      </div>

      {/* prev/next widget, bottom center so it doesn't fight with the two corner menus */}
      {pathActive && (
        <PathNav
          pathIndex={pathIndex}
          total={ideas.length}
          onPrev={prevPathStep}
          onNext={nextPathStep}
        />
      )}
    </div>
  );
}
