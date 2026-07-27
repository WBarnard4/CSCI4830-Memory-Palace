import { useState, useRef, useEffect } from "react";
import "./PathMenu.css";

// dropdown for the memory path - shows order (just insertion order for now,
// no drag/reorder yet) and lets you step through highlighting them
export function PathMenu({ ideas, pathActive, pathIndex, onStart, onNext, onPrev, onStop }) {
  const [opened, setOpened] = useState(false);
  const [closing, setClosing] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    function closeMenuOnOutsideClick(event) {
      if (
        opened &&
        !closing &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        closeMenu();
      }
    }

    document.addEventListener("mousedown", closeMenuOnOutsideClick);

    return () => {
      document.removeEventListener("mousedown", closeMenuOnOutsideClick);
    };
  }, [opened, closing]);

  function label(idea) {
    if (idea.type === "text") {
      return idea.text ? idea.text.slice(0, 20) : "Untitled";
    }
    return "Image";
  }

  function startPath() {
    closeMenu();
    onStart();
  }

  function openMenu() {
    setClosing(false);
    setOpened(true);
  }

  function closeMenu() {
    if (!opened || closing) {
      return;
    }

    setClosing(true);
  }

  function finishMenuAnimation(event) {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.animationName === "menu-panel-close") {
      setOpened(false);
      setClosing(false);
    }
  }


  return (
    <div
      ref={menuRef}
      className="path-menu"
    >
      {opened ? (
        <div
          className={
            `menu-panel ` +
            `menu-transition-panel ` +
            `menu-transition-from-right ` +
            `glass-surface` +
            (closing
              ? " menu-transition-closing"
              : "")
          }
          onAnimationEnd={finishMenuAnimation}
        >
          <span
            className={
              "menu-transition-icon " +
              "path-menu-transition-icon"
            }
            aria-hidden="true"
          />

          <div className="menu-opened menu-transition-content">
            <h1 className="path-menu-title">Path Order</h1>

            {ideas.length === 0 ? (
              <p className="path-empty">No ideas yet</p>
            ) : (
              <ul className="path-list">
                {ideas.map((idea, index) => (
                  <li
                    key={idea.id}
                    className={
                      `path-list-item glass-surface` +
                      (pathActive && index === pathIndex
                        ? " path-current"
                        : "")
                    }
                  >
                    <span className="path-idea-number">
                      Idea {index + 1}:
                    </span>{" "}
                    {label(idea)}
                  </li>
                ))}
              </ul>
            )}

            {!pathActive ? (
              <button
                className={
                  "menu-action " +
                  "glass-surface " +
                  "glass-glow " +
                  "glass-ripple " +
                  "glass-button"
                }
                onClick={startPath}
                disabled={ideas.length === 0}
              >
                Start
              </button>
            ) : (
              <div className="path-active-controls">
                <p className="path-position">{pathIndex + 1} / {ideas.length}</p>

                <div className="path-controls menu-room-actions">
                  <button
                    className={
                      "menu-action " +
                      "glass-surface " +
                      "glass-glow " +
                      "glass-ripple " +
                      "glass-button"
                    }
                    onClick={onPrev}
                  >
                    Prev
                  </button>

                  <button
                    className={
                      "menu-action " +
                      "glass-surface " +
                      "glass-glow " +
                      "glass-ripple " +
                      "glass-button"
                    }
                    onClick={onNext}
                  >
                    Next
                  </button>
                </div>

                <button
                  className={
                    "menu-action " +
                    "glass-surface " +
                    "glass-glow " +
                    "glass-ripple " +
                    "glass-button"
                  }
                  onClick={onStop}
                >
                  Stop
                </button>
              </div>
            )}

            <div className="menu-close-zone">
              <button
                className="menu-close-button"
                aria-label="Close path menu"
                onClick={closeMenu}
              >
                <span />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className={
            "menu-closed " +
            "glass-surface " +
            "glass-glow " +
            "glass-ripple " +
            "glass-button"
          }
          aria-label="Open path menu"
          onClick={openMenu}
        />
      )}
    </div>
  );
}
