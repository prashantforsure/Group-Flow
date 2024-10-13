'use client'

import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { Users } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

type Task = {
  id: string
  title: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  priority: string
  group: {
    id: string
    name: string
  }
  assignments: {
    assignee: {
      id: string
      name: string
      email: string
      image: string
    }
  }[]
}

type Group = {
  id: string
  name: string
  description: string
  memberCount: number
  userRole: string
  recentActivity: boolean
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState({ tasks: true, groups: true })

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, tasks: true }))
      const response = await axios.get<Task[]>('/api/users/me/tasks')
      setTasks(response.data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
      toast({
        title: "Error",
        description: "Failed to load tasks. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(prev => ({ ...prev, tasks: false }))
    }
  }, [])

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, groups: true }))
      const response = await axios.get<{ groups: Group[], totalPages: number }>('/api/users/me/groups')
      setGroups(response.data.groups)
    } catch (error) {
      console.error('Error fetching groups:', error)
      toast({
        title: "Error",
        description: "Failed to load groups. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(prev => ({ ...prev, groups: false }))
    }
  }, [])

  useEffect(() => {
    fetchTasks()
    fetchGroups()
  }, [fetchTasks, fetchGroups])

  const getProgressPercentage = (status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED') => {
    switch (status) {
      case 'PENDING':
        return 0
      case 'IN_PROGRESS':
        return 50
      case 'COMPLETED':
        return 100
      default:
        return 0
    }
  }

  return (
    <div className="container mx-auto p-6 bg-gradient-to-br from-purple-900 to-indigo-900 min-h-screen">
      <h1 className="text-4xl font-bold mb-6 text-white">Dashboard</h1>
      <Tabs defaultValue="tasks" className="space-y-6">
        <TabsList className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg">
          <TabsTrigger value="tasks" className="text-white">Tasks</TabsTrigger>
          <TabsTrigger value="groups" className="text-white">Groups</TabsTrigger>
        </TabsList>
        <TabsContent value="tasks">
          {loading.tasks ? (
            <div className="text-white">Loading tasks...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.length > 0 ? tasks.map((task) => (
                <Card key={task.id} className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg border-none text-white">
                  <CardHeader>
                    <CardTitle>{task.title}</CardTitle>
                    <CardDescription className="text-gray-300">
                      Group: {task.group.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress value={getProgressPercentage(task.status)} className="mb-2" />
                    <p>Status: {task.status}</p>
                    <p>Priority: {task.priority}</p>
                  </CardContent>
                  <CardFooter>
                    <div className="flex flex-wrap gap-2">
                      {task.assignments.map((assignment) => (
                        <Avatar key={assignment.assignee.id}>
                          <AvatarImage src={assignment.assignee.image} alt={assignment.assignee.name} />
                          <AvatarFallback>{assignment.assignee.name[0]}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </CardFooter>
                </Card>
              )) : (
                <p className="text-white">No tasks found.</p>
              )}
            </div>
          )}
        </TabsContent>
        <TabsContent value="groups">
          {loading.groups ? (
            <div className="text-white">Loading groups...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.length > 0 ? groups.map((group) => (
                <Card key={group.id} className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg border-none text-white">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold">{group.name}</CardTitle>
                    <CardDescription className="text-gray-300">{group.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>{group.memberCount} members</span>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant={group.userRole === 'ADMIN' ? 'default' : 'secondary'}>
                        {group.userRole}
                      </Badge>
                      {group.recentActivity && (
                        <Badge variant="outline" className="bg-green-100 text-green-800 bg-opacity-10">
                          Recent Activity
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full bg-primary hover:bg-primary/90">
                      <Link href={`/groups/${group.id}`}>View Group</Link>
                    </Button>
                  </CardFooter>
                </Card>
              )) : (
                <p className="text-white">No groups found.</p>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}