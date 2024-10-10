'use client'
import { Badge } from "@/components/ui/badge"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { toast } from '@/hooks/use-toast'
import { FileText, Settings } from 'lucide-react'

type Group = {
  id: string
  name: string
  description: string
  memberCount: number
  taskCount: number
  completedTaskCount: number
}

type Activity = {
  id: string
  user: { name: string; avatar: string }
  action: string
  timestamp: string
}

type Task = {
  id: string
  title: string
  status: string
}

type Document = {
  id: string
  title: string
  type: string
}

type Message = {
  id: string
  user: { name: string; avatar: string }
  content: string
  timestamp: string
}

export default function GroupDetailsPage() {
  const { id } = useParams()
  const [group, setGroup] = useState<Group | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGroupDetails()
  }, [id])

  const fetchGroupDetails = async () => {
    try {
      setLoading(true)
      const [groupRes, activitiesRes, tasksRes, documentsRes, messagesRes] = await Promise.all([
        axios.get(`/api/groups/${id}`),
        axios.get(`/api/groups/${id}/activities`),
        axios.get(`/api/tasks?groupId=${id}`),
        axios.get(`/api/documents?groupId=${id}`),
        axios.get(`/api/channels/${id}/messages`)
      ])
      setGroup(groupRes.data)
      setActivities(activitiesRes.data)
      setTasks(tasksRes.data)
      setDocuments(documentsRes.data)
      setMessages(messagesRes.data)
    } catch (error) {
      console.error('Error fetching group details:', error)
      toast({
        title: "Error",
        description: "Failed to load group details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading || !group) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{group.name}</h1>
        <Button asChild>
          <Link href={`/groups/${id}/settings`}>
            <Settings className="mr-2 h-4 w-4" /> Group Settings
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Group Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Members:</span>
                <span>{group.memberCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Tasks:</span>
                <span>{group.taskCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Completed Tasks:</span>
                <span>{group.completedTaskCount}</span>
              </div>
              <Progress value={(group.completedTaskCount / group.taskCount) * 100} className="mt-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {activities.slice(0, 5).map((activity) => (
                <li key={activity.id} className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                    <AvatarFallback>{activity.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm">{activity.action}</p>
                    <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ongoing Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {tasks.slice(0, 5).map((task) => (
                <li key={task.id} className="flex justify-between items-center">
                  <span>{task.title}</span>
                  <Badge>
                    {task.status}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Access Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {documents.slice(0, 5).map((doc) => (
                <li key={doc.id} className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>{doc.title}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Group Chat Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {messages.slice(0, 5).map((message) => (
                <li key={message.id} className="flex items-start space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.user.avatar} alt={message.user.name} />
                    <AvatarFallback>{message.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{message.user.name}</p>
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs text-gray-500">{new Date(message.timestamp).toLocaleString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}