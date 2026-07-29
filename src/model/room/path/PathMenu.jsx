import { useState, useRef, useEffect } from "react";
import "./PathMenu.css";

/**
 * Dropdown menu for the memory path. Shows ideas in path order (just
 * insertion order for now, no drag/reorder yet) and lets the user
 * step through highlighting them one at a time.
 *
 * @param {object} props
 * @param {Array<object>} props.ideas - ideas in path order.
 * @param {boolean} props.pathActive - whether a path walk is in progress.
 * @param {number} props.pathIndex - index of the currently highlighted idea.
 * @param {() => void} props.onStart - begins the path walk.
 * @param {() => void} props.onNext - advances to the next idea.
 * @param {() => void} props.onPrev - goes back to the previous idea.
 * @param {() => void} props.onStop - ends the path walk.
 */
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

  /** Shortens an idea's title for display in the path list. */
  function label(idea) {
    return idea.title ? idea.title.slice(0, 20) : "Untitled";
  }

  /** Closes the menu and starts the memory path walk */
  function startPath() {
    closeMenu();
    onStart();
  }

  /** Opens the path menu panel. */
  function openMenu() {
    setClosing(false);
    setOpened(true);
  }

  /** Begins the closing animation for the path menu panel. */
  function closeMenu() {
    if (!opened || closing) {
      return;
    }

    setClosing(true);
  }

  /** Marks the panel as fully closed once its close animation ends. */
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
