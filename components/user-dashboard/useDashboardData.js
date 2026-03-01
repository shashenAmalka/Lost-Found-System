'use client';
import { useState, useEffect } from 'react';

/**
 * Custom hook encapsulating data-fetching logic for the User Dashboard.
 * Fetches lost items, claims, and notifications for the authenticated user.
 * @param {object|null} user - The authenticated user object from AuthContext.
 * @returns {{ myLost: Array, myClaims: Array, notifications: Array, matches: Array, loading: boolean }}
 */
export default function useDashboardData(user) {
    const [myLost, setMyLost] = useState([]);
    const [myClaims, setMyClaims] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        Promise.all([
            fetch('/api/lost-items', { credentials: 'include' }).then(r => r.json()),
            fetch('/api/claims', { credentials: 'include' }).then(r => r.json()),
            fetch('/api/notifications', { credentials: 'include' }).then(r => r.json()),
        ]).then(([lost, claims, notifs]) => {
            setMyLost((lost.items || []).filter(i => i.postedBy === user.id));
            setMyClaims(claims.claims || []);

            const allNotifs = notifs.notifications || [];
            setNotifications(allNotifs);

            // Build matches array from ai_match notifications (with populated foundItemId)
            // Deduplicate by foundItemId to prevent duplicate match cards
            const CLAIM_THRESHOLD = 75; // Only show matches ≥ 75% to users
            const seenFoundIds = new Set();
            const aiMatches = allNotifs
                .filter(n => n.type === 'ai_match' && n.foundItemId && (n.matchScore || 0) >= CLAIM_THRESHOLD)
                .filter(n => {
                    const fid = typeof n.foundItemId === 'object' ? n.foundItemId._id : n.foundItemId;
                    if (seenFoundIds.has(String(fid))) return false;
                    seenFoundIds.add(String(fid));
                    return true;
                })
                .map(n => {
                    const found = n.foundItemId;
                    return {
                        id: typeof found === 'object' ? found._id : found,
                        title: typeof found === 'object' ? found.title : 'Found Item',
                        location: typeof found === 'object' ? found.locationFound : '',
                        category: typeof found === 'object' ? found.category : '',
                        matchScore: n.matchScore || 0,
                        timeAgo: timeAgo(n.createdAt),
                        imageUrl: typeof found === 'object' ? found.photoUrl : '',
                        notificationId: n._id,
                        lostItemId: typeof n.lostItemId === 'object' ? n.lostItemId?._id : n.lostItemId,
                        submittedBy: typeof found === 'object' ? found.submittedBy : null,
                    };
                });
            setMatches(aiMatches);
        }).catch(() => { }).finally(() => setLoading(false));
    }, [user]);

    return { myLost, myClaims, notifications, matches, loading };
}

function timeAgo(dateStr) {
    if (!dateStr) return 'Recently';
    const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}
