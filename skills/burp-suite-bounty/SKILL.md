---
name: burp-suite-bounty
description: Web bug bounty hunting with Burp Suite — Intruder fuzzing, Autorize access-control checks, Collaborator blind-vuln proof, Active Scan++, Scanner/Crawler, Turbo Intruder, Repeater confirmation, and Sequencer token analysis. Use this skill whenever the user asks about hunting web vulnerabilities with Burp Suite, testing a web app for a bounty, proving SSRF/XSS/XXE, checking IDOR or broken access control, fuzzing parameters, or choosing which Burp technique to learn first. Also use it when a web bounty target (such as a testnet web wallet or any in-scope web app) needs a testing plan.
---

# Burp Suite for Bug Bounty

A practical playbook distilled from the Hacking Articles (Ignite Technologies) BurpSuite-For-Pentester series. It covers the Burp tools that matter for web bug bounty hunting, in priority order, with the exact workflow and a concrete test case for each.

Source repo (index only — the articles live on hackingarticles.in): https://github.com/Ignitetechnologies/BurpSuite-For-Pentester

## When to use this skill

- The target is a **web application** with a bounty program (in scope, authorized). Burp does NOT apply to smart-contract code review (Solidity), to building make.fun entries, or to testing a site with no bounty program.
- Use the priority playbook below to pick the technique, then follow that section's workflow.

## Priority playbook — learn in this order

1. **Intruder + Repeater** (foundation). Nearly every bounty finding starts here: fuzz a parameter, then prove it manually in Repeater. The only technique that stands alone without Burp Pro.
2. **Autorize**. Broken Access Control / IDOR is the most frequently paid vuln class and the most often missed by scanners. Autorize automates the tedious part (replaying every endpoint with a low-priv credential) and flags red candidates.
3. **Burp Collaborator**. The only way to prove "blind" vulns (SSRF, Blind XSS, Blind XXE, Blind RCE) — high-paying classes that cannot be proven without an out-of-band interaction. Learn after #1 and #2, because placing the payload needs Repeater/Intruder first.

After those three: Active Scan++ + Scanner for an initial automated sweep, Turbo Intruder when payload lists get large, Sequencer when a token looks suspicious.

## 1. Autorize — automated authorization / IDOR testing

**Finds:** Broken Access Control, IDOR, weak RBAC, forced browsing, horizontal & vertical privilege escalation, business-logic flaws.

**Setup:**
1. Install Jython first (Settings → Extensions → Python Environment → pick the Jython Standalone file), restart Burp, then Extender → BApp Store → install Autorize.
2. Log in as a low-priv user, copy its Cookie/Authorization header → paste in the Autorize tab → Configuration → "Temporary header" (or click "Fetch Cookies header" / "Fetch Authorization header").
3. Enforcement Detector: enter the response pattern for denied access (easiest: Body (simple string) contains → e.g. "Access denied" / "Unauthorized") → Add filter. Repeat for the Unauthenticated Detector (no credentials at all). If there are several different error messages, make one filter per message and change AND to OR.
4. Interception filter: "Scope items only", ignore spider & image extensions.
5. Turn Autorize ON, then log in as admin and browse every admin page. Autorize automatically replays each request with the low-priv user's cookie.
6. Read results: **Red [Bypassed!]** = possibly vulnerable; **Orange [Is enforced!]** = looks protected but check manually; **Green [Enforced!]** = protected.

**Concrete test:** Log in as a low-priv user, take its cookie. Log in as admin, open `/admin/users` or an endpoint like `DELETE /api/users/{id}`. If Autorize flags it red (response 200, same as admin), open that request, replace the admin cookie with the low-priv cookie manually in Repeater and resend — if it still returns 200 and the data appears, that is a valid IDOR / broken-access-control finding.

**Rules:** Red ≠ definitely vulnerable — always cross-check manually (false positives exist). For a JWT API, replace the Authorization header, not the cookie.

