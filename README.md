# grandpa-smoldot-issue

This project was created using `bun init` in bun v1.1.43. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

To install dependencies:

```bash
bun install
```

To run:

- Start zombienet with: (keep in mind that `polkadot` must be in the `PATH`)

```bash
npx --yes @zombienet/cli@1.3.133 --provider native --dir ./logs spawn zombienet.native.toml
```

- Once zombienet is running, start the script:

```
bun run src/index.ts
```

### Logs
The logs will be stored in 2 different files:
- SMOLDOT-LOGS.txt (the most important one: these are all the logs from smoldot)
- JSON-RPC-LOGS.txt (these logs contain all the JSON-RPC messages that have been sent between smoldot <-> PAPI)

You can change the name and/or the path of the logs by altering the `src/config.ts` file.
