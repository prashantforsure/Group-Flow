'use client'

import { toast } from "@/hooks/use-toast"
import axios from "axios"
import { Calendar, ChevronDown, ChevronUp, Plus, Search } from "lucide-react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import Link from "next/link"
import { Badge } from "./ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

type Task = {
    id: string
    title: string
    status: 'pending' | 'in_progress' | 'completed'
    dueDate: string
    priority: 'low' | 'medium' | 'high'
    assignedMembers: {
      id: string
      name: string
      avatar: string
    }[]
}
export default function TaskList(){
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [priorityFilter, setPriorityFilter] = useState('all')
    const [sortField, setSortField] = useState('dueDate')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

    useEffect(() => {
        fetchTasks()
      }, [statusFilter, priorityFilter, sortField, sortOrder])

    const fetchTasks = async () => {
        try{
            setLoading(true)
            const response = await axios.get('/api/tasks', {
              params: {
                status: statusFilter !== 'all' ? statusFilter : undefined,
                priority: priorityFilter !== 'all' ? priorityFilter : undefined,
                sort: sortField,
                order: sortOrder,
              }
            })
            setTasks(response.data) 
        }catch(error){
            console.error('Error fetching tasks:', error)
            toast({
            title: "Error",
            description: "Failed to load tasks. Please try again.",
            variant: "destructive",
      })
        }finally {
            setLoading(false)
        }
    }
    const handleCreateTask = () => {
        // Implement task creation logic or navigation
        toast({
          title: "Create Task",
          description: "Task creation functionality not implemented yet.",
        })
      }
    
      const filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    
      const toggleSort = (field: string) => {
        if (field === sortField) {
          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
          setSortField(field)
          setSortOrder('asc')
        }
      }
    
      const renderSortIcon = (field: string) => {
        if (field === sortField) {
          return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
        }
        return null
      }
      return (
        <div className="container mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Tasks</h1>
            <Button onClick={handleCreateTask}>
              <Plus className="mr-2 h-4 w-4" /> Create New Task
            </Button>
          </div>
    
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
            <div className="w-full md:w-1/3">
              <Input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                
              />
            </div>
            <div className="flex space-x-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
    
          {loading ? (
            <div>Loading tasks...</div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Your Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full">
                  <thead>
                    <tr className="text-left">
                      <th className="pb-4">
                        <Button variant="ghost" onClick={() => toggleSort('title')}>
                          Title {renderSortIcon('title')}
                        </Button>
                      </th>
                      <th className="pb-4">
                        <Button variant="ghost" onClick={() => toggleSort('status')}>
                          Status {renderSortIcon('status')}
                        </Button>
                      </th>
                      <th className="pb-4">
                        <Button variant="ghost" onClick={() => toggleSort('dueDate')}>
                          Due Date {renderSortIcon('dueDate')}
                        </Button>
                      </th>
                      <th className="pb-4">
                        <Button variant="ghost" onClick={() => toggleSort('priority')}>
                          Priority {renderSortIcon('priority')}
                        </Button>
                      </th>
                      <th className="pb-4">Assigned To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map((task) => (
                      <tr key={task.id} className="border-t">
                        <td className="py-4">
                          <Link href={`/tasks/${task.id}`} className="hover:underline">
                            {task.title}
                          </Link>
                        </td>
                        <td className="py-4">
                          <Badge>
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-4">
                          <Badge >
                            {task.priority}
                          </Badge>
                        </td>
                        <td className="py-4">
                          <div className="flex -space-x-2">
                            {task.assignedMembers.map((member) => (
                              <Avatar key={member.id} className="border-2 border-background">
                                <AvatarImage src={member.avatar} alt={member.name} />
                                <AvatarFallback>{member.name[0]}</AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </div>
      )
    }
