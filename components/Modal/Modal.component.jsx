const Modal = ({ children, handleModalClose, modalClass }) => {
  const handleClick = (e) => {
    e.currentTarget.getAttribute("id") === "modalBg" && handleModalClose();
  };
  return (
    <>
      <div
        id="modalBg"
        onClick={(e) => {
          handleClick(e);
        }}
        className={`bg-black w-screen h-screen absolute bg-opacity-30 flex justify-center items-center`}></div>
      <div className={`bg-yellow-300 border-black border-2 rounded-lg absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 ${modalClass}`}>{children}</div>
    </>
  );
};

export default Modal;
