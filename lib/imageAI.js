const CATEGORY_KEYWORDS = {
    Electronics: ['phone', 'laptop', 'tablet', 'charger', 'earphone', 'headphone', 'camera', 'electronic', 'watch', 'mobile'],
    Books: ['book', 'notebook', 'magazine', 'journal', 'textbook', 'novel'],
    Clothing: ['shirt', 't-shirt', 'jacket', 'hoodie', 'dress', 'trouser', 'pant', 'cloth', 'shoe', 'cap', 'hat'],
    Keys: ['key', 'keychain', 'keyring'],
    'ID Card': ['id', 'identity', 'card', 'license', 'passport', 'student card', 'badge'],
    Bag: ['bag', 'backpack', 'handbag', 'wallet', 'purse', 'luggage'],
    Jewelry: ['ring', 'bracelet', 'necklace', 'earring', 'jewelry'],
    Sports: ['ball', 'racket', 'bat', 'helmet', 'sports', 'bottle'],
    Other: [],
}

const COLOR_WORDS = ['black', 'white', 'gray', 'grey', 'red', 'green', 'blue', 'yellow', 'orange', 'purple', 'pink', 'brown', 'silver', 'gold']

const STOP_WORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'for', 'with', 'of', 'to', 'from',
    'this', 'that', 'these', 'those', 'item', 'object', 'photo', 'image', 'there', 'near', 'front', 'back',
])

const HF_IMAGE_CAPTION_MODEL = 'Salesforce/blip-image-captioning-large'
const HF_OBJECT_MODEL = 'facebook/detr-resnet-50'
const HF_CLASSIFICATION_MODEL = 'google/vit-base-patch16-224'
const HF_OCR_MODEL = 'microsoft/trocr-base-printed'

const BRAND_HINTS = [
    'apple', 'samsung', 'xiaomi', 'oneplus', 'huawei', 'dell', 'hp', 'lenovo', 'asus',
    'nike', 'adidas', 'puma', 'reebok', 'vaseline', 'nivea', 'signal', 'star', 'coca',
    'pepsi', 'sony', 'canon', 'casio', 'fossil', 'rayban', 'zara', 'levis', 'uniqlo',
]

