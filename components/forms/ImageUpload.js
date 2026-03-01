'use client'
import { useState, useRef } from 'react'
import { ImagePlus, X, Loader2, UploadCloud } from 'lucide-react'

export default function ImageUpload({ value, onChange }) {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')
    const fileInputRef = useRef(null)

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate type & size (max 5MB)
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file')
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5MB')
            return
        }

        setError('')
        setUploading(true)

        try {
            // Convert to base64
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onloadend = async () => {
                const base64data = reader.result

                // Upload via our secure backend API
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imageFile: base64data })
                })

                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Upload failed')

                // Send the Cloudinary URL back to the parent form
                onChange(data.url)
                setUploading(false)
            }
        } catch (err) {
            console.error(err)
            setError(err.message || 'Upload failed')
            setUploading(false)
        }
    }

    // If an image is already uploaded/set
    if (value) {
        return (
            <div className="relative w-full h-40 rounded-xl overflow-hidden border border-white/10 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        className="btn-glass p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full space-y-2">
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
            />

            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className={`w-full h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors
                    ${error ? 'border-red-500/30 bg-red-500/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}
                    ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
            >
                {uploading ? (
                    <>
                        <Loader2 className="animate-spin text-white/50" size={24} />
                        <span className="text-sm text-white/50">Uploading to Cloudinary...</span>
                    </>
                ) : (
                    <>
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50">
                            <UploadCloud size={20} />
                        </div>
                        <span className="text-sm text-white/60 font-medium">Click or touch to upload photo</span>
                        <span className="text-xs text-white/30">JPG, PNG, WebP up to 5MB</span>
                    </>
                )}
            </button>

            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>
    )
}
