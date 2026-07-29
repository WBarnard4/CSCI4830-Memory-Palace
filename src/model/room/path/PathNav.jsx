import "./PathNav.css";
import { useEffect, useState } from "react";

/**
  * Small floating prev/next control for the memory path. Only shows
  * up once a path walk has been started (`active` is true), and
  * animates itself open/closed to match.
  *
  * @param {object} props
  * @param {boolean} props.active - whether a path walk is in progress.
  * @param {number} props.pathIndex - index of the current path step.
  * @param {number} props.total - total number of ideas in the path.
  * @param {() => void} props.onPrev - goes back to the previous idea.
  * @param {() => void} props.onNext - advances to the next idea.
  */
export function PathNav({ active, pathIndex, total, onPrev, onNext }) {
  const [opened, setOpened] = useState(active);
  const [closing, setClosing] = useState(false);


  /**
    * Changes States for opening and closing
    */
  useEffect(() => {
    if (active && opened) {
      setClosing(false);
      return;
    }
    if (active) {
      setOpened(true);
      setClosing(false);
      return;
    }

    if (opened) {
      setClosing(true);
    }

  }, [active, opened]);

  /**
    * Sets opened to false at the end of closing animation.
    */
  function finishAnimation(event) {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.animationName !== "menu-panel-close") {
      return;
    }

    setOpened(false);
    setClosing(false);
  }

  /**
    * Do not render anything after the closing animation finishes.
    */
  if (!opened) {
    return null;
  }


  return (
    <div
      className={
        `path-nav ` +
        `menu-transition-panel ` +
        `menu-transition-from-center ` +
        `glass-surface` +
        (closing
          ? " menu-transition-closing"
          : "")
      }
      onAnimationEnd={finishAnimation}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      <div className="path-nav-content menu-transition-content" >
        <button
          className={
            "path-nav-button " +
            "glass-surface " +
            "glass-glow " +
            "glass-ripple " +
            "glass-button"
          }
          aria-label="Previous Path"
          onClick={onPrev}>
          ←
        </button>
        <span className="path-nav-label">{pathIndex + 1} / {total}</span>
        <button
          className={
            "path-nav-button " +
            "glass-surface " +
            "glass-glow " +
            "glass-ripple " +
            "glass-button"
          }
          aria-label="Next Path"
          onClick={onNext}>
          →
        </button>
      </div>
    </div >
  );
}