## 2. Burp Collaborator — blind / out-of-band proof (SSRF, Blind XSS, Blind XXE, Blind RCE)

**Finds:** Blind SSRF, Blind XSS, Blind XXE, Blind OS Command Injection.

**Setup:**
1. Project Options → Misc → Burp Collaborator server → Run health check (must pass). Default uses PortSwigger's public server; you can host a private server.
2. Burp → Burp Collaborator client → Generate (Number to Generate 1–10) → Copy to clipboard.
3. Paste the payload at the injection point (via Repeater or Intruder), send it, then go back to the Collaborator client → Poll now (default polls every 60 s; can be sped up).
4. If an interaction arrives (DNS/HTTP/SMTP), the vuln is confirmed.

**Concrete tests (per class):**
- **Blind RCE:** `127.0.0.1|nslookup <payload>.burpcollaborator.net` in a ping/IP field. A DNS query arriving at Collaborator confirms command injection.
- **Blind XSS:** `<img src="http://<payload>.burpcollaborator.net">` in a stored field (e.g. User-Agent, name, comment). An HTTP/DNS hit when an admin opens the page confirms stored XSS.
- **Blind XXE:** `<!DOCTYPE stockCheck [ <!ENTITY xxe SYSTEM "http://<payload>.burpcollaborator.net"> ]>` in an XML body (e.g. a productID parameter in "Check stock"). Even if the response says "Invalid Product ID", a hit at Collaborator confirms XXE.
- **Blind SSRF:** replace a `Referer` value (or a URL/webhook/callback parameter) with `http://<payload>.burpcollaborator.net`, send, then Poll. A hit = SSRF. If one payload fails, fuzz that point with Intruder + a Collaborator payload list (Number to Generate 10).

**Rule:** This is the standard way to prove blind vulns in a bounty report — without a Collaborator hit, blind SSRF/XSS/XXE is almost impossible to prove.

## 3. XSS Validator — automated XSS detection + validation via Intruder

**Finds:** Reflected, Stored, and DOM XSS.

**Setup:**
1. Extender → BApp Store → install XSS Validator (new "xssValidator" tab).
2. Install PhantomJS, download `xss.js` (the detector), put `phantomjs.exe` in the detector folder, run `phantomjs.exe xss.js` → check `http://127.0.0.1:8093` (detector server running).
3. Capture a request (e.g. a search field) → Send to Intruder → Positions: mark the parameter → Attack type: Sniper.
4. Payloads → Payload type: **Extension-generated** → Generator: **XSS Validator Payloads**. Uncheck "Payload Encoding".
5. Copy the "Grep Phrase" from the XSS Validator tab → Options → Grep – Match → paste it. Check "Search responses for payload strings". Start Attack.
6. Flagged results = payloads that executed. Right-click a request → "Show response in browser" to prove execution in a browser. PhantomJS also tests each request for DOM XSS.
7. Custom payloads: type/paste directly in the extension's Payload list.

**Concrete test:** A search field `?q=ignite` → Intruder + XSS Validator Payloads. If a payload triggers the Grep Phrase, open the response in a browser and prove `alert()` runs. That is valid XSS proof.

**Important caveat:** PhantomJS is unmaintained (project died 2018). The setup still works but is outdated; for modern bounties, validating XSS is more practical with Collaborator (Blind XSS, see §2) or a headless browser. Do not waste time troubleshooting PhantomJS if it does not run.

## 4. Intruder — fuzzing

**Finds:** SQLi, XSS, OS command injection, auth bypass, hidden files/directories, file-upload bypass, HTTP verb tampering, OTP bypass, IDOR via token.

**Base workflow (always the same):** Capture a request in Proxy → right-click → Send to Intruder → Positions: clear the default selection, mark the value to fuzz with Add § → pick an Attack type → Payloads: choose a list (Add from list / Load file / type) → Start Attack → sort the Length/Status columns to find anomalies.

