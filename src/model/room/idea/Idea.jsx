import { useState, useRef, useLayoutEffect } from "react";

export function Idea({ id, type, x, y, w, h, r, title, text, roomBaseDimensions, imageId, imageSrc, highlighted, pathHighlighted, zIndex, updateIdea, deleteIdea, openImagePicker, moveIdeaBack, moveIdeaForward, isFirst, isLast, roomRef }) {
  const [menuActive, toggleMenu] = useState(false);

  // Live position/width while a drag or resize gesture is in
  // progress. Committed to RoomScreen state only on release so
  // we don't re-render the whole ideas array on every pixel.
  const [dragPos, setDragPos] = useState(null);
  const [dragWidth, setDragWidth] = useState(null);
  const [dragHeight, setDragHeight] = useState(null);
  const [dragRotation, setDragRotation] = useState(null);

  // Natural (unscaled) rendered size of the text, used to compute
  // the Paint-style stretch factors when the box is resized.
  const [naturalTextSize, setNaturalTextSize] = useState(null);
  const textRef = useRef(null);

  const boxRef = useRef(null);
  const gestureRef = useRef(null);

  const ideaInfo = {
    id: id,
    type: type,
    x: x,
    y: y,
    w: w ?? null,
    h: h ?? null,
    r: r ?? 0,
    title: title,
    text: text,
    imageId: imageId,
    imageSrc: imageSrc,
    highlighted: highlighted,
  };

  // glow if manually highlighted OR the path is currently sitting on this one
  const isHighlighted = ideaInfo.highlighted || pathHighlighted;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  const shownX = dragPos !== null ? dragPos.x : ideaInfo.x;
  const shownY = dragPos !== null ? dragPos.y : ideaInfo.y;
  const shownW = dragWidth !== null ? dragWidth : ideaInfo.w;
  const shownH = dragHeight !== null ? dragHeight : ideaInfo.h;
  const shownR = dragRotation !== null ? dragRotation : ideaInfo.r;

  // Measure the text at its natural size. offsetWidth/offsetHeight
  // report layout dimensions, which CSS transforms don't affect,
  // so this stays accurate even while the text is being stretched.
  useLayoutEffect(() => {
    if (ideaInfo.type !== "text") {
      return;
    }

    function measure() {
      if (!textRef.current) {
        return;
      }

      setNaturalTextSize({
        width: textRef.current.offsetWidth,
        height: textRef.current.offsetHeight,
      });
    }

    measure();

    // Fonts can finish loading after the first measurement, which
    // changes the text's natural size — re-measure once they're
    // settled so the stretch factors stay accurate.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measure);
    }
  }, [ideaInfo.type, ideaInfo.title]);

  // Paint-style stretch: scale the text block to exactly fill the
  // box's content area, in room-base pixels. 24px accounts for
  // the box's padding (2x10) and border (2x2).
  //
  // IMPORTANT: this uses the roomBaseDimensions PROP, not a DOM
  // read like roomRef.current.offsetWidth. Reading the DOM during
  // render returns the room's PREVIOUS committed size — on a fresh
  // load, the room re-bases itself once the background image
  // loads, and a render-time DOM read computes the stretch against
  // the stale 1920px default, cropping the text until some later
  // re-render happens to read the settled value. Props are state,
  // so this recomputes in lockstep with the room.
  let textScaleX = 1;
  let textScaleY = 1;
  const textIsStretched =
    ideaInfo.type === "text" && shownW != null && shownH != null;

  if (textIsStretched && naturalTextSize && roomBaseDimensions) {
    const boxContentW = Math.max((shownW / 100) * roomBaseDimensions.width - 24, 1);
    const boxContentH = Math.max((shownH / 100) * roomBaseDimensions.height - 24, 1);

    if (naturalTextSize.width > 0) {
      textScaleX = boxContentW / naturalTextSize.width;
    }
    if (naturalTextSize.height > 0) {
      textScaleY = boxContentH / naturalTextSize.height;
    }
  }

  // Editor popup: offset toward the room center and clamp so it
  // can't be clipped by the room's overflow:hidden edges.
  const editorX = clamp(ideaInfo.x + (ideaInfo.x > 70 ? -14 : 14), 10, 90);
  const editorY = clamp(ideaInfo.y, 16, 84);

  /**
   * Pointer capture keeps receiving move/up events when the cursor
   * outruns the element. Guarded because test environments (jsdom)
   * don't fully implement it.
   */
  function capturePointer(event) {
    const target = event.currentTarget;

    if (typeof target.setPointerCapture === "function") {
      try {
        target.setPointerCapture(event.pointerId);
      } catch {
        // No active pointer with this id (synthetic events) — fine.
      }
    }
  }

  /** Left button only; button is undefined for synthetic events. */
  function isPrimaryButton(event) {
    return event.button == null || event.button === 0;
  }

  /**
   * The room div is scaled to fit the window, so pointer deltas
   * (screen px) are converted to room percentages through its
   * on-screen bounding rect. This keeps x/y/w in the same
   * percentage space the rest of the app already uses.
   */
  function roomRect() {
    return roomRef.current.getBoundingClientRect();
  }

  /** Begin a move gesture on the idea box. */
  function startMove(event) {
    if (!isPrimaryButton(event)) {
      return;
    }

    capturePointer(event);

    gestureRef.current = {
      kind: "move",
      startX: event.clientX,
      startY: event.clientY,
      fromX: ideaInfo.x,
      fromY: ideaInfo.y,
      lastX: ideaInfo.x,
      lastY: ideaInfo.y,
      moved: false,
    };
  }

  /** Begin a resize gesture on the corner handle. */
  function startResize(event) {
    if (!isPrimaryButton(event)) {
      return;
    }

    // Don't let the box's move gesture start underneath us.
    event.stopPropagation();
    capturePointer(event);

    // Ideas that have never been resized have no stored width,
    // so measure the rendered width to start from what's on
    // screen instead of jumping to some default.
    let fromW = ideaInfo.w;
    let fromH = ideaInfo.h;
    if (boxRef.current && roomRef.current) {
      // offsetWidth/offsetHeight are layout sizes in room-base px,
      // unaffected by the room's scale or the idea's rotation
      // (getBoundingClientRect would return the rotated bounding
      // box, which over-measures rotated ideas).
      if (fromW == null) {
        fromW = (boxRef.current.offsetWidth / roomRef.current.offsetWidth) * 100;
      }
      if (fromH == null) {
        fromH = (boxRef.current.offsetHeight / roomRef.current.offsetHeight) * 100;
      }
    }

    gestureRef.current = {
      kind: "resize",
      startX: event.clientX,
      startY: event.clientY,
      fromW: fromW,
      fromH: fromH,
      lastW: fromW,
      lastH: fromH,
      moved: false,
    };
  }

  /** Begin a rotate gesture on the top handle. */
  function startRotate(event) {
    if (!isPrimaryButton(event)) {
      return;
    }

    event.stopPropagation();
    capturePointer(event);

    gestureRef.current = {
      kind: "rotate",
      startX: event.clientX,
      startY: event.clientY,
      lastR: ideaInfo.r,
      moved: false,
    };
  }

  /** Shared pointermove for all gestures. */
  function movePointer(event) {
    const gesture = gestureRef.current;
    if (gesture === null) {
      return;
    }

    const dx = event.clientX - gesture.startX;
    const dy = event.clientY - gesture.startY;

    // Ignore tiny jitters so a normal click still opens the editor.
    if (!gesture.moved && Math.hypot(dx, dy) < 4) {
      return;
    }
    gesture.moved = true;

    const rect = roomRect();

    if (gesture.kind === "move") {
      gesture.lastX = clamp(gesture.fromX + (dx / rect.width) * 100, 0, 100);
      gesture.lastY = clamp(gesture.fromY + (dy / rect.height) * 100, 0, 100);
      setDragPos({ x: gesture.lastX, y: gesture.lastY });
    } else if (gesture.kind === "rotate") {
      // Angle of the pointer around the box center, with the
      // handle sitting at the top (hence the +90).
      const boxBounds = boxRef.current.getBoundingClientRect();
      const centerX = boxBounds.left + boxBounds.width / 2;
      const centerY = boxBounds.top + boxBounds.height / 2;

      let angle =
        (Math.atan2(event.clientY - centerY, event.clientX - centerX) * 180) /
        Math.PI +
        90;

      // Snap to right angles when close, so straightening an
      // idea back out doesn't require pixel-perfect aim.
      for (const snap of [-90, 0, 90, 180, 270, 360]) {
        if (Math.abs(angle - snap) < 5) {
          angle = snap % 360;
          break;
        }
      }

      gesture.lastR = angle;
      setDragRotation(angle);
    } else {
      // Both idea types resize freely in both directions, and the
      // content stretches to take the shape of the box.
      gesture.lastW = clamp(gesture.fromW + (dx / rect.width) * 100, 3, 95);
      gesture.lastH = clamp(gesture.fromH + (dy / rect.height) * 100, 3, 95);
      setDragWidth(gesture.lastW);
      setDragHeight(gesture.lastH);
    }
  }

  /** Shared pointerup/cancel: commit the gesture, or treat it as a click. */
  function endPointer() {
    const gesture = gestureRef.current;
    gestureRef.current = null;

    if (gesture === null) {
      return;
    }

    if (!gesture.moved) {
      // Pointer never really moved: this was a plain click.
      if (gesture.kind === "move") {
        toggleMenu(!menuActive);
      }
    } else if (gesture.kind === "move") {
      updateIdea({ ...ideaInfo, x: gesture.lastX, y: gesture.lastY });
    } else if (gesture.kind === "rotate") {
      updateIdea({ ...ideaInfo, r: gesture.lastR });
    } else {
      updateIdea({ ...ideaInfo, w: gesture.lastW, h: gesture.lastH });
    }

    setDragPos(null);
    setDragWidth(null);
    setDragHeight(null);
    setDragRotation(null);
  }

  function toggleHighlight() {
    updateIdea({
      ...ideaInfo,
      highlighted: !ideaInfo.highlighted,
    });
  }

  function setInfo(e) {
    e.preventDefault();

    // Position and size are handled by dragging now, so the
    // editor only needs to commit text changes.
    const formData = new FormData(e.target);
    let newTitle = formData.get("title");
    let newText = formData.get("text")

    if (!newTitle) {
      newTitle = ideaInfo.title;
    }
    if (!newText) {
      newText = ideaInfo.text;
    }

    toggleMenu(false);
    updateIdea({ ...ideaInfo, title: newTitle, text: newText });
  }

  function handleDelete() {
    deleteIdea(ideaInfo.id);
  }

  function chooseNewImage() {
    openImagePicker(({ imageId, imageSrc }) => {
      const newInfo = {
        ...ideaInfo,
        imageId: imageId,
        imageSrc: imageSrc,
      };

      updateIdea(newInfo);
    });
  }

  function handleMoveBack(e) {
    e.stopPropagation();
    moveIdeaBack(ideaInfo.id);
  }

  function handleMoveForward(e) {
    e.stopPropagation();
    moveIdeaForward(ideaInfo.id);
  }

  return (
    <div>
      <div
        key={ideaInfo.id}
        ref={boxRef}
        onPointerDown={startMove}
        onPointerMove={movePointer}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        style={{
          position: "absolute",
          left: `${shownX}%`,
          top: `${shownY}%`,
          width: shownW != null ? `${shownW}%` : "auto",
          height: shownH != null ? `${shownH}%` : "auto",
          boxSizing: "border-box",
          transform: `translate(-50%, -50%) rotate(${shownR}deg)`,
          backgroundColor: "white",
          padding: "10px",
          border: isHighlighted
            ? "2px solid #ffd700"
            : "2px solid black",
          borderRadius: "8px",
          color: "black",
          cursor: dragPos !== null ? "grabbing" : "grab",
          touchAction: "none",
          userSelect: "none",
          overflowWrap: "break-word",
          boxShadow: isHighlighted
            ? "0 0 0 4px rgba(255, 215, 0, 0.9), 0 0 24px 10px rgba(255, 215, 0, 0.55)"
            : "0 4px 6px rgba(0,0,0,0.3)",
          transition: "box-shadow 0.25s ease, border-color 0.25s ease",
          // z-index now comes from RoomScreen (order position + highlight state)
          zIndex: zIndex ?? (isHighlighted ? 5 : 1),
        }}
      >
        {ideaInfo.type === "text" &&
          (textIsStretched ? (
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
              }}
            >
              {/*
                Absolutely positioned at the corner so the room's
                inherited text-align:center can't shift the span
                before the stretch is applied — the scale then
                grows it into the box from a fixed anchor point.
              */}
              <span
                ref={textRef}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  whiteSpace: "pre",
                  lineHeight: "normal",
                  transform: `scale(${textScaleX}, ${textScaleY})`,
                  transformOrigin: "top left",
                }}
              >
                {ideaInfo.title}
              </span>
            </div>
          ) : (
            <span
              ref={textRef}
              style={{ display: "inline-block", whiteSpace: "pre" }}
            >
              {ideaInfo.title}
            </span>
          ))}

        {ideaInfo.type === "image" && (
          <img
            src={ideaInfo.imageSrc}
            alt="User idea"
            draggable={false}
            style={
              shownW != null
                ? {
                  // Resized: take the exact shape of the box,
                  // stretching rather than proportionally scaling
                  width: "100%",
                  height: shownH != null ? "100%" : "auto",
                  display: "block",
                  objectFit: "fill",
                  pointerEvents: "none",
                }
                : {
                  // Never resized: original fixed thumbnail size
                  width: "100px",
                  height: "100px",
                  display: "block",
                  objectFit: "contain",
                  pointerEvents: "none",
                }
            }
          />
        )}

        {/* Top handle for rotating */}
        <div
          onPointerDown={startRotate}
          onPointerMove={movePointer}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "-22px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            background: "white",
            border: "2px solid #2f6fd0",
            cursor: "grab",
            touchAction: "none",
            zIndex: 2,
          }}
        />

        {/* Corner drag handle for resizing */}
        <div
          onPointerDown={startResize}
          onPointerMove={movePointer}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
          aria-hidden="true"
          style={{
            position: "absolute",
            right: "-7px",
            bottom: "-7px",
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            background: "white",
            border: "2px solid black",
            cursor: "nwse-resize",
            touchAction: "none",
            zIndex: 2,
          }}
        />
      </div>
      {menuActive && (
        <div className="idea-menu"
          style={{
            position: "absolute",
            left: `${editorX}%`,
            top: `${editorY}%`,
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: "10px",
            border: "2px solid black",
            borderRadius: "8px",
            color: "black",
            boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
            // Above every idea (highlighted ideas reach 1000+n)
            zIndex: 3000,
          }}>

          <form onSubmit={setInfo}>
            <div>
              <label>Title</label>
              <br />
              <textarea
                defaultValue={ideaInfo.title}
                name="title"
                rows="1"
                style={{
                  width: "100%",
                  resize: "none"
                }}
              />
              <br />

              <label>Description</label>
              <br />
              <textarea
                defaultValue={ideaInfo.text}
                name="text"
                style={{
                  width: "100%",
                }}
              />
            </div>

            {ideaInfo.type === "image" ? (
              <>
                <button type="button" onClick={chooseNewImage}>Select Image</button>
                <br />
              </>
            ) : (
              <>
              </>
            )}

            <button type="button" onClick={toggleHighlight}>
              {ideaInfo.highlighted ? "Remove Highlight" : "Highlight"}
            </button>

            <button type="button" onClick={handleMoveBack} disabled={isFirst}>
              ← Back
            </button>
            <button type="button" onClick={handleMoveForward} disabled={isLast}>
              Forward →
            </button>
            <br />

            <br />
            <button type="submit">Submit</button>
            <button type="button" onClick={handleDelete}>Delete Idea</button>
          </form>
        </div>
      )}
    </div>
  );
}
