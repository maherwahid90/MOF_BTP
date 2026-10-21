# Data model

All tables are client-dependent, delivery class `A` (application data). Each active table that backs a
draft-enabled entity has a matching draft table that mirrors the CDS field names and includes the
standard draft admin structure (`.INCLUDE` of `SYCH_BDL_DRAFT_ADMIN_INC`).

## SRC Hierarchy

### `ZSRC_NODE`: SRC hierarchy node (draft: `ZSRC_D_NODE`)

| Column | CDS element | Type | Notes |
|--------|-------------|------|-------|
| `CLIENT` | | CLNT 3 | Key |
| `NODE_UUID` | `NodeUUID` | `SYSUUID_X16` | Key, managed numbering |
| `PARENT_UUID` | `ParentUUID` | `SYSUUID_X16` | Parent node; initial for roots |
| `NODE_LEVEL` | `NodeLevel` | INT2 | Depth in the tree (readonly) |
| `SRC_CODE` | `SrcCode` | CHAR 20 | Item code, semantic key, mandatory |
| `SRC_TYPE` | `SrcType` | CHAR 10 | → `ZSRC_TYPE_T`, mandatory |
| `SRC_NAME` | `SrcName` | CHAR 120 | Item name, mandatory |
| `SRC_DESC` | `SrcDesc` | CHAR 250 | Description |
| `GFS_CODE` | `GfsCode` | CHAR 20 | Economic classification (GFS) |
| `NATURAL_ACCOUNT` | `NaturalAccount` | CHAR 20 | Natural (GL) account |
| `IS_REFUNDABLE` | `IsRefundable` | `ABAP_BOOLEAN` | Refundable |
| `SRC_METHOD` | `SrcMethod` | CHAR 10 | Service delivery method → `ZSRC_METH_T` |
| `G2C` / `G2B` / `G2G` | `G2C` / `G2B` / `G2G` | `ABAP_BOOLEAN` | Beneficiaries: citizens / business / government |
| `SRC_NATURE` | `SrcNature` | CHAR 10 | Revenue nature → `ZSRC_NAT_T` |
| `SRC_NATURE_PCT` | `SrcNaturePct` | DEC 5,2 | Direct revenue percentage |
| `OWNER_GE_CODE` | `OwnerGECode` | CHAR 20 | Owning government entity → `ZSRC_GE_T` |
| `START_DATE` / `END_DATE` | `StartDate` / `EndDate` | DATS | Validity |
| `PRICE` | `Price` | CURR 15,2 | Amount in `CurrencyCode` |
| `DISCOUNT` | `Discount` | CURR 15,2 | Amount in `CurrencyCode` |
| `CURRENCY_CODE` | `CurrencyCode` | CUKY 5 | Value help `I_Currency` |
| `PROCESSING_STATUS` | `ProcessingStatus` | CHAR 2 | Approval workflow status (readonly) |
| `IS_ACTIVE` | `IsActive` | `ABAP_BOOLEAN` | Readonly |
| `CREATED_BY` / `CREATED_AT` | | `SYUNAME` / `TIMESTAMPL` | Admin |
| `LAST_CHANGED_BY` / `LAST_CHANGED_AT` | | `SYUNAME` / `TIMESTAMPL` | Admin; `LastChangedAt` is the total etag |
| `LOCAL_LAST_CHANGED_AT` | | `TIMESTAMPL` | Etag master |

### `ZSRC_PAYM`: SRC payment method (draft: `ZSRC_D_PAYM`)

| Column | CDS element | Notes |
|--------|-------------|-------|
| `PM_UUID` | `PayMethodUUID` | Key, managed numbering |
| `NODE_UUID` | `NodeUUID` | Parent node |
| `PAY_TYPE` | `PayType` | → `ZSRC_PT_T`, mandatory |
| `PAY_NAME` | `PayName` | |
| `BEGIN_DATE` / `END_DATE` | `BeginDate` / `EndDate` | Validity |
| admin fields | | `CREATED_BY`, `CREATED_AT`, `LAST_CHANGED_BY`, `LOCAL_LAST_CHANGED_AT` |

