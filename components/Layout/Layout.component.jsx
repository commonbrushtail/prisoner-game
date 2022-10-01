import { useSelector } from "react-redux";

const Layout = ({ children, fetchContent }) => {
  const isLoading = useSelector((state) => state.loading.isLoading);
  return (
    <div className="relative">
      {isLoading && <div className={`absolute min-h-screen bg-white opacity-20 flex w-full flex justify-center items-center text-4xl`}>LOADINGG</div>}
      {children}
    </div>
  );
};

export default Layout;
