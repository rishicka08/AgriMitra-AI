
const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { GoogleGenAI } = require('@google/genai')

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
})

const app = express()

app.use(cors())
app.use(express.json())


app.get('/', (req, res) => {
  res.send('AgriMitra AI Backend is running!')
})

app.get('/api/mandi', async (req, res) => {
  try {
    const { state, commodity } = req.query
    const apiKey = process.env.DATA_GOV_IN_API_KEY

    if (!apiKey) {
      return res.status(500).json({
        error: 'Government API key is missing.'
      })
    }

    const params = new URLSearchParams({
      'api-key': apiKey,
      format: 'json',
      limit: '100'
    })

    if (state) {
      params.append('filters[state.keyword]', state)
    }

    if (commodity) {
      params.append('filters[commodity]', commodity)
    }

    const apiUrl =
      `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?${params}`

    const response = await fetch(apiUrl)
    const result = await response.json()

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Government mandi service returned an error.',
        details: result
      })
    }

    res.json({
      total: result.total || 0,
      records: result.records || []
    })

  } catch (error) {
    console.error('Mandi API error:', error)

    res.status(500).json({
      error: 'Unable to fetch mandi prices. Please try again.'
    })
  }
})


app.post('/api/assistant', async (req, res) => {
  try {
    const { question, language } = req.body

    if (!question || !question.trim()) {
      return res.status(400).json({
        error: 'Please enter a farming question.'
      })
    }

    const languages = {
      en: 'English',
      ta: 'Tamil',
      hi: 'Hindi',
      te: 'Telugu',
      kn: 'Kannada',
      ml: 'Malayalam',
      bn: 'Bengali',
      mr: 'Marathi',
      gu: 'Gujarati',
      pa: 'Punjabi',
      or: 'Odia',
      ur: 'Urdu'
    }

    const selectedLanguage = languages[language] || 'English'

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
      contents: `You are AgriMitra, a helpful farming assistant for Indian farmers.

Answer the farmer's question in ${selectedLanguage}.

Use simple language that farmers can easily understand.
Give practical and clear farming advice.
Never invent market prices or weather information.
For pesticide or chemical advice, encourage farmers to follow product labels and consult local agricultural experts.

Farmer's question: ${question}`
    })

    res.json({
      answer: response.text
    })

  } catch (error) {
    console.error('AI Assistant error:', error)

    res.status(500).json({
      error: 'Unable to generate an answer. Please try again.'
    })
  }
})

module.exports = app
