import RoomScreen from "@/model/room/RoomScreen";

// WIP, not actually used anywhere.
export default function RoomFactory({roomData, onGoHome}) {
    switch(roomData.type) {
        case "New": {
            return <RoomScreen roomData={roomData} onGoHome={onGoHome}/>;
        }

        case "Load": {
            return null;
        }

        case "Template": {
            return <RoomScreen roomData={roomData} onGoHome={onGoHome}/>;
        }

        default: {
            return null;
        }
    }
}