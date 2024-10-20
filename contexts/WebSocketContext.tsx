import React, { createContext, useContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

interface WebSocketContextType {
  socket: WebSocket | null
  sendMessage: (message: any) => void
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  sendMessage: () => {},
})

export const useWebSocket = () => useContext(WebSocketContext)

export const WebSocketProvider: React.FC<{ groupId: string; channelId: string; children: React.ReactNode }> = ({
  groupId,
  channelId,
  children,
}) => {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const { data: session } = useSession()

  useEffect(() => {
    if (session && groupId && channelId) {
      const ws = new WebSocket(`ws://localhost:3000/api/websocket?groupId=${groupId}&channelId=${channelId}`)

      ws.onopen = () => {
        console.log('WebSocket connection established')
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        console.log('Received message:', data)
        // Handle incoming messages here (e.g., update state, trigger notifications)
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      ws.onclose = () => {
        console.log('WebSocket connection closed')
      }

      setSocket(ws)

      return () => {
        ws.close()
      }
    }
  }, [session, groupId, channelId])

  const sendMessage = (message: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message))
    } else {
      console.error('WebSocket is not connected')
    }
  }

  return (
    <WebSocketContext.Provider value={{ socket, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  )
}