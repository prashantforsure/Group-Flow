'use client'
import { Badge } from "@/components/ui/badge"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { toast } from '@/hooks/use-toast'
import { Settings } from 'lucide-react'

type Group = {
  id: string
  name: string
  memberCount: number
  taskCount: number
  completedTaskCount: number
}

type Activity = {
  id: string
  user: {
    name: string
    avatar: string
  }
  action: string
  timestamp: string
}

type Task = {
  id: string
  title: string
  status: string
}

export default function GroupDetailsPage() {
  const { id } = useParams()
  const [group, setGroup] = useState<Group | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGroupDetails()
  }, [id])

  const fetchGroupDetails = async () => {
    try {
      setLoading(true)
      const groupRes = await axios.get(`/api/groups/${id}`)
      setGroup(groupRes.data)
  
  
      try {
        const tasksRes = await axios.get(`/api/groups/${id}/tasks`)
        setTasks(tasksRes.data)
      } catch (taskError) {
        console.error('Error fetching group tasks:', taskError)
        setTasks([])
        toast({
          title: "Warning",
          description: "Unable to load group tasks. Some features may be limited.",
          
        })
      }
    } catch (error) {
      console.error('Error fetching group details:', error)
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 404) {
          toast({
            title: "Error",
            description: "Group not found. It may have been deleted or you don't have access.",
            variant: "destructive",
          })
        } else if (error.response.status === 401) {
          toast({
            title: "Error",
            description: "You are not authorized to view this group.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error",
            description: "Failed to load group details. Please try again.",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading || !group) {
    return <div>Loading...</div>
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Group Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Members:</span>
                <span>{group.memberCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Tasks:</span>
                <span>{group.taskCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Completed Tasks:</span>
                <span>{group.completedTaskCount}</span>
              </div>
              <Progress value={(group.completedTaskCount / group.taskCount) * 100} className="mt-2" />
            </div>
          </CardContent>
        </Card>

        

        <Card>
          <CardHeader>
            <CardTitle>Ongoing Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {tasks.slice(0, 5).map((task) => (
                <li key={task.id} className="flex justify-between items-center">
                  <span>{task.title}</span>
                  <Badge>
                    {task.status}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}