'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import { Plus, Hash, Megaphone, ChevronDown, Settings } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from '@/hooks/use-toast'

type Channel = {
  id: string
  name: string
  description: string
  type: 'GENERAL' | 'ANNOUNCEMENTS' | 'CUSTOM'
}

export default function GroupChannelsPage() {
  const { id: groupId } = useParams() as { id: string }
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [newChannel, setNewChannel] = useState({ name: '', description: '' })
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  useEffect(() => {
    fetchChannels()
  }, [groupId])

  const fetchChannels = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/groups/${groupId}/channels`)
      setChannels(response.data)
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

  const handleCreateChannel = async () => {
    try {
      const response = await axios.post(`/api/groups/${groupId}/channels`, newChannel)
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

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Channels</h2>
          <ul className="space-y-2">
            {channels.map((channel) => (
              <li key={channel.id}>
                <a
                  href="#"
                  className="flex items-center px-2 py-1 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  {getChannelIcon(channel.type)}
                  {channel.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="px-4 mt-4">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Create Channel
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Channel</DialogTitle>
                <DialogDescription>
                  Add a new channel to your group. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="name" className="text-right">
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
                  <label htmlFor="description" className="text-right">
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
                <Button onClick={handleCreateChannel}>Create Channel</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mr-2">Group Name</h1>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>
          <Button variant="ghost" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </header>
        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Welcome to the Channels</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This is where you'll see the messages for the selected channel. Select a channel from the sidebar to view its content.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              You can also create new channels using the "Create Channel" button in the sidebar.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}