'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { Loader2, Download, Edit, Save, X, MessageSquare, Clock, FileText } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

type Document = {
  id: string
  name: string
  description: string
  content: string
  creator: {
    id: string
    name: string
    avatar: string
  }
  createdAt: string
  modifiedAt: string
  version: number
  comments: {
    id: string
    user: {
      id: string
      name: string
      avatar: string
    }
    content: string
    createdAt: string
  }[]
  relatedTasks: {
    id: string
    title: string
  }[]
  relatedProjects: {
    id: string
    name: string
  }[]
}

export default function DocumentDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [editedDescription, setEditedDescription] = useState('')
  const [editedContent, setEditedContent] = useState('')
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    fetchDocumentDetails()
  }, [id])

  const fetchDocumentDetails = async () => {
    try {
      setLoading(true)
      const [documentRes, commentsRes] = await Promise.all([
        axios.get(`/api/documents/${id}`),
        axios.get(`/api/documents/${id}/comments`)
      ])
      const documentData = { ...documentRes.data, comments: commentsRes.data }
      setDocument(documentData)
      setEditedName(documentData.name)
      setEditedDescription(documentData.description)
      setEditedContent(documentData.content)
    } catch (error) {
      console.error('Error fetching document details:', error)
      toast({
        title: "Error",
        description: "Failed to load document details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (document) {
      const blob = new Blob([document.content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      //@ts-expect-error there is so type error
      const a = document.createElement('a')
      a.href = url
      a.download = document.name
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleEdit = () => {
    setEditing(true)
  }

  const handleSave = async () => {
    try {
      const response = await axios.put(`/api/documents/${id}`, {
        name: editedName,
        description: editedDescription,
        content: editedContent
      })
      setDocument(response.data)
      setEditing(false)
      toast({
        title: "Success",
        description: "Document updated successfully.",
      })
    } catch (error) {
      console.error('Error updating document:', error)
      toast({
        title: "Error",
        description: "Failed to update document. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCancelEdit = () => {
    setEditing(false)
    if (document) {
      setEditedName(document.name)
      setEditedDescription(document.description)
      setEditedContent(document.content)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    try {
      const response = await axios.post(`/api/documents/${id}/comments`, { content: newComment })
      setDocument(prevDoc => prevDoc ? {
        ...prevDoc,
        comments: [...prevDoc.comments, response.data]
      } : null)
      setNewComment('')
      toast({
        title: "Success",
        description: "Comment added successfully.",
      })
    } catch (error) {
      console.error('Error adding comment:', error)
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!document) {
    return <div>Document not found</div>
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            {editing ? (
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="text-2xl font-bold"
              />
            ) : (
              <CardTitle>{document.name}</CardTitle>
            )}
            <div className="space-x-2">
              <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" /> Download
              </Button>
              {editing ? (
                <>
                  <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" /> Save
                  </Button>
                  <Button variant="outline" onClick={handleCancelEdit}>
                    <X className="mr-2 h-4 w-4" /> Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              {editing ? (
                <Textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  rows={3}
                />
              ) : (
                <p>{document.description}</p>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Content</h3>
              {editing ? (
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  rows={10}
                />
              ) : (
                <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md">{document.content}</pre>
              )}
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarImage src={document.creator.avatar} alt={document.creator.name} />
                  <AvatarFallback>{document.creator.name[0]}</AvatarFallback>
                </Avatar>
                <span>{document.creator.name}</span>
              </div>
              <div className="space-x-2">
                <Badge variant="secondary">
                  <Clock className="mr-1 h-3 w-3" />
                  Created: {new Date(document.createdAt).toLocaleDateString()}
                </Badge>
                <Badge variant="secondary">
                  <Clock className="mr-1 h-3 w-3" />
                  Modified: {new Date(document.modifiedAt).toLocaleDateString()}
                </Badge>
                <Badge variant="secondary">
                  <FileText className="mr-1 h-3 w-3" />
                  Version: {document.version}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Related Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {document.relatedTasks.map(task => (
              <li key={task.id} className="flex items-center space-x-2">
                <Button variant="link" onClick={() => router.push(`/tasks/${task.id}`)}>
                  {task.title}
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Related Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {document.relatedProjects.map(project => (
              <li key={project.id} className="flex items-center space-x-2">
                <Button variant="link" onClick={() => router.push(`/projects/${project.id}`)}>
                  {project.name}
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4 mb-4">
            {document.comments.map(comment => (
              <li key={comment.id} className="flex space-x-4">
                <Avatar>
                  <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                  <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{comment.user.name}</p>
                  <p className="text-sm text-muted-foreground">{new Date(comment.createdAt).toLocaleString()}</p>
                  <p className="mt-1">{comment.content}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex space-x-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button onClick={handleAddComment}>
              <MessageSquare className="mr-2 h-4 w-4" /> Post
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}