function normalizeText(value) {
    return String(value || '')
        .toLowerCase()
        .replace(/[_-]/g, ' ')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

function uniqueStrings(values) {
    const seen = new Set()
    const out = []
    for (const value of values) {
        const normalized = normalizeText(value)
        if (!normalized || seen.has(normalized)) continue
        seen.add(normalized)
        out.push(normalized)
    }
    return out
}

function toTitleCase(value) {
    return String(value || '')
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
}

function extractKeywords(text) {
    return uniqueStrings(
        normalizeText(text)
            .split(' ')
            .filter((token) => token.length > 2 && !STOP_WORDS.has(token))
    )
}

function extractUpperWords(text) {
    const matches = String(text || '').match(/\b[A-Z]{3,}\b/g) || []
    return uniqueStrings(matches)
}

function detectCategory(candidates) {
    const all = candidates.map((value) => normalizeText(value))
    let best = { category: 'Other', score: 0 }

    for (const [category, words] of Object.entries(CATEGORY_KEYWORDS)) {
        if (!words.length) continue
        let score = 0
        for (const candidate of all) {
            if (words.some((word) => candidate.includes(word))) score += 1
        }
        if (score > best.score) best = { category, score }
    }

    return best.category
}

function detectColor(candidates) {
    const allText = normalizeText(candidates.join(' '))
    const color = COLOR_WORDS.find((word) => allText.includes(word))
    if (!color) return ''
    if (color === 'grey') return 'Gray'
    return toTitleCase(color)
}

function detectObjectType(candidates) {
    const all = candidates.map((value) => normalizeText(value)).join(' ')
    if (!all) return 'item'

    const objectKeywords = [
        'bottle', 'wallet', 'bag', 'backpack', 'phone', 'laptop', 'watch', 'key', 'card', 'book',
        'notebook', 'earphone', 'headphone', 'charger', 'ring', 'bracelet', 'necklace', 'shoe',
    ]

    const hit = objectKeywords.find((word) => all.includes(word))
    return hit || 'item'
}

function inferSubType(candidates, objectType) {
    const all = candidates.map((value) => normalizeText(value)).join(' ')
    if (!all) return objectType

    if (objectType === 'bottle') {
        if (all.includes('water')) return 'water bottle'
        if (all.includes('lotion')) return 'lotion bottle'
        if (all.includes('shampoo')) return 'shampoo bottle'
    }

    if (objectType === 'card') {
        if (all.includes('student')) return 'student id card'
        if (all.includes('license')) return 'license card'
    }

    return objectType
}

function detectBrands(candidates) {
    const all = candidates.map((value) => normalizeText(value)).join(' ')
    const hints = BRAND_HINTS.filter((brand) => all.includes(brand))
    return uniqueStrings(hints).map(toTitleCase)
}

function buildVisualFingerprint({ objectType, subType, category, color, labels, ocrText }) {
    const parts = [
        objectType,
        subType,
        category,
        color,
        ...labels.slice(0, 8),
        ...extractKeywords(ocrText).slice(0, 5),
    ]
    return uniqueStrings(parts).join(' | ')
}

function buildDescription(caption, labels, color) {
    const captionText = String(caption || '').trim()
    if (captionText) {
        const withPeriod = /[.!?]$/.test(captionText) ? captionText : `${captionText}.`
        return withPeriod[0].toUpperCase() + withPeriod.slice(1)
    }

    const primary = labels[0] || 'item'
    const extras = labels.slice(1, 4)
    const colorPrefix = color ? `${color.toLowerCase()} ` : ''

    if (!extras.length) {
        return `A ${colorPrefix}${primary} is visible in the uploaded image.`
    }

    return `A ${colorPrefix}${primary} is visible in the uploaded image with related details such as ${extras.join(', ')}.`
}

function buildFullScanDescription({ caption, labels, category, color, detectionLabels, classificationLabels }) {
    const parts = []
    if (caption) {
        parts.push(`Scene summary: ${caption}`)
    }

    if (labels.length) {
        parts.push(`Detected objects and cues: ${labels.slice(0, 12).join(', ')}`)
    }

    if (detectionLabels.length) {
        parts.push(`Object detector focus: ${detectionLabels.slice(0, 8).join(', ')}`)
    }

    if (classificationLabels.length) {
        parts.push(`Classifier hints: ${classificationLabels.slice(0, 8).join(', ')}`)
    }

    parts.push(`Predicted category: ${category || 'Other'}`)
    if (color) parts.push(`Predicted color: ${color}`)

    return parts.join('. ') + '.'
}

function buildAdvancedFullScanDescription({
    caption,
    labels,
    category,
    color,
    detectionLabels,
    classificationLabels,
    ocrText,
    brandHints,
    objectType,
    subType,
}) {
    const base = buildFullScanDescription({
        caption,
        labels,
        category,
        color,
        detectionLabels,
        classificationLabels,
    })

    const parts = [base]
    parts.push(`Primary object type: ${objectType}`)
    parts.push(`Predicted sub type: ${subType}`)

    if (brandHints.length) {
        parts.push(`Brand hints from visual/text cues: ${brandHints.join(', ')}`)
    }

    if (ocrText) {
        parts.push(`Visible printed text from OCR: ${ocrText}`)
    }

    return parts.join('. ') + '.'
}

async function waitMs(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

async function callHuggingFaceModel(model, imageBytes, apiKey, attempt = 0) {
    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/octet-stream',
        },
        body: imageBytes,
    })

    if (!response.ok) {
        const text = await response.text()
        throw new Error(`Hugging Face ${model} failed: ${response.status} ${text}`)
    }

    const data = await response.json()

    if (data?.error && String(data.error).toLowerCase().includes('loading') && attempt < 2) {
        await waitMs(2000)
        return callHuggingFaceModel(model, imageBytes, apiKey, attempt + 1)
    }

    return data
}

function parseCaptionResult(result) {
    if (Array.isArray(result)) {
        return String(result[0]?.generated_text || '').trim()
    }
    return String(result?.generated_text || '').trim()
}

function parseDetectionLabels(result) {
    if (!Array.isArray(result)) return []
    return result
        .filter((entry) => Number(entry?.score || 0) >= 0.3)
        .map((entry) => entry?.label)
        .filter(Boolean)
}

function parseClassificationLabels(result) {
    if (!Array.isArray(result)) return []
    return result
        .filter((entry) => Number(entry?.score || 0) >= 0.2)
        .slice(0, 8)
        .map((entry) => entry?.label)
        .filter(Boolean)
}

function parseOcrText(result) {
    if (Array.isArray(result)) {
        return String(result[0]?.generated_text || '').trim()
    }
    return String(result?.generated_text || '').trim()
}

