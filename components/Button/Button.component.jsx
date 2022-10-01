const Button = ({ children, handleClick, className }) => {
  return (
    <button className={`font-mono text-xl font-bold w-[280px] py-2 border border-black border-2 rounded-lg ${className}`} onClick={() => handleClick()}>
      {children}
    </button>
  );
};

export default Button;
