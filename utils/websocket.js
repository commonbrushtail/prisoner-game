export const socketInit = () => {
  const socket = new WebSocket(`wss://tkkum8dy7d.execute-api.ap-southeast-1.amazonaws.com/production`);
  socket.onopen = (event) => {
    console.log(event);
    console.log("connect");
  };
};
