import nacl from 'tweetnacl'
import util from 'tweetnacl-util'

const keypair = nacl.box.keyPair()
const receiverPublicKey = util.encodeBase64(keypair.publicKey)
const receiverSecretKey = util.encodeBase64(keypair.secretKey)

export { receiverPublicKey }

export function decodeMessage(
  encryptedMessage: string,
  senderPublicKey: string,
  nonce: string,
) {
  const receiverSecretKeyUInt8Array = util.decodeBase64(receiverSecretKey)
  const nonceUInt8Array = util.decodeBase64(nonce)
  const encryptedMessageUInt8Array = util.decodeBase64(encryptedMessage)
  const senderPublicKeyUInt8Array = util.decodeBase64(senderPublicKey)

  const messageUInt8Array = nacl.box.open(
    encryptedMessageUInt8Array,
    nonceUInt8Array,
    senderPublicKeyUInt8Array,
    receiverSecretKeyUInt8Array,
  )

  if (!messageUInt8Array) {
    return null
  }

  return util.encodeUTF8(messageUInt8Array)
}
