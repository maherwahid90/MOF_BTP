# MOF SRC — SAP CAP + React

A rebuild of the ABAP RAP **SRC** application (see the [repository README](../README.md)) as a
side-by-side app for **SAP BTP Cloud Foundry**:

- **Backend:** SAP Cloud Application Programming Model (CAP, Node.js) with OData V4 services
- **Frontend:** React 19 single-page app (Vite), Arabic (RTL) and English
- **Database:** SQLite in memory for local development, **SAP HANA Cloud** (HDI container) on BTP
- **Security:** XSUAA login through the SAP **approuter**, four role collections

```
Browser ──► approuter (XSUAA login, serves React build) ──/odata──► CAP service ──► HANA Cloud (HDI)
```

## What it does

| Area | Features |
|------|----------|
| National structure (SRC hierarchy) | Tree of SRC items (chapter → section → item) with search, status filter and counters; item page with basic, beneficiary and financial data; payment methods and agent government entities as editable lists |
| Approval workflow | New → *Submit for approval* → *Approve* / *Reject (with reason)*; approved items become active; changing an approved or rejected item sends it back to New |
| SRC details | Time-dependent records (object type + ID) with classification, price, discount and relation tabs |
| Master data | SRC types, delivery methods, revenue natures, payment types, government entities, object types, relation types |

This implements the behavior that is only declared (empty stubs) in the ABAP version:

- `status`, `isActive`, `level` and workflow fields are set by the server only
- SRC codes are unique, end dates ≥ start dates, percentages 0–100, discount ≤ price
- payment types and agent entities can't repeat on one item; agent collection percentages add up to ≤ 100 %
- items can't be moved under themselves or their descendants; levels are recalculated after a move
- items awaiting approval are locked; items with children can't be deleted
- master data codes still in use can't be deleted
- error messages in English and Arabic (`_i18n/`), chosen by the UI language

## Roles

| Role collection (BTP) | Roles | Can do |
|-----------------------|-------|--------|
| `MOF_SRC_Viewer` | SrcViewer | Read everything |
| `MOF_SRC_Editor` | SrcViewer, SrcEditor | Create/change/delete items and details, submit for approval |
| `MOF_SRC_Approver` | SrcViewer, SrcApprover | Approve or reject submitted items |
| `MOF_SRC_Admin` | all four | Everything, including master data |

Locally there are mocked users (password = user name):
`alice` (editor + master data admin), `bob` (approver), `carol` (viewer).
The React dev build shows a user switcher in the header.

## Project structure

```
cap/
├── db/schema.cds              data model (mof.src)
├── db/data/                   currencies (reference data deployed with the database)
├── srv/services.cds           SrcService, DetailsService, AdminService (+ authorization)
├── srv/*-service.js           business logic
├── srv/seed.js, sample-data/  one-time demo data load
├── _i18n/                     server messages (en, ar)
├── test/                      API tests (node:test + @cap-js/cds-test)
├── app/web/                   React app (Vite)
├── app/router/                approuter (xs-app.json); the React build is copied to resources/
├── xs-security.json           scopes, role templates, role collections
└── mta.yaml                   BTP deployment descriptor
```

| ABAP object | CAP equivalent |
|-------------|----------------|
| `ZSRC_NODE`, `ZSRC_PAYM`, `ZSRC_GOV` | `SrcNodes`, `SrcPayMethods`, `SrcGovEntities` |
| `ZSRC_TYPE_T`, `_METH_T`, `_NAT_T`, `_PT_T`, `_GE_T` | `SrcTypes`, `SrcMethods`, `SrcNatures`, `PaymentTypes`, `GovEntities` |
| `ZYM_SRCDTAILSMOF` + 4 child tables | `SrcDetails` + `SrcClassifications`, `SrcPrices`, `SrcDiscounts`, `SrcRelations` |
| `ZYM_YBJCTTYPEMOF`, `ZYM_YRELATIONMOF` | `ObjectTypes`, `RelationTypes` |
| `ZC_SRCNODE_SD` / `ZYM_UI_*` / `ZZM_UI_*` | `/odata/v4/src`, `/odata/v4/details`, `/odata/v4/admin` |
| `submitForApproval`, `approve`, `reject` | bound actions `submitForApproval`, `approve`, `rejectNode` |

Not carried over: RAP draft. The React app edits a local copy and saves the whole item in one request
(deep update), which gives the same "edit, then save or cancel" experience.

