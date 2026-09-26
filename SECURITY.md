# Security

mattpocock-native is a Hana plugin with no network behavior: it reads and writes files in the working directory (`.matt-flow/`) and schedules nothing externally. Report any issue you find.

## Reporting a vulnerability

Please do not open a public issue for security problems. Instead:

- Contact the maintainer privately (see git history / issue tracker for the current maintainer).
- Include: affected version, a description of the problem, and if possible a minimal reproduction.

You will receive a response within a reasonable timeframe. Please do not exploit the issue further after disclosure.

## Scope

- Unauthorized access to files outside the intended working directory
- Bypassing the three gates (acceptance / independent review / confirmation)
- Accidental disclosure of secrets via plugin output or state files

## Out of scope

- Hana platform itself (report those to the Hana project)
- The official Matt Pocock skills content (upstream repo)
