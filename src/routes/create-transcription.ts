import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'
import { createReadStream } from 'fs'
import { openai } from '../lib/openai'
import { decodeMessage } from '../lib/crypto'

export async function createTranscriptionRoute(app: FastifyInstance) {
  app.post('/videos/:videoId/transcription', async (request, response) => {
    const paramsSchema = z.object({
      videoId: z.string().uuid(),
    })

    const { videoId } = paramsSchema.parse(request.params)

    const bodySchema = z.object({
      encryptedApiKey: z.string(),
      ephemPubKey: z.string(),
      nonce: z.string(),
      prompt: z.string(),
    })

    const { encryptedApiKey, ephemPubKey, nonce, prompt } = bodySchema.parse(
      request.body,
    )

    const apiKey = decodeMessage(encryptedApiKey, ephemPubKey, nonce)

    if (!apiKey) {
      return response.status(400).send({ error: 'Failed to decrypt API Key' })
    }

    const video = await prisma.video.findFirstOrThrow({
      where: {
        id: videoId,
      },
    })

    const videoPath = video.path

    const audioReadStream = createReadStream(videoPath)

    openai.apiKey = apiKey
    const openAIResponse = await openai.audio.transcriptions.create({
      file: audioReadStream,
      model: 'whisper-1',
      language: 'pt',
      response_format: 'json',
      temperature: 0,
      prompt,
    })
    openai.apiKey = ''

    const transcription = openAIResponse.text

    await prisma.video.update({
      where: {
        id: videoId,
      },
      data: {
        transcription,
      },
    })

    return { transcription }
  })
}