### `ZSRC_GOV`: SRC agent government entity (draft: `ZSRC_D_GOV`)

| Column | CDS element | Notes |
|--------|-------------|-------|
| `GE_UUID` | `GovEntityRowUUID` | Key, managed numbering |
| `NODE_UUID` | `NodeUUID` | Parent node |
| `GE_CODE` | `GovEntityCode` | → `ZSRC_GE_T`, mandatory |
| `COLLECTION_PCT` | `CollectionPct` | Agent entity's share of the revenue |
| `BEGIN_DATE` / `END_DATE` | `BeginDate` / `EndDate` | Validity |
| admin fields | | as above |

## Master data (code tables)

| Table | Draft table | Key | Fields |
|-------|-------------|-----|--------|
| `ZSRC_TYPE_T` | `ZZM_SRC_TPE_DMOF` | `TYPE_CODE` | `TYPE_NAME` |
| `ZSRC_METH_T` | `ZZM_SRC_METH_T_D` | `METHOD_CODE` | `METHOD_NAME` |
| `ZSRC_NAT_T` | `ZZM_SRC_NT_DMOF` | `NATURE_CODE` | `NATURE_NAME` |
| `ZSRC_PT_T` | `ZZM_SRC_PT_DMOF` | `PT_CODE` | `PT_NAME`, `IS_ACTIVE` |
| `ZSRC_GE_T` | `ZZM_SRC_GE_DMOF` | `GE_CODE` (CHAR 20) | `GE_NAME` (CHAR 120), `REGION` (CHAR 60), `IBAN` (CHAR 34), `IS_ACTIVE` |

All five also carry the standard RAP admin fields `LOCAL_CREATED_BY`, `LOCAL_CREATED_AT`,
`LOCAL_LAST_CHANGED_BY`, `LOCAL_LAST_CHANGED_AT`, `LAST_CHANGED_AT`.

## SRC Details and catalogs

All keyed by `UUID` (`SYSUUID_X16`); children reference the root through `PARENT_UUID`.
Validity dates `BEGDA`/`ENDDA` are `DATN`. `OBJECT_TYPE`/`OBJECT_ID` are CHAR 10.

| Table | Draft table | Fields |
|-------|-------------|--------|
| `ZYM_SRCDTAILSMOF` | `ZYM_SRCDTLS_DMOF` | `OBJECT_TYPE`, `OBJECT_ID`, `BEGDA`, `ENDDA`, `STEXT` (CHAR 100), `LTEXT` (CHAR 200), admin fields |
| `ZYM_SRCCLSSFCMOF` | `ZYM_SRCCLSS_DMOF` | `PARENT_UUID`, `OBJECT_TYPE`, `OBJECT_ID`, `BEGDA`, `ENDDA`, `GFS`, `NATURAL_ACCOUNT` |
| `ZYM_SRCPRICEMOF` | `ZYM_SRCPRCE_DMOF` | `PARENT_UUID`, `OBJECT_TYPE`, `OBJECT_ID`, `BEGDA`, `ENDDA`, `PRICE`, `CURRENCY_CODE` |
| `ZYM_SRCDSCUNTMOF` | `ZYM_SRCDSCN_DMOF` | `PARENT_UUID`, `OBJECT_TYPE`, `OBJECT_ID`, `BEGDA`, `ENDDA`, `DISCOUNT`, `CURRENCY` |
| `ZYM_SRCRLTIONMOF` | `ZYM_SRCRLTN_DMOF` | `PARENT_UUID`, `FOTYPE`, `FOBJID`, `BEGDA`, `ENDDA`, `RELATION_TYPE`, `RELATION_ID`, `TOTYPE`, `TOBJID` |
| `ZYM_YBJCTTYPEMOF` | `ZYM_YBJCTTP_DMOF` | `OBJECT_TYPE`, `OBJECT_NAME_AR`, `OBJECT_NAME_EN`, admin fields |
| `ZYM_YRELATIONMOF` | `ZYM_YRLTION_DMOF` | `RELATION_TYPE`, `RELATION`, `RELATION_NAME_AR`, `RELATION_NAME_EN`, admin fields |
