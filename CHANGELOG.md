# IUI Technology changelog

## B2C learning loop — August 2026

### Diagnostics and weekly learning

- Mandatory first EEG diagnostic before ordinary sessions and homework.
- Grade-locked content for classes 1–11 with separate age bands and Russian/Kazakh language blocks.
- 40-minute route: mathematics (15), logic (10), language (15), with section-level EEG metrics.
- Automatic seven-day plan with 3–5 daily micro-tasks depending on grade and diagnosed gaps.
- Real attempts, hints, response time, XP, levels, streak, milestones and confetti saved through PostgreSQL.
- Completed week requires a repeat diagnostic before the next personalized plan.
- Added a midweek control point with six parallel questions that do not repeat the initial diagnostic items.
- The control point compares knowledge, attention, focus, engagement, fatigue, relaxation and signal quality, then atomically adapts only unfinished future tasks.
- Control-point answers recover from a local draft after an accidental reload; successful completion shows a reduced-motion-safe celebration.
- Previously authorized Bluetooth devices restore silently; a new system device chooser is opened only from an explicit user click.
- Student, parent and teacher learning reports with PDF, Excel and CSV export.
- Kazakhstan UTC+5 school calendar for day unlocks and streak continuity on cloud hosting.

### Reliability and release safety

- Removed legacy demo pages, fake names, fixed metrics and the unused Web Serial transport from production.
- Bluetooth connection is shared between Devices, Diagnostics and Live EEG with automatic GATT recovery.
- A final STOP disconnection no longer discards EEG samples already uploaded to PostgreSQL.
- Diagnostic section timestamps, grade ownership and minimum EEG samples are validated server-side.
- Diagnostic EEG sessions are unique at PostgreSQL level; concurrent retries return the existing result and cannot create duplicate plans.
- Added an isolated Supabase/API integration test for weekly check-in persistence, adaptation and idempotency.
- Product audit covers 53 unique API routes, 22 initial diagnostic variants, 22 control-point variants, 22 weekly-plan variants and unique answer options.
- Teacher registration now stores the real school or learning-center name.

## Product update — July 2026

### Student experience

- Bluetooth Low Energy connection for cable-free ESP32 EEG sessions.

- Personal ESP32 + BioAmp EXG connection flow with device handshake.
- Automatic three-second calibration before recording.
- Session topic and time goal with live progress.
- Real-time EEG charts, signal warning and Bluetooth reconnect recovery.
- Session result with cognitive score, fatigue, attention stability, XP and level.
- Achievement collection driven by real session metrics.
- Real level-up and achievement celebrations with accessible confetti.
- Animated streak flame, weekly 3/5/7-session goal and activity calendar.
- Weekly goal persists in PostgreSQL across browsers and devices.
- Three-second recording countdown, session pause/resume and distraction-free EEG mode.
- In-session time-goal milestone with optional device vibration.
- Firmware compatibility warning after the ESP32 handshake.

### Teacher experience

- Live student connection board with stale-device detection.
- Self-registration through unique class codes.
- Full student profiles, EEG timeline, comments and profile editing.
- Personal parent invitation tied to one student and email.
- Class archive with restore and permanent delete actions.
- Class progress board for weekly activity, focus, XP, streak and support signals.
- Private progress view without a public student leaderboard.

### Analytics and reports

- Role-scoped cognitive trends for 7, 14 and 30 days.
- Detailed report cards and radar metric visualization.
- PDF export for an individual session or the filtered journal.
- Excel and CSV exports protected against spreadsheet formula injection.
- Event center for device connections and completed reports.
- Secure role-aware account archive in JSON format.

### Security and reliability

- Student, parent and teacher data scopes enforced on the server.
- HTTP-only authentication cookie and password replacement screen.
- Security and Permissions Policy headers.
- Stale session cancellation, one-active-session enforcement and device heartbeat.
- Service messages from ESP32 are excluded from EEG samples.
- EEG batches are range-validated, timestamp-clamped and saved with the device heartbeat in one transaction.
- Cancelled sessions atomically return their device to the online state.
- Database-backed `/api/ready` health check for Railway and Render.
- Responsive layouts, skeleton states, reduced-motion support and keyboard navigation.
- Automatic cleanup for abandoned six-hour sessions and stale device statuses.
- Managed firmware status center without public firmware distribution.
- Live unread-event badge and progress notifications.
