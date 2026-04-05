import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

/**
 * Verifies a Thai bank transfer slip using Gemini Vision.
 * 
 * @param {string} base64Image - Base64 encoded image string (no prefix)
 * @param {string} mimeType - image/jpeg, image/png, etc.
 * @returns {Object} { amount, date, time, receiverName, refNumber, isVerified }
 */
export async function verifyThaiSlip(base64Image, mimeType = 'image/jpeg') {
  const prompt = `
    Analyze this Thai bank transfer slip. 
    Verify if it is a valid transfer and extract the following data in JSON format:
    
    1. amount: The transfer amount (number)
    2. date: The transfer date (YYYY-MM-DD)
    3. time: The transfer time (HH:mm)
    4. receiverName: The name of the receiver (string)
    5. refNumber: The Transaction ID / Reference Number (string)
    6. bankName: The source bank (string)
    7. isVerified: Boolean (true if it looks like a real, complete slip)

    Rules:
    - If any data is missing or unreadable, set as null.
    - Response MUST be ONLY a valid JSON object.
  `

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image.replace(/^data:image\/\w+;base64,/, ""),
          mimeType,
        },
      },
    ])

    const responseText = result.response.text()
    const cleanedText = responseText.replace(/```json|```/g, '').trim()
    return JSON.parse(cleanedText)
  } catch (error) {
    console.error('[Gemini Slip Verification Error]:', error)
    return { isVerified: false, error: 'AI processing failed' }
  }
}