function buildConfidenceMap({ detectionResult, classificationResult, caption, ocrText }) {
    const detectionConfidence = bestConfidence(detectionResult)
    const classificationConfidence = bestConfidence(classificationResult)
    const captionConfidence = caption ? 75 : 0
    const ocrConfidence = ocrText ? 70 : 0

    return {
        detection: detectionConfidence,
        classification: classificationConfidence,
        caption: captionConfidence,
        ocr: ocrConfidence,
    }
}

function bestConfidence(...results) {
    let maxScore = 0
    for (const result of results) {
        if (!Array.isArray(result)) continue
        for (const row of result) {
            const score = Number(row?.score || 0)
            if (score > maxScore) maxScore = score
        }
    }
    return Math.round(maxScore * 100)
}

export function mergeKeywordLists(...lists) {
    const merged = []
    for (const list of lists) {
        if (!list) continue
        if (Array.isArray(list)) {
            merged.push(...list)
            continue
        }
        const parts = String(list)
            .split(',')
            .map((part) => part.trim())
            .filter(Boolean)
        merged.push(...parts)
    }
    return uniqueStrings(merged)
}

export async function analyzeImageFromUrl(imageUrl) {
    const apiKey = process.env.HUGGINGFACE_API_KEY
    if (!apiKey) throw new Error('HUGGINGFACE_API_KEY is not configured')
    if (!imageUrl) throw new Error('imageUrl is required')

    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
        throw new Error(`Failed to download image: ${imageResponse.status}`)
    }

    const imageBytes = Buffer.from(await imageResponse.arrayBuffer())

    const [captionRes, detectionRes, classificationRes, ocrRes] = await Promise.allSettled([
        callHuggingFaceModel(HF_IMAGE_CAPTION_MODEL, imageBytes, apiKey),
        callHuggingFaceModel(HF_OBJECT_MODEL, imageBytes, apiKey),
        callHuggingFaceModel(HF_CLASSIFICATION_MODEL, imageBytes, apiKey),
        callHuggingFaceModel(HF_OCR_MODEL, imageBytes, apiKey),
    ])

    const captionResult = captionRes.status === 'fulfilled' ? captionRes.value : null
    const detectionResult = detectionRes.status === 'fulfilled' ? detectionRes.value : []
    const classificationResult = classificationRes.status === 'fulfilled' ? classificationRes.value : []
    const ocrResult = ocrRes.status === 'fulfilled' ? ocrRes.value : null

    const caption = parseCaptionResult(captionResult)
    const detectionLabels = parseDetectionLabels(detectionResult)
    const classificationLabels = parseClassificationLabels(classificationResult)
    const ocrText = parseOcrText(ocrResult)
    const ocrTokens = mergeKeywordLists(extractKeywords(ocrText), extractUpperWords(ocrText))

    const labels = uniqueStrings([...detectionLabels, ...classificationLabels]).slice(0, 14)
    const primaryObject = labels[0] || (caption ? extractKeywords(caption)[0] : 'item') || 'item'
    const color = detectColor([caption, ocrText, ...labels])
    const category = detectCategory([caption, ocrText, ...labels])
    const objectType = detectObjectType([caption, ocrText, ...labels])
    const subType = inferSubType([caption, ocrText, ...labels], objectType)
    const brandHints = detectBrands([caption, ocrText, ...labels])

    const description = buildDescription(caption, labels, color)
    const fullScanDescription = buildAdvancedFullScanDescription({
        caption,
        labels,
        category,
        color,
        detectionLabels,
        classificationLabels,
        ocrText,
        brandHints,
        objectType,
        subType,
    })
    const keywords = mergeKeywordLists(labels, extractKeywords(description), ocrTokens, brandHints, [objectType, subType]).slice(0, 16)

    const confidenceMap = buildConfidenceMap({
        detectionResult,
        classificationResult,
        caption,
        ocrText,
    })

    const visualFingerprint = buildVisualFingerprint({
        objectType,
        subType,
        category,
        color,
        labels,
        ocrText,
    })

    const suggestedTitle = toTitleCase(`${color ? `${color} ` : ''}${primaryObject}`.trim()) || 'Unidentified Item'

    return {
        title: suggestedTitle,
        description,
        fullScanDescription,
        labels,
        keywords,
        category,
        color,
        confidence: bestConfidence(detectionResult, classificationResult),
        aiProfile: {
            objectType,
            subType,
            brandHints,
            ocrText,
            visualFingerprint,
            confidenceMap,
        },
        raw: {
            captionModel: HF_IMAGE_CAPTION_MODEL,
            objectModel: HF_OBJECT_MODEL,
            classificationModel: HF_CLASSIFICATION_MODEL,
            ocrModel: HF_OCR_MODEL,
        },
    }
}
