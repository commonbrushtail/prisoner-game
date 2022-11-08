import { useEffect, useState } from "react";
import ContentContainer from "../../components/ContentContainer/ContentContainer.component";
import GameLayout from "../../components/Layout/GameLayout.component";
import OnlineList from "../../components/OnlineList/OnlineList.component";
import Modal from "../../components/Modal/Modal.component";
import { useForm } from "react-hook-form";
import { generateRoomKey, createRoom, updateOnlineUser, updateRoomData, deleteRoom, onlineListUserRef } from "../../utils/firebase";
import { useDispatch, useSelector } from "react-redux";
import { updateIsLoading } from "../../store/loading/loading.slice";
import { updateIsClosingRoom, updateIsHosting, updateIsInRoom, updateUserIsLeavingRoom, updateUserRoomId } from "../../store/user/user.slice";
import { useRouter } from "next/router";
import RoomList from "../../components/RoomList/RoomList.component";
import winLogo from "../../public/assets/images/win.png";
import stealLogo from "../../public/assets/images/steal.png";
import splitLogo from "../../public/assets/images/share.png";
import { remove } from "firebase/database";
import { getAuth } from "firebase/auth";
const Lobby = () => {
  const auth = getAuth();
  const router = useRouter();
  const dispatch = useDispatch();
  const userWin = useSelector((state) => state.user.user.win);
  const userSteal = useSelector((state) => state.user.user.steal);
  const userSplit = useSelector((state) => state.user.user.split);
  const userUid = useSelector((state) => state.user.user.uid);
  const userEmail = useSelector((state) => state.user.user.email);
  const userOnlineState = useSelector((state) => state.online.online[userUid]);
  const roomList = useSelector((state) => state.roomList.roomList);
  const [selectedRoomId, setselectedRoomId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const isClosingRoom = useSelector((state) => state.user.isClosingRoom);
  const userRoomId = useSelector((state) => state.user.userRoomId);
  // watch for roomList change, if somebody join the room
  //before the current user press join, will clear the selected room
  /*
  useEffect(() => {
    if (selectedRoomId && roomList) {
      if (roomList[selectedRoomId].guestEmail) {
        setselectedRoomId(null);
      }
    }
  }, [roomList, selectedRoomId]);
*/
  // everytime user navigate back to lobby all their state
  // relate to room will be reset

  /*
  // if user is the last person who leave the room,
  //user will be the one who closing the room on firebase
  //after that the user state will reset
  useEffect(() => {
    if (userRoomId && isClosingRoom) {
      deleteRoom(userRoomId);
      dispatch(updateIsHosting(false));
      dispatch(updateIsInRoom(false));
      dispatch(updateUserRoomId(null));
      dispatch(updateIsClosingRoom(false));
    }
  }, [isClosingRoom, userRoomId]);

  */

  useEffect(() => {
    updateOnlineUser(userUid, { state: { name: "lobby", detail: null } });
    dispatch(updateIsHosting(false));
    dispatch(updateIsInRoom(false));
    dispatch(updateUserRoomId(null));
    dispatch(updateIsClosingRoom(false));
    dispatch(updateUserIsLeavingRoom(false));
  }, []);
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
    if (userOnlineState.state.name === "hosting") return;
    dispatch(updateIsLoading(true));

    // generate room key
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
    dispatch(updateIsInRoom(true));

    router.replace({ pathname: "/game/room" }, "/");
  };

  const handleJoinClick = () => {
    dispatch(updateIsLoading(true));
    const roomData = {
      guestEmail: userEmail,
      guestUid: userUid,
      guestState: "not ready",
      guestInRoom: true,
      guestLeaving: false,
      roomState: "guest joined",
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
    dispatch(updateIsInRoom(true));
    // the current user will be joining room as guest

    router.replace({ pathname: "/game/room" }, "/");
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
  const handleSignoutClick = () => {
    remove(onlineListUserRef(userUid));
    auth.signOut().then((res) => {
      console.log(res, "sign out complete");

      router.replace({ pathname: "/" }, "/");
    });
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

        <div className="flex space-x-5 w-full  py-4 -mt-2 ">
          <div className="flex items-center space-x-1 ">
            <img className="w-[25px]" src={winLogo.src} alt="" />
            <span className="text-xl">{userWin}</span>
          </div>
          <div className="flex items-center space-x-1 ">
            <img className="w-[30px]" src={splitLogo.src} alt="" />
            <span className="text-xl">{userSplit}</span>
          </div>
          <div className="flex items-center space-x-1 ">
            <img className="w-[25px]" src={stealLogo.src} alt="" />
            <span className="text-xl">{userSteal}</span>
          </div>
        </div>

        <div className=" flex flex-1 flex-wrap font-mono xs:flex-auto xs:flex-nowrap xs:space-y-0 space-y-2 ">
          <div className="space-x-2 flex w-full">
            <button onClick={handleCreateRoomClick} className="px-3 rounded-md  py-1 border-2 border-black">
              Create Room
            </button>
            <button
              onClick={() => {
                handleJoinClick();
              }}
              className={` px-3  border-black border-2 rounded-md transition-all duration-100 py-1  px-4 ${
                selectedRoomId ? "pointer-events-auto cursor-pointer opacity-100" : "pointer-events-none opacity-20 "
              } `}>
              Join
            </button>
          </div>
          <button
            onClick={() => {
              handleSignoutClick();
            }}
            className={` border-black border-2 rounded-md px-4 transition-all duration-100 whitespace-nowrap  `}>
            Sign out
          </button>
        </div>
      </div>
    </>
  );
};

export default Lobby;
Lobby.Layout = GameLayout;
