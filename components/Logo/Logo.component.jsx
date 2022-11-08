import logo from "../../public/assets/images/uncertainty.png";
import Image from "next/image";
const Logo = ({}) => {
  return (
    <div className="flex flex-col justify-center items-center pointer-events-none select-none">
      <div className="w-[250px] h-[250px] relative ">
        <Image layout="fill" src={logo.src} alt="" objectFit="contain" />
      </div>
      <h1 className="text-3xl font-mono font-bold">SPLIT OR STEAL</h1>
    </div>
  );
};

export default Logo;
