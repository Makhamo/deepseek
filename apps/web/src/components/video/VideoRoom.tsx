'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Peer, { MediaConnection, DataConnection } from 'peerjs';
import {
  Video, VideoOff, Mic, MicOff, PhoneOff, MessageSquare, Users,
  Send, X, Shield, Clock, Link2, UserPlus, AlertTriangle, Hand,
  Monitor, MonitorOff, Settings, Grid3x3, User, Smile, Circle, Maximize2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const IDENTITY_MAP: Record<string, { name: string; role: string }> = {
  'doctor-naidoo': { name: 'Dr. S. Naidoo', role: 'Doctor' },
  'patient-thandi': { name: 'Thandi Ndlovu', role: 'Patient' },
  'lab-dlamini': { name: 'Lab Tech M. Dlamini', role: 'Lab' },
  'pharm-botha': { name: 'Pharm. K. Botha', role: 'Pharmacy' },
  'admin-unitac': { name: 'Admin – Unitac', role: 'Admin' },
};

type Participant = {
  id: string;
  name: string;
  role: string;
  isLocal?: boolean;
  videoOn: boolean;
  audioOn: boolean;
  raisedHand?: boolean;
  reaction?: string;
};

type ChatMessage = { from: string; text: string; time: string };

type AppStateMsg =
  | { type: 'state'; videoOn: boolean; audioOn: boolean; raisedHand: boolean }
  | { type: 'chat'; from: string; text: string; time: string }
  | { type: 'reaction'; emoji: string; from: string };

type Props = {
  roomId: string;
  userId: string;
  onLeave: () => void;
  startWithMic?: boolean;
  startWithCam?: boolean;
};

const REACTIONS = ['👍', '👏', '❤️', '😂', '😮', '🙌'];

export function VideoRoom({
  roomId,
  userId,
  onLeave,
  startWithMic = false,
  startWithCam = true,
}: Props) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer | null>(null);
  const callsRef = useRef<Map<string, MediaConnection>>(new Map());
  const dataConnsRef = useRef<Map<string, DataConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoOn, setVideoOn] = useState(startWithCam);
  const [audioOn, setAudioOn] = useState(startWithMic);
  const [screenSharing, setScreenSharing] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Connecting…');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [duration, setDuration] = useState(0);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [linkCopied, setLinkCopied] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [handRaised, setHandRaised] = useState(false);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [layout, setLayout] = useState<'grid' | 'spotlight'>('grid');
  const [devices, setDevices] = useState<{ video: MediaDeviceInfo[]; audio: MediaDeviceInfo[] }>({ video: [], audio: [] });
  const [recording, setRecording] = useState(false);
  const [reactionsOpen, setReactionsOpen] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);

  const identity = IDENTITY_MAP[userId] || { name: userId, role: 'Participant' };
  const localName = identity.name;
  const localRole = identity.role;
  const joinLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/join/${roomId}`
      : `/join/${roomId}`;

  // ─── FIX: random suffix per mount ───
  // Room membership is tracked server-side by name; the PeerJS routing handle
  // must be fresh every mount so a quick rejoin after leaving never collides
  // with the "ghost" of the previous session on the PeerJS cloud.
  const myPeerId = useRef(
    `${roomId}_${userId}_${Math.random().toString(36).slice(2, 8)}`
  ).current;

  const extractName = (peerId: string) => {
    // "ABC123_doctor-naidoo_x7k2ab" -> "doctor-naidoo"
    const parts = peerId.split('_');
    return parts.length >= 3 ? parts[1] : parts[1] || peerId;
  };

  const addOrUpdateParticipant = useCallback((p: Participant) => {
    setParticipants((prev) => {
      const idx = prev.findIndex((x) => x.id === p.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...p };
        return next;
      }
      return [...prev, p];
    });
  }, []);

  const removeParticipant = useCallback((id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    setRemoteStreams((prev) => {
      const n = new Map(prev);
      n.delete(id);
      return n;
    });
    remoteVideoRefs.current.delete(id);
    const call = callsRef.current.get(id);
    if (call) {
      try { call.close(); } catch {}
      callsRef.current.delete(id);
    }
    const conn = dataConnsRef.current.get(id);
    if (conn) {
      try { conn.close(); } catch {}
      dataConnsRef.current.delete(id);
    }
  }, []);

  /* ───────────── Broadcast helpers ───────────── */

  const broadcastState = useCallback(
    (override?: Partial<{ videoOn: boolean; audioOn: boolean; raisedHand: boolean }>) => {
      const payload: AppStateMsg = {
        type: 'state',
        videoOn: override?.videoOn ?? videoOn,
        audioOn: override?.audioOn ?? audioOn,
        raisedHand: override?.raisedHand ?? handRaised,
      };
      dataConnsRef.current.forEach((conn) => {
        if (conn.open) conn.send(payload);
      });
    },
    [videoOn, audioOn, handRaised]
  );

  const broadcastChat = useCallback(
    (text: string) => {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const payload: AppStateMsg = { type: 'chat', from: localName, text, time };
      dataConnsRef.current.forEach((conn) => {
        if (conn.open) conn.send(payload);
      });
      setMessages((prev) => [...prev, { from: localName, text, time }]);
    },
    [localName]
  );

  const broadcastReaction = useCallback(
    (emoji: string) => {
      const payload: AppStateMsg = { type: 'reaction', emoji, from: myPeerId };
      dataConnsRef.current.forEach((conn) => {
        if (conn.open) conn.send(payload);
      });
    },
    [myPeerId]
  );

  const handleData = useCallback(
    (peerId: string, raw: unknown) => {
      const msg = raw as AppStateMsg;
      if (!msg || typeof msg !== 'object') return;

      if (msg.type === 'state') {
        addOrUpdateParticipant({
          id: peerId,
          name: extractName(peerId),
          role: 'Participant',
          videoOn: msg.videoOn,
          audioOn: msg.audioOn,
          raisedHand: msg.raisedHand,
        });
      } else if (msg.type === 'chat') {
        setMessages((prev) => [...prev, { from: msg.from, text: msg.text, time: msg.time }]);
      } else if (msg.type === 'reaction') {
        addOrUpdateParticipant({
          id: msg.from,
          name: extractName(msg.from),
          role: 'Participant',
          videoOn: true,
          audioOn: true,
          reaction: msg.emoji,
        });
        setTimeout(() => {
          addOrUpdateParticipant({
            id: msg.from,
            name: extractName(msg.from),
            role: 'Participant',
            videoOn: true,
            audioOn: true,
          });
        }, 4000);
      }
    },
    [addOrUpdateParticipant]
  );

  /* ───────────── Main PeerJS setup ───────────── */

  useEffect(() => {
    let cancelled = false;
    let peer: Peer | null = null;

    function attachDataConnection(conn: DataConnection, remoteId: string) {
      if (dataConnsRef.current.has(remoteId)) {
        if (myPeerId < remoteId) {
          conn.close();
          return;
        }
        dataConnsRef.current.get(remoteId)?.close();
      }

      dataConnsRef.current.set(remoteId, conn);

      conn.on('data', (raw) => handleData(remoteId, raw));
      conn.on('open', () => {
        conn.send({ type: 'state', videoOn, audioOn, raisedHand: handRaised } as AppStateMsg);
      });
      conn.on('close', () => {
        console.log('[data close]', remoteId);
        removeParticipant(remoteId);
      });
      conn.on('error', (err) => {
        console.error('[data error]', remoteId, err);
        removeParticipant(remoteId);
      });
    }

    function callPeer(remotePeerId: string, media: MediaStream) {
      if (!peerRef.current) return;
      if (remotePeerId === myPeerId) return;
      if (callsRef.current.has(remotePeerId)) return;

      const call = peerRef.current.call(remotePeerId, media, {
        metadata: { name: localName, role: localRole },
      });
      if (!call) return;
      callsRef.current.set(remotePeerId, call);

      call.on('stream', (remoteStream) => {
        setRemoteStreams((prev) => new Map(prev).set(remotePeerId, remoteStream));
        addOrUpdateParticipant({
          id: remotePeerId,
          name: call.metadata?.name || extractName(remotePeerId),
          role: call.metadata?.role || 'Participant',
          videoOn: true,
          audioOn: true,
        });
      });
      call.on('close', () => removeParticipant(remotePeerId));
      call.on('error', (err) => {
        console.error('[call error]', remotePeerId, err);
        removeParticipant(remotePeerId);
      });
    }

    function openDataTo(remotePeerId: string) {
      if (!peerRef.current) return;
      if (remotePeerId === myPeerId) return;
      if (dataConnsRef.current.has(remotePeerId)) return;
      const conn = peerRef.current.connect(remotePeerId, { reliable: true });
      attachDataConnection(conn, remotePeerId);
    }

    async function start() {
      try {
        const media = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
        if (cancelled) {
          media.getTracks().forEach((t) => t.stop());
          return;
        }

        media.getVideoTracks().forEach((t) => (t.enabled = startWithCam));
        media.getAudioTracks().forEach((t) => (t.enabled = startWithMic));

        localStreamRef.current = media;
        setStream(media);
        setError('');

        try {
          const all = await navigator.mediaDevices.enumerateDevices();
          setDevices({
            video: all.filter((d) => d.kind === 'videoinput'),
            audio: all.filter((d) => d.kind === 'audioinput'),
          });
        } catch {}

        peer = new Peer(myPeerId, {
          debug: 1,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
              {
                urls: 'turn:openrelay.metered.ca:80',
                username: 'openrelayproject',
                credential: 'openrelayproject',
              },
              {
                urls: 'turn:openrelay.metered.ca:443',
                username: 'openrelayproject',
                credential: 'openrelayproject',
              },
              {
                urls: 'turn:openrelay.metered.ca:443?transport=tcp',
                username: 'openrelayproject',
                credential: 'openrelayproject',
              },
            ],
          },
        });
        peerRef.current = peer;

        peer.on('open', async (id) => {
          if (cancelled) return;
          setStatus('Connected');

          addOrUpdateParticipant({
            id: myPeerId,
            name: localName,
            role: localRole,
            isLocal: true,
            videoOn: startWithCam,
            audioOn: startWithMic,
          });

          try {
            const res = await fetch('/api/signal', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                roomId,
                peerId: id,
                name: localName,
                role: localRole,
                action: 'join',
              }),
            });
            const data = await res.json();
            const existing: { id: string }[] = data.peers || [];

            existing.forEach((p) => {
              if (p.id === id) return;
              callPeer(p.id, media);
              openDataTo(p.id);
            });
          } catch (err) {
            console.error('[join room]', err);
          }

          const interval = setInterval(async () => {
            if (cancelled || !peerRef.current) return;
            try {
              const r = await fetch(`/api/signal?roomId=${encodeURIComponent(roomId)}`);
              const j = await r.json();
              (j.peers || []).forEach((p: any) => {
                if (p.id === myPeerId) return;
                if (localStreamRef.current && !callsRef.current.has(p.id)) {
                  callPeer(p.id, localStreamRef.current);
                }
                if (!dataConnsRef.current.has(p.id)) {
                  openDataTo(p.id);
                }
              });
            } catch {}
          }, 3000);
          (peer as any)._interval = interval;
        });

        peer.on('call', (call) => {
          if (!localStreamRef.current) return;
          if (callsRef.current.has(call.peer)) {
            call.close();
            return;
          }

          call.answer(localStreamRef.current);
          callsRef.current.set(call.peer, call);

          call.on('stream', (remoteStream) => {
            setRemoteStreams((prev) => new Map(prev).set(call.peer, remoteStream));
            addOrUpdateParticipant({
              id: call.peer,
              name: call.metadata?.name || extractName(call.peer),
              role: call.metadata?.role || 'Participant',
              videoOn: true,
              audioOn: true,
            });
          });
          call.on('close', () => removeParticipant(call.peer));
          call.on('error', (err) => {
            console.error('[incoming call error]', call.peer, err);
            removeParticipant(call.peer);
          });
        });

        peer.on('connection', (conn) => {
          attachDataConnection(conn, conn.peer);
        });

        peer.on('error', (err: any) => {
          console.error('Peer error', err);
          if (err?.type === 'unavailable-id') {
            // Shouldn't happen with the random suffix, but handle gracefully
            setError('This identity is already in the room. Close the other tab or pick another identity.');
            setStatus('Error');
          } else if (err?.type === 'peer-unavailable') {
            // Harmless
          } else {
            setError(`Connection error: ${err?.type || err?.message || 'unknown'}`);
            setStatus('Error');
          }
        });

        peer.on('disconnected', () => {
          if (cancelled) return;
          setStatus('Reconnecting…');
          callsRef.current.forEach((c) => { try { c.close(); } catch {} });
          callsRef.current.clear();
          dataConnsRef.current.forEach((c) => { try { c.close(); } catch {} });
          dataConnsRef.current.clear();
          setParticipants((prev) => prev.filter((p) => p.isLocal));
          setRemoteStreams(new Map());
          peer?.reconnect();
        });

        peer.on('close', () => {
          if (cancelled) return;
          setStatus('Closed');
        });
      } catch (err: any) {
        console.error('[start]', err);
        setError(err?.message || 'Camera/microphone access denied or PeerJS failed.');
        setStatus('Failed');
      }
    }

    start();

    const timer = setInterval(() => setDuration((d) => d + 1), 1000);

    return () => {
      cancelled = true;
      clearInterval(timer);
      if ((peer as any)?._interval) clearInterval((peer as any)._interval);
      callsRef.current.forEach((c) => c.close());
      callsRef.current.clear();
      dataConnsRef.current.forEach((c) => c.close());
      dataConnsRef.current.clear();
      try {
        peer?.destroy();
      } catch {}
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      if (peer?.id) {
        fetch('/api/signal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId, peerId: peer.id, action: 'leave' }),
        }).catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, userId]);

  /* ───────────── pagehide → destroy peer + notify server ───────────── */

  useEffect(() => {
    const handleUnload = () => {
      // Synchronous destroy closes the signaling WebSocket so the PeerJS
      // cloud releases the id immediately.
      try { peerRef.current?.destroy(); } catch {}
      const peerId = peerRef.current?.id;
      if (peerId) {
        try {
          const blob = new Blob(
            [JSON.stringify({ roomId, peerId, action: 'leave' })],
            { type: 'application/json' }
          );
          navigator.sendBeacon('/api/signal', blob);
        } catch {}
      }
    };

    window.addEventListener('pagehide', handleUnload);
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('pagehide', handleUnload);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [roomId]);

  useEffect(() => {
    if (localVideoRef.current && stream) {
      localVideoRef.current.srcObject = stream;
    }
  }, [stream, videoOn]);

  useEffect(() => {
    remoteStreams.forEach((s, id) => {
      const el = remoteVideoRefs.current.get(id);
      if (el && el.srcObject !== s) el.srcObject = s;
    });
  }, [remoteStreams, participants]);

  /* ───────────── Handlers ───────────── */

  const toggleVideo = () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setVideoOn(track.enabled);
      addOrUpdateParticipant({
        id: myPeerId, name: localName, role: localRole, isLocal: true,
        videoOn: track.enabled, audioOn,
      });
      broadcastState({ videoOn: track.enabled });
    }
  };

  const toggleAudio = () => {
    if (!stream) return;
    const track = stream.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setAudioOn(track.enabled);
      addOrUpdateParticipant({
        id: myPeerId, name: localName, role: localRole, isLocal: true,
        videoOn, audioOn: track.enabled,
      });
      broadcastState({ audioOn: track.enabled });
    }
  };

  const toggleScreenShare = async () => {
    if (screenSharing) {
      try {
        const cam = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = cam;
        setStream(cam);
        callsRef.current.forEach((call) => {
          const pc = (call as any).peerConnection as RTCPeerConnection | undefined;
          const sender = pc?.getSenders?.().find((s) => s.track?.kind === 'video');
          if (sender && cam.getVideoTracks()[0]) sender.replaceTrack(cam.getVideoTracks()[0]);
        });
        setScreenSharing(false);
      } catch {}
      return;
    }
    try {
      const screen = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      localStreamRef.current = screen;
      setStream(screen);
      setScreenSharing(true);
      callsRef.current.forEach((call) => {
        const pc = (call as any).peerConnection as RTCPeerConnection | undefined;
        const sender = pc?.getSenders?.().find((s) => s.track?.kind === 'video');
        if (sender && screen.getVideoTracks()[0]) sender.replaceTrack(screen.getVideoTracks()[0]);
      });
      screen.getVideoTracks()[0].onended = () => toggleScreenShare();
    } catch {
      setError('Screen share cancelled.');
    }
  };

  const toggleHand = () => {
    const next = !handRaised;
    setHandRaised(next);
    addOrUpdateParticipant({
      id: myPeerId, name: localName, role: localRole, isLocal: true,
      videoOn, audioOn, raisedHand: next,
    });
    broadcastState({ raisedHand: next });
  };

  const sendReaction = (emoji: string) => {
    broadcastReaction(emoji);
    addOrUpdateParticipant({
      id: myPeerId, name: localName, role: localRole, isLocal: true,
      videoOn, audioOn, reaction: emoji,
    });
    setTimeout(() => {
      addOrUpdateParticipant({
        id: myPeerId, name: localName, role: localRole, isLocal: true,
        videoOn, audioOn,
      });
    }, 4000);
    setReactionsOpen(false);
  };

  const toggleRecording = () => {
    if (recording) {
      mediaRecorderRef.current?.stop();
      setRecording(false);
      return;
    }
    if (!stream) return;
    try {
      const rec = new MediaRecorder(stream, { mimeType: 'video/webm' });
      recordedChunks.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size) recordedChunks.current.push(e.data);
      };
      rec.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `unitac-${roomId}-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      };
      rec.start();
      mediaRecorderRef.current = rec;
      setRecording(true);
    } catch {
      setError('Recording not supported.');
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(joinLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    broadcastChat(input.trim());
    setInput('');
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const leave = () => {
    const peerId = peerRef.current?.id;
    if (peerId) {
      try {
        const blob = new Blob(
          [JSON.stringify({ roomId, peerId, action: 'leave' })],
          { type: 'application/json' }
        );
        navigator.sendBeacon('/api/signal', blob);
      } catch {}
    }

    peerRef.current?.destroy();
    stream?.getTracks().forEach((t) => t.stop());
    mediaRecorderRef.current?.stop();
    onLeave();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
    else document.exitFullscreen();
  };

  const all = participants.map((p) => ({
    ...p,
    stream: p.isLocal ? stream : remoteStreams.get(p.id) || null,
  }));

  const display =
    layout === 'spotlight' && pinnedId
      ? all.filter((p) => p.id === pinnedId || p.isLocal)
      : all;

  const sidebarOpen = chatOpen || participantsOpen || settingsOpen;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2">
        <div className="flex items-center gap-3">
          <Shield className="h-4 w-4 text-teal-400" />
          <span className="text-sm font-medium">Unitac Telehealth</span>
          <span className={cn(
            'rounded-full px-2 py-0.5 text-[10px] font-medium',
            status === 'Connected' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
          )}>
            {status}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5" /> {formatTime(duration)}
          </span>
          <span className="text-xs text-slate-500">Room {roomId}</span>
          <span className="text-xs text-slate-400">{all.length} in call</span>
          {recording && (
            <span className="flex items-center gap-1 text-xs text-rose-400">
              <Circle className="h-2.5 w-2.5 fill-current animate-pulse" /> Rec
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setLayout(layout === 'grid' ? 'spotlight' : 'grid')} className="rounded-lg p-2 hover:bg-slate-800">
            {layout === 'grid' ? <User className="h-4 w-4" /> : <Grid3x3 className="h-4 w-4" />}
          </button>
          <button onClick={copyLink} className="flex items-center gap-1 rounded-lg bg-slate-800 px-2 py-1 text-xs hover:bg-slate-700">
            {linkCopied ? <span className="text-emerald-400">Copied</span> : <><Link2 className="h-3.5 w-3.5" /> Share</>}
          </button>
          <button onClick={() => setParticipantsOpen(!participantsOpen)} className="rounded-lg p-2 hover:bg-slate-800"><Users className="h-4 w-4" /></button>
          <button onClick={() => setChatOpen(!chatOpen)} className="rounded-lg p-2 hover:bg-slate-800"><MessageSquare className="h-4 w-4" /></button>
          <button onClick={toggleFullscreen} className="rounded-lg p-2 hover:bg-slate-800"><Maximize2 className="h-4 w-4" /></button>
          <button onClick={() => setSettingsOpen(!settingsOpen)} className="rounded-lg p-2 hover:bg-slate-800"><Settings className="h-4 w-4" /></button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-900/50 px-4 py-2 text-center text-xs text-rose-200 flex items-center justify-center gap-2">
          <AlertTriangle className="h-4 w-4" /> {error}
        </div>
      )}

      {/* Main: grid + sidebars in one flex row */}
      <div className="flex flex-1 min-h-0 min-w-0 overflow-hidden">
        <div className="flex flex-1 min-w-0 min-h-0 p-2">
          <div
            className={cn(
              'grid h-full w-full gap-2',
              display.length === 1 && 'grid-cols-1 place-items-center',
              display.length === 2 && 'grid-cols-1 sm:grid-cols-2',
              display.length === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
              display.length >= 4 && 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
              sidebarOpen && display.length >= 4 && 'xl:grid-cols-3',
              sidebarOpen && display.length === 3 && 'lg:grid-cols-2'
            )}
            style={{ gridAutoRows: 'minmax(0, 1fr)' }}
          >
            {display.map((p) => {
              const showVideo = !!p.stream && (p.isLocal ? videoOn || screenSharing : p.videoOn);
              return (
                <div
                  key={p.id}
                  className="relative flex items-center justify-center overflow-hidden rounded-xl bg-slate-800 cursor-pointer aspect-video w-full h-full max-h-full"
                  onClick={() => setPinnedId(pinnedId === p.id ? null : p.id)}
                >
                  {showVideo ? (
                    <video
                      ref={
                        p.isLocal
                          ? (el) => {
                              if (el) {
                                (localVideoRef as any).current = el;
                                if (stream && el.srcObject !== stream) el.srcObject = stream;
                              }
                            }
                          : (el) => {
                              if (el) {
                                remoteVideoRefs.current.set(p.id, el);
                                const s = p.stream;
                                if (s && el.srcObject !== s) el.srcObject = s;
                              } else {
                                remoteVideoRefs.current.delete(p.id);
                              }
                            }
                      }
                      autoPlay
                      muted={!!p.isLocal}
                      playsInline
                      className={cn(
                        'h-full w-full object-cover',
                        p.isLocal && !screenSharing && 'scale-x-[-1]'
                      )}
                    />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-700 text-lg font-bold">
                        {p.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <p className="mt-2 text-sm">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.role}</p>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-black/60 px-2 py-0.5 text-xs">
                    {!p.audioOn && <MicOff className="h-3 w-3 text-rose-400" />}
                    {!p.videoOn && !screenSharing && <VideoOff className="h-3 w-3 text-rose-400" />}
                    {screenSharing && p.isLocal && <Monitor className="h-3 w-3 text-teal-400" />}
                    <span>{p.name} {p.isLocal && '(You)'}</span>
                    {p.reaction && <span className="ml-1">{p.reaction}</span>}
                  </div>
                  {p.raisedHand && (
                    <div className="absolute top-2 left-2 rounded-full bg-amber-500 p-1.5">
                      <Hand className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                  {pinnedId === p.id && (
                    <div className="absolute top-2 right-2 rounded bg-teal-600 px-1.5 py-0.5 text-[10px]">Pinned</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {chatOpen && (
          <aside className="flex w-80 shrink-0 flex-col border-l border-slate-800 bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <span className="text-sm font-medium">Chat</span>
              <button onClick={() => setChatOpen(false)}><X className="h-4 w-4" /></button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m, i) => (
                <div key={i} className={cn('max-w-[85%] rounded-2xl px-3 py-2 text-sm', m.from === localName ? 'ml-auto bg-teal-600' : 'bg-slate-800')}>
                  <p className="text-[10px] text-slate-300">{m.from}</p>
                  <p>{m.text}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2 border-t border-slate-800 p-3">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Message…" className="flex-1 rounded-lg bg-slate-800 px-3 py-2 text-sm outline-none" />
              <button onClick={sendMessage} className="rounded-lg bg-teal-600 p-2"><Send className="h-4 w-4" /></button>
            </div>
          </aside>
        )}

        {participantsOpen && (
          <aside className="flex w-72 shrink-0 flex-col border-l border-slate-800 bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <span className="text-sm font-medium">In call ({all.length})</span>
              <button onClick={() => setParticipantsOpen(false)}><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-2 p-4 overflow-y-auto flex-1">
              {all.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-lg bg-slate-800 px-3 py-2">
                  <div className="h-8 w-8 rounded-full bg-teal-600 text-center text-sm leading-8">
                    {p.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name} {p.isLocal && '(You)'}</p>
                    <p className="text-xs text-slate-400">{p.role}</p>
                  </div>
                  {!p.audioOn && <MicOff className="h-3.5 w-3.5 text-rose-400" />}
                  {p.raisedHand && <Hand className="h-4 w-4 text-amber-400" />}
                </div>
              ))}
            </div>
            <div className="border-t border-slate-800 p-3">
              <button onClick={copyLink} className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 py-2 text-sm">
                <UserPlus className="h-4 w-4" /> {linkCopied ? 'Copied' : 'Copy invite link'}
              </button>
            </div>
          </aside>
        )}

        {settingsOpen && (
          <aside className="flex w-80 shrink-0 flex-col border-l border-slate-800 bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <span className="text-sm font-medium">Settings</span>
              <button onClick={() => setSettingsOpen(false)}><X className="h-4 w-4" /></button>
            </div>
            <div className="p-4 space-y-4">
              <button onClick={toggleRecording} className={cn('w-full rounded-lg py-2 text-sm font-medium', recording ? 'bg-rose-600' : 'bg-slate-700')}>
                {recording ? 'Stop & Download Recording' : 'Start Local Recording'}
              </button>
              <p className="text-xs text-slate-500">Devices detected: {devices.video.length} cameras, {devices.audio.length} mics</p>
            </div>
          </aside>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 border-t border-slate-800 bg-slate-900 py-4 px-2">
        <button onClick={toggleAudio} className={cn('rounded-full p-3.5', audioOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-rose-600')} title="Mic">
          {audioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </button>
        <button onClick={toggleVideo} className={cn('rounded-full p-3.5', videoOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-rose-600')} title="Camera">
          {videoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </button>
        <button onClick={toggleScreenShare} className={cn('rounded-full p-3.5', screenSharing ? 'bg-teal-600' : 'bg-slate-700 hover:bg-slate-600')} title="Share screen">
          {screenSharing ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
        </button>
        <button onClick={toggleHand} className={cn('rounded-full p-3.5', handRaised ? 'bg-amber-500' : 'bg-slate-700 hover:bg-slate-600')} title="Raise hand">
          <Hand className="h-5 w-5" />
        </button>
        <div className="relative">
          <button onClick={() => setReactionsOpen(!reactionsOpen)} className="rounded-full bg-slate-700 p-3.5 hover:bg-slate-600" title="React">
            <Smile className="h-5 w-5" />
          </button>
          {reactionsOpen && (
            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-1 rounded-full bg-slate-800 p-2 shadow-lg">
              {REACTIONS.map((e) => (
                <button key={e} onClick={() => sendReaction(e)} className="text-xl hover:scale-125 transition">{e}</button>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => setChatOpen(!chatOpen)} className="rounded-full bg-slate-700 p-3.5 hover:bg-slate-600"><MessageSquare className="h-5 w-5" /></button>
        <button onClick={leave} className="rounded-full bg-rose-600 p-3.5 hover:bg-rose-700"><PhoneOff className="h-5 w-5" /></button>
      </div>
    </div>
  );
}