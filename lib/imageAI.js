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

let localCaptioner = null
let localClassifier = null
let localVisionLoading = null

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

function extractIdentifierFromText(text) {
    const source = String(text || '').trim()
    if (!source) return ''

    const serialLike = source.match(/\b[A-Z0-9]{4,}(?:[-_][A-Z0-9]{2,})+\b/i)
    if (serialLike?.[0]) return serialLike[0]

    const mixedToken = source.match(/\b[A-Z]{1,5}\d{3,}[A-Z0-9]*\b/i)
    if (mixedToken?.[0]) return mixedToken[0]

    const numberToken = source.match(/\b\d{6,}\b/)
    if (numberToken?.[0]) return numberToken[0]

    return ''
}

function detectCondition(candidates) {
    const all = normalizeText(candidates.join(' '))
    if (!all) return 'Good'

    if (/(broken|crack|damaged|torn|tear|missing|rust|heavily worn)/.test(all)) return 'Damaged'
    if (/(poor|very old|stained|scratch|scratched|worn|faded)/.test(all)) return 'Poor'
    if (/(fair|used|minor wear|slight wear)/.test(all)) return 'Fair'
    if (/(new|unused|mint|pristine|like new|excellent)/.test(all)) return 'Excellent'

    return 'Good'
}

function estimateValue(category, brand, condition) {
    const categoryWeight = {
        Electronics: 3,
        Jewelry: 3,
        Sports: 2,
        Bag: 2,
        'ID Card': 1,
        Keys: 1,
        Clothing: 1,
        Books: 1,
        Other: 1,
    }

    const premiumBrands = new Set([
        'Apple', 'Samsung', 'Sony', 'Canon', 'Dell', 'HP', 'Asus', 'Lenovo',
        'Fossil', 'Rayban', 'Nike', 'Adidas',
    ])

    const conditionWeight = {
        Excellent: 2,
        Good: 1,
        Fair: 0,
        Poor: -1,
        Damaged: -2,
    }

    let score = categoryWeight[category] || 1
    if (brand && premiumBrands.has(String(brand))) score += 1
    score += conditionWeight[condition] || 0

    if (score >= 4) return 'High'
    if (score >= 2) return 'Medium'
    return 'Low'
}

function buildDetailedDescription({ itemTitle, color, brand, category, labels, ocrText, condition, uniqueIdentifier }) {
    const details = []
    const baseName = itemTitle || 'Item'
    const featureLabels = labels.slice(0, 5)

    details.push(`${baseName} appears in the image${color ? ` with a ${color.toLowerCase()} primary color` : ''}${brand ? ` and ${brand} branding cues` : ''}.`)

    if (featureLabels.length) {
        details.push(`Visible cues include ${featureLabels.join(', ')}${category ? `, consistent with ${category.toLowerCase()} items` : ''}.`)
    } else {
        details.push(`Visual cues suggest it belongs to the ${String(category || 'Other').toLowerCase()} category.`)
    }

    if (ocrText || uniqueIdentifier) {
        const ocrLine = ocrText ? `Extracted visible text: ${ocrText}.` : ''
        const idLine = uniqueIdentifier ? `Distinctive identifier observed: ${uniqueIdentifier}.` : ''
        details.push(`${ocrLine} ${idLine}`.trim())
    } else {
        details.push(`Estimated visible condition is ${condition.toLowerCase()} based on available image cues.`)
    }

    return details.slice(0, 3).join(' ')
}

