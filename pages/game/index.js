import { useEffect } from "react";
import GameLayout from "../../components/Layout/GameLayout.component";
import Link from "next/link";
const Game = ({ Component, children }) => {
  return (
    <div className="">
      <Link href="/game/lobby" replace>
        asd
      </Link>
    </div>
  );
};

export default Game;

Game.Layout = GameLayout;
