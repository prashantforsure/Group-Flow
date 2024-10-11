'use client'

import { toast } from "@/hooks/use-toast"
import axios from "axios"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Calendar, Clock, Paperclip, MessageSquare, History } from 'lucide-react'

type Task = {
    id: string
    title: string
    description: string
    status: 'pending' | 'in_progress' | 'completed'
    priority: 'low' | 'medium' | 'high'
    dueDate: string
    createdDate: string
    assignedMembers: {
      id: string
      name: string
      avatar: string
    }[]
    project: {
      id: string
      name: string
    }
    subtasks: {
      id: string
      title: string
      completed: boolean
    }[]
    attachments: {
      id: string
      name: string
      url: string
    }[]
    timeTracked: number
    comments: {
      id: string
      user: {
        name: string
        avatar: string
      }
      content: string
      createdAt: string
    }[]
    activityLog: {
      id: string
      action: string
      timestamp: string
    }[]
  }
  
  export default function page(){
    const { id } = useParams()
    const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    fetchTaskDetails()
  }, [id])

  const fetchTaskDetails = async () => {
    try {
      setLoading(true)
      const [taskRes, commentsRes] = await Promise.all([
        axios.get(`/api/tasks/${id}`),
        axios.get(`/api/tasks/${id}/comments`)
      ])
      setTask({ ...taskRes.data, comments: commentsRes.data })
    } catch (error) {
      console.error('Error fetching task details:', error)
      toast({
        title: "Error",
        description: "Failed to load task details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    try {
      const response = await axios.post(`/api/tasks/${id}/comments`, { content: newComment })
      setTask(prevTask => prevTask ? {
        ...prevTask,
        comments: [...prevTask.comments, response.data]
      } : null)
      setNewComment('')
      toast({
        title: "Success",
        description: "Comment added successfully.",
      })
    } catch (error) {
      console.error('Error adding comment:', error)
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSubtaskToggle = async (subtaskId: string) => {
    try {
      await axios.put(`/api/tasks/${id}/subtasks/${subtaskId}/toggle`)
      setTask(prevTask => prevTask ? {
        ...prevTask,
        subtasks: prevTask.subtasks.map(subtask =>
          subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
        )
      } : null)
    } catch (error) {
      console.error('Error toggling subtask:', error)
      toast({
        title: "Error",
        description: "Failed to update subtask. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading || !task) {
    return <div>Loading task details...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{task.title}</h1>
        <div className="flex items-center space-x-4">
          <Badge>
            {task.status.replace('_', ' ')}
          </Badge>
          <Badge>
            {task.priority} priority
          </Badge>
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4 text-gray-500" />
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{task.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assigned Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {task.assignedMembers.map((member) => (
                <div key={member.id} className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>{member.name[0]}</AvatarFallback>
                  </Avatar>
                  <span>{member.name}</span>
                </div>
              
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subtasks</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {task.subtasks.map((subtask) => (
                <li key={subtask.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={() => handleSubtaskToggle(subtask.id)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className={subtask.completed ? 'line-through text-gray-500' : ''}>
                    {subtask.title}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attachments</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {task.attachments.map((attachment) => (
                <li key={attachment.id} className="flex items-center space-x-2">
                  <Paperclip className="h-4 w-4 text-gray-500" />
                  <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {attachment.name}
                  </a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Time Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>{Math.floor(task.timeTracked / 3600)} hours {Math.floor((task.timeTracked % 3600) / 60)} minutes</span>
            </div>
            <Progress value={(task.timeTracked / (8 * 3600)) * 100} className="w-full" />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4 mb-4">
              {task.comments.map((comment) => (
                <li key={comment.id} className="flex space-x-4">
                  <Avatar>
                    <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                    <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{comment.user.name}</p>
                    <p className="text-sm text-gray-500">{new Date(comment.createdAt).toLocaleString()}</p>
                    <p className="mt-1">{comment.content}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex space-x-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Button onClick={handleAddComment}>Post</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {task.activityLog.map((activity) => (
                <li key={activity.id} className="flex items-center space-x-2">
                  <History className="h-4 w-4 text-gray-500" />
                  <span>{activity.action}</span>
                  <span className="text-sm text-gray-500">{new Date(activity.timestamp).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
  }