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
            <div className="p-5 rounded-[16px] flex items-start gap-4 bg-[#CCFBF1] border border-[#99F6E4]">
                <CheckCircle size={20} className="shrink-0 mt-0.5 text-[#0F766E]" />
                <div>
                    <h4 className="text-sm font-bold text-[#0F766E]">Pickup Scheduled</h4>
                    {claim.pickupScheduledAt && (
                        <p className="text-sm mt-2 flex items-center gap-1.5 font-medium text-[#115E59]">
                            <CalendarCheck size={13} /> {new Date(claim.pickupScheduledAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    )}
                    <p className="text-sm mt-1 flex items-center gap-1.5 font-medium text-[#115E59]">
                        <MapPin size={13} /> {claim.pickupPreference || 'Campus Lost & Found Office'}
                    </p>
                    <div className="mt-3 p-3 rounded-lg text-xs bg-white/50 text-[#0F766E] font-medium border border-[#99F6E4]/50">
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
        <div className="p-6 rounded-[16px] space-y-5 bg-white border border-gray-200 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-[#3E4A56]">
                <CalendarCheck size={14} /> Schedule Pickup
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs text-[#1C2A59] uppercase tracking-wide font-bold">Pickup Date <span className="text-red-500">*</span></label>
                    <input
                        type="date"
                        min={minDate}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-sm text-[#1C2A59] outline-none transition-all focus:ring-2 focus:ring-[#008489]/50 focus:border-[#008489]"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs text-[#1C2A59] uppercase tracking-wide font-bold">Time Slot <span className="text-red-500">*</span></label>
                    <select
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-sm text-[#1C2A59] outline-none transition-all appearance-none cursor-pointer focus:ring-2 focus:ring-[#008489]/50 focus:border-[#008489]">
                        <option value="">Select time...</option>
                        {TIME_SLOTS.map(slot => (
                            <option key={slot} value={slot}>{slot}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="p-3 rounded-xl text-xs flex items-start gap-2 bg-[#FEF3C7] border border-[#FDE68A] text-[#D97706] font-medium">
                <Clock size={13} className="shrink-0 mt-0.5 text-[#D97706]" />
                Pickup location: <strong className="text-[#1C2A59]">{claim.pickupPreference || 'Campus Lost & Found Office'}</strong>. Bring valid ID for verification.
            </div>

            {error && (
                <p className="text-sm bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg font-medium">
                    {error}
                </p>
            )}

            <button
                onClick={handleSchedule}
                disabled={scheduling}
                className="flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed bg-[#008489] hover:bg-[#006e73] shadow-md w-full sm:w-auto">
                {scheduling ? <Loader2 size={16} className="animate-spin" /> : <CalendarCheck size={16} />}
                {scheduling ? 'Scheduling...' : 'Confirm Pickup'}
            </button>
        </div>
    );
}
