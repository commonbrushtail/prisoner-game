import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import GameLayout from "../../components/Layout/GameLayout.component";
import { updateIsLoading } from "../../store/loading/loading.slice";
import Chat from "../../components/Chat/Chat.component";
import { updateRoomData } from "../../utils/firebase";
import { userStateKey } from "../../store/user/user.slice";
import { playerCard, flipCard, flipCardInner, flipCardFront, flipCardBack, play } from "../../styles/room.module.scss";
import usePrevious from "../../hook/usePrevious";
import { gsap } from "gsap";
const Room = () => {
  const dispatch = useDispatch();
  const isHosting = useSelector((state) => state.user.isHosting);
  const userRoomId = useSelector((state) => state.user.userRoomId);
  const roomState = useSelector((state) => state.roomList.roomList[userRoomId].roomState);
  const roomRound = useSelector((state) => state.roomList.roomList[userRoomId].roomRound);
  const playerState = isHosting ? useSelector((state) => state.roomList.roomList[userRoomId].hostState) : useSelector((state) => state.roomList.roomList[userRoomId].guestState);
  const foeState = !isHosting ? useSelector((state) => state.roomList.roomList[userRoomId].hostState) : useSelector((state) => state.roomList.roomList[userRoomId].guestState);
  const playerCountdownState = isHosting ? useSelector((state) => state.roomList.roomList[userRoomId].hostCountdown) : useSelector((state) => state.roomList.roomList[userRoomId].guestCountdown);
  const guestCountdownState = !isHosting ? useSelector((state) => state.roomList.roomList[userRoomId].hostCountdown) : useSelector((state) => state.roomList.roomList[userRoomId].guestCountdown);
  const [timer, setTimer] = useState(null);
  const [choice, setChoice] = useState(null);
  const [confirmChoice, setConfirmChoice] = useState(null);
  const userStateKey = useSelector((state) => (state.user.isHosting ? "hostState" : "guestState"));
  const userCountdownStateKey = useSelector((state) => (state.user.isHosting ? "hostCountdown" : "guestCountdown"));
  const userChoiceKey = useSelector((state) => (state.user.isHosting ? "hostChoice" : "guestChoice"));
  const foeChoiceKey = useSelector((state) => (!state.user.isHosting ? "hostChoice" : "guestChoice"));
  const userScoreKey = useSelector((state) => (state.user.isHosting ? "hostScore" : "guestScore"));
  const foeScoreKey = useSelector((state) => (!state.user.isHosting ? "hostScore" : "guestScore"));

  const foeCurrentRoundChoice = useSelector((state) => state.roomList.roomList[userRoomId][foeChoiceKey][`round${roomRound}`]);
  const UserChoiceAllRound = useSelector((state) => state.roomList.roomList[userRoomId][userChoiceKey]);
  const slideFlip = useRef();
  const slideFlipReverse = useRef;
  const prevRoomState = usePrevious(roomState);
  useEffect(() => {
    dispatch(updateIsLoading(false));
  }, []);

  useEffect(() => {
    if (playerCountdownState === "done" && guestCountdownState === "done" && roomState === "countdown") {
      const data = {};
      data[userCountdownStateKey] = "";
      data["roomState"] = "result";

      var userChoice;

      (() => {
        if (!choice && !confirmChoice) {
          setChoice("split");
          setConfirmChoice("split");
          userChoice = "split";
          return;
        }
        if (choice && !confirmChoice) {
          setConfirmChoice(choice);
          setChoice(choice);
          userChoice = choice;
          return;
        }

        if (confirmChoice) {
          userChoice = confirmChoice;
          return;
        }
      })();

      data[userChoiceKey] = { ...UserChoiceAllRound };
      data[userChoiceKey][`round${roomRound}`] = userChoice;

      updateRoomData(userRoomId, data);
      return;
    }
    if (playerCountdownState === "done" && guestCountdownState === "done" && roomState === "result") {
      const data = { roomState: "countdown" };
      data[userCountdownStateKey] = "counting";
      var nextRound;

      if (roomRound === 3) {
        nextRound = 0;
        return;
      }
      if (roomRound < 3) {
        nextRound = roomRound + 1;
        data.roomRound = nextRound;
        updateRoomData(userRoomId, data);
        setChoice(null);
        setConfirmChoice(null);
        setTimer(30);
        slideFlipReverse.current = gsap
          .timeline()
          .to(".foeCard", {
            y: "-500%",
            scale: 1.25,
          })
          .to(".foeCardInner", {
            rotationY: "0deg",
          });
        return;
      }
    }
  }, [playerCountdownState, guestCountdownState]);

  // handle when user are ready to play the first round
  useEffect(() => {
    if (playerState === "ready" && foeState === "ready" && roomState === "guest joined") {
      const data = { roomState: "countdown" };
      data[userCountdownStateKey] = "counting";
      data.roomRound = 1;
      updateRoomData(userRoomId, data);
      setTimer(30);
    }
  }, [playerState, foeState]);

  useEffect(() => {
    if (roomState === "result" && prevRoomState === "countdown") {
      slideFlip.current = gsap
        .timeline({
          onComplete: () => {},
        })
        .to(".foeCard", {
          y: "0",
          scale: 1.25,
        })
        .to(".foeCardInner", {
          rotationY: "180deg",
        });

      setTimer(15);
    }
  }, [roomState]);
  // this useeffect will handle countdown only and handle all the logic in other useEffect
  useEffect(() => {
    if (timer !== null && timer > 0) {
      setTimeout(() => setTimer(timer - 1), 1000);
    }
    if (timer === 0) {
      const data = {};
      data[userCountdownStateKey] = "done";
      updateRoomData(userRoomId, data);
    }
  }, [timer]);

  const onReadyClick = () => {
    var data = {};

    if (playerState === "ready") {
      data[userStateKey] = "not ready";
    } else {
      if (playerState === "not ready") {
        data[userStateKey] = "ready";
      }
    }

    updateRoomData(userRoomId, data);
  };

  const onCardClick = (value) => {
    if (playerCountdownState === "done") {
      return;
    }
    if (confirmChoice === null && choice === null) {
      console.log("first time");
      setChoice(value);

      return;
    }
    if (choice === "split" && confirmChoice === null && value === "split") {
      setConfirmChoice("split");
      return;
    }
    if (choice === "steal" && confirmChoice === null && value === "steal") {
      setConfirmChoice("steal");
      return;
    }
    if (choice === "split" && confirmChoice === null && value === "steal") {
      setChoice("steal");
      return;
    }
    if (choice === "steal" && confirmChoice === null && value === "split") {
      setChoice("split");
      return;
    }
    if (choice === "split" && confirmChoice === "split" && value === "steal") {
      setConfirmChoice(null);
      setChoice(value);
      return;
    }
    if (choice === "steal" && confirmChoice === "steal" && value === "split") {
      setConfirmChoice(null);
      setChoice(value);
      return;
    }
  };
  const calculateScore = (userChoice, foeChoice) => {
    if (userChoice === "split" && foeChoice === "split") {
      return 2;
    }
    if (userChoice === "split" && foeChoice === "steal") {
      return 0;
    }
    if (userChoice === "steal" && foeChoice === "steal") {
      return 0;
    }
    if (userChoice === "steal" && foeChoice === "split") {
      return 3;
    }
  };

  return (
    <div className="flex flex-col  px-4 py-4 h-screen flex flex-col justify-between">
      <div className="w-full h-[45%] border-2 border-black rounded-md  font-mono relative overflow-hidden ">
        <div className="absolute right-0 border border-black w-14 h-14 flex justify-center items-center rounded-full m-2">{timer}</div>
        {(roomState === "countdown" || roomState === "result") && (
          <div className="w-full h-full flex flex-col justify-between items-center">
            <div className={`flex  pt-[3vh] relative w-full justify-center `}>
              <div className={`${flipCard} foeCard -translate-y-[500%]  `}>
                <div className={`${flipCardInner} foeCardInner`}>
                  <div className={flipCardFront}></div>
                  <div
                    className={`${flipCardBack} flex 
                items-center justify-center cursor-pointer`}>
                    <span className="-rotate-[30deg]">
                      {foeCurrentRoundChoice === "split" && "Split"}
                      {foeCurrentRoundChoice === "steal" && "Steal"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className={`flex pb-[3vh] relative w-full justify-center`}>
              <div className={`${roomState === "result" && "opacity-0"} w-full absolute`}>
                {choice !== null && confirmChoice === null && (
                  <div className={`absolute -translate-y-[19vh]  text-center w-full ${roomState === "result" && "opacity-0"} `}>
                    Press on the card again to confirm <br />
                    <span className="">{choice}ing</span>
                  </div>
                )}
                {choice && confirmChoice && <div className="absolute -translate-y-[19vh] text-center w-full">You chose {confirmChoice}ing</div>}
                {!choice && !confirmChoice && <div className="absolute -translate-y-[19vh] text-center w-full">choose "Split" or "Steal"</div>}
              </div>

              <div className={`flex justify-between ${!choice && "space-x-4"}`}>
                <div
                  onClick={() => {
                    onCardClick("split");
                  }}
                  className={`${playerCard} 
                ${!choice && "hover:-translate-y-[10%]"}
                ${choice === "split" && roomState === "countdown" && "translate-x-[50%] -translate-y-[75%] "}
                ${choice === "steal" && roomState === "countdown" && " translate-y-[50%] "}
                ${choice === "split" && roomState === "result" && "translate-x-[50%] -translate-y-[0%] scale-125 "}
                ${choice === "steal" && roomState === "result" && " translate-y-[200%] "}
                `}>
                  <span className="-rotate-[30deg]">Split</span>
                </div>

                <div
                  onClick={() => {
                    onCardClick("steal");
                  }}
                  className={`${playerCard} 
                ${!choice && "hover:-translate-y-[10%]"}
                ${choice === "split" && roomState === "countdown" && " translate-y-[50%]"}
                 ${choice === "steal" && roomState === "countdown" && "-translate-x-[50%] -translate-y-[75%] "}
                 ${choice === "split" && roomState === "result" && " translate-y-[200%]"}
                 ${choice === "steal" && roomState === "result" && "-translate-x-[50%] -translate-y-[0%] scale-125 "}
                 `}>
                  <span className="-rotate-[30deg]">Steal</span>
                </div>
              </div>
            </div>
          </div>
        )}
        {roomState === "guest joined" && (
          <div className="w-full h-full flex flex-col justify-between items-center ">
            <div className="w-full h-[50%] flex justify-center items-center">
              <div className="">
                {foeState === "not join" && "Wating for another player to join"}
                {foeState === "not ready" && "Another player is not ready"} {foeState === "ready" && "Another player is ready"}
              </div>
            </div>
            <div className="w-full h-[50%] flex flex-col items-center justify-center">
              <button
                onClick={() => {
                  onReadyClick();
                }}
                className="border-2 border-black rounded-full transition-all p-6 w-[80px] h-[80px] flex justify-center items-center">
                {playerState === "not ready" && "Ready"}
                {playerState === "ready" && "Cancel"}
              </button>
              <div className="mt-2">{"Press ready to play"}</div>
            </div>
          </div>
        )}

        {roomState === "init" && (
          <div className="w-full h-full flex flex-col justify-between items-center ">
            <div className="w-full h-full flex justify-center items-center">
              <div className="w-full h-full flex justify-center items-center text-center">{foeState === "not join" && "Wating for another player to join"}</div>
            </div>
          </div>
        )}
      </div>
      <div className="h-[10%] flex flex-col justify-center items-center w-full font-mono">
        <div>Opponent Score: 5 </div>
        <div>Your Score:5</div>
      </div>
      <Chat></Chat>
    </div>
  );
};

export default Room;

Room.Layout = GameLayout;
