import { type Extendable } from "./Extension";
import type { GetWcifResult } from "../api/wca.redocly";

export type WcifRound = GetWcifResult["events"][number]["rounds"][number] &
    Extendable;
