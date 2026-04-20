/**
 * AI Matching Engine — Semantic Edition
 * Uses thi sentence transformer for semantic text similarity
 * Falls back to TF-IDF if model fails to load
 */

// ========== SENTENCE TRANSFORMER (MiniLM-L6-v2) ==========

let pipeline = null
let embedder = null
let modelLoading = false
let modelFailed = false

/**
 * Lazy-load the sentence transformer model (singleton)
 * Model downloads (~23MB) on first use, then cached locally
 */
async function getEmbedder() {
    if (embedder) return embedder
    if (modelFailed) return null
    if (modelLoading) {
        // Wait for ongoing load
        await new Promise(resolve => {
            const check = setInterval(() => {
                if (!modelLoading) { clearInterval(check); resolve() }
            }, 200)
        })
        return embedder
    }

    modelLoading = true
    try {
        const { pipeline: pipelineFn } = await import('@xenova/transformers')
        pipeline = pipelineFn
        embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
            quantized: true, // Use quantized model for faster inference
        })
        console.log('[AI Engine] ✅ MiniLM-L6-v2 model loaded successfully')
        return embedder
    } catch (err) {
        console.error('[AI Engine] ⚠️ Failed to load MiniLM model, falling back to TF-IDF:', err.message)
        modelFailed = true
        return null
    } finally {
        modelLoading = false
    }
}

/**
 * Generate embedding for a text string
 * Returns a Float32Array of 384 dimensions
 */
async function getEmbedding(text) {
    const model = await getEmbedder()
    if (!model || !text?.trim()) return null

    const output = await model(text, { pooling: 'mean', normalize: true })
    return Array.from(output.data)
}

/**
 * Cosine similarity between two embedding vectors
 */
function cosineSimilarityVec(vec1, vec2) {
    if (!vec1 || !vec2 || vec1.length !== vec2.length) return 0
    let dot = 0, mag1 = 0, mag2 = 0
    for (let i = 0; i < vec1.length; i++) {
        dot += vec1[i] * vec2[i]
        mag1 += vec1[i] * vec1[i]
        mag2 += vec2[i] * vec2[i]
    }
    if (mag1 === 0 || mag2 === 0) return 0
    return dot / (Math.sqrt(mag1) * Math.sqrt(mag2))
}

/**
 * Semantic text similarity using MiniLM embeddings (0-1)
 */
async function semanticSimilarity(text1, text2) {
    if (!text1?.trim() || !text2?.trim()) return 0
    const [emb1, emb2] = await Promise.all([getEmbedding(text1), getEmbedding(text2)])
    if (!emb1 || !emb2) return fallbackTextSimilarity(text1, text2) // TF-IDF fallback
    return Math.max(0, cosineSimilarityVec(emb1, emb2))
}

// ========== TF-IDF FALLBACK ==========

const STOP_WORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'is', 'was', 'are', 'were', 'be', 'been', 'has', 'have', 'had',
    'this', 'that', 'these', 'those', 'it', 'its', 'my', 'your', 'our', 'their',
    'i', 'me', 'we', 'he', 'she', 'they', 'him', 'her', 'us', 'them', 'what', 'which',
    'who', 'when', 'where', 'how', 'why', 'not', 'no', 'yes', 'all', 'any', 'each',
    'item', 'lost', 'found', 'campus', 'university', 'please', 'very', 'some', 'also'
])

function tokenize(text) {
    if (!text) return []
    return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/)
        .filter(w => w.length > 2 && !STOP_WORDS.has(w))
}

function termFrequency(tokens) {
    const tf = {}
    tokens.forEach(t => { tf[t] = (tf[t] || 0) + 1 })
    return tf
}

function cosineSimilarityTF(tf1, tf2) {
    const allTerms = new Set([...Object.keys(tf1), ...Object.keys(tf2)])
    let dot = 0, mag1 = 0, mag2 = 0
    allTerms.forEach(term => {
        const v1 = tf1[term] || 0
        const v2 = tf2[term] || 0
        dot += v1 * v2
        mag1 += v1 * v1
        mag2 += v2 * v2
    })
    if (mag1 === 0 || mag2 === 0) return 0
    return dot / (Math.sqrt(mag1) * Math.sqrt(mag2))
}

