const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'

const ALLOWED_CATEGORIES = [
    'Electronics', 'Books', 'Clothing', 'Keys',
    'ID Card', 'Bag', 'Jewelry', 'Sports', 'Other',
]

const ALLOWED_CONDITIONS = new Set(['Excellent', 'Good', 'Fair', 'Poor'])

const COLOR_HINTS = [
    'black', 'blue', 'silver', 'red', 'white', 'green', 'brown',
    'grey', 'gray', 'gold', 'pink', 'orange', 'purple', 'yellow',
]

function normalizeCategory(value) {
    const raw = String(value || '').trim()
    const match = ALLOWED_CATEGORIES.find((item) => item.toLowerCase() === raw.toLowerCase())
    return match || 'Other'
}

function normalizeArray(value) {
    if (Array.isArray(value)) {
        return value.map((entry) => String(entry || '').trim()).filter(Boolean)
    }

    if (typeof value === 'string') {
        return value
            .split(',')
            .map((entry) => entry.trim())
            .filter(Boolean)
    }

    return []
}

function normalizeColor(value) {
    const raw = String(value || '').trim().toLowerCase()
    if (!raw) return ''

    const hinted = COLOR_HINTS.find((color) => raw.includes(color))
    if (!hinted) return raw.split(/\s+/)[0] || ''

    return hinted === 'gray' ? 'grey' : hinted
}

function normalizeCondition(value) {
    const raw = String(value || '').trim().toLowerCase()
    const cleaned = String(value || '').trim()
    if (ALLOWED_CONDITIONS.has(cleaned)) return cleaned
    if (/broken|damaged|poor|torn|scratched|worn/.test(raw)) return 'Poor'
    if (/fair|used|slight wear/.test(raw)) return 'Fair'
    if (/excellent|new|pristine|like new/.test(raw)) return 'Excellent'
    return 'Good'
}

function clampConfidence(value) {
    const numeric = Number(value)
    if (!Number.isFinite(numeric) || numeric <= 0) return 70
    if (numeric <= 1) return Math.round(numeric * 100)
    return Math.min(100, Math.max(0, Math.round(numeric)))
}

function cleanJson(raw) {
    const stripped = String(raw || '')
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim()

    const match = stripped.match(/\{[\s\S]*\}/)
    return match ? match[0] : stripped
}

function normalizeProfile(value) {
    const profile = value && typeof value === 'object' ? value : {}

    return {
        objectType: String(profile.objectType || '').trim(),
        subType: String(profile.subType || '').trim(),
        material: String(profile.material || '').trim(),
        size: String(profile.size || '').trim().toLowerCase(),
        distinguishingFeatures: String(profile.distinguishingFeatures || '').trim(),
        visualFingerprint: String(profile.visualFingerprint || '').trim(),
    }
}

function buildFallbackDescription({ title, color, brand, keywords, condition }) {
    const subject = title || 'The item'
    const firstSentence = `${subject} appears in the uploaded image${color ? ` with a ${color} appearance` : ''}${brand ? ` and visible ${brand} branding` : ''}.`
    const secondSentence = keywords.length
        ? `Visible cues include ${keywords.slice(0, 3).join(', ')}.`
        : `No clear brand or identifier is visible from the image.`
    const thirdSentence = condition ? `Estimated condition is ${condition.toLowerCase()}.` : ''

    return [firstSentence, secondSentence, thirdSentence].filter(Boolean).join(' ')
}

