import { generateSW } from "workbox-build"
import { buildServiceWorkerConfig } from "./service-worker-config.mjs"

const CLIENT_DIRECTORY = "dist/client"

const { count, size } = await generateSW(buildServiceWorkerConfig(CLIENT_DIRECTORY))
console.log(`Service worker precaches ${count} files (${size} bytes) in ${CLIENT_DIRECTORY}/sw.js`)
