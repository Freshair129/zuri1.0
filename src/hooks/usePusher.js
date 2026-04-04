import { useEffect } from 'react'
import Pusher from 'pusher-js'

/**
 * Subscribes to a Pusher channel and binds event handlers.
 * Cleans up subscription on unmount or when channelName changes.
 *
 * Supported events: 'new-message', 'customer-updated'
 *
 * @param {string} channelName - Pusher channel to subscribe to
 * @param {{ onNewMessage?: Function, onCustomerUpdated?: Function }} handlers
 */
export function usePusher(channelName, { onNewMessage, onCustomerUpdated } = {}) {
  useEffect(() => {
    if (!channelName) return

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    })

    const channel = pusher.subscribe(channelName)

    if (onNewMessage) {
      channel.bind('new-message', onNewMessage)
    }

    if (onCustomerUpdated) {
      channel.bind('customer-updated', onCustomerUpdated)
    }

    return () => {
      channel.unbind_all()
      pusher.unsubscribe(channelName)
      pusher.disconnect()
    }
  }, [channelName])
}
