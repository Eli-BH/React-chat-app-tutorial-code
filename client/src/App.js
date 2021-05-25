import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import "./App.css";

const App = () => {
  //set the port that we connect to
  const socket = useRef();
  const ioPort = "localhost:3001";

  const [loggedIn, setLoggedIn] = useState(false);
  const [messageList, setMessageList] = useState([]);
  const [room, setRoom] = useState([]);
  const [username, setUsername] = useState("");
  const [onlineList, setOnlineList] = useState([]);

  const message = useRef();
  const scrollRef = useRef();

  useEffect(() => {
    socket.current = io(ioPort);
  }, [ioPort]);

  useEffect(() => {
    socket.current.on("receiveMessage", (data) => {
      setMessageList([...messageList, data]);
    });
  });

  useEffect(() => {
    scrollRef?.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList]);

  useEffect(() => {
    socket.current.on("receiveMessage", (data) => {
      setMessageList([...messageList, data]);
    });

    return () => {
      socket.current.off("receiveMessage");
    };
  }, [messageList]);

  useEffect(() => {
    socket.current.on("sendList", (data) => {
      setOnlineList(data[room]);
    });
  });

  const handleEnterRoom = (e) => {
    e.preventDefault();
    const currentUser = {
      username,
      room,
    };
    socket.current.emit("enterRoom", currentUser);
    setLoggedIn((prev) => (prev = !prev));
  };

  const sendMessage = (e) => {
    e.preventDefault();
    let newMessage = {
      room,
      content: {
        username,
        text: message.current.value,
      },
    };

    socket.current.emit("sendMessage", newMessage);
    setMessageList([...messageList, newMessage.content]);
    message.current.value = "";
  };

  console.log(messageList);

  return (
    <div className="App">
      {loggedIn ? (
        <div className="chatPage">
          <h1 className="heading">{`Welcome to the ${room} room ${username}`}</h1>
          <div className="chatWrapper">
            <div className="chatOnline">
              {onlineList?.map((item, index) => (
                <div className="name" key={index}>
                  <p>{item.username}</p>
                </div>
              ))}
            </div>

            <div className="chatContainer">
              <div className="chatBox">
                {messageList.map((item, index) => (
                  <div
                    ref={scrollRef}
                    className={
                      username === item.username
                        ? "messageBubble right"
                        : "messageBubble"
                    }
                    key={index}
                  >
                    <p id="itemText">{item.text}</p>
                    <p id="itemAuthor">
                      <small>
                        <i>{item.username}</i>
                      </small>
                    </p>
                  </div>
                ))}
              </div>

              <form onSubmit={sendMessage} className="chatInput">
                <input type="text" placeholder="type message" ref={message} />
                <button type="submit">Send</button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="form">
          <div className="formWrapper">
            <form className="loginForm" onSubmit={handleEnterRoom}>
              <input
                className="formInput"
                type="text"
                placeholder="username"
                onChange={(e) => setUsername(e.target.value)}
                required
              />

              <input
                className="formInput"
                type="text"
                placeholder="Room Name"
                onChange={(e) => setRoom(e.target.value)}
                required
              />

              <button className="formBtn" type="submit">
                Enter Room
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
