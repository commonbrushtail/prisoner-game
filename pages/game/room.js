import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import GameLayout from "../../components/Layout/GameLayout.component";
import { updateIsLoading } from "../../store/loading/loading.slice";

const Room = () => {
  const dispatch = useDispatch();
  const userUid = useSelector((state) => state.user.user.uid);
  const chatInput = useRef(null);
  const handleKeydown = (event) => {
    if (event.key !== "Enter") {
      return;
    }

    const text = chatInput.current.value;
    chatInput.current.value = null;
  };

  useEffect(() => {
    dispatch(updateIsLoading(false));
  }, []);
  return (
    <div className="flex flex-col px-4 py-4">
      <div className="flex flex-col">
        <div className="w-full border-2 border-black h-[400px] rounded-md "></div>
        <input
          ref={chatInput}
          onKeyDown={() => {
            handleKeydown(event);
          }}
          className="bg-transparent border-2 border-black rounded-md py-1 px-2 mt-1"
          type="text"
        />
      </div>
    </div>
  );
};

export default Room;

Room.Layout = GameLayout;
