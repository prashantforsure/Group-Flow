'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import { Plus, Hash, Megaphone, ChevronDown, Settings, Send, Trash2, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from '@/hooks/use-toast'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
type Channel = {
  id: string
  name: string
  description: string
  type: 'GENERAL' | 'ANNOUNCEMENTS' | 'CUSTOM'
}

type Message = {
  id: string
  content: string
  createdAt: string
  sender: {
    id: string
    name: string
    email: string
    image: string
  }
}

export default function Page() {
  const { id } = useParams() as { id: string }
  const [channels, setChannels] = useState<Channel[]>([])
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [newChannel, setNewChannel] = useState({ name: '', description: '' })
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()

  useEffect(() => {
    fetchChannels()
  }, [id])

  useEffect(() => {
    if (selectedChannel) {
      fetchMessages(selectedChannel.id)
    }
  }, [selectedChannel])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchChannels = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/groups/${id}/channels`)
      setChannels(response.data)
      if (response.data.length > 0) {
        setSelectedChannel(response.data[0])
      }
    } catch (error) {
      console.error('Error fetching channels:', error)
      toast({
        title: "Error",
        description: "Failed to load channels. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (channelId: string) => {
    try {
      const response = await axios.get(`/api/groups/${id}/channels/${channelId}/messages`)
      setMessages(response.data)
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCreateChannel = async () => {
    try {
      const response = await axios.post(`/api/groups/${id}/channels`, newChannel)
      setChannels([...channels, response.data])
      setIsCreateDialogOpen(false)
      setNewChannel({ name: '', description: '' })
      toast({
        title: "Success",
        description: "New channel created successfully.",
      })
    } catch (error) {
      console.error('Error creating channel:', error)
      toast({
        title: "Error",
        description: "Failed to create new channel. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSendMessage = async () => {
    if (!selectedChannel || !newMessage.trim()) return

    try {
      const response = await axios.post(`/api/groups/${id}/channels/${selectedChannel.id}/messages`, {
        content: newMessage
      })
      setMessages([...messages, response.data])
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!selectedChannel) return

    try {
      await axios.delete(`/api/groups/${id}/channels/${selectedChannel.id}/messages/${messageId}`)
      setMessages(messages.filter(message => message.id !== messageId))
      toast({
        title: "Success",
        description: "Message deleted successfully.",
      })
    } catch (error) {
      console.error('Error deleting message:', error)
      toast({
        title: "Error",
        description: "Failed to delete message. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteChannel = async (channelId: string) => {
    try {
      await axios.delete(`/api/groups/${id}/channels/${channelId}`)
      setChannels(channels.filter(channel => channel.id !== channelId))
      if (selectedChannel?.id === channelId) {
        setSelectedChannel(channels[0] || null)
      }
      toast({
        title: "Success",
        description: "Channel deleted successfully.",
      })
    } catch (error) {
      console.error('Error deleting channel:', error)
      toast({
        title: "Error",
        description: "Failed to delete channel. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getChannelIcon = (type: Channel['type']) => {
    switch (type) {
      case 'ANNOUNCEMENTS':
        return <Megaphone className="w-4 h-4 mr-2" />
      case 'GENERAL':
      case 'CUSTOM':
      default:
        return <Hash className="w-4 h-4 mr-2" />
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-[#A259FF]" /></div>
  }

  return (
    <div className="flex h-screen bg-white">
      <motion.div 
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-64 bg-gray-50 border-r border-gray-200"
      >
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Channels</h2>
          <ul className="space-y-2">
            {channels.map((channel) => (
              <motion.li key={channel.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <button
                  onClick={() => setSelectedChannel(channel)}
                  className={`flex items-center w-full px-3 py-2 text-sm rounded-lg transition-colors ${
                    selectedChannel?.id === channel.id ? 'bg-[#A259FF] text-white' : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {getChannelIcon(channel.type)}
                  {channel.name}
                  {session?.user?.email && channel.type !== 'GENERAL' && channel.type !== 'ANNOUNCEMENTS' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteChannel(channel.id)
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </button>
              </motion.li>
            ))}
          </ul>
        </div>
        <div className="px-4 mt-4">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full justify-start bg-[#1ABCFE] hover:bg-[#A259FF] text-white transition-colors">
                <Plus className="w-4 h-4 mr-2" />
                Create Channel
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Channel</DialogTitle>
                <DialogDescription>
                  Add a new channel to your group. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="name" className="text-right text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <Input
                    id="name"
                    value={newChannel.name}
                    onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="description" className="text-right text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <Input
                    id="description"
                    value={newChannel.description}
                    onChange={(e) => setNewChannel({ ...newChannel, description: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateChannel} className="bg-[#1ABCFE] hover:bg-[#A259FF] text-white transition-colors">Create Channel</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-800 mr-2">
              {selectedChannel ? selectedChannel.name : 'Select a channel'}
            </h1>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>
          <Button variant="ghost" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </header>
        <main className="flex-1 overflow-auto p-4 bg-gray-50">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((message) => (
              <motion.div 
                key={message.id} 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <img src={message.sender.image || '/placeholder.svg'} alt={message.sender.name} className="w-10 h-10 rounded-full mr-3" />
                    <div>
                      <p className="font-semibold text-gray-800">{message.sender.name}</p>
                      <p className="text-xs text-gray-500">{new Date(message.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  {(session?.user?.email === message.sender.email || session?.user?.email === 'admin@example.com') && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteMessage(message.id)}
                    >
                      <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-500 transition-colors" />
                    </Button>
                  )}
                </div>
                <p className="mt-2 text-gray-700">{message.content}</p>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </main>
        <footer className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-3xl mx-auto flex items-center">
            <Input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 mr-2"
            />
            <Button onClick={handleSendMessage} className="bg-[#1ABCFE] hover:bg-[#A259FF] text-white transition-colors">
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>
        </footer>
      </div>
    </div>
  )
}




