import { appendFileSync, existsSync, rmSync } from "fs"
import { start } from "polkadot-api/smoldot"
import { createClient } from "polkadot-api"
import { getSmProvider } from "polkadot-api/sm-provider"
import { getWsProvider } from "polkadot-api/ws-provider/web"
import { withLogsRecorder } from "polkadot-api/logs-provider"
import { ZOMBIENET_RPC, WIRE_FILE, SMOLDOT_LOGS_FILE } from "./config"

if (existsSync(WIRE_FILE)) rmSync(WIRE_FILE)
if (existsSync(SMOLDOT_LOGS_FILE)) rmSync(SMOLDOT_LOGS_FILE)

let tickDate = ""
const setTickDate = () => {
  tickDate = new Date().toISOString() // This way we know which events took place inside the same macro-task
  setTimeout(setTickDate, 0)
}
setTickDate()

const smoldot = start({
  logCallback: (level: number, target: string, message: string) => {
    const msg = `${tickDate} (${level})-${target}\n${message}\n\n`
    appendFileSync(SMOLDOT_LOGS_FILE, msg)
  },
  maxLogLevel: 7,
})

const tmpClient = createClient(getWsProvider(ZOMBIENET_RPC))
const getChainspec = async (count = 1): Promise<string> => {
  try {
    const result = JSON.stringify(
      await tmpClient._request<{}>("sync_state_genSyncSpec", [false]),
    )
    tmpClient.destroy()
    console.log("Got the chainspec! Initializing the smoldot chain...")
    return result
  } catch (e) {
    if (count === 20) throw e
    await new Promise((res) => setTimeout(res, 3_000))
    return getChainspec(count + 1)
  }
}

export const client = createClient(
  withLogsRecorder(
    (log) => {
      appendFileSync(WIRE_FILE, log + "\n")
    },
    getSmProvider(
      getChainspec().then((chainSpec) => smoldot.addChain({ chainSpec })),
    ),
  ),
)
