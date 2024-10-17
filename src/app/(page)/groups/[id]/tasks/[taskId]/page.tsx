'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from '@/hooks/use-toast'
import { Plus, Trash2, Edit2, CheckCircle, XCircle, Calendar, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type User = {
  id: string
  name: string
  email: string
  image?: string
}

type Subtask = {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  createdAt: string
}

type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

type Task = {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assignments: { assignee: User }[]
  startDate: string | null
  dueDate: string | null
  completedAt: string | null
  estimatedHours: number | null
  actualHours: number | null
  subtasks: Subtask[]
  createdAt: string
  creator: User
}

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-800' },
}

const PRIORITY_CONFIG = {
  LOW: { label: 'Low', color: 'bg-gray-100 text-gray-800' },
  MEDIUM: { label: 'Medium', color: 'bg-blue-100 text-blue-800' },
  HIGH: { label: 'High', color: 'bg-orange-100 text-orange-800' },
  URGENT: { label: 'Urgent', color: 'bg-red-100 text-red-800' },
}

export default function TaskDetailsPage() {
  const { id, taskId } = useParams() as { id: string; taskId: string }
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newSubtask, setNewSubtask] = useState({ 
    title: '', 
    description: '', 
    priority: 'MEDIUM' as TaskPriority 
  })
  const [editingSubtask, setEditingSubtask] = useState<Subtask | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Task>>({})
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (id && taskId && sessionStatus !== 'loading') {
      fetchTaskDetails()
    }
  }, [id, taskId, sessionStatus])

  const fetchTaskDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`/api/groups/${id}/tasks/${taskId}`)
      setTask(response.data)
      setEditForm(response.data)
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }

  const handleError = (error: unknown) => {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.error || error.message
      : 'An unexpected error occurred'
    setError(errorMessage)
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    })
  }

  const handleAddSubtask = async () => {
    if (!newSubtask.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Subtask title is required",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await axios.post(`/api/groups/${id}/tasks/${taskId}/subtasks`, newSubtask)
      setTask(prevTask => prevTask ? {
        ...prevTask,
        subtasks: [response.data, ...prevTask.subtasks]
      } : null)
      setNewSubtask({ title: '', description: '', priority: 'MEDIUM' })
      toast({
        title: "Success",
        description: "Subtask added successfully",
      })
    } catch (error) {
      handleError(error)
    }
  }

  const handleEditSubtask = async (subtaskId: string) => {
    if (!editingSubtask?.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Subtask title is required",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await axios.put(
        `/api/groups/${id}/tasks/${taskId}/subtasks/${subtaskId}`,
        editingSubtask
      )
      setTask(prevTask => prevTask ? {
        ...prevTask,
        subtasks: prevTask.subtasks.map(st => st.id === subtaskId ? response.data : st)
      } : null)
      setEditingSubtask(null)
      toast({
        title: "Success",
        description: "Subtask updated successfully",
      })
    } catch (error) {
      handleError(error)
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
        description: "Subtask deleted successfully",
      })
    } catch (error) {
      handleError(error)
    }
  }

  const handleUpdateTask = async () => {
    try {
      const response = await axios.put(`/api/groups/${id}/tasks/${taskId}`, editForm)
      setTask(response.data)
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Task updated successfully",
      })
    } catch (error) {
      handleError(error)
    }
  }

  const handleDeleteTask = async () => {
    try {
      await axios.delete(`/api/groups/${id}/tasks/${taskId}`)
      toast({
        title: "Success",
        description: "Task deleted successfully",
      })
      router.push(`/groups/${id}`)
    } catch (error) {
      handleError(error)
    } finally {
      setIsDeleteDialogOpen(false)
    }
  }

  const handleStatusChange = async (status: TaskStatus) => {
    try {
      const response = await axios.put(`/api/groups/${id}/tasks/${taskId}`, {
        status,
        completedAt: status === 'COMPLETED' ? new Date().toISOString() : null
      })
      setTask(response.data)
      toast({
        title: "Success",
        description: "Task status updated successfully",
      })
    } catch (error) {
      handleError(error)
    }
  }

  const canEdit = session?.user && (
    session.user.id === task?.assignments[0]?.assignee.id ||
    session.user.email === 'admin@example.com'
  )

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="flex items-center gap-2 text-red-500 mb-4">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
        <Button onClick={fetchTaskDetails}>Retry</Button>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Task not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              {isEditing ? (
                <div className="space-y-4 w-full">
                  <Input
                    value={editForm.title || ''}
                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                    placeholder="Task title"
                    className="text-xl font-bold"
                  />
                  <Textarea
                    value={editForm.description || ''}
                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Task description"
                  />
                  <div className="flex gap-4">
                    <Button onClick={handleUpdateTask}>Save Changes</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <CardTitle className="text-2xl font-bold mb-2">{task.title}</CardTitle>
                    <CardDescription>{task.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn(STATUS_CONFIG[task.status].color)}>
                      {STATUS_CONFIG[task.status].label}
                    </Badge>
                    <Badge className={cn(PRIORITY_CONFIG[task.priority].color)}>
                      {PRIORITY_CONFIG[task.priority].label}
                    </Badge>
                  </div>
                </>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Task Details */}
            <div className="grid grid-cols-2 gap-6">
              {/* Assignee */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Assignee</h3>
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={task.assignments[0]?.assignee.image} />
                    <AvatarFallback>{task.assignments[0]?.assignee.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{task.assignments[0]?.assignee.name}</span>
                </div>
              </div>

              {/* Creator */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Created By</h3>
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={task.creator.image} />
                    <AvatarFallback>{task.creator.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{task.creator.name}</span>
                </div>
              </div>

              {/* Dates */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Start Date</h3>
                <p className="text-sm flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  {task.startDate ? format(new Date(task.startDate), 'PP') : 'Not set'}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Due Date</h3>
                <p className="text-sm flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  {task.dueDate ? format(new Date(task.dueDate), 'PP') : 'Not set'}
                </p>
              </div>

              {/* Hours */}
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

            {/* Progress Bar */}
            {task.estimatedHours && task.actualHours && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Progress</h3>
                <Progress value={(task.actualHours / task.estimatedHours) * 100} className="h-2" />
              </div>
            )}
          </CardContent>

          {canEdit && (
            <CardFooter className="flex justify-between border-t pt-6">
              <Select
                value={task.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Update Status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                  
                </SelectContent>
              </Select>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="mr-2 h-4 w-4" /> Edit Task
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Task
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>

        {/* Subtasks Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Subtasks</CardTitle>
          </CardHeader>
          <CardContent>
            {/* New Subtask Form */}
            {canEdit && (
              <div className="mb-6 space-y-4">
                <Input
                  placeholder="Subtask title"
                  value={newSubtask.title}
                  onChange={(e) => setNewSubtask({ ...newSubtask, title: e.target.value })}
                />
                <Textarea
                  placeholder="Subtask description"
                  value={newSubtask.description}
                  onChange={(e) => setNewSubtask({ ...newSubtask, description: e.target.value })}
                />
                <Select
                  value={newSubtask.priority}
                  onValueChange={(value: TaskPriority) => 
                    setNewSubtask({ ...newSubtask, priority: value })
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORITY_CONFIG).map(([value, { label }]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAddSubtask}>
                  <Plus className="mr-2 h-4 w-4" /> Add Subtask
                </Button>
              </div>
            )}

            {/* Subtasks List */}
            <div className="space-y-4">
              {task.subtasks.map((subtask) => (
                <Card key={subtask.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    {editingSubtask?.id === subtask.id ? (
                      <div className="space-y-4">
                        <Input
                          value={editingSubtask.title}
                          onChange={(e) => setEditingSubtask({ 
                            ...editingSubtask, 
                            title: e.target.value 
                          })}
                        />
                        <Textarea
                          value={editingSubtask.description}
                          onChange={(e) => setEditingSubtask({ 
                            ...editingSubtask, 
                            description: e.target.value 
                          })}
                        />
                        <Select
                          value={editingSubtask.priority}
                          onValueChange={(value: TaskPriority) => 
                            setEditingSubtask({ ...editingSubtask, priority: value })
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(PRIORITY_CONFIG).map(([value, { label }]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex justify-end gap-2">
                          <Button 
                            onClick={() => handleEditSubtask(subtask.id)} 
                            variant="outline"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" /> Save
                          </Button>
                          <Button 
                            onClick={() => setEditingSubtask(null)} 
                            variant="outline"
                          >
                            <XCircle className="mr-2 h-4 w-4" /> Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-semibold">{subtask.title}</h4>
                            <p className="text-gray-600 mt-1">{subtask.description}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={cn(STATUS_CONFIG[subtask.status].color)}>
                              {STATUS_CONFIG[subtask.status].label}
                            </Badge>
                            <Badge className={cn(PRIORITY_CONFIG[subtask.priority].color)}>
                              {PRIORITY_CONFIG[subtask.priority].label}
                            </Badge>
                          </div>
                        </div>
                        {canEdit && (
                          <div className="flex justify-end gap-2">
                            <Button 
                              onClick={() => setEditingSubtask(subtask)} 
                              variant="outline" 
                              size="sm"
                            >
                              <Edit2 className="mr-2 h-4 w-4" /> Edit
                            </Button>
                            <Button 
                              onClick={() => handleDeleteSubtask(subtask.id)} 
                              variant="outline" 
                              size="sm"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Delete Task Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Task</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this task? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteTask}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}