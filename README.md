# RESPOND Safeguarding Simulator

Interactive scenario-based safeguarding training powered by the RESPOND Framework.

**Live site:** `https://your-site-name.netlify.app`

---

## Deployment — GitHub → Netlify

### Step 1 — Push to GitHub
```bash
cd respond-simulator
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-ORG/respond-simulator.git
git push -u origin main
```

### Step 2 — Connect Netlify
1. Log in to [netlify.com](https://www.netlify.com/) (free tier works)
2. Click **Add new site → Import an existing project**
3. Select your GitHub repo
4. Build settings are already in `netlify.toml` — just click **Deploy site**

### Step 3 — Add your API key
1. In Netlify, go to **Site configuration → Environment variables**
2. Click **Add a variable**
3. Set:
   - **Key:** `ANTHROPIC_API_KEY`
   - **Value:** Your Anthropic API key (starts with `sk-ant-...`)
4. Go to **Deploys → Trigger deploy → Deploy site**

### Step 4 — Custom domain (optional)
1. Go to **Domain management → Add a domain**
2. Enter e.g. `simulator.respondsafeguarding.org`
3. Add the DNS records Netlify provides
4. SSL is automatic

### Ongoing updates
Push to `main` → Netlify auto-deploys. No build step needed.

---

## How it works

```
Browser (staff)           Netlify                    Anthropic API
    │                       │                            │
    ├── Click "Begin" ─────►│                            │
    │                       ├── POST /v1/messages ──────►│
    │                       │   (with API key)           │
    │                       │◄── Scenario JSON ──────────┤
    │◄── Render scenario ───┤                            │
    │                       │                            │
    ├── Submit response ───►│                            │
    │                       ├── POST /v1/messages ──────►│
    │                       │   (with conversation       │
    │                       │    history + API key)      │
    │                       │◄── Assessment JSON ────────┤
    │◄── Show score + ──────┤                            │
    │    next development   │                            │
```

- **Frontend:** Single HTML file (`public/index.html`) — no build step
- **Backend:** Netlify serverless function (`netlify/functions/respond-api.js`)
- **API key:** Stored as Netlify environment variable — never sent to browser

---

## Project structure

```
respond-simulator/
├── .gitignore
├── netlify.toml                      # Netlify config (publish + functions)
├── netlify/
│   └── functions/
│       └── respond-api.js            # Serverless API proxy
├── public/
│   └── index.html                    # The entire game (single file, no build)
├── google-apps-script/
│   └── Code.gs                       # Google Sheets logger (deploy separately)
└── README.md
```

---

## Features

### 📄 PDF Download
After each scenario debrief, staff can click **Download PDF** to save a professional report including all step scores, strengths, areas for development, key learning, and statutory references.

### 📊 Google Sheet Logging
Every completed scenario is automatically logged to a Google Sheet for DSL oversight, including: timestamp, scenario details, all 7 step scores, grade, RAG status, strengths, development areas, and full user responses.

---

## Google Sheet Setup (5 minutes)

### Step 1 — Create the Sheet
1. Create a new Google Sheet (name it e.g. "RESPOND Simulator Log")
2. Go to **Extensions → Apps Script**

### Step 2 — Deploy the Logger
1. Delete any code in the editor
2. Paste the entire contents of `google-apps-script/Code.gs`
3. Click **Deploy → New deployment**
4. Choose **Web app** as type
5. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone
6. Click **Deploy** and authorise when prompted
7. Copy the **Web app URL** (looks like `https://script.google.com/macros/s/XXXX/exec`)

### Step 3 — Connect to Simulator
1. Open `public/index.html`
2. Find the line: `const GOOGLE_SHEET_WEBHOOK = "";`
3. Paste your Web app URL between the quotes
4. Redeploy on Netlify

### Step 4 — Test
1. Run a scenario to completion
2. Check your Google Sheet — a new row should appear with all data
3. Headers are auto-created and colour-coded on first run

### What gets logged
| Column | Data |
|--------|------|
| Timestamp | When scenario completed |
| Scenario Title | Generated scenario name |
| Setting | Location/time of scenario |
| Hidden Issue | The actual safeguarding concern |
| Overall Score | 0-100 |
| Grade | Outstanding / Good / RI / Inadequate |
| RAG Final | GREEN / AMBER / RED |
| R through D | Individual step scores (1-10 each) |
| Strengths | Identified strengths |
| Areas for Development | Identified areas |
| Key Learning | Main takeaway |
| Statutory References | KCSIE / WT2023 references |
| User Responses | All responses with step labels |

---

## Costs

- **Netlify hosting:** Free tier includes 125K function invocations/month
- **Anthropic API:** Each scenario uses ~5-8 API calls. At Sonnet pricing (~$3/M input, $15/M output), expect roughly $0.05-0.10 per completed scenario
- **Estimate:** 100 staff completing 2 scenarios each ≈ $10-20

---

## Customisation

### Change the model
In `netlify/functions/respond-api.js`, change the default model:
```js
model: body.model || "claude-sonnet-4-20250514"
```

### Add access control
For simple password protection, add to `netlify.toml`:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    Authorization = "Basic YOUR_BASE64_ENCODED_CREDENTIALS"
```

Or use Netlify Identity for proper user accounts.

### Restrict to your domain
In the serverless function, change `Access-Control-Allow-Origin` from `"*"` to your domain.

---

## Brand assets
- **7-dot colours:** R `#24437b` · E `#235e4b` · S `#a4684e` · P `#cd372b` · O `#ebaf24` · N `#287bc9` · D `#8625eb`
- **Primary:** `#1e3d6f` / `#2c5aa0`
- **Accent:** `#ff6b35`
- **Font:** Inter (Google Fonts)
- **Logo:** Loaded from GitHub repo

---

© 2025 RESPOND Safeguarding Framework | [respondsafeguarding.org](https://www.respondsafeguarding.org/)