function fallbackTextSimilarity(text1, text2) {
    const toks1 = tokenize(text1)
    const toks2 = tokenize(text2)
    if (toks1.length === 0 && toks2.length === 0) return 1
    if (toks1.length === 0 || toks2.length === 0) return 0
    return cosineSimilarityTF(termFrequency(toks1), termFrequency(toks2))
}

function tokenOverlapSimilarity(text1, text2) {
    const set1 = new Set(tokenize(text1))
    const set2 = new Set(tokenize(text2))
    if (!set1.size && !set2.size) return 1
    if (!set1.size || !set2.size) return 0

    let intersection = 0
    for (const token of set1) {
        if (set2.has(token)) intersection += 1
    }

    const union = set1.size + set2.size - intersection
    return union ? intersection / union : 0
}

function blendSimilarity(semanticScore, lexicalScore, semanticWeight = 0.75) {
    const s = Number.isFinite(semanticScore) ? semanticScore : 0
    const l = Number.isFinite(lexicalScore) ? lexicalScore : 0
    return (s * semanticWeight) + (l * (1 - semanticWeight))
}

// ========== STRUCTURAL SIMILARITY (unchanged) ==========

/**
 * Date proximity score (daysApart → 0-1)
 */
function dateSimilarity(date1, date2) {
    if (!date1 || !date2) return 0.5
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    const diffDays = Math.abs((d1 - d2) / (1000 * 60 * 60 * 24))
    if (diffDays <= 1) return 1.0
    if (diffDays <= 7) return 0.85
    if (diffDays <= 14) return 0.7
    if (diffDays <= 30) return 0.5
    if (diffDays <= 60) return 0.3
    if (diffDays <= 90) return 0.1
    return 0
}

/**
 * Category exact match
 */
function categorySimilarity(cat1, cat2) {
    if (!cat1 || !cat2) return 0
    return cat1.toLowerCase() === cat2.toLowerCase() ? 1 : 0
}

function colorSimilarity(color1, color2) {
    const c1 = String(color1 || '').toLowerCase().trim()
    const c2 = String(color2 || '').toLowerCase().trim()
    if (!c1 && !c2) return 0.5
    if (!c1 || !c2) return 0
    if (c1 === c2) return 1

    const t1 = new Set(c1.split(/\s+/).filter(Boolean))
    const t2 = new Set(c2.split(/\s+/).filter(Boolean))
    const overlap = [...t1].filter((token) => t2.has(token)).length
    const maxLen = Math.max(t1.size, t2.size)
    return maxLen ? overlap / maxLen : 0
}

function objectTypeSimilarity(type1, type2, subType1, subType2) {
    const t1 = normalizeToken(type1)
    const t2 = normalizeToken(type2)
    const s1 = normalizeToken(subType1)
    const s2 = normalizeToken(subType2)

    if (!t1 && !t2) return 0.5
    if (!t1 || !t2) return 0

    if (t1 === t2) {
        if (s1 && s2 && s1 !== s2) return 0.7
        return 1
    }

    if (s1 && s2 && s1 === s2) return 0.85
    return tokenOverlapSimilarity(`${t1} ${s1}`.trim(), `${t2} ${s2}`.trim())
}

