import { useSelector } from "react-redux/es/exports";
const OnlineList = ({ children, handleClick, className }) => {
  const online = useSelector((state) => state.online.online);

  var onlineArray = Object.keys(online).map((key) => {
    return online[key];
  });

  return (
    <>
      <div className="font-mono">Online User</div>
      <div className="w-full border-2 border-black p-4 rounded-lg h-[100px] overflow-y-auto font-mono ">
        {onlineArray.map((user, index) => {
          return <div key={index}>{user.email}</div>;
        })}
      </div>
    </>
  );
};

export default OnlineList;
