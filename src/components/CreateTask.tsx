'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { MultiSelect } from "@/components/ui/multi-select"
import { DatePicker } from "@/components/ui/date-picker"
import { Loader2, Plus, X } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

type User = {
  id: string
  name: string
}

type Group = {
  id: string
  name: string
}
type Option = {
  value: string
  label: string
}


interface Task {
  title: string
  description: string
  status: string
  priority: string
  dueDate: Date
  assignedMembers: string[]
  group: string
  subtasks: { title: string; completed: boolean }[]
  attachments: File[]
}

export default function CreateTaskPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [task, setTask] = useState<Task>({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    dueDate: new Date(),
    assignedMembers: [],
    group: '',
    subtasks: [],
    attachments: []
  })

  useEffect(() => {
    fetchUsersAndGroups()
  }, [])

  const fetchUsersAndGroups = async () => {
    try {
      const [usersRes, groupsRes] = await Promise.all([
        axios.get<User[]>('/api/users'),
        axios.get<Group[]>('/api/groups')
      ])
      setUsers(usersRes.data)
      setGroups(groupsRes.data)
    } catch (error) {
      console.error('Error fetching users and groups:', error)
      toast({
        title: "Error",
        description: "Failed to load users and groups. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getSelectedOptions = (): Option[] => {
    return task.assignedMembers.map(memberId => {
      const user = users.find(u => u.id === memberId)
      return {
        value: memberId,
        label: user?.name || memberId
      }
    })
  }

  // Convert users to Option[] format
  const getUserOptions = (): Option[] => {
    return users.map(user => ({
      value: user.id,
      label: user.name
    }))
  }

  const handleMemberChange = (selectedOptions: Option[]) => {
    setTask({
      ...task,
      assignedMembers: selectedOptions.map(option => option.value)
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTask({ ...task, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setTask({ ...task, [name]: value })
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setTask({ ...task, dueDate: date })
    }
  }

  

  const handleAddSubtask = () => {
    setTask({
      ...task,
      subtasks: [...task.subtasks, { title: '', completed: false }]
    })
  }

  const handleSubtaskChange = (index: number, value: string) => {
    const newSubtasks = [...task.subtasks]
    newSubtasks[index].title = value
    setTask({ ...task, subtasks: newSubtasks })
  }

  const handleRemoveSubtask = (index: number) => {
    const newSubtasks = task.subtasks.filter((_, i) => i !== index)
    setTask({ ...task, subtasks: newSubtasks })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setTask({ ...task, attachments: [...task.attachments, ...Array.from(e.target.files)] })
    }
  }

  const handleRemoveAttachment = (index: number) => {
    const newAttachments = task.attachments.filter((_, i) => i !== index)
    setTask({ ...task, attachments: newAttachments })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData()

      Object.entries(task).forEach(([key, value]) => {
        if (key === 'attachments') {
          value.forEach((file: File) => formData.append('attachments', file))
        } else if (key === 'subtasks') {
          formData.append('subtasks', JSON.stringify(value))
        } else if (key === 'dueDate') {
          formData.append(key, value.toISOString())
        } else {
          formData.append(key, value.toString())
        }
      })

      await axios.post('/api/tasks', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      toast({
        title: "Success",
        description: "Task created successfully.",
      })
      router.push('/tasks')
    } catch (error) {
      console.error('Error creating task:', error)
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Task</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={task.title}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={task.description}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={task.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={task.priority}
                  onValueChange={(value) => handleSelectChange('priority', value)}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <DatePicker
              //@ts-expect-error there is some type error
                id="dueDate"
                selected={task.dueDate}
                onSelect={handleDateChange}
              />
            </div>
            <div>
              <Label htmlFor="assignedMembers">Assigned Members</Label>
              <MultiSelect
                options={getUserOptions()}
                selected={getSelectedOptions()}
                onChange={handleMemberChange}
                placeholder="Select members"
              />
            </div>
            <div>
              <Label htmlFor="group">Related Project/Group</Label>
              <Select
                value={task.group}
                onValueChange={(value) => handleSelectChange('group', value)}
              >
                <SelectTrigger id="group">
                  <SelectValue placeholder="Select project/group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map(group => (
                    <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subtasks</Label>
              {task.subtasks.map((subtask, index) => (
                <div key={index} className="flex items-center space-x-2 mt-2">
                  <Input
                    value={subtask.title}
                    onChange={(e) => handleSubtaskChange(index, e.target.value)}
                    placeholder="Subtask title"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveSubtask(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={handleAddSubtask}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Subtask
              </Button>
            </div>
            <div>
              <Label htmlFor="attachments">Attachments</Label>
              <Input
                id="attachments"
                type="file"
                onChange={handleFileChange}
                multiple
                className="mt-2"
              />
              {task.attachments.length > 0 && (
                <ul className="mt-2 space-y-2">
                  {task.attachments.map((file, index) => (
                    <li key={index} className="flex items-center justify-between">
                      <span>{file.name}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveAttachment(index)}
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button type="submit" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Task...
              </>
            ) : (
              'Create Task'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}