function normalizeToken(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

// ========== RISK DETECTION (unchanged) ==========

/**
 * Risk scoring - detects suspicious claim patterns
 */
function computeRiskScore(lostItem, foundItem, claim) {
    let risk = 0

    // Vague ownership explanation
    const explanationLength = (claim?.ownershipExplanation || '').trim().length
    if (explanationLength < 30) risk += 25
    else if (explanationLength < 80) risk += 10

    // No hidden details provided
    if (!(claim?.hiddenDetails || '').trim()) risk += 15

    // Date mismatch > 30 days
    const dateDiff = Math.abs(
        new Date(lostItem.dateLost || Date.now()) - new Date(foundItem.dateFound || Date.now())
    ) / (1000 * 60 * 60 * 24)
    if (dateDiff > 30) risk += 20
    else if (dateDiff > 14) risk += 10

    // Category mismatch
    if (lostItem.category !== foundItem.category) risk += 20

    return Math.min(100, risk)
}

// ========== MAIN ENGINE ==========

/**
 * Compute match score between a lost item and found item (+ claim details).
 * Uses MiniLM-L6-v2 for semantic text comparison.
 * Returns: { matchScore, riskScore, suggestedDecision, breakdown }
 */
export async function computeMatchScore(lostItem, foundItem, claim = {}) {
    // Weights for each component
    const W = {
        description: 0.24,
        keywords: 0.17,
        location: 0.10,
        date: 0.12,
        category: 0.14,
        attributes: 0.05,
        color: 0.05,
        ocr: 0.06,
        objectType: 0.05,
        profile: 0.02,
    }

    const lostProfile = lostItem.aiProfile || {}
    const foundProfile = foundItem.aiProfile || {}

    const lostDesc = [lostItem.title, lostItem.description, lostItem.aiGeneratedDescription]
        .filter(Boolean)
        .join(' ')
    const foundDesc = [foundItem.title, foundItem.description, foundItem.aiGeneratedDescription]
        .filter(Boolean)
        .join(' ')

    const lostKeywordText = [...(lostItem.keywords || []), ...(lostItem.aiLabels || [])].join(', ')
    const foundKeywordText = [...(foundItem.keywords || []), ...(foundItem.aiLabels || [])].join(', ')

    const lostOcrText = `${lostProfile.ocrText || ''} ${(lostProfile.brandHints || []).join(' ')}`.trim()
    const foundOcrText = `${foundProfile.ocrText || ''} ${(foundProfile.brandHints || []).join(' ')}`.trim()

    const lostFingerprint = String(lostProfile.visualFingerprint || '').trim()
    const foundFingerprint = String(foundProfile.visualFingerprint || '').trim()

    // Semantic similarity for text fields (uses MiniLM-L6-v2)
    const [descSemantic, kwSemantic, locScore, attrScore, ocrSemantic] = await Promise.all([
        // Description: compare full title + description
        semanticSimilarity(lostDesc, foundDesc),
        // Keywords: join arrays and compare semantically
        semanticSimilarity(lostKeywordText, foundKeywordText),
        // Location
        semanticSimilarity(lostItem.possibleLocation, foundItem.locationFound),
        // Color + Brand attributes
        semanticSimilarity(
            `${lostItem.color || ''} ${lostItem.brand || ''}`.trim(),
            `${foundItem.color || ''} ${foundItem.brand || ''}`.trim()
        ),
        semanticSimilarity(lostOcrText, foundOcrText),
    ])

    const descLexical = tokenOverlapSimilarity(lostDesc, foundDesc)
    const kwLexical = tokenOverlapSimilarity(lostKeywordText, foundKeywordText)
    const ocrLexical = tokenOverlapSimilarity(lostOcrText, foundOcrText)
    const descScore = blendSimilarity(descSemantic, descLexical, 0.8)
    const kwScore = blendSimilarity(kwSemantic, kwLexical, 0.65)
    const ocrScore = blendSimilarity(ocrSemantic, ocrLexical, 0.6)

    // Structural scores (not text-based — no ML needed)
    const dateScore = dateSimilarity(lostItem.dateLost, foundItem.dateFound)
    const catScore = categorySimilarity(lostItem.category || lostItem.aiCategory, foundItem.category || foundItem.aiCategory)
    const colorScore = colorSimilarity(lostItem.color || lostItem.aiColor, foundItem.color || foundItem.aiColor)
    const objectTypeScore = objectTypeSimilarity(
        lostProfile.objectType,
        foundProfile.objectType,
        lostProfile.subType,
        foundProfile.subType
    )
    const profileScore = tokenOverlapSimilarity(lostFingerprint, foundFingerprint)

    const rawMatch =
        descScore * W.description +
        kwScore * W.keywords +
        locScore * W.location +
        dateScore * W.date +
        catScore * W.category +
        attrScore * W.attributes +
        colorScore * W.color +
        ocrScore * W.ocr +
        objectTypeScore * W.objectType +
        profileScore * W.profile

    const matchScore = Math.round(rawMatch * 100)
    const riskScore = computeRiskScore(lostItem, foundItem, claim)

    // Adjusted effective score (risk penalises)
    const effectiveScore = Math.max(0, matchScore - (riskScore * 0.2))

    let suggestedDecision
    if (effectiveScore >= 70) suggestedDecision = 'approve'
    else if (effectiveScore >= 40) suggestedDecision = 'review'
    else suggestedDecision = 'reject'

    console.log(`[AI Engine] Match: ${matchScore}% | Risk: ${riskScore}% | Decision: ${suggestedDecision} | Model: ${embedder ? 'MiniLM-L6-v2' : 'TF-IDF fallback'}`)

    return {
        matchScore,
        riskScore,
        suggestedDecision,
        breakdown: {
            descriptionScore: Math.round(descScore * 100),
            keywordScore: Math.round(kwScore * 100),
            locationScore: Math.round(locScore * 100),
            dateScore: Math.round(dateScore * 100),
            categoryScore: Math.round(catScore * 100),
            colorScore: Math.round(colorScore * 100),
            ocrScore: Math.round(ocrScore * 100),
            objectTypeScore: Math.round(objectTypeScore * 100),
            profileScore: Math.round(profileScore * 100),
            lexicalDescriptionOverlap: Math.round(descLexical * 100),
            lexicalKeywordOverlap: Math.round(kwLexical * 100),
            lexicalOcrOverlap: Math.round(ocrLexical * 100),
        },
    }
}

/**
 * Compute match score for a DIRECT CLAIM (no linked lost item).
 * Uses the claimant's own description as proxy for the "lost item".
 * Returns full analysis including matchLevel, matchReasons[], redFlags[].
 */
export async function computeClaimMatchScore(claim, foundItem) {
    try {
        // ── Build comparison texts ────────────────────────────────────────
        const claimText = [
            claim.ownershipExplanation || '',
            claim.hiddenDetails || '',
            claim.exactColorBrand || '',
        ].join(' ').trim()

        const foundText = [
            foundItem.title || '',
            foundItem.description || '',
            foundItem.aiGeneratedDescription || '',
            (foundItem.keywords || []).join(' '),
            (foundItem.aiLabels || []).join(' '),
            foundItem.aiProfile?.ocrText || '',
            (foundItem.aiProfile?.brandHints || []).join(' '),
            foundItem.color || '',
            foundItem.brand || '',
        ].join(' ').trim()

        const foundLocation = foundItem.locationFound || ''
        const claimLocation = claim.locationLost || ''
        const foundColor = `${foundItem.color || ''} ${foundItem.brand || ''}`.trim()
        const claimColor = claim.exactColorBrand || ''

        // ── Weights (must sum to 1.0) ─────────────────────────────────────
        const W = { desc: 0.40, location: 0.15, date: 0.15, category: 0.15, attr: 0.15 }

        // ── Run semantic similarity ───────────────────────────────────────
        const [descScore, locScore, attrScore] = await Promise.all([
            semanticSimilarity(claimText, foundText),
            claimLocation ? semanticSimilarity(claimLocation, foundLocation) : Promise.resolve(0.5), // neutral if not provided
            claimColor ? semanticSimilarity(claimColor, foundColor) : Promise.resolve(0),
        ])

        const dateScore = dateSimilarity(claim.dateLost, foundItem.dateFound)

        // Category: if claim has no category, use foundItem category → neutral match 0.5
        const claimCat = (claim.category || '').trim()
        const foundCat = (foundItem.category || '').trim()
        const catScore = claimCat
            ? (claimCat.toLowerCase() === foundCat.toLowerCase() ? 1.0 : 0.0)
            : 0.5  // neutral — we can't penalize for missing category on direct claims

        // ── Keyword overlap bonus ─────────────────────────────────────────
        // Boost score if claim text contains found item keywords
        const foundKeywords = (foundItem.keywords || []).map(k => k.toLowerCase())
        const claimLower = claimText.toLowerCase()
        let keywordOverlap = 0
        if (foundKeywords.length > 0) {
            const hits = foundKeywords.filter(k => claimLower.includes(k)).length
            keywordOverlap = hits / foundKeywords.length
        }

        // ── Compute raw weighted score ────────────────────────────────────
        const rawMatch = (
            descScore * W.desc +
            locScore * W.location +
            dateScore * W.date +
            catScore * W.category +
            attrScore * W.attr
        )

        // Apply keyword bonus (up to +10 extra points)
        const keywordBonus = keywordOverlap * 0.10

        const rawTotal = rawMatch + keywordBonus
        const matchScore = Math.round(Math.min(100, Math.max(0, isNaN(rawTotal) ? 0 : rawTotal * 100)))

        // ── Risk scoring ──────────────────────────────────────────────────
        let risk = 0
        const explanationLength = (claim.ownershipExplanation || '').trim().length
        if (explanationLength < 30) risk += 30
        else if (explanationLength < 80) risk += 15
        if (!(claim.hiddenDetails || '').trim()) risk += 20
        const dateDiff = Math.abs(
            new Date(claim.dateLost || Date.now()) - new Date(foundItem.dateFound || Date.now())
        ) / (1000 * 60 * 60 * 24)
        if (dateDiff > 30) risk += 20
        else if (dateDiff > 14) risk += 10
        const riskScore = Math.min(100, risk)

        // ── Match level ───────────────────────────────────────────────────
        let matchLevel
        if (matchScore >= 70) matchLevel = 'HIGH'
        else if (matchScore >= 45) matchLevel = 'MEDIUM'
        else if (matchScore >= 20) matchLevel = 'LOW'
        else matchLevel = 'UNLIKELY'

        // ── Suggested decision ────────────────────────────────────────────
        const effective = Math.max(0, matchScore - riskScore * 0.2)
        let suggestedDecision
        if (effective >= 70) suggestedDecision = 'approve'
        else if (effective >= 40) suggestedDecision = 'review'
        else suggestedDecision = 'reject'

        // ── Match reasons (dynamic) ───────────────────────────────────────
        const matchReasons = []
        if (descScore >= 0.45) matchReasons.push('Description aligns with found item')
        if (keywordOverlap >= 0.4) matchReasons.push(`Matches ${Math.round(keywordOverlap * 100)}% of item keywords`)
        if (catScore >= 1) matchReasons.push('Category matches exactly')
        if (locScore >= 0.5 && claimLocation) matchReasons.push('Location aligns with where item was found')
        if (dateScore >= 0.7) matchReasons.push('Date lost aligns with date found')
        if (attrScore >= 0.45 && claimColor) matchReasons.push('Color/brand details match')
        if (matchReasons.length === 0) matchReasons.push('Limited details provided for full AI comparison')

        // ── Red flags ─────────────────────────────────────────────────────
        const redFlags = []
        if (explanationLength < 50) redFlags.push('Ownership explanation is very brief')
        if (!(claim.hiddenDetails || '').trim()) redFlags.push('No hidden/identifying details provided')
        if (dateDiff > 30) redFlags.push('Date lost does not align with date found')
        if (claimCat && catScore < 1) redFlags.push('Category does not match found item')
        if (descScore < 0.25) redFlags.push('Description has low similarity to found item')

        const modelLabel = embedder ? 'MiniLM-L6-v2' : 'TF-IDF'
        console.log(`[AI Engine] Claim Score: ${matchScore}% (${matchLevel}) | Risk: ${riskScore}% | Desc: ${Math.round(descScore * 100)}% | Keywords: ${Math.round(keywordOverlap * 100)}% | Model: ${modelLabel}`)

        return {
            matchScore,
            riskScore,
            matchLevel,
            suggestedDecision,
            matchReasons,
            redFlags,
            breakdown: {
                descriptionScore: Math.round(descScore * 100),
                locationScore: Math.round(locScore * 100),
                dateScore: Math.round(dateScore * 100),
                categoryScore: Math.round(catScore * 100),
            },
        }
    } catch (err) {
        console.error('[AI Engine] computeClaimMatchScore failed:', err.message)
        return {
            matchScore: 0, riskScore: 0, matchLevel: 'PENDING',
            suggestedDecision: 'review', matchReasons: [], redFlags: [],
            breakdown: { descriptionScore: 0, locationScore: 0, dateScore: 0, categoryScore: 0 },
        }
    }
}


