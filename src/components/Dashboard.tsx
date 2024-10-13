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

import { Users, Loader2 } from 'lucide-react'
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
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="tasks" className="space-y-8">
          <TabsList className="bg-gray-100 p-1 rounded-full inline-flex">
            <TabsTrigger value="tasks" className="rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#A259FF] focus:ring-offset-2">
              Tasks
            </TabsTrigger>
            <TabsTrigger value="groups" className="rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#A259FF] focus:ring-offset-2">
              Groups
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tasks" className="space-y-6">
            {loading.tasks ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-[#A259FF]" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.length > 0 ? tasks.map((task) => (
                  <Card key={task.id} className="overflow-hidden transition-shadow duration-300 hover:shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-[#A259FF] to-[#1ABCFE] text-white">
                      <CardTitle>{task.title}</CardTitle>
                      <CardDescription className="text-gray-100">
                        Group: {task.group.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <Progress value={getProgressPercentage(task.status)} className="mb-4" />
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-500">Status</span>
                        <Badge variant={task.status === 'COMPLETED' ? 'default' : 'secondary'}>
                          {task.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">Priority</span>
                        <Badge variant="outline" className="font-semibold">
                          {task.priority}
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-gray-50 flex justify-between items-center">
                      <div className="flex -space-x-2 overflow-hidden">
                        {task.assignments.map((assignment) => (
                          <Avatar key={assignment.assignee.id} className="border-2 border-white">
                            <AvatarImage src={assignment.assignee.image} alt={assignment.assignee.name} />
                            <AvatarFallback>{assignment.assignee.name[0]}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <Button variant="ghost" size="sm">View Details</Button>
                    </CardFooter>
                  </Card>
                )) : (
                  <p className="text-gray-500 text-center col-span-full">No tasks found.</p>
                )}
              </div>
            )}
          </TabsContent>
          <TabsContent value="groups" className="space-y-6">
            {loading.groups ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-[#A259FF]" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.length > 0 ? groups.map((group) => (
                  <Card key={group.id} className="overflow-hidden transition-shadow duration-300 hover:shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold">{group.name}</CardTitle>
                      <CardDescription className="text-gray-600">{group.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2 mb-4">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{group.memberCount} members</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={group.userRole === 'ADMIN' ? 'default' : 'secondary'} className="text-xs">
                          {group.userRole}
                        </Badge>
                        {group.recentActivity && (
                          <Badge variant="outline" className="bg-green-100 text-green-800 text-xs">
                            Recent Activity
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full bg-[#A259FF] hover:bg-[#1ABCFE] transition-colors">
                        <Link href={`/groups/${group.id}`}>View Group</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                )) : (
                  <p className="text-gray-500 text-center col-span-full">No groups found.</p>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}