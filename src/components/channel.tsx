import React, { useState, useEffect } from 'react'
import { useWebSocket } from '../../contexts/WebSocketContext'


interface Message {
  id: string
  content: string
  senderId: string
  senderName: string
  createdAt: string
}

interface ChannelProps {
  groupId: string
  channelId: string
}

const Channel: React.FC<ChannelProps> = ({ groupId, channelId }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const { sendMessage } = useWebSocket()

  useEffect(() => {
    // Fetch initial messages
    fetchMessages()
  }, [groupId, channelId])

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}/channels/${channelId}/messages`)
      const data = await response.json()
      setMessages(data.messages)
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      try {
        const response = await fetch(`/api/groups/${groupId}/channels/${channelId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: newMessage }),
        })
        const data = await response.json()
        
        // Send the new message through WebSocket
        sendMessage({
          type: 'NEW_MESSAGE',
          message: data,
        })

        setNewMessage('')
      } catch (error) {
        console.error('Error sending message:', error)
      }
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto p-4">
        {messages.map((message) => (
          <div key={message.id} className="mb-4">
            <p className="font-bold">{message.senderName}</p>
            <p>{message.content}</p>
            <p className="text-xs text-gray-500">{new Date(message.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
          Send
        </button>
      </form>
    </div>
  )
}

export default Channel