## Run locally

Requirements: Node.js 20 or later.

```bash
cd cap
npm install
npm install --prefix app/web

npm run watch        # terminal 1: CAP on http://localhost:4004 (restarts on changes)
npm run dev:ui       # terminal 2: React on http://localhost:5173 (proxies /odata to :4004)
```

Open http://localhost:5173. The database is in memory and reloads the demo data on every start.

```bash
npm test             # API tests: workflow, validations, authorization
```

## Deploy to your SAP BTP trial

### 1. One-time setup in the BTP cockpit

1. Open your trial account at https://account.hanatrial.ondemand.com and go to your subaccount (usually *trial*).
   Cloud Foundry is enabled with an org and a space (*dev*) by default.
2. **Create a SAP HANA Cloud database** (needed for the HDI container):
   1. *Services → Service Marketplace* → **SAP HANA Cloud** → *Create*, plan **tools** (this subscribes to SAP HANA Cloud Central).
   2. *Security → Users* → your user → *Assign Role Collection* → **SAP HANA Cloud Administrator**.
   3. Open *Instances and Subscriptions → SAP HANA Cloud* → **Create Instance** → *SAP HANA Database*.
      Set an administrator password, and under *Connections* choose **Allow all IP addresses**.
   4. When the instance is running, map it to Cloud Foundry: in HANA Cloud Central open the instance →
      *Manage Configuration* → *Instance Mapping* → add your **Cloud Foundry org ID and space ID**
      (shown on the subaccount and space overview pages).
   > Trial HANA Cloud instances stop every night. Start yours again in HANA Cloud Central before using the app
   > or deploying.

### 2. Build and deploy

The easiest path is **SAP Business Application Studio** (included in the trial: *Instances and Subscriptions →
SAP Business Application Studio*; create a *Full Stack Cloud Application* dev space). It already has
`cf`, the MultiApps plugin and `mbt`. On your own computer, install the
[cf CLI v8](https://github.com/cloudfoundry/cli), then `cf install-plugin multiapps` and `npm install -g mbt`.

```bash
git clone https://github.com/maherwahid90/MOF_BTP.git
cd MOF_BTP/cap

# API endpoint is on the subaccount overview page, e.g. https://api.cf.us10-001.hana.ondemand.com
cf login -a <API endpoint>

mbt build -t mta_archives        # runs cds build + React build, creates the .mtar
cf deploy mta_archives/mof-src_1.0.0.mtar
```

The deployment creates:

| Name | What |
|------|------|
| `mof-src` | approuter — **this is the app URL** |
| `mof-src-srv` | CAP service |
| `mof-src-db-deployer` | one-off task that creates the tables (stops after it finishes) |
| `mof-src-db` | HDI container service |
| `mof-src-auth` | XSUAA service with the role collections |

### 3. Give yourself access

*Security → Users* → your user → *Assign Role Collection* → **MOF_SRC_Admin**
(or `MOF_SRC_Editor` / `MOF_SRC_Approver` / `MOF_SRC_Viewer` to try the separate roles).

Then open the `mof-src` route (`cf apps` lists it, e.g. `https://<org>-<space>-mof-src.cfapps.us10-001.hana.ondemand.com`).
If you assign roles while logged in, log out (header button) and log in again.

### Demo data on BTP

`SEED_SAMPLE_DATA: true` in `mta.yaml` loads the demo data from `srv/sample-data` **once**, when the
database has no SRC types yet. It never overwrites your data. Set it to `false` (or delete the property)
before deploying if you want to start empty.

### Updating

Change the code, then run `mbt build -t mta_archives` and `cf deploy mta_archives/mof-src_1.0.0.mtar` again.
Table changes are applied by the HDI deployer.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Deploy fails creating `mof-src-db` | The HANA Cloud instance isn't running or isn't mapped to your CF space (step 1.2) |
| `403 Forbidden` in the app | No role collection assigned, or you didn't log in again after assigning it |
| App shows "Session expired" / reloads | Normal after the XSUAA session timeout; you'll be logged in again |
| Logs | `cf logs mof-src-srv --recent`, `cf logs mof-src --recent`, `cf logs mof-src-db-deployer --recent` |
| Out of memory quota | Trial CF has a limited quota; `cf apps` and `cf delete` old apps you no longer need |
