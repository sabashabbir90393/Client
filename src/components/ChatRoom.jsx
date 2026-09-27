import { useEffect, useRef, useState } from "react";

function ChatRoom({ username, room, socketRef, onLeave }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const emojis = [
    "😀", "😂", "😍", "🥰", "😊",
    "😎", "🤔", "😢", "😡", "❤️",
    "👍", "👏", "🔥", "🎉", "🙏",
    "😴", "🤣", "😘", "💯", "✨",
  ];

  // Receive messages
  useEffect(() => {
    const socket = socketRef.current;

    if (!socket) return;

    const handleMessage = (data) => {
      console.log("Message received:", data);

      setMessages((prev) => [
        ...prev,
        {
          ...data,
          receivedAt: Date.now(),
        },
      ]);
    };

    socket.on("message", handleMessage);

    return () => {
      socket.off("message", handleMessage);
    };
  }, [socketRef]);

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // Time

  const formatTime = (time) => {
  if (!time) return "";

  return new Date(time).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};
  /* const formatTime = (time) => {
    return new Date(time || Date.now()).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }; */

  // Send text
  const handleSend = () => {
    const socket = socketRef.current;
    const trimmedMessage = message.trim();

    if (!trimmedMessage || !socket) return;

    const newMessage = {
      username,
      room,
      text: trimmedMessage,
      type: "text",
      time: new Date().toISOString(),
    };

    socket.emit("send", newMessage);

    setMessages((prev) => [...prev, newMessage]);

    setMessage("");
    setShowEmoji(false);
  };

  // Enter to send
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Emoji
  const addEmoji = (emoji) => {
    setMessage((prev) => prev + emoji);
  };

  // Attachment
  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  // File selected
  const handleFileChange = (e) => {
    const socket = socketRef.current;
    const file = e.target.files?.[0];

    if (!file || !socket) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File size should be less than 2 MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const fileMessage = {
        username,
        room,
        text: file.name,
        type: file.type.startsWith("image/") ? "image" : "file",
        fileName: file.name,
        fileType: file.type,
        fileData: reader.result,
        time: new Date().toISOString(),
      };

      socket.emit("send", fileMessage);

      setMessages((prev) => [...prev, fileMessage]);
    };

    reader.readAsDataURL(file);

    e.target.value = "";
  };

  // Clear chat
  const clearChat = () => {
    setMessages([]);
    setShowMenu(false);
  };

  // Search
  const filteredMessages = messages.filter((msg) => {
    if (!searchText.trim()) return true;

    const search = searchText.toLowerCase();

    return (
      msg.text?.toLowerCase().includes(search) ||
      msg.username?.toLowerCase().includes(search) ||
      msg.fileName?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="fixed inset-0 w-full h-screen bg-[#efeae2] overflow-hidden">

      <div className="w-full h-full flex flex-col bg-[#efeae2]">

        {/* HEADER */}
        <header className="h-[64px] shrink-0 bg-[#075E54] text-white flex items-center px-3 sm:px-5 shadow-md relative z-30">

          {/* Leave */}
          <button
            onClick={onLeave}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition text-[25px]"
            title="Leave room"
          >
            ‹
          </button>

          {/* Avatar */}
          <div className="ml-1 sm:ml-2 w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white font-semibold text-lg shrink-0">
            {username?.charAt(0)?.toUpperCase() || "U"}
          </div>

          {/* User info */}
          <div className="ml-3 min-w-0 flex-1">
            <h2 className="font-medium text-[16px] truncate">
              {username || "User"}
            </h2>

            <p className="text-[12px] text-white/75 truncate">
              {room}
            </p>
          </div>

          {/* Search */}
          <button
            onClick={() => {
              setShowSearch((prev) => !prev);
              setShowMenu(false);
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition"
            title="Search"
          >
            <svg
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
          </button>

          {/* Menu */}
          <button
            onClick={() => {
              setShowMenu((prev) => !prev);
              setShowSearch(false);
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition"
            title="Menu"
          >
            <span className="text-[25px] leading-none">⋮</span>
          </button>

          {/* Menu dropdown */}
          {showMenu && (
            <div className="absolute right-3 top-[58px] w-48 bg-white text-gray-800 rounded-md shadow-xl overflow-hidden border border-gray-100">

              <button
                onClick={clearChat}
                className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100 transition"
              >
                🗑️ Clear chat
              </button>

              <button
                onClick={() => {
                  setShowMenu(false);
                  onLeave();
                }}
                className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100 transition"
              >
                🚪 Leave room
              </button>

            </div>
          )}
        </header>

        {/* SEARCH */}
        {showSearch && (
          <div className="shrink-0 bg-[#f0f2f5] px-3 py-2 border-b border-gray-200">

            <div className="max-w-3xl mx-auto bg-white rounded-lg flex items-center px-3">

              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#667781"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>

              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search messages"
                autoFocus
                className="flex-1 py-2.5 px-3 outline-none text-sm"
              />

              {searchText && (
                <button
                  onClick={() => setSearchText("")}
                  className="text-gray-400 hover:text-gray-700 px-2"
                >
                  ×
                </button>
              )}

            </div>
          </div>
        )}

        {/* CHAT AREA */}
        <main
          className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-6 py-5"
          style={{
            backgroundColor: "#efeae2",
            backgroundImage:
              "radial-gradient(rgba(0,0,0,0.035) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        >
          {filteredMessages.length === 0 ? (
            <div className="h-full " />
          ) : (
            <div className="w-full max-w-4xl mx-auto space-y-2">

              {filteredMessages.map((msg, index) => {
                const isMine = msg.username === username;

                return (
                  <div
                    key={`${msg.time || msg.receivedAt || index}-${index}`}
                    className={`flex ${
                      isMine ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`relative max-w-[85%] sm:max-w-[65%] px-3 py-2 rounded-lg shadow-sm ${
                        isMine
                          ? "bg-[#d9fdd3] rounded-tr-none"
                          : "bg-white rounded-tl-none"
                      }`}
                    >

                      {!isMine && (
                        <p className="text-[12px] font-semibold text-[#075E54] mb-1">
                          {msg.username}
                        </p>
                      )}

                      {/* IMAGE */}
                      {msg.type === "image" && msg.fileData && (
                        <img
                          src={msg.fileData}
                          alt={msg.fileName || "Shared image"}
                          className="max-w-full max-h-[320px] rounded-md cursor-pointer object-contain"
                          onClick={() =>
                            window.open(msg.fileData, "_blank")
                          }
                        />
                      )}

                      {/* FILE */}
                      {msg.type === "file" && msg.fileData && (
                        <div className="flex items-center gap-3 bg-black/[0.04] rounded-lg p-3 min-w-[220px]">

                          <div className="w-10 h-10 rounded-lg bg-[#075E54] text-white flex items-center justify-center shrink-0">

                            <svg
                              width="21"
                              height="21"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <path d="M14 2v6h6" />
                            </svg>

                          </div>

                          <div className="min-w-0 flex-1">

                            <p className="text-sm font-medium truncate">
                              {msg.fileName || "Attachment"}
                            </p>

                            <button
                              onClick={() =>
                                window.open(msg.fileData, "_blank")
                              }
                              className="text-xs text-[#075E54] hover:underline mt-1"
                            >
                              Open attachment
                            </button>

                          </div>

                        </div>
                      )}

                      {/* TEXT */}
                      {msg.type === "text" && msg.text && (
                        <p className="text-[14.5px] text-[#111b21] whitespace-pre-wrap break-words">
                          {msg.text}
                        </p>
                      )}

                      {/* TIME */}
                      <div className="flex items-center justify-end gap-1 mt-1">

                        <span className="text-[10px] text-[#667781]">
                          {formatTime(msg.time || msg.receivedAt)}
                        </span>

                        {isMine && (
                          <span className="text-[#53bdeb] text-[13px]">
                            ✓✓
                          </span>
                        )}

                      </div>

                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />

            </div>
          )}
        </main>

        {/* EMOJI PICKER */}
        {showEmoji && (
          <div className="shrink-0 bg-[#f0f2f5] border-t border-gray-200 px-3 py-3">

            <div className="max-w-3xl mx-auto grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-1">

              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => addEmoji(emoji)}
                  className="h-9 rounded-md hover:bg-gray-200 transition text-xl"
                >
                  {emoji}
                </button>
              ))}

            </div>
          </div>
        )}

        {/* HIDDEN FILE INPUT */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx,.txt,.zip"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* BOTTOM INPUT */}
        <footer className="shrink-0 bg-[#f0f2f5] px-2 sm:px-4 py-2.5 border-t border-gray-200">

          <div className="w-full max-w-5xl mx-auto flex items-center gap-2">

            {/* EMOJI */}
            <button
              onClick={() => {
                setShowEmoji((prev) => !prev);
                setShowMenu(false);
              }}
              className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition ${
                showEmoji
                  ? "bg-[#d9fdd3]"
                  : "hover:bg-gray-200"
              }`}
              title="Emoji"
            >
              <svg
                width="23"
                height="23"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#54656f"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <path d="M9 9h.01" />
                <path d="M15 9h.01" />
              </svg>
            </button>

            {/* ATTACHMENT */}
            <button
              onClick={handleAttachmentClick}
              className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
              title="Attach"
            >
              <svg
                width="23"
                height="23"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#54656f"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 1 1-2.83-2.83l8.49-8.48" />
              </svg>
            </button>

            {/* MESSAGE INPUT */}
            <div className="flex-1 min-w-0 bg-white rounded-lg shadow-sm">

              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message"
                className="w-full px-4 py-2.5 bg-transparent outline-none text-[15px] text-[#111b21] placeholder:text-[#667781]"
              />

            </div>

            {/* SEND */}
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center transition ${
                message.trim()
                  ? "bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-sm"
                  : "bg-[#d9dde0] text-[#8696a0] cursor-not-allowed"
              }`}
              title="Send"
            >
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            </button>

          </div>

          <p className="text-center text-[10px] text-[#8696a0] mt-1.5">
            Real-time messaging with Socket.IO
          </p>

        </footer>

      </div>
    </div>
  );
}

export default ChatRoom;