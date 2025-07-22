import { map, mergeMap, pairwise, skip } from "rxjs"
import type { BlockInfo, HexString } from "polkadot-api"
import { localWnd } from "@polkadot-api/descriptors"
import { client } from "./client"

const api = client.getUnsafeApi<typeof localWnd>()

const hasNewAuthoritySet = async (at: HexString) =>
  (await api.query.System.Events.getValue({ at })).some(
    ({ event }) =>
      event.type === "Grandpa" && event.value.type === "NewAuthorities",
  )

const printFinalized = ({ number, hash }: BlockInfo) =>
  console.log(`Finalized block: ${number} - ${hash}`)

client.finalizedBlock$
  .pipe(
    pairwise(),
    map(([prev, current], idx) => {
      if (idx === 0) printFinalized(prev) // The first finalized block

      if (prev.number + 1 < current.number)
        console.log("\nGAP DETECTED!! CHAINHEAD RECOVERED FROM A STOP EVENT\n")

      printFinalized(current)
    }),
  )
  .subscribe()

client.blocks$
  .pipe(
    skip(10),
    mergeMap(async (block) => {
      try {
        if (await hasNewAuthoritySet(block.hash))
          console.log(`\nNEW AUTH SET AT: ${block.number} - ${block.hash}\n`)
      } catch {
        console.error(
          `COULD NOT CHECK NEW AUTH SET AT: ${block.number} - ${block.hash}`,
        )
      }
    }),
  )
  .subscribe()
