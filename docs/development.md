# Development guide

## Prerequisites

- SAP BTP ABAP Environment (or S/4HANA Cloud, public edition developer extensibility). All objects use ABAP language version 5 (ABAP for Cloud Development).
- ABAP Development Tools (ADT) for Eclipse with the abapGit plugin, or the abapGit app on the system.
- A developer user with authorization to create packages, publish service bindings and maintain IAM apps.

## Importing the repository

1. Create a target package (transport-enabled if you need to move it between systems).
2. In ADT, open *abapGit Repositories* → **Link** this repository to the package, then **Pull**.
   `.abapgit.xml` sets `STARTING_FOLDER=/src/` and `FOLDER_LOGIC=FULL`; `README.md` and `docs/` sit outside the starting folder, so abapGit does not import them.
3. Activate. If mass activation fails on dependencies, activate in this order:
   1. Tables (active and draft)
   2. Value help and interface/R CDS views, then the hierarchy `ZSRC_HIERARCHY`
   3. Projection/C views, metadata extensions, access controls
   4. Behavior definitions and their handler classes
   5. Service definitions, then service bindings
4. Publish each service binding (ADT → binding → **Publish**), then use **Preview**.
5. To run the apps for business users, create IAM apps / business catalogs for the services and assign them through business roles.

## Recommended data setup order

1. Master data apps: SRC types, SRC methods, SRC natures, payment types, government entities.
2. Object types and relation types (catalogs for SRC Details).
3. SRC nodes: create root nodes first (empty parent), then child nodes linked to a parent.

## Naming conventions

| Pattern | Meaning | Example |
|---------|---------|---------|
| `ZSRC_*` | Database table for the SRC Hierarchy app or its master data | `ZSRC_NODE`, `ZSRC_GE_T` |
| `ZSRC_D_*`, `*_DMOF`, `*_D` | Draft table | `ZSRC_D_NODE`, `ZZM_SRC_GE_DMOF` |
| `ZI_*` / `ZC_*` | Interface / consumption (projection) CDS view | `ZI_SrcNode`, `ZC_SrcNode` |
| `ZI_*_VH` | Value help view | `ZI_SrcType_VH` |
| `Z*_R_*` / `Z*_C_*` | Generated base (R) / projection (C) CDS view | `ZZM_R_SRC_GE_TMOF` |
| `ZBP_*`, `Z*_BP_R_*`, `Z*_BP_C_*` | Behavior pool (handler class) | `ZBP_I_SRCNODE` |
| `*_UI_*_O4*` | OData V4 UI service definition / binding | `ZZM_UI_SRC_GE_T_O4MOF` |
| `MOF` suffix | Ministry of Finance | |

Each repository object is split into files by abapGit type, for example `zi_srcnode.ddls.asddls` (source),
`.ddls.xml` (metadata), `.ddls.baseinfo` (dependencies).

## Object catalog by type

| abapGit type | Count | Description |
|--------------|-------|-------------|
| `TABL` | 30 | Database and draft tables |
| `DDLS` | 36 | CDS view entities and the hierarchy |
| `DDLX` | 15 | Metadata extensions (UI annotations) |
| `DCLS` | 24 | Access controls |
| `BDEF` | 18 | Behavior definitions (9 base + 9 projection) |
| `CLAS` | 17 | Behavior pools |
| `SRVD` | 9 | Service definitions |
| `SRVB` | 10 | Service bindings |
| `SCO2` | 10 | Service group publications |
| `SUSH` | 11 | Authorization default values |
| `RONT` / `NONT` | 8 / 8 | SAP object types / object node types |
| `SKTD` | 2 | Knowledge transfer documents |
| `DEVC` | 1 | Package |

## Open items

Observed in the code as of the first release:

1. **SRC Hierarchy behavior is not implemented.** All methods in `zbp_i_srcnode.clas.locals_imp.abap`
   are empty: `submitForApproval`, `approve`, `reject`, `setInitialStatus`, `setInitialLevel`,
   `validateNode`, `validateParent`, `validateDates`, `get_instance_features` and
   `get_instance_authorizations`. As a result `ProcessingStatus` and `NodeLevel` are never set,
   the workflow buttons change nothing, and no validation messages are raised.
   Status values for `PROCESSING_STATUS` (CHAR 2) are not defined yet.
2. **Payment type value help not exposed.** `ZC_SrcPayMethod.PayType` refers to `ZI_PayType_VH`, but
   `ZC_SRCNODE_SD` does not expose that entity, so the value help is missing in the OData V4 service.
   Add `expose ZI_PayType_VH;` to the service definition.
3. **Authorization handlers are empty** for the global-authorization BOs (`ZYM_`/`ZZM_`), and all
   DCL roles grant `where TRUE`. Any user with access to the service can read and change all data.
4. **Currency field naming is inconsistent** in SRC Details: price uses `CurrencyCode`, discount uses `Currency`.
5. **SRC Details compositions are `[1..*]`**, which says every root must have at least one child of each kind;
   the behavior does not enforce it. Use `[0..*]` if children are optional.
6. **Cosmetic:** `ZSRC_HIERARCHY` is labelled *"Hierarchy: Draft: Employee HierarchyNode"*,
   `ZC_SRCNODE_SD` is labelled *"sd"*, and generated R views keep the *"###GENERATED Core Data Service Entity"* label.
   The Arabic label *"ننسبة ايراد الجهة الوكيلة"* has a duplicated letter.
7. `ytest` / `ytest2` knowledge transfer documents look like test objects and can be removed.
