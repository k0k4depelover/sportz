import { MATCH_STATUS } from "../validation/matches.js";

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
    const match = await Match.findById(matchId);
    if (!match) {
        return null;
    }
    return getMatchStatus(match.startTime, match.endTime);
}