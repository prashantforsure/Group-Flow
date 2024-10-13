'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Plus, Settings, BarChart, CircleUser } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import Link from 'next/link'

type User = {
  id: string
  name: string
  email: string
  avatar: string
}

type Task = {
  id: string
  title: string
  description: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' 
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  assignments: { assignee: User }[]
  assigneeId?: string
  startDate: string | null
  dueDate: string | null
  completedAt: string | null
  estimatedHours: number | null
  actualHours: number | null
  subtasks: Task[]
}

type Group = {
  id: string
  name: string
  description: string | null
  members: User[]
  tasks: Task[]
}

export default function GroupDetailsPage() {
  const { id } = useParams() as { id: string }
  const [group, setGroup] = useState<Group | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    assigneeId: '',
    startDate: null,
    dueDate: null,
    estimatedHours: null,
    actualHours: null,
    subtasks: [],
    status: 'PENDING',
    priority: 'MEDIUM',
    assignments: [],
    completedAt: null
  })
  const [newSubtask, setNewSubtask] = useState<Partial<Task>>({
    title: '',
    description: ''
  })

  useEffect(() => {
    if (id) {
      fetchGroupDetails()
      fetchGroupTasks()
    }
  }, [id])

  const fetchGroupDetails = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/groups/${id}`)
      setGroup(response.data)
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

  const fetchGroupTasks = async () => {
    try {
      const response = await axios.get(`/api/groups/${id}/tasks`)
      setTasks(response.data)
    } catch (error) {
      console.error('Error fetching group tasks:', error)
      toast({
        title: "Error",
        description: "Failed to load group tasks. Please try again.",
        variant: "destructive",
      })
    }
  }

  const addMember = async () => {
    try {
      await axios.post(`/api/groups/${id}/members`, { email: newMemberEmail })
      toast({
        title: "Success",
        description: "New member added to the group.",
      })
      fetchGroupDetails()
      setNewMemberEmail('')
    } catch (error) {
      console.error('Error adding member:', error)
      toast({
        title: "Error",
        description: "Failed to add new member. Please try again.",
        variant: "destructive",
      })
    }
  }

  const addTask = async () => {
    try {
      await axios.post(`/api/groups/${id}/tasks`, newTask)
      toast({
        title: "Success",
        description: "New task added to the group.",
      })
      fetchGroupTasks()
      setNewTask({
        title: '',
        description: '',
        assigneeId: '',
        startDate: null,
        dueDate: null,
        estimatedHours: null,
        actualHours: null,
        subtasks: [],
        status: 'PENDING',
        priority: 'MEDIUM',
        assignments: [],
        completedAt: null
      })
    } catch (error) {
      console.error('Error adding task:', error)
      toast({
        title: "Error",
        description: "Failed to add new task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const addSubtask = async (parentTaskId: string) => {
    try {
      await axios.post(`/api/tasks/${parentTaskId}/subtasks`, newSubtask)
      toast({
        title: "Success",
        description: "New subtask added.",
      })
      fetchGroupTasks()
      setNewSubtask({
        title: '',
        description: ''
      })
    } catch (error) {
      console.error('Error adding subtask:', error)
      toast({
        title: "Error",
        description: "Failed to add new subtask. Please try again.",
        variant: "destructive",
      })
    }
  }

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    try {
      await axios.put(`/api/tasks/${taskId}`, { status })
      toast({
        title: "Success",
        description: "Task status updated.",
      })
      fetchGroupTasks()
    } catch (error) {
      console.error('Error updating task status:', error)
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const renderTaskList = (status: Task['status']) => {
    const filteredTasks = tasks.filter((task) => task.status === status)
    
    return (
      <div key={status} className="space-y-2">
        <h3 className="font-semibold capitalize">{status.toLowerCase().replace('_', ' ')}</h3>
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <Card key={task.id} className="p-4 bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg border-none text-white">
              <h4 className="font-medium">{task.title}</h4>
              <p className="text-sm text-gray-300">{task.description}</p>
              <div className="flex items-center mt-2">
                {task.assignments[0] && task.assignments[0].assignee && (
                  <>
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={task.assignments[0].assignee.avatar} alt={task.assignments[0].assignee.name} />
                      <AvatarFallback>{task.assignments[0].assignee.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-300">{task.assignments[0].assignee.name}</span>
                  </>
                )}
              </div>
              {task.estimatedHours && task.actualHours && (
                <Progress 
                  value={(task.actualHours / task.estimatedHours) * 100} 
                  className="mt-2" 
                />
              )}
              <div className="mt-2 text-sm text-gray-300">
                <p>Start: {task.startDate ? new Date(task.startDate).toLocaleDateString() : 'Not set'}</p>
                <p>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}</p>
                <p>Estimated: {task.estimatedHours || 0} hours</p>
                <p>Actual: {task.actualHours || 0} hours</p>
              </div>
              <Select
                value={task.status}
                onValueChange={(value) => updateTaskStatus(task.id, value as Task['status'])}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Change status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
              <div className="mt-2">
                <h5 className="font-medium">Subtasks</h5>
                {task.subtasks.map((subtask) => (
                  <div key={subtask.id} className="ml-4 mt-1">
                    <p>{subtask.title}</p>
                  </div>
                ))}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button  className="mt-2 bg-black">
                      <Plus className="h-4 w-4 mr-2" /> Add Subtask
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Subtask</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
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
                    </div>
                    <DialogFooter>
                      <Button  onClick={() => addSubtask(task.id)}>Add Subtask</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          ))
        ) : (
          <p className="text-gray-300">No tasks in this status</p>
        )}
      </div>
    )
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!group) {
    return <div className="flex items-center justify-center h-screen">Group not found</div>
  }

  return (
    <div className="container mx-auto p-6 bg-gradient-to-br from-purple-900 to-indigo-900 min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{group.name}</h1>
        <Button asChild variant="outline" className='text-black'>
          <Link href={`/groups/${id}/settings`}>
            <Settings className="mr-2 h-4 w-4" /> Group Settings
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <Card className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg border-none">
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['PENDING', 'IN_PROGRESS', 'COMPLETED'].map((status) => renderTaskList(status as Task['status']))}
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" /> Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg border-none text-white">
                  <DialogHeader>
                    <DialogTitle>Add New Task</DialogTitle>
                    <DialogDescription>Create a new task for this group.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Input
                      placeholder="Task title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    />
                    <Textarea
                      placeholder="Task description"
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    />
                    <Select
                      value={newTask.assigneeId}
                      onValueChange={(value) => setNewTask({ ...newTask, assigneeId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Assign to" />
                      </SelectTrigger>
                      <SelectContent>
                        {group.members.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Start Date</label>
                        <Input
                          type="date"
                          value={newTask.startDate || ''}
                          onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Due Date</label>
                        <Input
                          type="date"
                          value={newTask.dueDate || ''}
                          onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="number"
                        placeholder="Estimated hours"
                        value={newTask.estimatedHours || ''}
                        onChange={(e) => setNewTask({ ...newTask, estimatedHours: parseFloat(e.target.value) || null })}
                      />
                      <Input
                        type="number"
                        placeholder="Actual hours"
                        value={newTask.actualHours || ''}
                        onChange={(e) => setNewTask({ ...newTask, actualHours: parseFloat(e.target.value) || null })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                  <Button onClick={addTask}>Add Task</Button>
                  </DialogFooter>
                </DialogContent> 
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <Card className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg border-none">
            <CardHeader>
              <CardTitle>Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.members.map((member) => (
                  <Card key={member.id} className="p-4 bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg border-none">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback><CircleUser /></AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-300">{member.email}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              <div className="mt-4 flex space-x-2">
                <Input
                  placeholder="New member's email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                />
                <Button onClick={addMember}>Add Member</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <Card className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg border-none">
            <CardHeader>
              <CardTitle>Group Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg border-none">
                  <CardHeader>
                    <CardTitle>Total Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{tasks.length}</div>
                  </CardContent>
                </Card>
                <Card className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg border-none">
                  <CardHeader>
                    <CardTitle>Members</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{group.members.length}</div>
                  </CardContent>
                </Card>
                <Card className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg border-none">
                  <CardHeader>
                    <CardTitle>Completion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {tasks.length > 0
                        ? Math.round((tasks.filter(t => t.status === 'COMPLETED').length / tasks.length) * 100)
                        : 0}%
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Card className="mt-4 bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg border-none">
                <CardHeader>
                  <CardTitle>Task Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart
                  //@ts-expect-error there is some type error
                    data={[
                      { name: 'Pending', value: tasks.filter(t => t.status === 'PENDING').length },
                      { name: 'In Progress', value: tasks.filter(t => t.status === 'IN_PROGRESS').length },
                      { name: 'Completed', value: tasks.filter(t => t.status === 'COMPLETED').length },
                    ]}
                    index="name"
                    categories={['value']}
                    colors={['blue']}
                    valueFormatter={(value: number) => `${value} tasks`}
                    className="mt-6"
                  />
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}