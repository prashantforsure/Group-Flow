import React from 'react'

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect }) => {
  const emojis = ['😀', '😂', '😍', '🤔', '😎', '👍', '❤️', '🎉', '🔥', '💯']

  return (
    <div className="absolute bottom-16 left-4 bg-gray-700 rounded-md p-2 shadow-lg">
      <div className="grid grid-cols-5 gap-2">
        {emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onEmojiSelect(emoji)}
            className="text-2xl hover:bg-gray-600 p-1 rounded"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}

export default EmojiPicker