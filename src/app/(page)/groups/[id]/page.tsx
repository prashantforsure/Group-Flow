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
import TaskDistributionChart from '@/components/TaskDistributionChart'

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
    
    return   (
      <div key={status} className="space-y-4">
        <h3 className="text-lg font-semibold capitalize">{status.toLowerCase().replace('_', ' ')}</h3>
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <Card key={task.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
              <CardHeader className="bg-gradient-to-r from-[#A259FF] to-[#1ABCFE] text-white p-4">
                <CardTitle className="text-lg font-medium">{task.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600 mb-4">{task.description}</p>
                <div className="flex items-center mb-4">
                  {task.assignments[0] && task.assignments[0].assignee && (
                    <>
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={task.assignments[0].assignee.avatar} alt={task.assignments[0].assignee.name} />
                        <AvatarFallback>{task.assignments[0].assignee.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600">{task.assignments[0].assignee.name}</span>
                    </>
                  )}
                </div>
                {task.estimatedHours && task.actualHours && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{Math.round((task.actualHours / task.estimatedHours) * 100)}%</span>
                    </div>
                    <Progress 
                      value={(task.actualHours / task.estimatedHours) * 100} 
                      className="h-2"
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                  <div>
                    <p>Start: {task.startDate ? new Date(task.startDate).toLocaleDateString() : 'Not set'}</p>
                    <p>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}</p>
                  </div>
                  <div>
                    <p>Estimated: {task.estimatedHours || 0} hours</p>
                    <p>Actual: {task.actualHours || 0} hours</p>
                  </div>
                </div>
                <Select
                  value={task.status}
                  onValueChange={(value) => updateTaskStatus(task.id, value as Task['status'])}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Change status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <div className="mt-4">
                  <h5 className="font-medium mb-2">Subtasks</h5>
                  {task.subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center mb-2">
                      <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                      <p className="text-sm text-gray-600">{subtask.title}</p>
                    </div>
                  ))}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full mt-2">
                        <Plus className="h-4 w-4 mr-2" /> Add Subtask
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add New Subtask</DialogTitle>
                        <DialogDescription>Create a new subtask for this task.</DialogDescription>
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
                        <Button onClick={() => addSubtask(task.id)}>Add Subtask</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-gray-500">No tasks in this status</p>
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
          <div className=''>
          <Button asChild variant="outline" className='mr-2'>
            <Link href={`/groups/${id}/channels`}>
              <Settings className="mr-2 h-4 w-4" />Channels
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/groups/${id}/settings`}>
              <Settings className="mr-2 h-4 w-4" /> Group Settings
            </Link>
          </Button>

          </div>
          
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="tasks" className="space-y-8">
          <TabsList className="bg-white p-1 rounded-full inline-flex shadow-sm">
            <TabsTrigger value="tasks" className="rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#A259FF] focus:ring-offset-2">
              Tasks
            </TabsTrigger>
            <TabsTrigger value="members" className="rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#A259FF] focus:ring-offset-2">
              Members
            </TabsTrigger>
            <TabsTrigger value="overview" className="rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#A259FF] focus:ring-offset-2">
              Overview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {['PENDING', 'IN_PROGRESS', 'COMPLETED'].map((status) => renderTaskList(status as Task['status']))}
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-[#A259FF] hover:bg-[#1ABCFE] text-white transition-colors">
                  <Plus className="mr-2 h-4 w-4" /> Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <Input
                        type="date"
                        value={newTask.startDate || ''}
                        onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
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
                  <Button onClick={addTask} className="bg-[#A259FF] hover:bg-[#1ABCFE] text-white transition-colors">Add Task</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="members" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {group.members.map((member) => (
                <Card key={member.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback><CircleUser /></AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-lg">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex space-x-4">
              <Input
                placeholder="New member's email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="flex-grow"
              />
              <Button onClick={addMember} className="bg-[#A259FF] hover:bg-[#1ABCFE] text-white transition-colors">Add Member</Button>
            </div>
          </TabsContent>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-[#A259FF]">{tasks.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-[#1ABCFE]">{group.members.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold  text-green-500">
                    {tasks.length > 0
                      ? Math.round((tasks.filter(t => t.status === 'COMPLETED').length / tasks.length) * 100)
                      : 0}%
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card>
  <CardHeader>
    <CardTitle>Task Distribution</CardTitle>
  </CardHeader>
  <CardContent>
    <TaskDistributionChart tasks={tasks} />
  </CardContent>
</Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}