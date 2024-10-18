'use client'

import { useState, useEffect } from 'react'
import { toast } from "@/hooks/use-toast"
import axios from "axios"
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, ChevronDown, ChevronUp, Plus, Search, Filter, X, Loader2 } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Badge } from "./ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

type Task = {
  id: string
  title: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  dueDate: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  assignments: {
    assignee: {
      id: string
      name: string
      avatar: string
      email: string
    }
  }[]
}

const priorityColors = {
  LOW: 'bg-blue-100 text-blue-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-red-100 text-red-800'
}

const statusColors = {
  PENDING: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800'
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [sortField, setSortField] = useState('dueDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, [statusFilter, priorityFilter, sortField, sortOrder])

  const toggleSort = (field: string) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/tasks', {
        params: {
          status: statusFilter !== 'all' ? statusFilter.toUpperCase() : undefined,
          priority: priorityFilter !== 'all' ? priorityFilter.toUpperCase() : undefined,
          sort: sortField,
          order: sortOrder,
        }
      })
      setTasks(response.data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
      toast({
        title: "Error",
        description: "Failed to load tasks. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = () => {
    toast({
      title: "Create Task",
      description: "Task creation functionality not implemented yet.",
    })
  }

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const renderSortIcon = (field: string) => {
    if (field === sortField) {
      return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
    }
    return null
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Tasks</h1>
       
      </div>

      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>
          <Button 
            variant="outline" 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="rounded-full"
          >
            <Filter className="mr-2 h-4 w-4" /> Filters
          </Button>
        </div>
        
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-4 rounded-lg shadow-md mb-4"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Filters</h3>
                <Button variant="ghost" onClick={() => setIsFilterOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex space-x-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
         <Loader2 className="h-8 w-8 animate-spin text-[#A259FF]" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="bg-gray-100">
              <CardTitle>Your Tasks</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <Button variant="ghost" onClick={() => toggleSort('title')} className="font-medium">
                          Title {renderSortIcon('title')}
                        </Button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <Button variant="ghost" onClick={() => toggleSort('status')} className="font-medium">
                          Status {renderSortIcon('status')}
                        </Button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <Button variant="ghost" onClick={() => toggleSort('dueDate')} className="font-medium">
                          Due Date {renderSortIcon('dueDate')}
                        </Button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <Button variant="ghost" onClick={() => toggleSort('priority')} className="font-medium">
                          Priority {renderSortIcon('priority')}
                        </Button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assigned To
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredTasks.map((task, index) => (
                        <motion.tr
                          key={task.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="bg-white"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link href={`/tasks/${task.id}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                              {task.title}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={`${statusColors[task.status]} text-xs font-semibold px-2.5 py-0.5 rounded`}>
                              {task.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="mr-2 h-4 w-4" />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={`${priorityColors[task.priority]} text-xs font-semibold px-2.5 py-0.5 rounded`}>
                              {task.priority}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex -space-x-2">
                              {task.assignments.map((assignment) => (
                                // <Avatar 
                                //   key={assignment.assignee.id} 
                                //   className="border-2 border-white"
                                // >
                                //   <AvatarImage 
                                //     src={assignment.assignee.avatar} 
                                //     alt={assignment.assignee.name} 
                                //   />
                                //   <AvatarFallback>
                                //     {assignment.assignee.name}
                                //   </AvatarFallback>
                                // </Avatar>
                                <Badge className="text-sm text-zinc-800 font-semibold px-2.5 py-0.5 rounded hover:bg-sky-100 bg-white ">
                              {assignment.assignee.name}
                            </Badge>
                              ))}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}