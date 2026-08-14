# IUI Technology — release checklist

## Before deployment

- Rotate the Supabase database password if it has ever been shared.
- Set `DATABASE_URL` to the transaction pooler and `DIRECT_URL` to the session pooler.
- Generate a unique `JWT_SECRET` with at least 32 random characters.
- Set `CLIENT_URL` to the final HTTPS origin without a trailing slash.
- Run `npm run db:generate`, then `npm run db:push` once against the production database before starting the service. Confirm that the diagnostic and homework tables were created.
- Run `npm run audit` and start the service with `npm start`.
- Confirm that `/api/ready` returns `database: connected` on the deployed URL.

## Hardware

- Flash `firmware/iui_bioamp_esp32/iui_bioamp_esp32.ino` version 1.2.0 with Bluetooth LE support.
- Use ESP32 GPIO34 for the BioAmp EXG output and a common ground.
- Open the platform in Chrome or Edge over HTTPS (or localhost).
- Confirm that Device ID, firmware version, calibration and signal quality appear before a session.

## Acceptance check

1. Teacher creates a class and copies its registration code.
2. Student registers with that code and appears in the class roster.
3. Student connects ESP32, completes calibration and records a session.
4. Teacher sees ONLINE / IN_SESSION status and then the completed report.
5. Teacher creates a parent invitation from the student's profile.
6. Parent registers with the invitation and sees only that student's reports.
7. PDF, Excel and CSV exports contain the stored session metrics.
8. Account settings download a role-scoped JSON archive without exposing another user’s data.
9. Student changes the weekly goal, reloads the page and sees the same value from PostgreSQL.
10. Pause/resume sends `STOP`/`START`, while finishing still creates one complete report.
11. Firmware center shows the current version and does not expose a firmware download.
12. Student cannot receive a weekly plan before completing a knowledge diagnostic with a saved EEG session.
13. Grades 1–2, 3–4, 5–7, 8–9 and 10–11 receive age-appropriate diagnostic content.
14. Midweek checkpoint unlocks after two completed days or on plan day four, saves EEG deltas and adapts only future tasks.
15. Teacher can filter weekly plans by risk, open a student detail drawer and create a learning PDF.
16. Parent can access only the linked child and cannot query organization devices or other students.
17. A student registered in classes 1–11 receives the matching locked diagnostic grade.
18. Every generated question has four unique answer options and the full `npm run audit` passes.
19. Day unlocks and streak changes occur at Kazakhstan midnight (UTC+5), including on a UTC-hosted server.
20. Disconnect Bluetooth on the final STOP command and confirm already-uploaded samples still produce one report.
21. Run `npm run test:checkin` against staging and confirm it reports `ok: true`, adapted tasks and `idempotent: true`.

The EEG metrics are educational indicators and must not be presented as a medical diagnosis.
