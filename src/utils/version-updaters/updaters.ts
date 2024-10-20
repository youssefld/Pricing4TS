// deno-lint-ignore-file no-explicit-any

import v10toV11Updater from "./v10-to-v11-updater.ts";
import v11toV20Updater from "./v11-to-v20-updater.ts";

export const updaters: {[key: string]: ((extractedPricing: any) => any) | null} = {
    "1.0": v10toV11Updater,
    "1.1": v11toV20Updater,
    "2.0": null
}