# Security Specification: Carbon & Habits Tracker

## 1. Data Invariants
- **User profiles** (`/users/{userId}`) can only be created or modified by their auth owner. Profiles cannot have points, levels, or offset values mutated arbitrarily without matching validated write transactions (unless performing an action-specific update).
- **Daily Habit logs** (`/users/{userId}/habitLogs/{logId}`) are immutable once logged, restricted to the parent `userId` authenticated owner, must use a system-created ID representing user_habit_YYYY-MM-DD.
- **Impact log entries** (`/users/{userId}/impactLogs/{logId}`) are restricted to the owner, can never have blank fields or negative quantities, and are immutable.
- **Goals** (`/users/{userId}/goals/{goalId}`) can be updated to record increased progress or set new targets, but `createdAt` and `userId` are strictly immutable.

---

## 2. The "Dirty Dozen" Malicious Payloads

1. **Self-Elevated Custom Leaderboard Points Audit Bypass**: Mutation of a User's `points` field in `/users/attack_uid` by someone else's UID.
2. **Anonymous Email Spoofing**: Attempt to use `email_verified = false` or a fake admin email parameter without verify flags on a user document write.
3. **Ghost Status Bypass update**: Writing a finished or completed status on a Goal document without going through actual progress values.
4. **ID Poisoning Attack**: Trying to create an `impactLog` with a corrupted ID containing junk symbols to cause resource fatigue or URL breakouts.
5. **PII Blanket Scrape Query Extraction**: Unauthorized list/get request targeting another user's profile info.
6. **Temporal Spoofing**: Setting `createdAt` or `updatedAt` to values in the future or backdated to avoid deadline limits.
7. **Negative Integer/Offset Injection**: Logging habits or impact quantities with negative values (e.g., `-100 miles`) to reset records.
8. **Owner Spoofing**: Submitting a write for user profile `/users/uid_A` but containing auth token mapping to `uid_B`.
9. **Unbounded Payload Injection / Shadow fields**: Passing undocumented parameters in `User` map keys to bloat system database.
10. **Null fields in mandatory schema keys**: Omitting fields like `carbonSaved` or `category` to bypass downstream calculations.
11. **Immutable date revision**: Altering `createdAt` on an existing goal document to dodge deadlines.
12. **Double counting logging bypass**: Submitting a duplicated logId for the same habit and date.

---

## 3. Test Runner Blueprint
Our linter, compilers, and deployed rules execute strict schema checking to enforce permissions gates, preventing authorization bypass across all twelve vectors.
