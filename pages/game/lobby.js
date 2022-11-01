import { useEffect, useState } from "react";
import ContentContainer from "../../components/ContentContainer/ContentContainer.component";
import GameLayout from "../../components/Layout/GameLayout.component";
import OnlineList from "../../components/OnlineList/OnlineList.component";
import Modal from "../../components/Modal/Modal.component";
import { useForm } from "react-hook-form";
import { generateRoomKey, createRoom, updateOnlineUser, updateRoomData } from "../../utils/firebase";
import { useDispatch, useSelector } from "react-redux";
import { updateIsLoading } from "../../store/loading/loading.slice";
import { updateIsHosting, updateUserRoomId } from "../../store/user/user.slice";
import { useRouter } from "next/router";
import RoomList from "../../components/RoomList/RoomList.component";

const Lobby = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const userUid = useSelector((state) => state.user.user.uid);
  const userEmail = useSelector((state) => state.user.user.email);
  const userOnlineState = useSelector((state) => state.online.online[userUid]);
  const roomList = useSelector((state) => state.roomList.roomList);
  const [selectedRoomId, setselectedRoomId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // watch for roomList change, if somebody join the room
  //before the current user press join, will clear the selected room
  useEffect(() => {
    if (!selectedRoomId) {
      return;
    }
    if (roomList[selectedRoomId].guestEmail) {
      setselectedRoomId(null);
    }
  }, [roomList]);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const onCraeteSubmit = async (data) => {
    //undefined mean the validation faild
    const roomName = data.roomName;
    if (data === undefined) {
      return;
    }
    //check if user currently hosting any room
    console.log(userOnlineState);
    if (userOnlineState.state.name === "hosting") return;

    dispatch(updateIsLoading(true));
    const roomId = await generateRoomKey();

    createRoom(roomId, roomName, userUid, userEmail);
    var updateObject = {
      state: {
        name: "hosting",
        detail: {
          roomId: roomId,
        },
      },
    };
    updateOnlineUser(userUid, updateObject);
    dispatch(updateUserRoomId(roomId));
    dispatch(updateIsHosting(true));

    router.push("room");
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };
  const handleCreateRoomClick = () => {
    setModalOpen(true);
  };

  const handleSetselectedRoomId = (roomId) => {
    setselectedRoomId(roomId);
  };

  const handleJoinClick = () => {
    dispatch(updateIsLoading(true));
    const roomData = {
      guestEmail: userEmail,
      guestUid: userUid,
      roomState: "guest joined",
      guestState: "not ready",
    };
    updateRoomData(selectedRoomId, roomData);
    const userData = {
      state: {
        name: "guest",
        detail: {
          roomId: selectedRoomId,
        },
      },
    };

    updateOnlineUser(userUid, userData);
    dispatch(updateUserRoomId(selectedRoomId));
    // the current user will be joining room as guest

    router.push("room");
  };
  return (
    <>
      {modalOpen && (
        <Modal
          modalClass="px-4 py-4 w-[300px] top-[45%]"
          handleModalClose={() => {
            handleModalClose();
          }}>
          <div className="w-full h-full font-mono flex flex-col">
            <div className="text-xl font-semibold">Create Room</div>

            <form className="flex flex-col" onSubmit={handleSubmit(onCraeteSubmit)}>
              {/* register your input into the hook by invoking the "register" function */}
              <label className="font-semibold mt-4">Room name</label>
              <input className="bg-transparent border-2 border-black rounded-md py-2 px-2" {...register("roomName", { required: true, minLength: 5 })} />
              {errors.roomName && <span>This field is required</span>}

              <input className="border-2 border-black py-2 mt-2 rounded-md" value="Create" type="submit" />
            </form>
          </div>
        </Modal>
      )}
      <div className="px-4 py-4">
        <OnlineList></OnlineList>
        <RoomList selectedRoomId={selectedRoomId} handleSetselectedRoomId={handleSetselectedRoomId}></RoomList>
        <div className="flex mt-4 space-x-4 font-mono">
          <button onClick={handleCreateRoomClick} className="px-3 rounded-md  py-1 border-2 border-black">
            Create Room
          </button>
          <button
            onClick={() => {
              handleJoinClick();
            }}
            className={` px-3  border-black border-2 rounded-md transition-all duration-100  px-10 ${
              selectedRoomId ? "pointer-events-auto cursor-pointer opacity-100" : "pointer-events-none opacity-20 "
            } `}>
            Join
          </button>
        </div>
      </div>
    </>
  );
};

export default Lobby;
Lobby.Layout = GameLayout;