**Attack types:**
- **Sniper:** 1 payload set, 1 position (or several positions in turn). Most commonly used.
- **Battering ram:** the same payload set inserted into ALL positions at once. Good for checking "password == username".
- **Pitchfork:** several payload sets, position i tested with payload i from each set (parallel pairs, e.g. paired username:password).
- **Cluster bomb:** every combination of every set (cartesian product). Good for brute-forcing username × password, but request count explodes.

**Important payload types:**
- **Simple list + Add from list (built-in, Pro):** Fuzzing – full/quick, Fuzzing – XSS, Fuzzing – SQL Injection, Passwords, Usernames, Short words, Filenames – short/long, Extensions – short, Dictionary – short, HTTP verbs.
- **Brute forcer:** generates every combination from a charset + min/max length (no list needed).
- **Numbers:** From/To/Step — the go-to for OTP bypass (e.g. 000000–999999, step 1).
- **Character frobber:** increments each character's ASCII code one at a time — for manipulating encrypted tokens/IDs (e.g. CBC bit-flipping, account takeover via user ID).
- **Case modification:** changes the case of a base value — to slip past filters blocking words like "SCRIPT".
- **Username generator:** from one name, generates all username variants (max 50).
- **Load:** loads an external payload list (e.g. SecLists).
- **Grep – Match:** enter keywords from the application's error message (e.g. "Invalid credentials!" or "blocked") so matching results get flagged. **Grep – Extract:** pulls a value from the response (e.g. an Application ID) to correlate with a payload.

**Concrete tests (per built-in list):**
- **Login (Passwords/Short words/Usernames):** mark the password field, Sniper, list "Passwords". Sort Length ascending; a result with a drastically different length + status 302 = credentials found. If the password is not in the list, try "Short words". If the password is known but the username is not, mark the username and use the "Usernames" list.
- **SQLi:** mark uname + pass, Cluster Bomb, both positions "Fuzzing – SQL Injection" (or "Fuzzing – full"). Sort Length descending; try the anomalous credentials in a browser (e.g. username `'` with an empty password can bypass login).
- **Hidden files/directories:** replace a filename in the URL with a random word (e.g. `portal.php` → `abc`), mark it, Sniper, list "Filenames – short" (then "Filenames – long") or "Dictionary – short" for directories. Look for status 200/302 (e.g. `secret.php`, `captcha.php`, `Admin_files`).
- **File upload:** mark the file extension in the upload request, Sniper, list "Extensions – short". In Options → Grep – Match, enter the application's error word (e.g. "blocked"). Sort the "blocked" column to see which extensions are blocked — then upload with an extension that is NOT blocked.
- **XSS:** mark a parameter, Sniper, list "Fuzzing – XSS". Sort Length descending; open hits in a browser to confirm execution.
- **OS command injection:** no dedicated list; use "Fuzzing – quick". A payload like `;id` that changes the response = a hit.
- **HTTP verb tampering:** mark the HTTP verb itself (POST), Sniper, list "HTTP verbs". If almost every method returns 200 (including HEAD, which hides the body), per-method access control is weak.
- **OTP bypass:** mark the OTP field, Sniper, payload type Numbers (From 0 To 999999, Step 1). Look for 302/success.
- **Filter bypass (case):** payload type Case modification with a value like `<script>alert(1)</script>` to slip past a filter on "SCRIPT"/"script".

## 5. Active Scan++ (extension, James Kettle)

**Finds:** Host Header Injection, Password Reset Poisoning, Cache Poisoning, DNS Rebinding, XML Injection, Arbitrary Header Injection, Template Injection, Blind Code Injection, plus an insertion point for HTTP Basic Auth.

