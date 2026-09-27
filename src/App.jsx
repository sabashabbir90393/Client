import { useEffect, useRef, useState } from "react";
import ChatRoom from "./components/ChatRoom";
import "./App.css";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5050";

function App() {
  const [joined, setJoined] = useState(false);

  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");

  // Socket ko stable rakhne ke liye
  const socketRef = useRef(null);

  useEffect(() => {
    // Socket connection
    const socketInstance = io(SOCKET_URL);

    // Ref mein current socket save
    socketRef.current = socketInstance;

    socketInstance.on("connect", () => {
      console.log("Connected to server:", socketInstance.id);
    });

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    // Cleanup mein EXACT isi socket ko disconnect karo
    return () => {
      socketInstance.disconnect();

      if (socketRef.current === socketInstance) {
        socketRef.current = null;
      }
    };
  }, []);

  const handleLeave = () => {
    const socket = socketRef.current;

    if (socket && room) {
      socket.emit("leave", room);
    }

    setUsername("");
    setRoom("");
    setJoined(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const socket = socketRef.current;

    if (!socket) {
      alert("Socket is not connected. Please try again.");
      return;
    }

    if (!socket.connected) {
      alert("Connecting to server. Please try again in a moment.");
      return;
    }

    if (!username.trim() || !room.trim()) {
      return;
    }

    // Room join
    socket.emit("join", room.trim());

    console.log("Joined room:", room.trim());

    setJoined(true);
  };

  return (
    <>
      {joined === false ? (
        <div className="fixed inset-0 w-full h-screen overflow-hidden bg-[#efeae2] text-[#111b21]">

          {/* TOP GREEN HEADER */}
          <nav className="h-[68px] bg-[#075E54] text-white flex items-center justify-between px-5 sm:px-8 lg:px-12 shadow-md">

            {/* Logo */}
            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center shadow-sm">
                <svg
                  width="23"
                  height="23"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 8.5 8.5 0 0 1-4-.98L3 20l1.1-4.7A8.5 8.5 0 1 1 21 11.5Z" />
                  <path d="M8 10s1 3 4 4c.8.4 1.5.5 2 .5" />
                </svg>
              </div>

              <div>
                <h1 className="font-semibold text-[17px]">
                  ChatConnect
                </h1>

                <p className="text-[11px] text-white/70">
                  Real-time messaging
                </p>
              </div>

            </div>

            {/* Online */}
            <div className="flex items-center gap-2 text-sm text-white/90">
              <span className="w-2.5 h-2.5 rounded-full bg-[#25D366]"></span>
              Online
            </div>

          </nav>


          {/* MAIN */}
          <main className="h-[calc(100vh-68px)] overflow-y-auto flex items-center">

            <div className="w-full max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 py-8">

              <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">


                {/* LEFT SIDE */}
                <div className="hidden lg:block">

                  <div className="inline-flex items-center gap-2 bg-[#d9fdd3] text-[#075E54] px-4 py-2 rounded-full text-xs font-semibold mb-5">
                    <span className="w-2 h-2 rounded-full bg-[#25D366]"></span>
                    Real-time chat
                  </div>

                  <h2 className="text-5xl xl:text-6xl font-bold leading-[1.08] tracking-tight text-[#111b21]">

                    Connect.
                    <br />

                    <span className="text-[#075E54]">
                      Chat.
                    </span>

                    <br />

                    Enjoy. 💬

                  </h2>

                  <p className="mt-5 text-lg text-[#54656f] leading-relaxed max-w-lg">
                    Join a chat room and start talking instantly.
                    Simple, fast and real-time communication.
                  </p>


                  {/* Features */}
                  <div className="flex gap-8 mt-8">

                    {/* Live Chat */}
                    <div className="flex items-center gap-2.5">

                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#075E54]">
                        💬
                      </div>

                      <div>
                        <p className="text-sm font-semibold">
                          Live Chat
                        </p>

                        <p className="text-[11px] text-[#667781]">
                          Instant messages
                        </p>
                      </div>

                    </div>


                    {/* Groups */}
                    <div className="flex items-center gap-2.5">

                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#075E54]">
                        👥
                      </div>

                      <div>
                        <p className="text-sm font-semibold">
                          Groups
                        </p>

                        <p className="text-[11px] text-[#667781]">
                          Join any room
                        </p>
                      </div>

                    </div>


                    {/* Fast */}
                    <div className="flex items-center gap-2.5">

                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#075E54]">
                        ⚡
                      </div>

                      <div>
                        <p className="text-sm font-semibold">
                          Fast
                        </p>

                        <p className="text-[11px] text-[#667781]">
                          Real-time
                        </p>
                      </div>

                    </div>

                  </div>

                </div>


                {/* RIGHT JOIN CARD */}
                <div className="flex justify-center lg:justify-end">

                  <div className="w-full max-w-md">

                    {/* Mobile logo */}
                    <div className="lg:hidden flex justify-center mb-5">

                      <div className="w-16 h-16 rounded-full bg-[#075E54] flex items-center justify-center shadow-lg">

                        <svg
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 8.5 8.5 0 0 1-4-.98L3 20l1.1-4.7A8.5 8.5 0 1 1 21 11.5Z" />
                        </svg>

                      </div>

                    </div>


                    {/* Card */}
                    <div className="bg-white rounded-2xl shadow-xl border border-black/[0.04] p-6 sm:p-8">

                      <div className="text-center mb-7">

                        <p className="text-[#075E54] font-bold text-xs tracking-widest mb-2">
                          WELCOME
                        </p>

                        <h3 className="text-3xl font-bold text-[#111b21]">
                          Join a Chat
                        </h3>

                        <p className="text-sm text-[#667781] mt-2">
                          Enter your details to join the conversation.
                        </p>

                      </div>


                      <form
                        className="space-y-5"
                        onSubmit={handleSubmit}
                      >

                        {/* Username */}
                        <div>

                          <label className="block text-sm font-semibold text-[#3b4a54] mb-2">
                            Username
                          </label>

                          <div className="relative">

                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#667781]">
                              👤
                            </span>

                            <input
                              type="text"
                              placeholder="Enter your username"
                              value={username}
                              onChange={(e) =>
                                setUsername(e.target.value)
                              }
                              required
                              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#f0f2f5] border border-transparent text-[#111b21] placeholder-[#8696a0] outline-none focus:bg-white focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/15 transition"
                            />

                          </div>

                        </div>


                        {/* Room */}
                        <div>

                          <label className="block text-sm font-semibold text-[#3b4a54] mb-2">
                            Chat Room
                          </label>

                          <div className="relative">

                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#667781]">
                              #️⃣
                            </span>

                            <input
                              type="text"
                              placeholder="Enter room name"
                              value={room}
                              onChange={(e) =>
                                setRoom(e.target.value)
                              }
                              required
                              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#f0f2f5] border border-transparent text-[#111b21] placeholder-[#8696a0] outline-none focus:bg-white focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/15 transition"
                            />

                          </div>

                        </div>


                        {/* Join Button */}
                        <button
                          type="submit"
                          className="w-full py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                        >
                          Join Chat
                          <span className="ml-2">→</span>
                        </button>

                      </form>


                      {/* Bottom */}
                      <div className="flex items-center justify-center gap-2 mt-6 text-xs text-[#8696a0]">

                        <span className="text-[#25D366]">
                          ●
                        </span>

                        Connected through Socket.IO

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </main>

        </div>
      ) : (
        <ChatRoom
          username={username}
          room={room}
          socket={socketRef.current}
          onLeave={handleLeave}
        />
      )}
    </>
  );
}

export default App;