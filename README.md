# MOF_BTP

MOF BTP apps: SAP BTP ABAP Environment (Steampunk) applications for the **MOF Target Operating Model**.
The main application is **SRC**, which maintains the national Source of Revenue Code hierarchy:
revenue items, their classification, pricing, payment methods and the government entities that collect them.
It ships with the configuration (master data) apps that feed its value helps.

Everything is built on the **ABAP RESTful Application Programming Model (RAP)**: managed business objects
with draft, CDS view entities, and OData V4 UI services consumed by SAP Fiori elements.
The repository is serialized with [abapGit](https://abapgit.org/) (`FULL` folder logic, starting folder `/src/`, master language English).
Most UI labels are in Arabic.

## Applications

| App | Purpose | Root BO | Service binding | Protocol |
|-----|---------|---------|-----------------|----------|
| **SRC Hierarchy** | Hierarchical list of SRC nodes with payment methods, agent government entities and an approval workflow | `ZI_SrcNode` / `ZC_SrcNode` | `ZC_SRCNODE_SB` | OData V4 |
| **SRC Details** | Time-dependent SRC object with classification, price, discount and relation records | `ZYM_R_SRC_DETAILSMOF` / `ZYM_C_SRC_DETAILSMOF` | `ZYM_UI_SRC_DETAILS_O4MOF` (V4), `ZYM_UI_SRC_DETAILS_ODATAV2` (V2) | OData V4 / V2 |
| Object Types | Object-type catalog (Arabic/English names) | `ZYM_R_YOBJECT_TYPEMOF` | `ZYM_UI_YOBJECT_O4MOF` | OData V4 |
| Relation Types | Relation-type catalog (Arabic/English names) | `ZYM_R_YRELATIONMOF` | `ZYM_UI_YRELATION_O4MOF` | OData V4 |
| Government Entities | Government entity master (code, name, region, IBAN) | `ZZM_R_SRC_GE_TMOF` | `ZZM_UI_SRC_GE_T_O4MOF` | OData V4 |
| SRC Types | SRC type master | `ZZM_R_SRC_TYPE_TMOF` | `ZZM_UI_SRC_TYPE_T_O4MOF` | OData V4 |
| SRC Methods | Service delivery method master | `ZZM_R_SRC_METH_T` | `ZZM_UI_SRC_METH_T_O4` | OData V4 |
| SRC Natures | Revenue nature master | `ZZM_R_SRC_NAT_TMOF` | `ZZM_UI_SRC_NAT_T_O4MOF` | OData V4 |
| Payment Types | Payment type master | `ZZM_R_SRC_PT_TMOF` | `ZZM_UI_SRC_PT_T_O4MOF` | OData V4 |

## Documentation

| Document | Contents |
|----------|----------|
| [docs/architecture.md](docs/architecture.md) | Layering, business objects, behavior, draft, hierarchy, authorization |
| [docs/data-model.md](docs/data-model.md) | Database tables, fields and how they map to CDS entities |
| [docs/services.md](docs/services.md) | Service definitions, bindings, exposed entities and value helps |
| [docs/development.md](docs/development.md) | Importing with abapGit, naming conventions, object catalog, open items |

## Quick start

1. In an SAP BTP ABAP Environment system, create (or pick) a package for the objects; the original package is described as *MOF Target Operating Model*.
2. Pull this repository into that package with abapGit (ADT plugin or the abapGit app).
3. Activate all objects (tables first, then CDS, behavior definitions, classes, service definitions, bindings).
4. Publish the service bindings and preview the apps from ADT, or generate Fiori elements apps against them.
5. Fill the master data apps (types, methods, natures, payment types, government entities) before creating SRC nodes, since the SRC app's value helps read from them.

See [docs/development.md](docs/development.md) for details and the list of known gaps.
