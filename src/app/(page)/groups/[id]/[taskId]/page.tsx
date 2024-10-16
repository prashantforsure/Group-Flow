'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from '@/hooks/use-toast'
import { Plus, Trash2, Edit2, CheckCircle, XCircle, Calendar, Clock } from 'lucide-react'

type User = {
  id: string
  name: string
  email: string
  avatar: string
}

type Subtask = {
  id: string
  title: string
  description: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
}

type Task = {
  id: string
  title: string
  description: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  assignments: { assignee: User }[]
  startDate: string | null
  dueDate: string | null
  completedAt: string | null
  estimatedHours: number | null
  actualHours: number | null
  subtasks: Subtask[]
}

export default function TaskDetailsPage() {
  const { id, taskId } = useParams() as { id: string; taskId: string }
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [newSubtask, setNewSubtask] = useState({ title: '', description: '' })
  const [editingSubtask, setEditingSubtask] = useState<Subtask | null>(null)
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    fetchTaskDetails()
  }, [id, taskId])

  const fetchTaskDetails = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/groups/${id}/tasks/${taskId}`)
      setTask(response.data)
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

  const handleAddSubtask = async () => {
    try {
      const response = await axios.post(`/api/groups/${id}/tasks/${taskId}/subtasks`, newSubtask)
      setTask(prevTask => prevTask ? { ...prevTask, subtasks: [...prevTask.subtasks, response.data] } : null)
      setNewSubtask({ title: '', description: '' })
      toast({
        title: "Success",
        description: "Subtask added successfully.",
      })
    } catch (error) {
      console.error('Error adding subtask:', error)
      toast({
        title: "Error",
        description: "Failed to add subtask. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditSubtask = async (subtaskId: string) => {
    if (!editingSubtask) return
    try {
      const response = await axios.put(`/api/groups/${id}/tasks/${taskId}/subtasks/${subtaskId}`, editingSubtask)
      setTask(prevTask => prevTask ? {
        ...prevTask,
        subtasks: prevTask.subtasks.map(st => st.id === subtaskId ? response.data : st)
      } : null)
      setEditingSubtask(null)
      toast({
        title: "Success",
        description: "Subtask updated successfully.",
      })
    } catch (error) {
      console.error('Error updating subtask:', error)
      toast({
        title: "Error",
        description: "Failed to update subtask. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      await axios.delete(`/api/groups/${id}/tasks/${taskId}/subtasks/${subtaskId}`)
      setTask(prevTask => prevTask ? {
        ...prevTask,
        subtasks: prevTask.subtasks.filter(st => st.id !== subtaskId)
      } : null)
      toast({
        title: "Success",
        description: "Subtask deleted successfully.",
      })
    } catch (error) {
      console.error('Error deleting subtask:', error)
      toast({
        title: "Error",
        description: "Failed to delete subtask. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateTaskStatus = async (status: Task['status']) => {
    try {
      const response = await axios.put(`/api/groups/${id}/tasks/${taskId}`, { status })
      setTask(prevTask => prevTask ? { ...prevTask, status: response.data.status } : null)
      toast({
        title: "Success",
        description: "Task status updated successfully.",
      })
    } catch (error) {
      console.error('Error updating task status:', error)
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTask = async () => {
    try {
      await axios.delete(`/api/groups/${id}/tasks/${taskId}`)
      toast({
        title: "Success",
        description: "Task deleted successfully.",
      })
      router.push(`/groups/${id}`)
    } catch (error) {
      console.error('Error deleting task:', error)
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const canEdit = session?.user?.id === task?.assignments[0]?.assignee.id || session?.user?.email === 'admin@example.com'

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!task) {
    return <div className="flex items-center justify-center h-screen">Task not found</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="mb-8 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
            <div className="flex justify-between items-center">
              <CardTitle className="text-3xl font-bold">{task.title}</CardTitle>
              <Badge >
                {task.status}
              </Badge>
            </div>
            <CardDescription className="text-gray-100 mt-2">{task.description}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Assignee</h3>
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={task.assignments[0]?.assignee.avatar} alt={task.assignments[0]?.assignee.name} />
                    <AvatarFallback>{task.assignments[0]?.assignee.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{task.assignments[0]?.assignee.name}</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Priority</h3>
                <Badge variant={task.priority === 'HIGH' || task.priority === 'URGENT' ? 'destructive' : 'outline'}>
                  {task.priority}
                </Badge>
              </div>
            </div>
            <Separator className="my-6" />
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Start Date</h3>
                <p className="text-sm flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  {task.startDate ? new Date(task.startDate).toLocaleDateString() : 'Not set'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Due Date</h3>
                <p className="text-sm flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Estimated Hours</h3>
                <p className="text-sm flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  {task.estimatedHours || 'Not set'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Actual Hours</h3>
                <p className="text-sm flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  {task.actualHours || 'Not set'}
                </p>
              </div>
            </div>
            {task.estimatedHours && task.actualHours && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Progress</h3>
                <Progress value={(task.actualHours / task.estimatedHours) * 100} className="h-2" />
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-gray-50 flex justify-between">
            {canEdit && (
              <Select
                value={task.status}
                onValueChange={handleUpdateTaskStatus}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Change status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            )}
            {canEdit && (
              <Button variant="destructive" onClick={handleDeleteTask}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete Task
              </Button>
            )}
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Subtasks</CardTitle>
          </CardHeader>
          <CardContent>
            {canEdit && (
              <div className="mb-6">
                <Input
                  placeholder="Subtask title"
                  value={newSubtask.title}
                  onChange={(e) => setNewSubtask({ ...newSubtask, title: e.target.value })}
                  className="mb-2"
                />
                <Textarea
                  placeholder="Subtask description"
                  value={newSubtask.description}
                  onChange={(e) => setNewSubtask({ ...newSubtask, description: e.target.value })}
                  className="mb-2"
                />
                <Button onClick={handleAddSubtask}>
                  <Plus className="mr-2 h-4 w-4" /> Add Subtask
                </Button>
              </div>
            )}
            <div className="space-y-4">
              {task.subtasks.map((subtask) => (
                <Card key={subtask.id} className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-4">
                    {editingSubtask?.id === subtask.id ? (
                      <>
                        <Input
                          value={editingSubtask.title}
                          onChange={(e) => setEditingSubtask({ ...editingSubtask, title: e.target.value })}
                          className="mb-2"
                        />
                        <Textarea
                          value={editingSubtask.description}
                          onChange={(e) => setEditingSubtask({ ...editingSubtask, description: e.target.value })}
                          className="mb-2"
                        />
                        <div className="flex justify-end space-x-2">
                          <Button onClick={() => handleEditSubtask(subtask.id)} variant="outline">
                            <CheckCircle className="mr-2 h-4 w-4" /> Save
                          </Button>
                          <Button onClick={() => setEditingSubtask(null)} variant="outline">
                            <XCircle className="mr-2 h-4 w-4" /> Cancel
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <h4 className="text-lg font-semibold mb-2">{subtask.title}</h4>
                        <p className="text-gray-600 mb-4">{subtask.description}</p>
                        <div className="flex justify-between items-center">
                          <Badge >
                            {subtask.status}
                          </Badge>
                          {canEdit && (
                            <div className="space-x-2">
                              <Button onClick={() => setEditingSubtask(subtask)} variant="outline" size="sm">
                                <Edit2 className="mr-2 h-4 w-4" /> Edit
                              </Button>
                              <Button onClick={() => handleDeleteSubtask(subtask.id)} variant="outline" size="sm">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </Button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}