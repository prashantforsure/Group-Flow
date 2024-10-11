'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { Search, Upload, ChevronUp, ChevronDown } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

type Document = {
  id: string
  name: string
  createdAt: string
  modifiedAt: string
  creator: {
    id: string
    name: string
  }
  group: {
    id: string
    name: string
  }
}

type Group = {
  id: string
  name: string
}

export default function DocumentsListPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('')
  const [sortField, setSortField] = useState<keyof Document>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    fetchDocumentsAndGroups()
  }, [])

  const fetchDocumentsAndGroups = async () => {
    try {
      setLoading(true)
      const [documentsRes, groupsRes] = await Promise.all([
        axios.get('/api/documents'),
        axios.get('/api/groups')
      ])
      setDocuments(documentsRes.data)
      setGroups(groupsRes.data)
    } catch (error) {
      console.error('Error fetching documents and groups:', error)
      toast({
        title: "Error",
        description: "Failed to load documents and groups. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleGroupFilter = (value: string) => {
    setSelectedGroup(value)
  }

  const handleSort = (field: keyof Document) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to upload.",
        variant: "destructive",
      })
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post('/api/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setDocuments([...documents, response.data])
      setFile(null)
      toast({
        title: "Success",
        description: "Document uploaded successfully.",
      })
    } catch (error) {
      console.error('Error uploading document:', error)
      toast({
        title: "Error",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredDocuments = documents
    .filter(doc => doc.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(doc => selectedGroup ? doc.group.id === selectedGroup : true)
    .sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1
      if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Documents</h1>
        <div className="flex items-center space-x-2">
          <Input
            type="file"
            onChange={handleFileChange}
            className="max-w-xs"
          />
          <Button onClick={handleUpload}>
            <Upload className="mr-2 h-4 w-4" /> Upload New Document
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full"
              //@ts-expect-error this so type error
              icon={<Search className="h-4 w-4 text-gray-500" />}
            />
          </div>
          <div className="w-full md:w-64">
            <Select value={selectedGroup} onValueChange={handleGroupFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Groups</SelectItem>
                {groups.map(group => (
                  <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div>Loading documents...</div>
      ) : (
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('name')}>
                      Document Name
                      {sortField === 'name' && (sortOrder === 'asc' ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />)}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('createdAt')}>
                      Created Date
                      {sortField === 'createdAt' && (sortOrder === 'asc' ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />)}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('modifiedAt')}>
                      Modified Date
                      {sortField === 'modifiedAt' && (sortOrder === 'asc' ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />)}
                    </Button>
                  </TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Group/Project</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map(doc => (
                  <TableRow key={doc.id}>
                    <TableCell>{doc.name}</TableCell>
                    <TableCell>{new Date(doc.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(doc.modifiedAt).toLocaleDateString()}</TableCell>
                    <TableCell>{doc.creator.name}</TableCell>
                    <TableCell>{doc.group.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}