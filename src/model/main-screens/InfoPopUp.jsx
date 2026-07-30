import "@/App.css";
import "./Popup.css"

export default function InfoPopUp({ use, disable }) {

    return (
        <div className="info-popup">
            <button type="button" onClick={() => disable(true)}
                className="glass-surface glass-glow glass-button info-button">More Info</button>
        </div>
    );
}