function buildItemAnalysisPrompt(itemType = 'item') {
    const context = itemType === 'lost'
        ? 'lost item'
        : itemType === 'found'
            ? 'found item'
            : 'item'

    return `You are an AI assistant for a university lost and found system in Sri Lanka.
You are analyzing a ${context} image.
Carefully examine every visible detail in this image and return structured data.
Respond with ONLY valid JSON — no markdown, no backticks, no explanations outside JSON.

Return exactly this structure:
{
  "title": "Specific, descriptive item name. Include color and brand if visible.",
  "category": "ONE exact value from: Electronics, Books, Clothing, Keys, ID Card, Bag, Jewelry, Sports, Other",
  "description": "Write 2-3 natural flowing sentences covering what the item is, its color/material, visible brand markings, condition, and the most distinctive feature.",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "color": "Dominant color as one lowercase word",
  "brand": "Exact brand/manufacturer name if clearly visible, otherwise empty string",
  "uniqueIdentifier": "Visible serial number, ID number, asset tag, or engraving, otherwise empty string",
  "condition": "One of: Excellent, Good, Fair, Poor",
  "aiLabels": ["label1", "label2", "label3"],
  "aiProfile": {
    "objectType": "Specific item type",
    "subType": "More specific model or variant",
    "material": "Primary material if visible",
    "size": "small, medium, or large",
    "distinguishingFeatures": "Any stickers, scratches, cracks, engravings, custom attachments, or writing",
    "visualFingerprint": "Pipe-separated list of the most unique visual identifiers"
  },
  "confidence": 85
}

Rules:
- Description must be 2-3 full sentences and sound human.
- Keywords should be 4-7 lowercase terms used for search matching.
- aiLabels must be exactly 3 short labels.
- confidence must be an integer from 0 to 100.
- Use empty string values when uncertain instead of guessing.
- Category must be one of the exact enum values listed above.`
}

export async function analyzeItemImageWithGroq(imageUrl, options = {}) {
    if (!imageUrl) throw new Error('imageUrl is required')

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) throw new Error('GROQ_API_KEY is not set in environment variables')

    const itemType = String(options.itemType || 'item').trim().toLowerCase()

    let buffer
    let mimeType
    try {
        const imgRes = await fetch(imageUrl, { signal: AbortSignal.timeout(15_000) })
        if (!imgRes.ok) throw new Error(`HTTP ${imgRes.status}`)
        buffer = Buffer.from(await imgRes.arrayBuffer())
        mimeType = (imgRes.headers.get('content-type') || 'image/jpeg').split(';')[0].trim()
    } catch (err) {
        throw new Error(`Failed to download image: ${err.message}`)
    }

    const dataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`

    let groqRes
    try {
        groqRes = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'image_url', image_url: { url: dataUrl } },
                            { type: 'text', text: buildItemAnalysisPrompt(itemType) },
                        ],
                    },
                ],
                max_tokens: 750,
                temperature: 0.1,
            }),
            signal: AbortSignal.timeout(30_000),
        })
    } catch (err) {
        throw new Error(`Groq API request failed: ${err.message}`)
    }

    if (!groqRes.ok) {
        const errText = await groqRes.text().catch(() => '')
        throw new Error(`Groq API error ${groqRes.status}: ${errText.slice(0, 200)}`)
    }

    const data = await groqRes.json()
    const raw = data.choices?.[0]?.message?.content || '{}'

    let parsed
    try {
        parsed = JSON.parse(cleanJson(raw))
    } catch (err) {
        console.error('[Groq Item AI] JSON parse failed:', err.message, '| Raw:', raw)
        throw new Error('Groq returned unparsable JSON')
    }

    const aiProfile = normalizeProfile(parsed.aiProfile)
    const parsedTitle = String(parsed.title || '').trim()
    const category = normalizeCategory(parsed.category)
    const color = normalizeColor(parsed.color)
    const brand = String(parsed.brand || '').trim()
    const uniqueIdentifier = String(parsed.uniqueIdentifier || '').trim()
    const keywords = normalizeArray(parsed.keywords).map((value) => value.toLowerCase()).slice(0, 7)
    let aiLabels = normalizeArray(parsed.aiLabels).map((value) => value.toLowerCase())
    aiLabels = [...new Set([...aiLabels, ...keywords])].slice(0, 3)
    const confidence = clampConfidence(parsed.confidence)
    const condition = normalizeCondition(parsed.condition)

    const title = parsedTitle || aiProfile.subType || aiProfile.objectType || brand || 'Unidentified Item'
    const description = String(parsed.description || '').trim() || buildFallbackDescription({
        title,
        color,
        brand,
        keywords,
        condition,
    })

    return {
        title,
        category,
        description,
        keywords,
        color,
        brand,
        uniqueIdentifier,
        condition,
        aiGeneratedDescription: description,
        aiLabels,
        aiCategory: category,
        aiColor: color,
        aiConfidence: confidence,
        aiProfile,
        aiSource: 'groq',
        confidence,
        confidencePercent: confidence,
        labels: aiLabels,
        source: 'groq',
        fullScanDescription: description,
    }
}