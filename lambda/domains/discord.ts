import { Webhook } from 'discord-webhook-node'
import ENVIRONMENTS from '../utils/env'

const webhook = new Webhook(ENVIRONMENTS.DISCORD_WEBHOOK)
webhook.setUsername('AWS-Billing')
webhook.setAvatar('https://i.gyazo.com/6c01e62e044d6487f7e957aa5ac8029d.png')

export default webhook
