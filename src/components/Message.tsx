import React, { useState } from 'react'
import Image from 'next/image'
import { Smile } from 'lucide-react'

interface MessageProps {
  message: {
    id: string
    content: string
    sender: {
      id: string
      name: string
      image: string
    }
    createdAt: string
    reactions: {
      emoji: string
      users: string[]
    }[]
  }
  currentUser: {
    id: string
    name?: string | null
    image?: string | null
  } | null | undefined
  onReaction: (messageId: string, emoji: string) => void
}

const Message: React.FC<MessageProps> = ({ message, currentUser, onReaction }) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false)

  const handleReaction = (emoji: string) => {
    onReaction(message.id, emoji)
    setShowReactionPicker(false)
  }

  return (
    <div className="flex items-start mb-4">
      <Image
        src={message.sender.image || '/placeholder-user.jpg'}
        alt={message.sender.name}
        width={40}
        height={40}
        className="rounded-full mr-3"
      />
      <div className="flex-1">
        <div className="flex items-baseline">
          <span className="font-bold mr-2">{message.sender.name}</span>
          <span className="text-xs text-gray-400">
            {new Date(message.createdAt).toLocaleTimeString()}
          </span>
        </div>
        <p className="mt-1">{message.content}</p>
        <div className="flex items-center mt-2">
          {message.reactions.map((reaction) => (
            <button
              key={reaction.emoji}
              onClick={() => handleReaction(reaction.emoji)}
              className={`flex items-center mr-2 px-2 py-1 rounded-full text-sm ${
                reaction.users.includes(currentUser?.id || '') ? 'bg-blue-500' : 'bg-gray-700'
              }`}
            >
              {reaction.emoji} {reaction.users.length}
            </button>
          ))}
          <button
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            className="text-gray-400 hover:text-white"
          >
            <Smile className="w-4 h-4" />
          </button>
        </div>
        {showReactionPicker && (
          <div className="mt-2 bg-gray-700 p-2 rounded-md">
            {['👍', '❤️', '😂', '😮', '😢', '😡'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="mr-2 text-xl"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Message