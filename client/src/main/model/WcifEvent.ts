import { type Extendable } from "./Extension";
import type { GetWcifResult } from "../api/wca.redocly";

export type WcifEvent = GetWcifResult["events"][number] & Extendable;
