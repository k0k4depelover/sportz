import {
    listMatchesQuerySchema,
    matchIdParamSchema,
    createMatchSchema,
    updateScoreSchema,
    MATCH_STATUS,
} from './matches.js';

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`  ✅ ${name}`);
        passed++;
    } catch (err) {
        console.log(`  ❌ ${name}`);
        console.log(`     ${err.message}`);
        failed++;
    }
}

function assert(condition, msg) {
    if (!condition) throw new Error(msg || 'Assertion failed');
}

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n🔹 MATCH_STATUS constant');
// ─────────────────────────────────────────────────────────────────────────────

test('has SCHEDULED = "scheduled"', () => {
    assert(MATCH_STATUS.SCHEDULED === 'scheduled');
});

test('has LIVE = "live"', () => {
    assert(MATCH_STATUS.LIVE === 'live');
});

test('has FINISHED = "finished"', () => {
    assert(MATCH_STATUS.FINISHED === 'finished');
});

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n🔹 listMatchesQuerySchema');
// ─────────────────────────────────────────────────────────────────────────────

test('accepts empty object (limit is optional)', () => {
    const result = listMatchesQuerySchema.safeParse({});
    assert(result.success, JSON.stringify(result.error));
});

test('coerces string "50" to number 50', () => {
    const result = listMatchesQuerySchema.safeParse({ limit: '50' });
    assert(result.success, JSON.stringify(result.error));
    assert(result.data.limit === 50, `Expected 50, got ${result.data.limit}`);
});

test('rejects limit = 0 (not positive)', () => {
    const result = listMatchesQuerySchema.safeParse({ limit: 0 });
    assert(!result.success, 'Should have failed');
});

test('rejects limit = -5 (negative)', () => {
    const result = listMatchesQuerySchema.safeParse({ limit: -5 });
    assert(!result.success, 'Should have failed');
});

test('rejects limit = 101 (exceeds max 100)', () => {
    const result = listMatchesQuerySchema.safeParse({ limit: 101 });
    assert(!result.success, 'Should have failed');
});

test('accepts limit = 100 (boundary)', () => {
    const result = listMatchesQuerySchema.safeParse({ limit: 100 });
    assert(result.success, JSON.stringify(result.error));
});

test('accepts limit = 1 (boundary)', () => {
    const result = listMatchesQuerySchema.safeParse({ limit: 1 });
    assert(result.success, JSON.stringify(result.error));
});

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n🔹 matchIdParamSchema');
// ─────────────────────────────────────────────────────────────────────────────

test('coerces string "7" to number 7', () => {
    const result = matchIdParamSchema.safeParse({ id: '7' });
    assert(result.success, JSON.stringify(result.error));
    assert(result.data.id === 7, `Expected 7, got ${result.data.id}`);
});

test('rejects missing id', () => {
    const result = matchIdParamSchema.safeParse({});
    assert(!result.success, 'Should have failed');
});

test('rejects id = 0', () => {
    const result = matchIdParamSchema.safeParse({ id: 0 });
    assert(!result.success, 'Should have failed');
});

test('rejects negative id', () => {
    const result = matchIdParamSchema.safeParse({ id: -1 });
    assert(!result.success, 'Should have failed');
});

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n🔹 createMatchSchema');
// ─────────────────────────────────────────────────────────────────────────────

const validMatch = {
    sport: 'soccer',
    homeTeam: 'Team A',
    awayTeam: 'Team B',
    startTime: '2026-06-01T18:00:00Z',
    endTime: '2026-06-01T20:00:00Z',
};

test('accepts a valid match object', () => {
    const result = createMatchSchema.safeParse(validMatch);
    assert(result.success, JSON.stringify(result.error?.issues));
});

test('accepts valid match with optional scores', () => {
    const result = createMatchSchema.safeParse({
        ...validMatch,
        homeScore: 2,
        awayScore: 1,
    });
    assert(result.success, JSON.stringify(result.error?.issues));
});

