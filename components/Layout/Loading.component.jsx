import { useSelector } from "react-redux";

const Loading = ({ children, fetchContent }) => {
  const isLoading = useSelector((state) => state.loading.isLoading);

  return (
    <div className="relative overflow-hidden">
      {isLoading && (
        <div className={`absolute min-h-screen h-full bg-white bg-opacity-50 flex w-full flex justify-center items-center text-4xl z-50`}>
          <div className="lds-circle w-[120px] h-[180px] -rotate-[25deg] ">
            <div className="circleInner font-mono rounded-md">
              <div className="circleFront flex justify-center items-center ">
                <span className="rotate-45">Split</span>
              </div>
              <div className="circleBack flex justify-center items-center ">
                <span className="-rotate-45">Steal</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

export default Loading;
