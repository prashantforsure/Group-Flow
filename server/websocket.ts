import { Server as HttpServer } from 'http'
import { parse } from 'url'
import { WebSocket, WebSocketServer } from 'ws'
import { getSession } from 'next-auth/react'
import { NextApiRequest } from 'next'

interface ExtWebSocket extends WebSocket {
  userId?: string
  groupId?: string
  channelId?: string
}

export default function setupWebSocketServer(server: HttpServer) {
  const wss = new WebSocketServer({ noServer: true })

  server.on('upgrade', async (request, socket, head) => {
    const { pathname, query } = parse(request.url || '', true)

    if (pathname === '/api/websocket') {
      const session = await getSession({ req: request as NextApiRequest })
      if (!session) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
        socket.destroy()
        return
      }

      wss.handleUpgrade(request, socket, head, (ws) => {
        const extWs = ws as ExtWebSocket
        extWs.userId = session.user.id
        extWs.groupId = query.groupId as string
        extWs.channelId = query.channelId as string
        wss.emit('connection', extWs, request)
      })
    } else {
      socket.destroy()
    }
  })

  wss.on('connection', (ws: ExtWebSocket) => {
    console.log(`New WebSocket connection: User ${ws.userId} in Group ${ws.groupId}, Channel ${ws.channelId}`)

    ws.on('message', (message: string) => {
      const data = JSON.parse(message)
      broadcastToChannel(wss, ws.groupId!, ws.channelId!, data)
    })

    ws.on('close', () => {
      console.log(`WebSocket disconnected: User ${ws.userId}`)
    })
  })

  return wss
}

function broadcastToChannel(wss: WebSocketServer, groupId: string, channelId: string, data: any) {
  wss.clients.forEach((client) => {
    const extClient = client as ExtWebSocket
    if (extClient.groupId === groupId && extClient.channelId === channelId) {
      extClient.send(JSON.stringify(data))
    }
  })
}