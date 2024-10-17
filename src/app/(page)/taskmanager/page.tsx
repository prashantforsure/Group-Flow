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
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from '@/hooks/use-toast'
import { Loader2, Calendar, Clock, AlertTriangle, CheckCircle, XCircle, Edit2, Trash2, Plus } from 'lucide-react'

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
  const { taskId } = useParams() as { taskId: string }
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [newSubtask, setNewSubtask] = useState({ title: '', description: '', priority: 'MEDIUM' as TaskPriority })
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Task>>({})
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    fetchTaskDetails()
  }, [taskId])

  const fetchTaskDetails = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/tasks/${taskId}`)
      setTask(response.data)
      setEditForm(response.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load task details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateTask = async ({ status }: { status: TaskStatus }) => {
    try {
      const response = await axios.put(`/api/tasks/${taskId}`, {
        ...editForm,
        status
      })
      setTask(response.data)
      setIsEditing(false)
      toast({
        title: "Success", 
        description: "Task updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddSubtask = async () => {
    try {
      const response = await axios.post(`/api/tasks/${taskId}/subtasks`, newSubtask)
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
      toast({
        title: "Error",
        description: "Failed to add subtask. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTask = async () => {
    try {
      await axios.delete(`/api/tasks/${taskId}`)
      toast({
        title: "Success",
        description: "Task deleted successfully",
      })
      router.push('/dashboard') // Adjust this route as needed
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
    }
  }

  const canEdit = session?.user && (
    task?.assignments.some(a => a.assignee.id === session.user.id) ||
    session.user.email === 'admin@example.com'
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Task Not Found</h1>
        <p className="text-gray-600">The requested task could not be found.</p>
        <Button onClick={() => router.push('/dashboard')} className="mt-4">
          Return to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
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
                <Button onClick={() => handleUpdateTask({ status: editForm.status! })}>
  Save Changes
</Button>
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
                  <Badge className={STATUS_CONFIG[task.status].color}>
                    {STATUS_CONFIG[task.status].label}
                  </Badge>
                  <Badge className={PRIORITY_CONFIG[task.priority].color}>
                    {PRIORITY_CONFIG[task.priority].label}
                  </Badge>
                </div>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
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
              onValueChange={(value: TaskStatus) => handleUpdateTask({ status: value })}
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
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit2 className="mr-2 h-4 w-4" /> Edit Task
              </Button>
              <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete Task
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {canEdit && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add Subtask</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
                onValueChange={(value: TaskPriority) => setNewSubtask({ ...newSubtask, priority: value })}
              >
                <SelectTrigger>
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
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Subtasks</CardTitle>
        </CardHeader>
        <CardContent>
          {task.subtasks.length > 0 ? (
            <div className="space-y-4">
              {task.subtasks.map((subtask) => (
                <Card key={subtask.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{subtask.title}</h4>
                        <p className="text-sm text-gray-600">{subtask.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge  className={STATUS_CONFIG[subtask.status].color}>
                          {STATUS_CONFIG[subtask.status].label}
                        </Badge>
                        <Badge className={PRIORITY_CONFIG[subtask.priority].color}>
                          {PRIORITY_CONFIG[subtask.priority].label}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">No subtasks yet.</p>
          )}
        </CardContent>
      </Card>

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
  )
}