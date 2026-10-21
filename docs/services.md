# Services

All bindings are published, service version `0001`.

| Service binding | Type | Service definition | Exposed entities |
|-----------------|------|--------------------|------------------|
| `ZC_SRCNODE_SB` | OData V4 | `ZC_SRCNODE_SD` | `ZC_SrcNode`, `ZC_SrcPayMethod`, `ZC_SrcGovEntity`, `ZI_SrcType_VH`, `ZI_SrcMethod_VH`, `ZI_SrcNature_VH`, `ZI_GovEntity_VH` |
| `ZYM_UI_SRC_DETAILS_O4MOF` | OData V4 UI | `ZYM_UI_SRC_DETAILS_O4MOF` | `Src_details`, `SRC_classification`, `SRC_Price`, `SRC_discount`, `src_relation` |
| `ZYM_UI_SRC_DETAILS_ODATAV2` | OData V2 | `ZYM_UI_SRC_DETAILS_O4MOF` | same as above |
| `ZYM_UI_YOBJECT_O4MOF` | OData V4 UI | `ZYM_UI_YOBJECT_O4MOF` | `yobject_type` |
| `ZYM_UI_YRELATION_O4MOF` | OData V4 UI | `ZYM_UI_YRELATION_O4MOF` | `yrelation` |
| `ZZM_UI_SRC_GE_T_O4MOF` | OData V4 UI | `ZZM_UI_SRC_GE_T_O4MOF` | `ZZM_C_SRC_GE_TMOF` |
| `ZZM_UI_SRC_TYPE_T_O4MOF` | OData V4 UI | `ZZM_UI_SRC_TYPE_T_O4MOF` | `ZZM_C_SRC_TYPE_TMOF` |
| `ZZM_UI_SRC_METH_T_O4` | OData V4 UI | `ZZM_UI_SRC_METH_T_O4` | `ZZM_C_SRC_METH_T` |
| `ZZM_UI_SRC_NAT_T_O4MOF` | OData V4 UI | `ZZM_UI_SRC_NAT_T_O4MOF` | `ZZM_C_SRC_NAT_TMOF` |
| `ZZM_UI_SRC_PT_T_O4MOF` | OData V4 UI | `ZZM_UI_SRC_PT_T_O4MOF` | `ZZM_C_SRC_PT_TMOF` |

The OData V4 bindings are on the standard path:

```
/sap/opu/odata4/sap/<binding_name_lowercase>/srvd/sap/<service_definition_lowercase>/0001/
```

Use **Preview** on the binding in ADT to open a Fiori elements list report without deploying a UI app.

## SRC Hierarchy service (`ZC_SRCNODE_SD`)

- Leading entity: `zsrc_hierarchy`, so the list report renders as a tree.
- Operations on `SrcNode`: create, update, delete, the draft actions, `submitForApproval`, `approve`, `reject`,
  create-by-association for `_PayMethod` and `_GovEntity`, and the link actions `linkManager` / `unlinkManager` on `_Parent`.
- `GovEntity` and `PayMethod`: update, delete, navigation to `_Node`.

### Value helps

| Field | Value help entity | Element | Backing table |
|-------|-------------------|---------|---------------|
| `ZC_SrcNode.SrcType` | `ZI_SrcType_VH` | `SrcType` | `ZSRC_TYPE_T` |
| `ZC_SrcNode.SrcMethod` | `ZI_SrcMethod_VH` | `SrcMethod` | `ZSRC_METH_T` |
| `ZC_SrcNode.SrcNature` | `ZI_SrcNature_VH` | `SrcNature` | `ZSRC_NAT_T` |
| `ZC_SrcNode.OwnerGECode` | `ZI_GovEntity_VH` | `GovEntityCode` | `ZSRC_GE_T` |
| `ZC_SrcNode.CurrencyCode` | `I_Currency` | `Currency` | SAP standard |
| `ZC_SrcGovEntity.GovEntityCode` | `ZI_GovEntity_VH` | `GovEntityCode` | `ZSRC_GE_T` |
| `ZC_SrcPayMethod.PayType` | `ZI_PayType_VH` | `PayType` | `ZSRC_PT_T` |

`ZYM_R_SRC_PRICEMOF` and `ZYM_R_SRC_DISCOUNTMOF` define currency value helps on `I_CurrencyStdVH` (also used for validation).

## Generated service artifacts

| Files | Object | Purpose |
|-------|--------|---------|
| `*_0001_g4ba.sco2.xml` | Service group publication (`G4BA`) | OData V4 service group, released for customer communication scenarios |
| `*ht.sush.xml` | Authorization default values | `S_START` defaults for the published services, used when adding them to IAM apps |
| `ytest.sktd.xml`, `ytest2.sktd.xml` | Knowledge transfer documents | Attached to `ZYM_UI_SRC_DETAILS_ODATAV2` and `ZYM_C_SRC_DETAILSMOF`; test documents |
