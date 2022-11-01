import { useEffect } from "react";
import { onlineListener, onlineListRef, realtimeDb, auth, roomRef, roomListRef, addUserToOnlineList, onlineListUserRef, updateRoom } from "../../utils/firebase";
import { onValue, ref, onDisconnect } from "firebase/database";
import { useDispatch, useSelector } from "react-redux";
import { updateOnline } from "../../store/online/online.slice";
import { updateRoomList } from "../../store/roomList/roomList.slice";
import { isAllOf } from "@reduxjs/toolkit";
const GameLayout = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const isHosting = useSelector((state) => state.user.isHosting);
  const userRoomId = useSelector((state) => state.user.userRoomId);

  useEffect(() => {
    const connectedRef = ref(realtimeDb, ".info/connected");

    onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        console.log("connected");

        addUserToOnlineList(user.uid, user.email);
      } else {
        console.log("not connected");
      }
    });

    onValue(onlineListRef(), (snapshot) => {
      if (snapshot.val()) {
        const data = snapshot.val();
        dispatch(updateOnline(data));
      } else {
        console.log("no data");
      }
    });
    //watch for room list and update local state
    onValue(roomListRef(), (snapshot) => {
      console.log(snapshot.val());
      if (snapshot.val()) {
        const data = snapshot.val();

        dispatch(updateRoomList(data));
      } else {
        console.log("no room list");
        dispatch(updateRoomList({}));
      }
    });

    onDisconnect(onlineListUserRef(user.uid)).remove();
  }, []);

  useEffect(() => {
    onDisconnect(roomRef(userRoomId)).remove();
  }, [isHosting]);

  return <div className="min-h-screen max-w-screen overflow-hidden bg-yellow-300">{children}</div>;
};

export default GameLayout;
