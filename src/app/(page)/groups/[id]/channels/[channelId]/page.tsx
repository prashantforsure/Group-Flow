import Channel from '@/components/channel'
import { useRouter } from 'next/router'


const ChannelPage: React.FC = () => {
  const router = useRouter()
  const { id: groupId, channelId } = router.query

  if (!groupId || !channelId) {
    return <div>Loading...</div>
  }

  return (
    <div className="h-screen">
      <Channel groupId={groupId as string} channelId={channelId as string} />
    </div>
  )
}

export default ChannelPage