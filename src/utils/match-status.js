import { MATCH_STATUS } from "../validation/matches.js";
import { eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { matches } from "../db/schema.js";


export function getMatchStatus(startTime, endTime, now = new Date()) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    now = new Date(now);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return null;
    }

    if (now < start) {
        return MATCH_STATUS.SCHEDULED;
    }

    if (now >= end) {
        return MATCH_STATUS.FINISHED;
    }

    return MATCH_STATUS.LIVE;

}

export async function getMatchStatusFromDB(matchId) {
    const [match] = await db
        .select({ startTime: matches.startTime, endTime: matches.endTime })
        .from(matches)
        .where(eq(matches.id, matchId))
        .limit(1);
    if (!match) {
        return null;
    }
    return getMatchStatus(match.startTime, match.endTime);
}