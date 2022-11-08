const Alert = ({ children, handleAlertClose, alertClass }) => {
  return (
    <>
      <div className={`bg-black w-screen min-h-screen h-full absolute bg-opacity-30 flex justify-center items-center z-30`}></div>
      <div className={`bg-yellow-300 border-black border-2 rounded-lg absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40 ${alertClass}`}>{children}</div>
    </>
  );
};

export default Alert;
