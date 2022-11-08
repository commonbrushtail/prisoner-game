import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { onValue, ref, onDisconnect } from "firebase/database";
import { increment } from "firebase/firestore";
import GameLayout from "../../components/Layout/GameLayout.component";
import { updateIsLoading } from "../../store/loading/loading.slice";
import Chat from "../../components/Chat/Chat.component";
import Modal from "../../components/Modal/Modal.component";
import { updateRoomData, roomRef, deleteRoom, resetRoomStateObject, updateOnlineUser, updateUserFirestore, anotherRoundStateObject } from "../../utils/firebase";
import { updateIsClosingRoom, updateIsHosting, updateIsInRoom, updateUserIsLeavingRoom, updateUserRoomId, userStateKey } from "../../store/user/user.slice";
import { playerCard, flipCard, flipCardInner, flipCardFront, flipCardBack, play } from "../../styles/room.module.scss";
import usePrevious from "../../hook/usePrevious";
import { gsap } from "gsap";
import { useRouter } from "next/router";
import Alert from "../../components/Alert/Alert.component";
const Room = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const isHosting = useSelector((state) => state.user.isHosting);
  const userUid = useSelector((state) => state.user.user.uid);
  const userRoomId = useSelector((state) => state.user.userRoomId);
  const roomState = useSelector((state) => state.roomList.roomList[userRoomId].roomState);
  const roomRound = useSelector((state) => state.roomList.roomList[userRoomId].roomRound);
  const playerState = useSelector((state) => {
    return isHosting ? state.roomList.roomList[userRoomId].hostState : state.roomList.roomList[userRoomId].guestState;
  });
  const foeState = useSelector((state) => {
    return !isHosting ? state.roomList.roomList[userRoomId].hostState : state.roomList.roomList[userRoomId].guestState;
  });
  const playerCountdownState = useSelector((state) => {
    return isHosting ? state.roomList.roomList[userRoomId].hostCountdown : state.roomList.roomList[userRoomId].guestCountdown;
  });

  const guestCountdownState = useSelector((state) => {
    return !isHosting ? state.roomList.roomList[userRoomId].hostCountdown : state.roomList.roomList[userRoomId].guestCountdown;
  });

  const [timer, setTimer] = useState(null);
  const [choice, setChoice] = useState(null);
  const [roundResultMsg, setRoundResultMsg] = useState(null);
  const [roundScore, setRoundScore] = useState(null);
  const [confirmChoice, setConfirmChoice] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const userStateKey = useSelector((state) => (state.user.isHosting ? "hostState" : "guestState"));
  const userCountdownStateKey = useSelector((state) => (state.user.isHosting ? "hostCountdown" : "guestCountdown"));
  const userChoiceKey = useSelector((state) => (state.user.isHosting ? "hostChoice" : "guestChoice"));
  const foeChoiceKey = useSelector((state) => (!state.user.isHosting ? "hostChoice" : "guestChoice"));
  const userScoreKey = useSelector((state) => (state.user.isHosting ? "hostScore" : "guestScore"));
  const foeScoreKey = useSelector((state) => (!state.user.isHosting ? "hostScore" : "guestScore"));
  const userScore = useSelector((state) => state.roomList.roomList[userRoomId][userScoreKey]);
  const foeScore = useSelector((state) => state.roomList.roomList[userRoomId][foeScoreKey]);
  const foeCurrentRoundChoice = useSelector((state) => state.roomList.roomList[userRoomId][foeChoiceKey][`round${roomRound}`]);
  const UserChoiceAllRound = useSelector((state) => state.roomList.roomList[userRoomId][userChoiceKey]);
  const userRecordSplit = useSelector((state) => state.user.user.split);
  const userRecordSteal = useSelector((state) => state.user.user.steal);
  const userRecordWin = useSelector((state) => state.user.user.win);

  const foeChoiceAllRound = useSelector((state) => state.roomList.roomList[userRoomId][foeChoiceKey]);
  const [alertGuestLeavingOpen, setAlertGuestLeavingOpen] = useState(false);
  const [alertHostLeavingOpen, setAlertHostLeavingOpen] = useState(false);
  const slideFlip = useRef();
  const slideFlipReverse = useRef;
  const prevRoomState = usePrevious(roomState);
  const timerRef = useRef();
  const [playAgainButtonClick, setPlayAgainButtonClick] = useState(false);
  const hostLeaving = useSelector((state) => state.roomList.roomList[userRoomId].hostLeaving);
  const guestLeaving = useSelector((state) => state.roomList.roomList[userRoomId].guestLeaving);
  const hostInRoom = useSelector((state) => state.roomList.roomList[userRoomId].hostInRoom);
  const guestInRoom = useSelector((state) => state.roomList.roomList[userRoomId].guestInRoom);
  const userIsLeavingRoom = useSelector((state) => state.user.userIsLeavingRoom);
  const guestUid = useSelector((state) => state.roomList.roomList[userRoomId].guestUid);
  var test;
  const onPlayAgainClick = () => {
    setPlayAgainButtonClick(true);
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
  const calculateRoundMsg = (userChoice, foeChoice) => {
    if (userChoice === "split" && foeChoice === "split") {
      return "You both choose split";
    }
    if (userChoice === "split" && foeChoice === "steal") {
      return "Your opponent steal all the points ";
    }
    if (userChoice === "steal" && foeChoice === "steal") {
      return "Both of you earn nothing";
    }
    if (userChoice === "steal" && foeChoice === "split") {
      return "You steal all your opponent points";
    }
  };

  useEffect(() => {
    dispatch(updateIsLoading(false));
    if (isHosting) {
      onDisconnect(roomRef(userRoomId)).update({
        hostLeaving: true,
      });
    } else {
      onDisconnect(roomRef(userRoomId)).update({
        guestLeaving: true,
      });
    }
  }, []);

  const onLeaveConfirm = () => {
    dispatch(updateUserIsLeavingRoom(true));
    // if there is no user in room
    if (isHosting && !guestInRoom) {
      const data = { roomClosing: true };
      updateRoomData(userRoomId, data);
      //onDisconnect(roomRef(userRoomId)).cancel();
    }
    // if you are the host and there a guest
    if (isHosting && guestInRoom) {
      const data = { hostLeaving: true, hostInRoom: false };
      updateRoomData(userRoomId, data);
    }

    // if you are a guest
    if (!isHosting) {
      const data = { guestLeaving: true, guestInRoom: false, guestEmail: "", guestUid: "" };
      updateRoomData(userRoomId, data);
      //onDisconnect(roomRef(userRoomId)).cancel();
    }

    router.replace({ pathname: "/game/lobby" }, "/");
  };

  useEffect(() => {
    if (playerCountdownState === "done" && guestCountdownState === "done" && roomState === "countdown") {
      const data = {};
      data[userCountdownStateKey] = "";
      data["roomState"] = "showdown";

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
      if (roomRound < 3) {
        const data = { roomState: "countdown" };
        data[userCountdownStateKey] = "counting";
        var nextRound = roomRound + 1;
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

      if (roomRound === 3) {
        var UserChoiceAllRoundArray = Object.keys(UserChoiceAllRound).map((key) => {
          return UserChoiceAllRound[key];
        });
        const countChoice = {};

        UserChoiceAllRoundArray.forEach(function (x) {
          countChoice[x] = (countChoice[x] || 0) + 1;
        });

        var win = userScore === foeScore || userScore < foeScore ? 0 : 1;
        console.log(countChoice.split);
        console.log(countChoice.steal);
        updateUserFirestore(userUid, {
          split: increment(countChoice.split ? countChoice.split : 0),
          steal: increment(countChoice.steal ? countChoice.steal : 0),
          win: increment(win),
        });

        const data = { roomState: "game result" };
        data[userCountdownStateKey] = "";
        data.roomRound = 0;
        setTimer(10);
        updateRoomData(userRoomId, data);
        setChoice(null);
        setConfirmChoice(null);
        return;
      }
    }
    if (playerCountdownState === "done" && guestCountdownState === "done" && roomState === "game result") {
      //updateRoomData(userRoomId, data);
      if (isHosting) {
        updateRoomData(userRoomId, anotherRoundStateObject());
      }
      setChoice(null);
      setConfirmChoice(null);
      return;
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
    if (roomState === "showdown" && foeCurrentRoundChoice !== "") {
      slideFlip.current = gsap
        .timeline({
          onComplete: () => {
            const data = { roomState: "result" };
            const score = calculateScore(confirmChoice, foeCurrentRoundChoice);
            data[userScoreKey] = userScore + score;
            updateRoomData(userRoomId, data);
            setRoundResultMsg(calculateRoundMsg(confirmChoice, foeCurrentRoundChoice));
            setRoundScore(score);
            if (roomRound === 3) {
              setTimer(5);
            } else {
              setTimer(15);
            }
          },
        })
        .to(".foeCard", {
          y: "0",
          scale: 1.25,
        })
        .to(".foeCardInner", {
          rotationY: "180deg",
        });
    }
  }, [roomState, foeCurrentRoundChoice]);
  // this useeffect will handle countdown only and handle all the logic in other useEffect
  useEffect(() => {
    if (timer !== null && timer > 0) {
      timerRef = setTimeout(() => setTimer(timer - 1), 1000);
    }
    if (timer === 0) {
      const data = {};
      data[userCountdownStateKey] = "done";
      updateRoomData(userRoomId, data);
    }
  }, [timer]);

  useEffect(() => {
    if (hostLeaving) {
      setAlertHostLeavingOpen(true);
    }

    if (guestLeaving) {
      setChoice(null);
      setTimer(null);

      setConfirmChoice(null);
      setAlertGuestLeavingOpen(true);
    }
  }, [hostLeaving, guestLeaving, guestInRoom]);

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
  const onLeaveButtonClick = () => {
    setModalOpen(true);
  };
  const handleModalClose = () => {
    setModalOpen(false);
  };
  const handleAlertClose = () => {
    setAlertGuestLeavingOpen(false);
  };

  const onConfirmGuestLeft = () => {
    clearInterval(timerRef);
    setTimer(null);
    updateRoomData(userRoomId, resetRoomStateObject());
    setAlertGuestLeavingOpen(false);
  };

  const onConfirmHostLeft = () => {
    dispatch(updateIsClosingRoom(true));
    const data = {
      roomClosing: true,
      guestLeaving: true,
      guestInRoom: false,
    };
    updateRoomData(userRoomId, data);

    router.replace({ pathname: "/game/lobby" }, "/");
  };

  return (
    <>
      {alertGuestLeavingOpen && guestLeaving && roomState !== "init" && !userIsLeavingRoom && (
        <Alert alertClass="px-4 py-6  top-[45%] w-[300px]">
          <div className="w-full h-full font-mono flex flex-col">
            <div>
              <div className="text-xl font-semibold text-center ">Your opponent has left the match</div>
              <div className="space-x-4 mt-10 w-full flex justify-center">
                <button
                  onClick={() => {
                    onConfirmGuestLeft();
                  }}
                  className="border border-black px-6  py-1 rounded-md">
                  Ok
                </button>
              </div>
            </div>
          </div>
        </Alert>
      )}
      {alertHostLeavingOpen && !userIsLeavingRoom && (
        <Alert alertClass="px-4 py-6  top-[45%] w-[300px]">
          <div className="w-full h-full font-mono flex flex-col">
            {hostLeaving && (
              <div>
                <div className="text-xl font-semibold text-center ">The host has left the match, Returning to lobby</div>
                <div className="space-x-4 mt-10 w-full flex justify-center">
                  <button
                    onClick={() => {
                      onConfirmHostLeft();
                    }}
                    className="border border-black px-6  py-1 rounded-md">
                    Ok
                  </button>
                </div>
              </div>
            )}
          </div>
        </Alert>
      )}
      {modalOpen && (
        <Modal
          modalClass="px-4 py-6  top-[45%] w-[250px]"
          handleModalClose={() => {
            handleModalClose();
          }}>
          <div className="w-full h-full font-mono flex flex-col">
            <div className="text-xl font-semibold text-center">Leaving?</div>
            <div className="space-x-4 mt-10 w-full flex justify-center">
              <button
                onClick={() => {
                  onLeaveConfirm();
                }}
                className="border border-black px-2  py-1 rounded-md">
                Confirm
              </button>
              <button
                className="border border-black px-2 py-1 rounded-md"
                onClick={() => {
                  setModalOpen(false);
                }}>
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
      <div className="flex flex-col  px-4 py-4 h-screen flex flex-col justify-between">
        <div className="w-full h-[45%] border-2 border-black rounded-md  font-mono relative overflow-hidden ">
          <div className="absolute right-0 border border-black w-14 h-14 flex justify-center items-center rounded-full m-2">{timer}</div>
          <button
            className="absolute left-3 top-3 border border-black px-4 py-1 rounded z-20"
            onClick={() => {
              onLeaveButtonClick();
            }}>
            Leave
          </button>
          {(roomState === "countdown" || roomState === "result" || roomState === "showdown") && (
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

              <div className="z-10">
                {roomState === "result" && (
                  <div className="bg-yellow-300 z-10">
                    <div className="text-center">{roundResultMsg}</div>
                    <div className="text-center">
                      you got {roundScore} point<span className={roundScore > 1 ? "inline" : "hidden"}>s</span>
                    </div>
                  </div>
                )}
              </div>

              <div className={`flex pb-[3vh] relative w-full justify-center`}>
                <div className={`${(roomState === "result" || roomState === "showdown") && "opacity-0"} w-full absolute`}>
                  {choice !== null && confirmChoice === null && (
                    <div className={`absolute -translate-y-[19vh]  text-center w-full ${(roomState === "result" || roomState === "showdown") && "opacity-0"} `}>
                      Press on the card again to confirm <br />
                      <span className="">{choice}ing</span>
                    </div>
                  )}
                  {choice && confirmChoice && <div className="absolute -translate-y-[19vh] text-center w-full">You chose {confirmChoice}ing</div>}
                  {!choice && !confirmChoice && <div className="absolute -translate-y-[19vh] text-center w-full">choose &quot;Split&quot; or &quot;Steal&quot;</div>}
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
                ${choice === "split" && (roomState === "result" || roomState === "showdown") && "translate-x-[50%] -translate-y-[0%] scale-125 "}
                ${choice === "steal" && (roomState === "result" || roomState === "showdown") && " translate-y-[200%] "}
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
                 ${choice === "split" && (roomState === "result" || roomState === "showdown") && " translate-y-[200%]"}
                 ${choice === "steal" && (roomState === "result" || roomState === "showdown") && "-translate-x-[50%] -translate-y-[0%] scale-125 "}
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
                <div className="w-full h-full flex justify-center items-center text-center">Wating for another player to join</div>
              </div>
            </div>
          )}

          {roomState === "game result" && (
            <div className="w-full h-full flex flex-col justify-between items-center ">
              <div className="w-full h-full flex justify-center items-center">
                <div className="w-full h-full flex flex-col justify-center items-center text-center">
                  <div className="text-3xl font-bold">
                    {userScore === foeScore && "Draw"}
                    {userScore < foeScore && "You Lose"}
                    {userScore > foeScore && "You Win"}
                  </div>
                  <div className="w-full space-x-4 mt-10">Another round will begin shortly...</div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="h-[10%] flex flex-col justify-center items-center w-full font-mono">
          <div>Opponent Score: {foeScore} </div>
          <div>Your Score: {userScore}</div>
        </div>
        <Chat></Chat>
      </div>
    </>
  );
};

export default Room;

Room.Layout = GameLayout;
