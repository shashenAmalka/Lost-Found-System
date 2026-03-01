'use client';
import { useState } from 'react';
import { CalendarCheck, Clock, MapPin, Loader2, CheckCircle } from 'lucide-react';

const TIME_SLOTS = [
    '9:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '1:00 PM - 2:00 PM',
    '2:00 PM - 3:00 PM',
    '3:00 PM - 4:00 PM',
];

export default function PickupScheduler({ claim, onScheduled }) {
    const [date, setDate] = useState('');
    const [timeSlot, setTimeSlot] = useState('');
    const [scheduling, setScheduling] = useState(false);
    const [error, setError] = useState('');

    const isApproved = claim.status === 'approved';
    const isScheduled = claim.status === 'pickup_scheduled';

    if (isScheduled) {
        return (
            <div className="p-5 rounded-[16px] flex items-start gap-4"
                style={{ background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.2)' }}>
                <CheckCircle size={20} className="shrink-0 mt-0.5" style={{ color: '#14b8a6' }} />
                <div>
                    <h4 className="text-sm font-bold" style={{ color: '#5eead4' }}>Pickup Scheduled</h4>
                    {claim.pickupScheduledAt && (
                        <p className="text-sm mt-2 flex items-center gap-1.5" style={{ color: 'rgba(245,246,250,0.6)' }}>
                            <CalendarCheck size={13} /> {new Date(claim.pickupScheduledAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    )}
                    <p className="text-sm mt-1 flex items-center gap-1.5" style={{ color: 'rgba(245,246,250,0.6)' }}>
                        <MapPin size={13} /> {claim.pickupPreference || 'Campus Lost & Found Office'}
                    </p>
                    <div className="mt-3 p-3 rounded-lg text-xs" style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(245,246,250,0.4)' }}>
                        Please bring your valid student/staff ID for verification at pickup.
                    </div>
                </div>
            </div>
        );
    }

    if (!isApproved) return null;

    const handleSchedule = async () => {
        if (!date || !timeSlot) {
            setError('Please select both a date and time slot');
            return;
        }
        setScheduling(true);
        setError('');
        try {
            const res = await fetch(`/api/claims/${claim._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'schedule_pickup',
                    pickupDate: date,
                    pickupTimeSlot: timeSlot,
                }),
                credentials: 'include',
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to schedule pickup');
            if (onScheduled) onScheduled(data.claim);
        } catch (err) {
            setError(err.message);
        } finally {
            setScheduling(false);
        }
    };

    // Minimum date = tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    return (
        <div className="p-6 rounded-[16px] space-y-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2" style={{ color: 'rgba(245,246,250,0.5)' }}>
                <CalendarCheck size={14} /> Schedule Pickup
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs text-white/50 uppercase tracking-wide font-medium">Pickup Date *</label>
                    <input
                        type="date"
                        min={minDate}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', colorScheme: 'dark' }}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs text-white/50 uppercase tracking-wide font-medium">Time Slot *</label>
                    <select
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all appearance-none cursor-pointer"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <option value="" style={{ background: '#13162B' }}>Select time...</option>
                        {TIME_SLOTS.map(slot => (
                            <option key={slot} value={slot} style={{ background: '#13162B' }}>{slot}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="p-3 rounded-xl text-xs flex items-start gap-2"
                style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', color: 'rgba(245,246,250,0.5)' }}>
                <Clock size={13} className="shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
                Pickup location: <strong className="text-white/70">{claim.pickupPreference || 'Campus Lost & Found Office'}</strong>. Bring valid ID for verification.
            </div>

            {error && (
                <p className="text-sm text-red-400" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', padding: '8px 12px', borderRadius: '10px' }}>
                    {error}
                </p>
            )}

            <button
                onClick={handleSchedule}
                disabled={scheduling}
                className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                    background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                    boxShadow: '0 6px 16px rgba(20,184,166,0.3)',
                }}>
                {scheduling ? <Loader2 size={16} className="animate-spin" /> : <CalendarCheck size={16} />}
                {scheduling ? 'Scheduling...' : 'Confirm Pickup'}
            </button>
        </div>
    );
}
