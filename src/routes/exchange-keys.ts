import { FastifyInstance } from 'fastify'
import { receiverPublicKey } from '../lib/crypto'

export async function exchangeKeysRoute(app: FastifyInstance) {
  app.post('/encryption/exchange', async (req, res) => {
    res.send({ receiverPublicKey })
  })
}
