'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { VideoRoom } from '@/components/video/VideoRoom';
import { VideoLobby } from '@/components/video/VideoLobby';   // ← new
import { Video } from 'lucide-react';

export default function JoinRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = (params.roomId as string)?.toUpperCase() || '';

  const [inLobby, setInLobby] = useState(true);
  const [joined, setJoined] = useState(false);
  const [finalUserId, setFinalUserId] = useState('patient-thandi');
  const [startWithMic, setStartWithMic] = useState(false);
  const [startWithCam, setStartWithCam] = useState(true);

  if (!roomId) return <div className="p-10 text-center">Invalid room.</div>;

  if (joined) {
    return (
      <VideoRoom
        roomId={roomId}
        userId={finalUserId}
        onLeave={() => router.push('/')}
        startWithMic={startWithMic}
        startWithCam={startWithCam}
      />
    );
  }

  if (inLobby) {
    return (
      <VideoLobby
        roomId={roomId}
        onCancel={() => router.push('/')}
        onJoin={({ userId, startWithMic: mic, startWithCam: cam }) => {
          setFinalUserId(userId);
          setStartWithMic(mic);
          setStartWithCam(cam);
          setJoined(true);
        }}
      />
    );
  }

  return null;
}