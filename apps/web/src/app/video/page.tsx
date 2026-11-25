'use client';

import { useState } from 'react';
import { VideoRoom } from '@/components/video/VideoRoom';
import { VideoLobby } from '@/components/video/VideoLobby';
import { Video, Calendar, Clock, Users, ArrowRight } from 'lucide-react';

const UPCOMING = [
  { id: '1', title: 'Follow-up hypertension', with: 'Dr. S. Naidoo', date: '23 Nov 2026', time: '09:30', room: 'ABC123', type: 'Patient consult' },
  { id: '2', title: 'Diabetes review', with: 'Thandi Ndlovu', date: '24 Nov 2026', time: '10:15', room: 'DEF456', type: 'Doctor consult' },
  { id: '3', title: 'Lab results discussion', with: 'Lab team', date: '25 Nov 2026', time: '14:00', room: 'GHI789', type: 'Multidisciplinary' },
  { id: '4', title: 'Pharmacy counselling', with: 'Pharm. K. Botha', date: '26 Nov 2026', time: '11:00', room: 'JKL012', type: 'Pharmacy' },
];

const IDENTITIES = [
  { id: 'patient-thandi', label: 'Patient – Thandi Ndlovu' },
  { id: 'doctor-naidoo', label: 'Doctor – Dr. S. Naidoo' },
  { id: 'lab-dlamini', label: 'Lab – M. Dlamini' },
  { id: 'pharm-botha', label: 'Pharmacy – K. Botha' },
  { id: 'admin-unitac', label: 'Admin – Unitac' },
];

type Stage = 'landing' | 'lobby' | 'room';

export default function CentralVideoPage() {
  const [stage, setStage] = useState<Stage>('landing');
  const [roomId, setRoomId] = useState('');
  const [code, setCode] = useState('');
  const [userId, setUserId] = useState('doctor-naidoo');
  const [joinOpts, setJoinOpts] = useState<{ userId: string; startWithMic: boolean; startWithCam: boolean } | null>(null);
  const [copied, setCopied] = useState('');

  const startNew = () => {
    const id = Math.random().toString(36).slice(2, 8).toUpperCase();
    setRoomId(id);
    setStage('lobby');
  };

  const joinWithCode = (c?: string) => {
    const target = (c || code).trim().toUpperCase();
    if (target.length < 4) return;
    setRoomId(target);
    setStage('lobby');
  };

  const copyRoom = (r: string) => {
    navigator.clipboard.writeText(r);
    setCopied(r);
    setTimeout(() => setCopied(''), 1500);
  };

  if (stage === 'room' && roomId && joinOpts) {
    return (
      <VideoRoom
        roomId={roomId}
        userId={joinOpts.userId}
        startWithMic={joinOpts.startWithMic}
        startWithCam={joinOpts.startWithCam}
        onLeave={() => { setStage('landing'); setJoinOpts(null); }}
      />
    );
  }

  if (stage === 'lobby' && roomId) {
    return (
      <VideoLobby
        roomId={roomId}
        onJoin={(opts) => { setJoinOpts(opts); setStage('room'); }}
        onCancel={() => setStage('landing')}
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Video conference</h2>
        <p className="text-slate-500">Central telehealth lobby for all roles. Start a call or join with a code.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900">Start or join</h3>
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Join as</label>
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                {IDENTITIES.map((i) => (
                  <option key={i.id} value={i.id}>{i.label}</option>
                ))}
              </select>
            </div>
            <button
              onClick={startNew}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white hover:bg-teal-700"
            >
              <Video className="h-4 w-4" /> Start new call
            </button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400">or</span></div>
            </div>
            <div className="flex gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Enter room code"
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm uppercase tracking-wider outline-none focus:border-teal-500"
              />
              <button
                onClick={() => joinWithCode()}
                className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
              >
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900">How it works</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>• Every portal uses this same lobby</li>
            <li>• Preview camera and mic before joining</li>
            <li>• See who is already in the room</li>
            <li>• Share the room code with anyone on the platform</li>
          </ul>
        </div>
      </div>

      <div>
        <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Calendar className="h-5 w-5 text-teal-600" /> Upcoming meetings
        </h3>
        <div className="space-y-3">
          {UPCOMING.map((m) => (
            <div key={m.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <Video className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">{m.title}</p>
                <p className="text-sm text-slate-500">{m.with} · {m.type}</p>
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {m.date} · {m.time}</span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Room: <span className="font-mono font-medium text-slate-700">{m.room}</span></span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyRoom(m.room)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                >
                  {copied === m.room ? 'Copied' : 'Copy code'}
                </button>
                <button
                  onClick={() => joinWithCode(m.room)}
                  className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
                >
                  Join <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