test('coerces score strings to numbers', () => {
    const result = createMatchSchema.safeParse({
        ...validMatch,
        homeScore: '3',
        awayScore: '0',
    });
    assert(result.success, JSON.stringify(result.error?.issues));
    assert(result.data.homeScore === 3, `Expected 3, got ${result.data.homeScore}`);
    assert(result.data.awayScore === 0, `Expected 0, got ${result.data.awayScore}`);
});

test('rejects empty sport string', () => {
    const result = createMatchSchema.safeParse({ ...validMatch, sport: '' });
    assert(!result.success, 'Should have failed');
});

test('rejects empty homeTeam string', () => {
    const result = createMatchSchema.safeParse({ ...validMatch, homeTeam: '' });
    assert(!result.success, 'Should have failed');
});

test('rejects empty awayTeam string', () => {
    const result = createMatchSchema.safeParse({ ...validMatch, awayTeam: '' });
    assert(!result.success, 'Should have failed');
});

test('rejects invalid startTime ISO string', () => {
    const result = createMatchSchema.safeParse({
        ...validMatch,
        startTime: 'not-a-date',
    });
    assert(!result.success, 'Should have failed');
});

test('rejects invalid endTime ISO string', () => {
    const result = createMatchSchema.safeParse({
        ...validMatch,
        endTime: 'not-a-date',
    });
    assert(!result.success, 'Should have failed');
});

test('rejects endTime equal to startTime', () => {
    const result = createMatchSchema.safeParse({
        ...validMatch,
        endTime: validMatch.startTime,
    });
    assert(!result.success, 'Should have failed');
});

test('rejects endTime before startTime', () => {
    const result = createMatchSchema.safeParse({
        ...validMatch,
        startTime: '2026-06-01T20:00:00Z',
        endTime: '2026-06-01T18:00:00Z',
    });
    assert(!result.success, 'Should have failed');
});

test('rejects negative homeScore', () => {
    const result = createMatchSchema.safeParse({
        ...validMatch,
        homeScore: -1,
    });
    assert(!result.success, 'Should have failed');
});

test('rejects negative awayScore', () => {
    const result = createMatchSchema.safeParse({
        ...validMatch,
        awayScore: -1,
    });
    assert(!result.success, 'Should have failed');
});

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n🔹 updateScoreSchema');
// ─────────────────────────────────────────────────────────────────────────────

test('accepts valid scores', () => {
    const result = updateScoreSchema.safeParse({ homeScore: 2, awayScore: 1 });
    assert(result.success, JSON.stringify(result.error));
});

test('coerces string scores', () => {
    const result = updateScoreSchema.safeParse({ homeScore: '3', awayScore: '0' });
    assert(result.success, JSON.stringify(result.error));
    assert(result.data.homeScore === 3);
    assert(result.data.awayScore === 0);
});

test('accepts zero scores', () => {
    const result = updateScoreSchema.safeParse({ homeScore: 0, awayScore: 0 });
    assert(result.success, JSON.stringify(result.error));
});

test('rejects missing homeScore', () => {
    const result = updateScoreSchema.safeParse({ awayScore: 1 });
    assert(!result.success, 'Should have failed');
});

test('rejects missing awayScore', () => {
    const result = updateScoreSchema.safeParse({ homeScore: 1 });
    assert(!result.success, 'Should have failed');
});

test('rejects negative homeScore', () => {
    const result = updateScoreSchema.safeParse({ homeScore: -1, awayScore: 0 });
    assert(!result.success, 'Should have failed');
});

test('rejects negative awayScore', () => {
    const result = updateScoreSchema.safeParse({ homeScore: 0, awayScore: -1 });
    assert(!result.success, 'Should have failed');
});

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n' + '─'.repeat(60));
console.log(`  Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
console.log('─'.repeat(60) + '\n');

if (failed > 0) process.exit(1);
