import { useSelector } from "react-redux";

const Loading = ({ children, fetchContent }) => {
  const isLoading = useSelector((state) => state.loading.isLoading);

  return (
    <div className="relative overflow-hidden">
      {isLoading == true && <div className={`absolute min-h-screen bg-white opacity-20 flex w-full flex justify-center items-center text-4xl z-50`}>LOADINGG</div>}
      {children}
    </div>
  );
};

export default Loading;
