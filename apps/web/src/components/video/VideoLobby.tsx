'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Video, VideoOff, Mic, MicOff, Users, X, ArrowRight, Loader2,
  Settings2, Sparkles, Shield, Volume2, Headphones, CheckCircle2,
  Circle, Wifi
} from 'lucide-react';
import { cn } from '@/lib/utils';

type RoomMember = { id: string; name: string; role: string };

type Props = {
  roomId: string;
  /** Called when user confirms — VideoRoom will start with these settings */
  onJoin: (opts: { userId: string; startWithMic: boolean; startWithCam: boolean }) => void;
  onCancel: () => void;
};

const IDENTITIES = [
  { id: 'patient-thandi', label: 'Patient – Thandi Ndlovu', role: 'Patient', initials: 'TN' },
  { id: 'doctor-naidoo', label: 'Doctor – Dr. S. Naidoo', role: 'Doctor', initials: 'SN' },
  { id: 'lab-dlamini', label: 'Lab – M. Dlamini', role: 'Lab', initials: 'MD' },
  { id: 'pharm-botha', label: 'Pharmacy – K. Botha', role: 'Pharmacy', initials: 'KB' },
  { id: 'admin-unitac', label: 'Admin – Unitac', role: 'Admin', initials: 'AU' },
];

export function VideoLobby({ roomId, onJoin, onCancel }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(false); // default mic OFF for politeness
  const [mediaError, setMediaError] = useState('');
  const [starting, setStarting] = useState(true);
  const [userId, setUserId] = useState('patient-thandi');
  const [joining, setJoining] = useState(false);
  const [devices, setDevices] = useState<{ video: MediaDeviceInfo[]; audio: MediaDeviceInfo[] }>({
    video: [],
    audio: [],
  });
  const [selectedVideoId, setSelectedVideoId] = useState('');
  const [selectedAudioId, setSelectedAudioId] = useState('');
  const [showDevices, setShowDevices] = useState(false);

  const [members, setMembers] = useState<RoomMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);

  const selectedIdentity = IDENTITIES.find((i) => i.id === userId) || IDENTITIES[0];

  /* ── Fetch who is already in the room ── */
  useEffect(() => {
    let cancelled = false;
    setMembersLoading(true);

    const fetchMembers = async () => {
      try {
        const r = await fetch(`/api/signal?roomId=${encodeURIComponent(roomId)}`, {
          cache: 'no-store',
        });
        const j = await r.json();
        if (!cancelled) setMembers(j.peers || []);
      } catch {
        if (!cancelled) setMembers([]);
      } finally {
        if (!cancelled) setMembersLoading(false);
      }
    };

    fetchMembers();
    const interval = setInterval(fetchMembers, 4000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [roomId]);

  /* ── Start / restart local preview ── */
  const startPreview = async (videoDeviceId?: string, audioDeviceId?: string) => {
    setStarting(true);
    setMediaError('');
    // Stop previous stream
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    try {
      const constraints: MediaStreamConstraints = {
        video: videoDeviceId
          ? { deviceId: { exact: videoDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
          : { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true,
      };
      const media = await navigator.mediaDevices.getUserMedia(constraints);

      streamRef.current = media;
      // Apply current toggles — do NOT force on
      media.getVideoTracks().forEach((t) => {
        t.enabled = camOn;
      });
      media.getAudioTracks().forEach((t) => {
        t.enabled = micOn;
      });
      setPreviewStream(media);
      if (videoRef.current) videoRef.current.srcObject = media;

      // Enumerate devices after permission granted
      try {
        const all = await navigator.mediaDevices.enumerateDevices();
        const vids = all.filter((d) => d.kind === 'videoinput');
        const auds = all.filter((d) => d.kind === 'audioinput');
        setDevices({ video: vids, audio: auds });
        if (!selectedVideoId && vids[0]) setSelectedVideoId(vids[0].deviceId);
        if (!selectedAudioId && auds[0]) setSelectedAudioId(auds[0].deviceId);
      } catch {
        /* ignore */
      }
    } catch {
      setMediaError('Cannot access camera/microphone. You can still join with them off.');
    } finally {
      setStarting(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await startPreview();
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Toggles — update both React state and live tracks ── */
  const toggleCam = () => {
    setCamOn((prev) => {
      const next = !prev;
      streamRef.current?.getVideoTracks().forEach((t) => {
        t.enabled = next;
      });
      return next;
    });
  };

  const toggleMic = () => {
    setMicOn((prev) => {
      const next = !prev;
      streamRef.current?.getAudioTracks().forEach((t) => {
        t.enabled = next;
      });
      return next;
    });
  };

  const switchVideoDevice = async (deviceId: string) => {
    setSelectedVideoId(deviceId);
    await startPreview(deviceId, selectedAudioId || undefined);
  };

  const switchAudioDevice = async (deviceId: string) => {
    setSelectedAudioId(deviceId);
    await startPreview(selectedVideoId || undefined, deviceId);
  };

  /* ── Join — pass exact toggle state to VideoRoom ── */
  const handleJoin = () => {
    if (joining) return;
    setJoining(true);
    // Capture current values before stopping tracks
    const finalMic = micOn;
    const finalCam = camOn;
    const finalUserId = userId;

    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    onJoin({
      userId: finalUserId,
      startWithMic: finalMic,
      startWithCam: finalCam,
    });
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-br from-slate-50 via-white to-teal-50/40">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700 ring-1 ring-teal-100">
                <Wifi className="h-3 w-3" />
                Live room
              </span>
              <span className="font-mono text-sm font-semibold tracking-wider text-slate-600">
                {roomId}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Ready to join?
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Check your camera and microphone, then enter the meeting.
            </p>
          </div>
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
          {/* ── Left: preview stage ── */}
          <div className="space-y-4">
            <div className="relative aspect-video overflow-hidden rounded-3xl bg-slate-900 shadow-xl shadow-slate-900/10 ring-1 ring-black/5">
              {mediaError ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-slate-400">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800">
                    <VideoOff className="h-8 w-8" />
                  </div>
                  <p className="max-w-xs text-sm">{mediaError}</p>
                  <button
                    onClick={() => startPreview()}
                    className="mt-1 rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-600"
                  >
                    Retry permissions
                  </button>
                </div>
              ) : starting ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-400">
                  <Loader2 className="h-9 w-9 animate-spin text-teal-400" />
                  <p className="text-sm">Starting camera…</p>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className={cn(
                      'h-full w-full scale-x-[-1] object-cover transition-all duration-300',
                      !camOn && 'opacity-0 scale-105'
                    )}
                  />
                  {!camOn && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900">
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-2xl font-bold text-white shadow-lg shadow-teal-900/40">
                        {selectedIdentity.initials}
                      </div>
                      <p className="mt-4 text-sm font-medium text-slate-300">Camera is off</p>
                      <p className="mt-0.5 text-xs text-slate-500">Others will see your initials</p>
                    </div>
                  )}

                  {/* Status pills */}
                  <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                      <Circle className={cn('h-2 w-2 fill-current', micOn ? 'text-emerald-400' : 'text-rose-400')} />
                      {micOn ? 'Mic on' : 'Mic muted'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                      <Circle className={cn('h-2 w-2 fill-current', camOn ? 'text-emerald-400' : 'text-rose-400')} />
                      {camOn ? 'Camera on' : 'Camera off'}
                    </span>
                  </div>

                  <div className="absolute right-4 top-4">
                    <span className="rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm">
                      Preview
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Control bar */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={toggleMic}
                disabled={starting || !!mediaError}
                className={cn(
                  'group flex h-14 w-14 items-center justify-center rounded-2xl transition-all disabled:opacity-40',
                  micOn
                    ? 'bg-white text-slate-800 shadow-md ring-1 ring-slate-200 hover:bg-slate-50'
                    : 'bg-rose-600 text-white shadow-lg shadow-rose-600/25 hover:bg-rose-500'
                )}
                title={micOn ? 'Mute microphone' : 'Unmute microphone'}
              >
                {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </button>

              <button
                type="button"
                onClick={toggleCam}
                disabled={starting || !!mediaError}
                className={cn(
                  'group flex h-14 w-14 items-center justify-center rounded-2xl transition-all disabled:opacity-40',
                  camOn
                    ? 'bg-white text-slate-800 shadow-md ring-1 ring-slate-200 hover:bg-slate-50'
                    : 'bg-rose-600 text-white shadow-lg shadow-rose-600/25 hover:bg-rose-500'
                )}
                title={camOn ? 'Turn off camera' : 'Turn on camera'}
              >
                {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </button>

              <button
                type="button"
                onClick={() => setShowDevices((v) => !v)}
                className={cn(
                  'flex h-14 w-14 items-center justify-center rounded-2xl transition-all',
                  showDevices
                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/25'
                    : 'bg-white text-slate-700 shadow-md ring-1 ring-slate-200 hover:bg-slate-50'
                )}
                title="Device settings"
              >
                <Settings2 className="h-5 w-5" />
              </button>
            </div>

            {/* Device selectors */}
            {showDevices && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Devices
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-600">
                      <Video className="h-3.5 w-3.5" /> Camera
                    </label>
                    <select
                      value={selectedVideoId}
                      onChange={(e) => switchVideoDevice(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    >
                      {devices.video.length === 0 && <option value="">Default camera</option>}
                      {devices.video.map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>
                          {d.label || `Camera ${d.deviceId.slice(0, 6)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-600">
                      <Headphones className="h-3.5 w-3.5" /> Microphone
                    </label>
                    <select
                      value={selectedAudioId}
                      onChange={(e) => switchAudioDevice(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    >
                      {devices.audio.length === 0 && <option value="">Default microphone</option>}
                      {devices.audio.map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>
                          {d.label || `Mic ${d.deviceId.slice(0, 6)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Tip */}
            <div className="flex gap-3 rounded-2xl border border-amber-100 bg-amber-50/80 p-4">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div className="text-xs leading-relaxed text-amber-900">
                <strong className="font-semibold">Tip:</strong> Your microphone starts{' '}
                <em>muted</em> so you don’t interrupt the room. Toggle camera and mic here —
                your choices are kept when you join.
              </div>
            </div>
          </div>

          {/* ── Right: identity + room ── */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Join as
              </label>
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm font-medium outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              >
                {IDENTITIES.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.label}
                  </option>
                ))}
              </select>

              {/* Selected identity card */}
              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-teal-50 to-slate-50 p-3 ring-1 ring-teal-100/60">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600 text-sm font-bold text-white shadow-md shadow-teal-600/20">
                  {selectedIdentity.initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {selectedIdentity.label.split('–')[1]?.trim() || selectedIdentity.label}
                  </p>
                  <p className="text-xs text-slate-500">{selectedIdentity.role}</p>
                </div>
              </div>

              {/* Join summary of media state */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium',
                    micOn ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  )}
                >
                  {micOn ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
                  {micOn ? 'Mic on' : 'Mic muted'}
                </div>
                <div
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium',
                    camOn ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  )}
                >
                  {camOn ? <Video className="h-3.5 w-3.5" /> : <VideoOff className="h-3.5 w-3.5" />}
                  {camOn ? 'Camera on' : 'Camera off'}
                </div>
              </div>

              <button
                type="button"
                onClick={handleJoin}
                disabled={starting || joining}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-600/25 transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {joining ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Joining…
                  </>
                ) : (
                  <>
                    Join meeting
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {mediaError && (
                <p className="mt-3 text-center text-xs text-rose-600">
                  Device access failed — you can still join, but media may be limited.
                </p>
              )}
            </div>

            {/* Who's in the room */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Users className="h-4 w-4 text-teal-600" />
                  In the room
                </h3>
                <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700">
                  {membersLoading ? '…' : members.length}{' '}
                  {members.length === 1 ? 'person' : 'people'}
                </span>
              </div>

              {membersLoading ? (
                <div className="flex items-center justify-center py-8 text-slate-400">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : members.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 py-6 text-center">
                  <Shield className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-2 text-xs font-medium text-slate-500">No one is here yet</p>
                  <p className="text-[11px] text-slate-400">You’ll be the first to join</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {members.map((m) => (
                    <li
                      key={m.id}
                      className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
                        {m.name
                          .split(' ')
                          .map((n) => n[0])
                          .filter(Boolean)
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">{m.name}</p>
                        <p className="text-xs text-slate-500">{m.role}</p>
                      </div>
                      <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                        <CheckCircle2 className="h-3 w-3" />
                        In call
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex items-start gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-[11px] leading-relaxed text-slate-500">
              <Volume2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
              Your mic and camera preferences from this lobby are applied when the meeting starts.
              You can change them again inside the call.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
