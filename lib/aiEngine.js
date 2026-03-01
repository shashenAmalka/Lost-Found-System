/**
 * AI Matching Engine — Semantic Edition
 * Uses all-MiniLM-L6-v2 sentence transformer for semantic text similarity
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
        description: 0.30,
        keywords: 0.20,
        location: 0.15,
        date: 0.20,
        category: 0.10,
        attributes: 0.05,
    }

    // Semantic similarity for text fields (uses MiniLM-L6-v2)
    const [descScore, kwScore, locScore, attrScore] = await Promise.all([
        // Description: compare full title + description
        semanticSimilarity(
            `${lostItem.title} ${lostItem.description}`,
            `${foundItem.title} ${foundItem.description}`
        ),
        // Keywords: join arrays and compare semantically
        semanticSimilarity(
            (lostItem.keywords || []).join(', '),
            (foundItem.keywords || []).join(', ')
        ),
        // Location
        semanticSimilarity(lostItem.possibleLocation, foundItem.locationFound),
        // Color + Brand attributes
        semanticSimilarity(
            `${lostItem.color || ''} ${lostItem.brand || ''}`.trim(),
            `${foundItem.color || ''} ${foundItem.brand || ''}`.trim()
        ),
    ])

    // Structural scores (not text-based — no ML needed)
    const dateScore = dateSimilarity(lostItem.dateLost, foundItem.dateFound)
    const catScore = categorySimilarity(lostItem.category, foundItem.category)

    const rawMatch =
        descScore * W.description +
        kwScore * W.keywords +
        locScore * W.location +
        dateScore * W.date +
        catScore * W.category +
        attrScore * W.attributes

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
        },
    }
}
