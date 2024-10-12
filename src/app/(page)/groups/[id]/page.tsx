'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  status: 'PENDING' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  assignments: { assignee: User }[]
  estimatedHours: number | null
  actualHours: number | null
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
  const [newTask, setNewTask] = useState({ title: '', assigneeId: '' })

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
      setNewTask({ title: '', assigneeId: '' })
    } catch (error) {
      console.error('Error adding task:', error)
      toast({
        title: "Error",
        description: "Failed to add new task. Please try again.",
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
            <Card key={task.id} className="p-4">
              <h4 className="font-medium">{task.title}</h4>
              <div className="flex items-center mt-2">
                {task.assignments[0] && task.assignments[0].assignee && (
                  <>
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={task.assignments[0].assignee.avatar} alt={task.assignments[0].assignee.name} />
                      <AvatarFallback>{task.assignments[0].assignee.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-500">{task.assignments[0].assignee.name}</span>
                  </>
                )}
              </div>
              {task.estimatedHours && task.actualHours && (
                <Progress 
                  value={(task.actualHours / task.estimatedHours) * 100} 
                  className="mt-2" 
                />
              )}
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
                  <SelectItem value="IN_REVIEW">In Review</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="ON_HOLD">On Hold</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
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
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{group.name}</h1>
        <Button asChild>
          <Link href={`/groups/${id}/settings`}>
            <Settings className="mr-2 h-4 w-4" /> Group Settings
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
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
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Task</DialogTitle>
                    <DialogDescription>Create a new task for this group.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Input
                        id="task-title"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        className="col-span-4"
                        placeholder="Task title"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Select
                        value={newTask.assigneeId}
                        onValueChange={(value) => setNewTask({ ...newTask, assigneeId: value })}
                      >
                        <SelectTrigger className="col-span-4">
                          <SelectValue placeholder="Assign to" />
                        </SelectTrigger>
                        <SelectContent>
                          {group.members.map((member) => (
                            member && (
                              <SelectItem key={member.id} value={member.id}>
                                {member.name}
                              </SelectItem>
                            )
                          ))}
                        </SelectContent>
                      </Select>
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
          <Card>
            <CardHeader>
              <CardTitle>Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.members.map((member) => (
                  <Card key={member.id } className="p-4">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        
                        <AvatarFallback> <CircleUser /> </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name }</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
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
          <Card>
            <CardHeader>
              <CardTitle>Group Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Total Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{tasks.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Members</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{group.members.length}</div>
                  </CardContent>
                </Card>
                <Card>
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
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Task Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart
                  //@ts-expect-error
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