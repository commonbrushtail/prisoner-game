import logo from "../../public/assets/images/uncertainty.png";

const Logo = ({}) => {
  return (
    <div className="flex flex-col justify-center items-center pointer-events-none select-none">
      <img className="w-[250px] " src={logo.src} alt="" />
      <h1 className="text-3xl font-mono font-bold">SPLIT OR STEAL</h1>
    </div>
  );
};

export default Logo;