function clampConfidenceToUnit(value) {
    const raw = Number(value || 0)
    if (!Number.isFinite(raw) || raw <= 0) return 0.7
    if (raw <= 1) return Math.max(0.7, Math.min(0.95, raw))
    return Math.max(0.7, Math.min(0.95, raw / 100))
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

function extractHintsFromImageUrl(imageUrl) {
    try {
        const parsed = new URL(imageUrl)
        const rawPath = `${parsed.pathname} ${parsed.search}`
        const parts = rawPath
            .split(/[\/_.\-?=&]+/)
            .map((v) => normalizeText(v))
            .filter((v) => v && v.length > 2)

        return uniqueStrings(parts).slice(0, 18)
    } catch {
        return uniqueStrings(String(imageUrl || '').split(/[\/_.\-?=&]+/)).slice(0, 18)
    }
}

function isWeakVisionResult({ caption, labels, category, color, confidence }) {
    const weakCaption = !caption || caption.toLowerCase().startsWith('a item is visible')
    const weakLabels = !labels || labels.length < 2
    const weakCategory = !category || category === 'Other'
    const weakColor = !color
    const weakConfidence = Number(confidence || 0) < 25
    return weakCaption && weakLabels && weakCategory && weakColor && weakConfidence
}

async function waitMs(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

async function getLocalVisionPipelines() {
    if (localCaptioner && localClassifier) {
        return { captioner: localCaptioner, classifier: localClassifier }
    }

    if (localVisionLoading) {
        await localVisionLoading
        return { captioner: localCaptioner, classifier: localClassifier }
    }

    localVisionLoading = (async () => {
        const { pipeline } = await import('@xenova/transformers')
        localCaptioner = await pipeline('image-to-text', 'Xenova/vit-gpt2-image-captioning')
        localClassifier = await pipeline('image-classification', 'Xenova/vit-base-patch16-224')
    })()

    try {
        await localVisionLoading
    } finally {
        localVisionLoading = null
    }

    return { captioner: localCaptioner, classifier: localClassifier }
}

async function analyzeImageWithLocalModels(imageUrl) {
    const { captioner, classifier } = await getLocalVisionPipelines()

    const [captionRes, classRes] = await Promise.allSettled([
        captioner(imageUrl),
        classifier(imageUrl),
    ])

    const caption = captionRes.status === 'fulfilled'
        ? parseCaptionResult(captionRes.value)
        : ''

    const classificationLabels = classRes.status === 'fulfilled'
        ? parseClassificationLabels(classRes.value)
        : []

    const fallbackDetection = mergeKeywordLists(
        extractKeywords(caption),
        classificationLabels
    ).slice(0, 8)

    return {
        caption,
        detectionLabels: fallbackDetection,
        classificationLabels,
        ocrText: '',
        confidence: bestConfidence(classRes.status === 'fulfilled' ? classRes.value : []),
        source: 'local_transformers',
    }
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
    if (!imageUrl) throw new Error('imageUrl is required')

    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
        throw new Error(`Failed to download image: ${imageResponse.status}`)
    }

    const imageBytes = Buffer.from(await imageResponse.arrayBuffer())

    const apiKey = process.env.HUGGINGFACE_API_KEY
    let caption = ''
    let detectionLabels = []
    let classificationLabels = []
    let ocrText = ''
    let analysisSource = 'heuristic'
    let detectionResult = []
    let classificationResult = []
    let visionConfidence = 0

    if (apiKey) {
        const [captionRes, detectionRes, classificationRes, ocrRes] = await Promise.allSettled([
            callHuggingFaceModel(HF_IMAGE_CAPTION_MODEL, imageBytes, apiKey),
            callHuggingFaceModel(HF_OBJECT_MODEL, imageBytes, apiKey),
            callHuggingFaceModel(HF_CLASSIFICATION_MODEL, imageBytes, apiKey),
            callHuggingFaceModel(HF_OCR_MODEL, imageBytes, apiKey),
        ])

        const captionResult = captionRes.status === 'fulfilled' ? captionRes.value : null
        detectionResult = detectionRes.status === 'fulfilled' ? detectionRes.value : []
        classificationResult = classificationRes.status === 'fulfilled' ? classificationRes.value : []
        const ocrResult = ocrRes.status === 'fulfilled' ? ocrRes.value : null

        caption = parseCaptionResult(captionResult)
        detectionLabels = parseDetectionLabels(detectionResult)
        classificationLabels = parseClassificationLabels(classificationResult)
        ocrText = parseOcrText(ocrResult)
        visionConfidence = bestConfidence(detectionResult, classificationResult)
        analysisSource = 'huggingface'
    }

    if (!apiKey || isWeakVisionResult({
        caption,
        labels: [...detectionLabels, ...classificationLabels],
        category: detectCategory([caption, ...detectionLabels, ...classificationLabels]),
        color: detectColor([caption, ...detectionLabels, ...classificationLabels]),
        confidence: visionConfidence,
    })) {
        try {
            const localResult = await analyzeImageWithLocalModels(imageUrl)
            caption = localResult.caption || caption
            detectionLabels = localResult.detectionLabels.length ? localResult.detectionLabels : detectionLabels
            classificationLabels = localResult.classificationLabels.length ? localResult.classificationLabels : classificationLabels
            visionConfidence = Math.max(visionConfidence, Number(localResult.confidence || 0))
            if (analysisSource !== 'huggingface') {
                analysisSource = localResult.source
            }
        } catch (localErr) {
            console.warn('[Image AI Local Fallback]', localErr.message)
        }
    }

    const urlHints = extractHintsFromImageUrl(imageUrl)
    if (!caption && urlHints.length) {
        caption = `Uploaded image appears related to ${urlHints.slice(0, 4).join(', ')}`
    }

    detectionLabels = mergeKeywordLists(detectionLabels, urlHints).slice(0, 10)
    classificationLabels = mergeKeywordLists(classificationLabels, urlHints).slice(0, 10)
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

    const modelConfidence = bestConfidence(detectionResult, classificationResult)
    const resolvedConfidence = Math.max(modelConfidence, visionConfidence, Number(confidenceMap.classification || 0), Number(confidenceMap.detection || 0))

    const visualFingerprint = buildVisualFingerprint({
        objectType,
        subType,
        category,
        color,
        labels,
        ocrText,
    })

    const suggestedTitle = toTitleCase(`${color ? `${color} ` : ''}${primaryObject}`.trim()) || 'Unidentified Item'

    const brand = brandHints[0] || null
    const uniqueIdentifier = extractIdentifierFromText(ocrText)
    const condition = detectCondition([caption, ocrText, ...labels])
    const aiLabels = labels.slice(0, 3)
    const keywordsExact = mergeKeywordLists(
        keywords,
        aiLabels,
        extractKeywords(caption),
        brand ? [brand] : [],
        uniqueIdentifier ? [uniqueIdentifier] : []
    ).slice(0, 5)
    const notableFeatures = mergeKeywordLists(
        aiLabels,
        [objectType, subType],
        brand ? [brand] : [],
        color ? [color] : [],
        uniqueIdentifier ? [uniqueIdentifier] : []
    ).slice(0, 3)
    const confidenceUnit = clampConfidenceToUnit(resolvedConfidence)
    const estimatedValue = estimateValue(category, brand, condition)
    const detailedDescription = buildDetailedDescription({
        itemTitle: suggestedTitle,
        color,
        brand,
        category,
        labels,
        ocrText,
        condition,
        uniqueIdentifier,
    })

    return {
        itemTitle: suggestedTitle,
        category,
        description: detailedDescription,
        color: color || '',
        brand,
        uniqueIdentifier: uniqueIdentifier || '',
        keywords: keywordsExact,
        aiLabels,
        confidence: confidenceUnit,
        condition,
        notableFeatures,
        estimatedValue,

        // Backward-compatible fields used by existing routes
        title: suggestedTitle,
        shortDescription: description,
        fullScanDescription,
        labels: mergeKeywordLists(labels, aiLabels).slice(0, 14),
        confidencePercent: Math.round(confidenceUnit * 100),
        source: analysisSource,
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
