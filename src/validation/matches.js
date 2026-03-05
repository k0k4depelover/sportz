import { z } from 'zod';

// ── Constants ───────────────────────────────────────────────────────────────────
export const MATCH_STATUS = {
    SCHEDULED: 'scheduled',
    LIVE: 'live',
    FINISHED: 'finished',
};

// ── Query / Param Schemas ───────────────────────────────────────────────────────

/** GET /matches?limit=25 */
export const listMatchesQuerySchema = z.object({
    limit: z.coerce
        .number()
        .int()
        .positive()
        .max(100)
        .optional(),
});

/** /matches/:id */
export const matchIdParamSchema = z.object({
    id: z.coerce.number().int().positive(),
});

// ── Body Schemas ────────────────────────────────────────────────────────────────

/** POST /matches */
export const createMatchSchema = z
    .object({
        sport: z.string().min(1, 'sport is required'),
        homeTeam: z.string().min(1, 'homeTeam is required'),
        awayTeam: z.string().min(1, 'awayTeam is required'),

        startTime: z
            .string()
            .refine((v) => !isNaN(Date.parse(v)), {
                message: 'startTime must be a valid ISO date string',
            }),

        endTime: z
            .string()
            .refine((v) => !isNaN(Date.parse(v)), {
                message: 'endTime must be a valid ISO date string',
            }),

        homeScore: z.coerce.number().int().nonnegative().optional(),
        awayScore: z.coerce.number().int().nonnegative().optional(),
    })
    .superRefine((data, ctx) => {
        if (new Date(data.endTime) <= new Date(data.startTime)) {
            ctx.addIssue({
                code: 'custom',
                path: ['endTime'],
                message: 'endTime must be after startTime',
                input: data,
            });
        }
    });

/** PATCH /matches/:id/score */
export const updateScoreSchema = z.object({
    homeScore: z.coerce.number().int().nonnegative(),
    awayScore: z.coerce.number().int().nonnegative(),
});
