import { createContext, useContext, useEffect, useRef, useState } from "react";

const WebSocketContext = createContext(null);

const WS_URL =
  "wss://9u0mqx2rxc.execute-api.ap-south-1.amazonaws.com/production";

export function WebSocketProvider({ children }) {

  const wsRef = useRef(null);
  const pingRef = useRef(null);
  const reconnectRef = useRef(null);

  const [ws, setWs] = useState(null);

  /* WS CONNECT */

  function connectSocket(token) {

    if (!token) return;

    // prevent duplicate connections
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    const socket = new WebSocket(`${WS_URL}?token=${token}`);

    socket.onopen = () => {
      console.log("WS CONNECTED");

      wsRef.current = socket;
      setWs(socket);

      //  clear reconnect timer
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }

      // start ping 
      pingRef.current = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ action: "ping" }));
        }
      }, 30000);

      window.dispatchEvent(new Event("ws-connected"));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        console.log("WS EVENT", data);

        window.dispatchEvent(
          new CustomEvent("ws-event", { detail: data })
        );

      } catch (err) {
        console.log("WS parse error");
      }
    };

    socket.onerror = (err) => {
      console.error("WS ERROR", err);
    };

    socket.onclose = () => {
      console.log("WS CLOSED");

      // clear ping
      if (pingRef.current) {
        clearInterval(pingRef.current);
        pingRef.current = null;
      }

      wsRef.current = null;
      setWs(null);

      const token = localStorage.getItem("id_token");

      // DO NOT reconnect if logged out
      if (!token) {
        console.log("No token → no reconnect");
        return;
      }

      // reconnect after delay
      reconnectRef.current = setTimeout(() => {
        console.log("Reconnecting WS...");
        connectSocket(token);
      }, 2000);
    };
  }

  function disconnectSocket() {

    console.log("Manual WS disconnect");

    //  stop reconnect attempts
    if (reconnectRef.current) {
      clearTimeout(reconnectRef.current);
      reconnectRef.current = null;
    }

    // stop ping
    if (pingRef.current) {
      clearInterval(pingRef.current);
      pingRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, "logout");
      wsRef.current = null;
    }

    setWs(null);
  }

  useEffect(() => {

    const token = localStorage.getItem("id_token");

    if (token) {
      connectSocket(token);
    }

    const handleLogin = () => {
      const t = localStorage.getItem("id_token");
      connectSocket(t);
    };

    const handleLogout = () => {
      disconnectSocket();
    };

    window.addEventListener("login", handleLogin);
    window.addEventListener("logout", handleLogout);

    return () => {
      window.removeEventListener("login", handleLogin);
      window.removeEventListener("logout", handleLogout);
      disconnectSocket();
    };

  }, []);

  return (
    <WebSocketContext.Provider value={ws}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  return useContext(WebSocketContext);
}
