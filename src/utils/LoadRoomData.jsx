// return object containing Room data to be used in RoomFactory. Called by RoomFactory.
export const LoadRoomData = (id) => {
    // TODO: Load from database and fill into roomData
    
    var roomData = {
        id: null,
        name: "",
        imgSrc: null,
        ideas: {},
        type: "Load"
    }

    return roomData;
}