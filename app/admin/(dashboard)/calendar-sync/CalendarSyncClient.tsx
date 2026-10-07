'use client';

import React, { useState, useTransition } from 'react';
import { Rooms } from '../../../../data/rooms';
import { saveCalendarConfig, deleteCalendarConfig } from '../../../actions/bookings';
import { Save, Clipboard, Check, Link2, RefreshCw } from 'lucide-react';

interface PlainConfig {
  id: number;
  roomId: number;
  source: string;
  url: string;
}

interface CalendarSyncClientProps {
  initialConfigs: PlainConfig[];
}

export default function CalendarSyncClient({ initialConfigs }: CalendarSyncClientProps) {
  const [configs, setConfigs] = useState<PlainConfig[]>(initialConfigs);
  const [isPending, startTransition] = useTransition();

  // Temporary local input states for editing
  const [inputs, setInputs] = useState<Record<string, string>>(() => {
    const initialInputs: Record<string, string> = {};
    Rooms.forEach(room => {
      ['booking.com', 'szallas.hu'].forEach(source => {
        const key = `${room.id}_${source}`;
        const found = initialConfigs.find(c => c.roomId === room.id && c.source === source);
        initialInputs[key] = found ? found.url : '';
      });
    });
    return initialInputs;
  });

  const [copiedRoomId, setCopiedRoomId] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<Record<string, 'idle' | 'saving' | 'success' | 'error'>>({});

  const handleCopyLink = (roomId: number) => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/api/ical/${roomId}`;
    navigator.clipboard.writeText(url);
    setCopiedRoomId(roomId);
    setTimeout(() => setCopiedRoomId(null), 2000);
  };

  const handleSave = (roomId: number, source: string) => {
    const key = `${roomId}_${source}`;
    const url = inputs[key] || '';

    setSaveStatus(prev => ({ ...prev, [key]: 'saving' }));

    startTransition(async () => {
      if (!url.trim()) {
        // If the URL is cleared, we delete the config
        const existing = configs.find(c => c.roomId === roomId && c.source === source);
        if (existing) {
          const res = await deleteCalendarConfig(existing.id);
          if (res.success) {
            setConfigs(prev => prev.filter(c => c.id !== existing.id));
            setSaveStatus(prev => ({ ...prev, [key]: 'success' }));
            setTimeout(() => setSaveStatus(prev => ({ ...prev, [key]: 'idle' })), 2000);
          } else {
            alert(res.error);
            setSaveStatus(prev => ({ ...prev, [key]: 'error' }));
          }
        } else {
          setSaveStatus(prev => ({ ...prev, [key]: 'idle' }));
        }
        return;
      }

      const res = await saveCalendarConfig({ roomId, source, url });
      if (res.success) {
        setSaveStatus(prev => ({ ...prev, [key]: 'success' }));
        setTimeout(() => setSaveStatus(prev => ({ ...prev, [key]: 'idle' })), 2000);
        
        setConfigs(prev => {
          const filtered = prev.filter(c => !(c.roomId === roomId && c.source === source));
          return [...filtered, { id: Date.now(), roomId, source, url }];
        });
      } else {
        alert(res.error);
        setSaveStatus(prev => ({ ...prev, [key]: 'error' }));
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Rooms.map((room) => {
        const exportUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/ical/${room.id}` : `.../api/ical/${room.id}`;

        return (
          <div key={room.id} className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6 flex flex-col justify-between">
            <div>
              {/* Room Title */}
              <div className="flex justify-between items-center border-b border-stone-100 pb-4">
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-800">{room.name}</h3>
                  <span className="text-xs text-stone-400">ID: {room.id} • Kapacitás: {room.capacity} fő</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800 font-bold font-serif">
                  {room.id}
                </div>
              </div>

              {/* Export iCal Link (For booking/szallas to fetch) */}
              <div className="mt-4 p-4 bg-stone-50 rounded-xl border border-stone-200/60 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-stone-500 flex items-center gap-1.5">
                    <Link2 size={14} className="text-emerald-700 animate-pulse" />
                    Rendszer export link (iCal)
                  </span>
                  <button
                    onClick={() => handleCopyLink(room.id)}
                    className="text-xs text-emerald-800 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedRoomId === room.id ? (
                      <>
                        <Check size={12} className="text-emerald-600" />
                        Másolva!
                      </>
                    ) : (
                      <>
                        <Clipboard size={12} />
                        Link másolása
                      </>
                    )}
                  </button>
                </div>
                <div className="text-xs text-stone-600 font-mono break-all bg-white p-2.5 rounded-lg border border-stone-200 select-all">
                  {exportUrl}
                </div>
                <p className="text-[10px] text-stone-400 leading-normal">
                  Másolja ki és illessze be ezt a linket a Booking.com és Szallas.hu naptár importálás (szinkronizáció) mezőibe.
                </p>
              </div>

              {/* Import Configuration Fields */}
              <div className="mt-6 space-y-4">
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Külső naptárak importálása (Sync)
                </h4>

                {/* Booking.com Sync */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-stone-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#003b95]"></span>
                    Booking.com iCal Import Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://ical.booking.com/v1/..."
                      value={inputs[`${room.id}_booking.com`] || ''}
                      onChange={(e) => setInputs(prev => ({ ...prev, [`${room.id}_booking.com`]: e.target.value }))}
                      className="flex-1 p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:border-emerald-500 focus:bg-white outline-none text-stone-850 font-mono"
                    />
                    <button
                      onClick={() => handleSave(room.id, 'booking.com')}
                      disabled={saveStatus[`${room.id}_booking.com`] === 'saving'}
                      className="px-4 py-2.5 bg-[#003b95] text-white hover:bg-[#003685] disabled:bg-stone-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed transition-all"
                    >
                      {saveStatus[`${room.id}_booking.com`] === 'saving' ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : saveStatus[`${room.id}_booking.com`] === 'success' ? (
                        <Check size={14} />
                      ) : (
                        <Save size={14} />
                      )}
                      Mentés
                    </button>
                  </div>
                </div>

                {/* Szallas.hu Sync */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-stone-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ba0712]"></span>
                    Szallas.hu iCal Import Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://partner.szallas.hu/Calendar/Export/..."
                      value={inputs[`${room.id}_szallas.hu`] || ''}
                      onChange={(e) => setInputs(prev => ({ ...prev, [`${room.id}_szallas.hu`]: e.target.value }))}
                      className="flex-1 p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:border-emerald-500 focus:bg-white outline-none text-stone-855 font-mono"
                    />
                    <button
                      onClick={() => handleSave(room.id, 'szallas.hu')}
                      disabled={saveStatus[`${room.id}_szallas.hu`] === 'saving'}
                      className="px-4 py-2.5 bg-[#ba0712] text-white hover:bg-[#a60610] disabled:bg-stone-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed transition-all"
                    >
                      {saveStatus[`${room.id}_szallas.hu`] === 'saving' ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : saveStatus[`${room.id}_szallas.hu`] === 'success' ? (
                        <Check size={14} />
                      ) : (
                        <Save size={14} />
                      )}
                      Mentés
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