**Setup:**
1. Needs Jython (same as Autorize): Settings → Extensions → Python Environment → pick Jython Standalone → restart Burp.
2. Extender → BApp Store → install Active Scan++ (highest rated).
3. No tab of its own — it merges with the scanner. To audit a whole app: Target → Site map → right-click the root → "Actively scan this branch" → watch the Dashboard. For one injection point: send the request to Intruder → Positions: mark the point → right-click → "Scan defined insertion points" → Open Scan launcher → OK (default).
4. Read results in Dashboard → Issue activity / Advisory (payload, request/response, mitigation, CVSS included).

**Concrete test:** Audit one parameter (e.g. a field that reflects input) with "Scan defined insertion points". If "Host header injection" or "Web cache poisoning" appears, that is a finding the built-in scanner would not give — and both are often valuable in bounties (especially password-reset poisoning via the Host header).

**Note:** Pro-only (designed for Professional users).

## 6. Scanner & Crawler (Audit)

**Finds:** Everything the scanner covers (SQLi, XSS, etc.) + Active Scan++ findings if installed.

**Workflow:**
1. Dashboard → New Scan → pick "Crawl" only (or "Crawl & Audit"). Enter the target URL → OK. Watch Tasks/Event log. Results appear as a tree in Target → Site Map (click the Params column to see which URLs have parameters — those are the test points).
2. Customize: Detailed Scope Configuration → Excluded URL prefixes (enter out-of-scope URLs). Scan Configuration → New: set Crawl optimization (Fastest–Deepest), Crawl limit (e.g. 50 minutes, max 5000 unique locations), check options for the crawler to register itself / try logging in with wrong credentials, and fill Application login with valid credentials for restricted pages. Resource Pool controls concurrent requests (lower it if the app is fragile).
3. Audit: right-click a URL in the Site Map → Scan (or "Audit selected items"). Watch Dashboard → Issue activity; click View Details for full proof; filter by severity. To verify: open the proof request in a browser (e.g. a time-based SQLi on an `artist=` parameter that gives a ~20 s delay = confirmed).

**Concrete test:** Crawl the bounty target → in the Site Map sort by Params → audit only URLs with parameters → from the audit results, take one High/Critical finding and prove it manually in Repeater before writing the report (never report raw scanner output — many false positives).

**Note:** Scanner/Audit and Crawler are Pro features. In Community, you do not have them — the replacement is manual crawling via Proxy + passive Site Map and Intruder fuzzing.

## 7. Turbo Intruder (extension, James Kettle)

**Finds:** Same as Intruder (credential brute-force, multi-parameter fuzzing), but much faster.

**Workflow:**
1. Extender → BApp Store → install Turbo Intruder (~5-star rated).
2. Capture a request → mark the injection point with `%s` → right-click → Send to Turbo Intruder.
3. Pick a script from the dropdown (e.g. `examples/basic.py` for one parameter, `examples/multipleParameters.py` for Cluster Bomb). Edit the script: fill in the dictionary path, set `concurrentConnections` and `requestsPerConnection`, and set a result filter (e.g. `if req.status != 404:` to show only non-404s; or `== 302` for redirects only).
4. Attack. If the "retries" value rises, halve requestsPerConnection.

**Concrete test:** Brute-force a password with a 100k list (e.g. SecLists 10-million-password-list). Plain Intruder runs ~23 req/s; Turbo Intruder with concurrentConnections=20, requestsPerConnection=200 reaches ~94 req/s (4× faster). Sort Length, look for 302.

**Note:** Default speed is slow (concurrentConnections=5) — it must be changed manually. No edition limit is mentioned in the articles (BApp Store extension).

## 8. Repeater — the confirmation tool

**Finds:** Everything (this is a confirmation tool, not a detection tool).

