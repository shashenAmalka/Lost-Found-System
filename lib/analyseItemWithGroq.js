const GROQ_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

function stripMarkdownFences(value) {
    return String(value || '')
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim()
}

function extractJsonPayload(value) {
    const cleaned = stripMarkdownFences(value)
    if (!cleaned) return '{}'

    try {
        JSON.parse(cleaned)
        return cleaned
    } catch {
        const match = cleaned.match(/\{[\s\S]*\}/)
        if (match) return match[0]
    }

    return cleaned
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

function normalizeCategory(value) {
    const allowed = ['Electronics', 'Books', 'Clothing', 'Keys', 'ID Card', 'Bag', 'Jewelry', 'Sports', 'Other']
    const raw = String(value || '').trim()
    const match = allowed.find((item) => item.toLowerCase() === raw.toLowerCase())
    return match || 'Other'
}

function normalizeConfidence(value) {
    const raw = String(value || '').trim().toLowerCase()
    if (raw === 'high') return { confidence: 'high', confidencePercent: 90 }
    if (raw === 'medium') return { confidence: 'medium', confidencePercent: 65 }
    if (raw === 'low') return { confidence: 'low', confidencePercent: 35 }

    const numeric = Number(value)
    if (Number.isFinite(numeric)) {
        const percent = numeric <= 1 ? Math.round(numeric * 100) : Math.round(numeric)
        if (percent >= 80) return { confidence: 'high', confidencePercent: percent }
        if (percent >= 50) return { confidence: 'medium', confidencePercent: percent }
        return { confidence: 'low', confidencePercent: percent }
    }

    return { confidence: 'medium', confidencePercent: 65 }
}

function buildPrompt() {
    return `You are an AI assistant for a university lost and found system. Carefully analyse every visible detail in the image and return structured data. Respond with ONLY valid JSON, no markdown backticks.

Return exactly this structure:
{
  "aiGeneratedDescription": "Write a clear, natural 2-3 sentence paragraph a student would write to describe this item. Mention the item type, its colour, any visible brand/text, condition, and the most distinctive feature that would help someone recognise it. Example style: 'This is a black leather bifold wallet with a visible Nike logo on the front. It appears to be in good condition with slight wear on the corners. The interior has multiple card slots and a transparent ID window.'",
  "aiLabels": ["label1", "label2", "label3"],
  "aiCategory": "one of: Electronics, Books, Clothing, Keys, ID Card, Bag, Jewelry, Sports, Other",
  "aiColor": "single dominant color word e.g. black, red, silver",
  "aiBrand": "exact brand name if any logo or text is visible, otherwise empty string",
  "aiProfile": {
    "itemType": "specific item name e.g. AirPods case, spiral notebook, car key fob",
    "material": "e.g. leather, plastic, fabric — only if clearly identifiable",
    "size": "small / medium / large — estimate relative to a hand",
    "distinguishingFeatures": "any stickers, scratches, engravings, patterns, custom attachments, unusual colours or damage that make this item unique"
  },
  "confidence": "high or medium or low"
}

Rules:
- aiGeneratedDescription must sound like a human wrote it, NOT a bullet list, NOT robotic. Write in full flowing sentences.
- aiLabels: 4-7 short lowercase search keywords (colours, material, brand, item type). These are used for matching lost vs found items.
- If something is not visible or not determinable, use an empty string — do not guess wildly.
- confidence is high if the item is clearly visible and identifiable, medium if partially obscured, low if very unclear.`
}

function normalizeParsedAnalysis(parsed) {
    const aiProfile = parsed && typeof parsed.aiProfile === 'object' && parsed.aiProfile !== null
        ? parsed.aiProfile
        : {}

    const aiGeneratedDescription = String(parsed?.aiGeneratedDescription || '').trim()
    const aiLabels = normalizeArray(parsed?.aiLabels).map((value) => value.toLowerCase())
    const aiCategory = normalizeCategory(parsed?.aiCategory)
    const aiColor = String(parsed?.aiColor || '').trim().toLowerCase()
    const aiBrand = String(parsed?.aiBrand || '').trim()
    const itemType = String(aiProfile.itemType || '').trim()
    const material = String(aiProfile.material || '').trim()
    const size = String(aiProfile.size || '').trim().toLowerCase()
    const distinguishingFeatures = String(aiProfile.distinguishingFeatures || '').trim()
    const { confidence, confidencePercent } = normalizeConfidence(parsed?.confidence)

    return {
        aiGeneratedDescription,
        aiLabels,
        aiCategory,
        aiColor,
        aiBrand,
        aiProfile: {
            itemType,
            material,
            size,
            distinguishingFeatures,
        },
        confidence,
        confidencePercent,
        title: itemType || aiBrand || aiCategory || 'Unidentified Item',
        description: aiGeneratedDescription,
        fullScanDescription: aiGeneratedDescription,
        keywords: aiLabels,
        labels: aiLabels,
        source: 'groq',
    }
}

export async function analyseItemWithGroq(buffer, mimeType) {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
        throw new Error('GROQ_API_KEY is not configured')
    }

    const res = await fetch(GROQ_URL, {
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
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:${mimeType};base64,${buffer.toString('base64')}`,
                            },
                        },
                        {
                            type: 'text',
                            text: buildPrompt(),
                        },
                    ],
                },
            ],
            max_tokens: 600,
            temperature: 0.2,
        }),
    })

    if (!res.ok) {
        const errorText = await res.text().catch(() => '')
        throw new Error(`GROQ_UNAVAILABLE: ${res.status} ${errorText}`.trim())
    }

    const data = await res.json()
    const raw = data.choices?.[0]?.message?.content || '{}'
    console.log('Groq Item Vision response:', raw)

    try {
        const parsed = JSON.parse(extractJsonPayload(raw))
        return normalizeParsedAnalysis(parsed)
    } catch {
        throw new Error('GROQ_PARSE_ERROR')
    }
}
