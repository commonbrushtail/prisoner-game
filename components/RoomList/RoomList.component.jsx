import { useSelector } from "react-redux/es/exports";
const RoomList = ({ children, handleClick, className, selectedRoomId, handleSetselectedRoomId }) => {
  const roomList = useSelector((state) => state.roomList.roomList);

  //convert roomList from object to array of object and adding roomid to individual room object
  var roomListArray = Object.keys(roomList).map((key) => {
    var roomDetail = roomList[key];
    roomDetail = { ...roomDetail, id: key };

    return roomDetail;
  });

  const handleRoomClick = (roomId) => {
    handleSetselectedRoomId(roomId);
    console.log(selectedRoomId);
  };

  return (
    <>
      <div className="font-mono">Rooms</div>
      <div className="w-full border-2 border-black p-4 rounded-lg h-[250px] overflow-y-auto font-mono overflow-hidden ">
        {roomListArray.map((room) => {
          // if there're already guest in the room, don't put in the array
          if (room.guestEmail) {
            return;
          } else {
            return (
              <div
                onClick={() => {
                  handleRoomClick(room.id);
                }}
                className="flex flex-col  px-2 rounded py-1 cursor-pointer relative border border-black  "
                key={room.id}>
                <div className="flex flex-col">
                  <div className="text-xl">{room.roomName}</div>
                  <div>Host: {room.hostEmail}</div>
                </div>
                <div
                  className={`absolute pointer-events-none left-0 top-0 rounded transition-all border border-black origin-center w-full h-full ${
                    room.id === selectedRoomId ? "scale-x-[102%] scale-y-[120%]" : " "
                  }`}></div>
              </div>
            );
          }
        })}
      </div>
    </>
  );
};

export default RoomList;