**Workflow & tricks:**
- Send a request: right-click in Proxy/HTTP history → Send to Repeater (or Ctrl+R).
- Rename a tab (double-click) so you do not get lost with many tabs.
- Change request method (right-click → Change request method): GET→POST moves URL parameters into the body.
- Request history: Back/Forward (< >) buttons + dropdown to see earlier responses.
- Paste URL as request: new tab → right-click in the empty request area → "Paste URL as request" — Burp builds the full request from the URL.
- URL-encode as you type: right-click → enable so characters like `< >` and spaces get encoded automatically while typing (useful for filter bypass).
- Following redirection: set to "Never follow redirections" when testing Open Redirect / Cache Poisoning, so you see the 302 response; then click "Follow redirection" to continue manually.
- Search: find a keyword in request/response (supports regex & case sensitive).
- Reopen closed tab: right-click the tab area → "Reopen Closed Tab".
- Save entire history: right-click → "Save entire history" (XML) — for report documentation.

**Concrete test (the rule):** Every finding from Intruder/scanner/Autorize must be re-proven in Repeater with a minimal request (one request, one change) before it goes into a report — this is what separates bounty reports that get accepted from ones that get rejected.

## 9. Sequencer (+ Comparer)

**Finds:** Predictable session/token (Insufficient Entropy / Broken Authentication).

**Workflow:**
1. Capture a login request → right-click → Send to Sequencer. The token is auto-filled from the response (or set a Custom location: Define start & end / Extract from regex group).
2. Token Location within Response → pick Cookie (or custom) → Start Live Capture. Burp repeats the request ~1000× and collects tokens. Minimum 100 tokens for analysis; 1000–2000 recommended for accurate results.
3. Pause → Analyze now. Read "overall quality of randomness" (excellent/poor) and "effective entropy" (good ≥64 bit, ideal 128 bit).
4. If quality is "poor" or entropy is low: Save Tokens → token.txt → try logging in by manipulating the session ID in a request (replace PHPSESSID with one of the saved tokens) → if it logs in without credentials = session fixation/prediction confirmed. If one token does not work, fuzz the whole token.txt with Intruder.
5. Manual load: if you already have token samples (from a file/clipboard), Sequencer → Manual load → Paste/Load → Analyze now (needs >100 tokens; enable "base-64 decode before analyzing" if the token is base64-encoded).
6. Comparer: send two requests/responses to Comparer (right-click → Send to Comparer) → Words or Bits → see the differences (Modified/Deleted/Added) — useful for comparing two session IDs or two responses.

**Concrete test:** Take password-reset tokens from two different accounts, run a Sequencer live capture of 1000 tokens. If entropy is <64 bit or there is a pattern (e.g. sequential/time-based tokens), report it as a predictable token.

**Note:** Sequencer is available in Community AND Pro (stated explicitly in the articles).

## Edition limits (Community vs Pro) — per the articles

- **Pro only:** Burp Collaborator (stated explicitly "Professional edition"); Active Scan++ ("designed for the Burp's Professional users"); Scanner/Audit & Crawler (the Dashboard scan engine — not in Community).
- **Intruder built-in payload lists** (Fuzzing – full/quick/XSS/SQLi, Passwords, Usernames, Filenames, etc.) — the articles describe them as a "Burp Suite's Professional Edition" option. In Community, Intruder exists but without these built-in lists (use Load from an external file such as SecLists).
- **Both editions (Community + Pro):** Sequencer (stated explicitly); Repeater (a core tool, present in both — the articles frame it as a Professional feature, but Repeater is available in Community); Autorize, XSS Validator, Turbo Intruder (BApp Store extensions, no edition limit stated in the articles — but Autorize & Active Scan++ need Jython).
- **Practical note:** PhantomJS (the XSS Validator companion) is unmaintained since 2018 — do not rely on that setup; for modern XSS validation use Collaborator or a headless browser.

## Scope rules for this skill

- Only test targets that are **in scope and authorized** (an active bounty program the user is participating in, or their own application). Never use these techniques on a site with no bounty program or without permission.
- Burp techniques apply to **web applications only**. They do not apply to smart-contract code review, to building make.fun entries, or to agent/sandbox testing.
- A scanner/Autorize flag is a **candidate**, not a finding. Always re-prove it with a minimal Repeater request before writing a report.
