import { setFailed, saveState, getState } from '@actions/core'
import * as core from '@actions/core'
import axios, {isAxiosError} from 'axios'
import getInputs from './inputs'
import installPnpm from './install-pnpm'
import setOutputs from './outputs'
import pnpmInstall from './pnpm-install'
import pruneStore from './pnpm-store-prune'

async function validateSubscription(): Promise<void> {
  const API_URL = `https://agent.api.stepsecurity.io/v1/github/${process.env.GITHUB_REPOSITORY}/actions/subscription`

  try {
    await axios.get(API_URL, {timeout: 3000})
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 403) {
      core.error(
        'Subscription is not valid. Reach out to support@stepsecurity.io'
      )
      process.exit(1)
    } else {
      core.info('Timeout or API not reachable. Continuing to next step.')
    }
  }
}

async function main() {
  await validateSubscription()

  const inputs = getInputs()
  const isPost = getState('is_post')
  if (isPost === 'true') return pruneStore(inputs)
  saveState('is_post', 'true')
  await installPnpm(inputs)
  console.log('Installation Completed!')
  setOutputs(inputs)
  pnpmInstall(inputs)
}

main().catch(error => {
  console.error(error)
  setFailed(error)
})
