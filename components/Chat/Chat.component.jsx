import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import GameLayout from "../../components/Layout/GameLayout.component";
import { updateIsLoading } from "../../store/loading/loading.slice";
import { createMsg, generateMsgKey, updateRoomData } from "../../utils/firebase";

const Chat = () => {
  const dispatch = useDispatch();
  const userUid = useSelector((state) => state.user.user.uid);
  const userRoomId = useSelector((state) => state.user.userRoomId);

  const roomDetail = useSelector((state) => state.roomList.roomList[userRoomId]);
  const roomChat = useSelector((state) => state.roomList.roomList[userRoomId].chat);
  // const isHosting = useSelector((state) => state.user.isHosting);
  const [guestUser, setGuestUser] = useState(null);
  const [msgList, setMsgList] = useState([]);
  const [isChatAtBottom, setIsChatAtBottom] = useState(true);

  const msgBoxRef = useRef(null);
  const chatInputRef = useRef(null);
  const endMsgRef = useRef(null);
  const handleKeydown = async (event) => {
    if (event.key !== "Enter") {
      return;
    }
    const text = chatInputRef.current.value;
    if (text == "") {
      return;
    }

    const msg = {
      text,
      uid: userUid,
    };

    const msgKey = await generateMsgKey(userRoomId);
    createMsg(userRoomId, msgKey, msg);
    chatInputRef.current.value = null;
  };

  useEffect(() => {
    var chat;

    if (roomChat) {
      chat = Object.keys(roomChat).map((key) => {
        var msgObj = roomChat[key];
        return (msgObj = { ...msgObj, id: key });
      });
    } else {
      chat = [];
    }

    // check if user are scroll at the bottom
    if (msgBoxRef.current.scrollTop + msgBoxRef.current.clientHeight === msgBoxRef.current.scrollHeight) {
      setIsChatAtBottom(true);
    } else {
      setIsChatAtBottom(false);
    }

    setMsgList(chat);
  }, [roomChat]);

  useEffect(() => {
    // if user scroll position are not on the bottom of chat
    // don't force them to bottom when there are new msg

    if (isChatAtBottom) {
      endMsgRef.current.scrollIntoView();
    }
  }, [msgList]);

  useEffect(() => {
    if (roomDetail.guestUid) {
      setGuestUser(roomDetail.guestUid);
    } else {
      setGuestUser(null);
    }
  }, [roomDetail]);

  return (
    <div className="flex flex-col font-mono h-[45%]">
      <div ref={msgBoxRef} className="w-full border-2 border-black h-full rounded-md overflow-y-scroll  px-2 py-4 space-y-2  ">
        {msgList.map((msg) => {
          return (
            <p key={msg.id} className={`px-4 py-1 border border-black rounded w-max max-w-[230px] sm:max-w-[350px]  whitespace-normal break-words ${msg.uid == userUid ? "ml-auto" : "mr-auto"}`}>
              {msg.text}
            </p>
          );
        })}
        <div ref={endMsgRef}></div>
      </div>
      <input
        disabled={guestUser == null ? "disabled" : ""}
        placeholder={guestUser == null ? "Please wait for another player to join the room..." : "Aa"}
        ref={chatInputRef}
        onKeyDown={() => {
          handleKeydown(event);
        }}
        className={`bg-transparent border-2 border-black rounded-md py-1 px-4 mt-1 placeholder-black placeholder-gray-500 
          ${guestUser == null ? "opacity-50 " : "opacity-100"}`}
        type="text"
      />
    </div>
  );
};

export default Chat;
