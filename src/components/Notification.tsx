'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from '@/hooks/use-toast'

type Notification = {
  id: string
  type: string
  message: string
  read: boolean
  createdAt: string
  link?: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/users/me/notifications')
      setNotifications(response.data)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast({
        title: "Error",
        description: "Failed to load notifications. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await axios.put(`/api/users/me/notifications/${id}`, { read: true })
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast({
        title: "Error",
        description: "Failed to mark notification as read. Please try again.",
        variant: "destructive",
      })
    }
  }

  const clearAllNotifications = async () => {
    try {
      await axios.delete('/api/users/me/notifications')
      setNotifications([])
      toast({
        title: "Success",
        description: "All notifications have been cleared.",
      })
    } catch (error) {
      console.error('Error clearing notifications:', error)
      toast({
        title: "Error",
        description: "Failed to clear notifications. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true
    if (filter === 'unread') return !n.read
    return n.type === filter
  })

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <div className="flex space-x-4">
          <Select onValueChange={setFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter notifications" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="task">Tasks</SelectItem>
              <SelectItem value="comment">Comments</SelectItem>
              <SelectItem value="mention">Mentions</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={clearAllNotifications} variant="outline">Clear All</Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Notifications</CardTitle>
          <CardDescription>Stay updated with your latest activities and mentions.</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length === 0 ? (
            <p>No notifications to display.</p>
          ) : (
            <ul className="space-y-4">
              {filteredNotifications.map((notification) => (
                <li key={notification.id} className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Checkbox
                      checked={notification.read}
                      onCheckedChange={() => markAsRead(notification.id)}
                    />
                    <div>
                      <p className={`font-medium ${notification.read ? 'text-gray-600' : 'text-black'}`}>
                        {notification.message}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {notification.link && (
                    <Button variant="link" asChild>
                      <a href={notification.link}>View</a>
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}