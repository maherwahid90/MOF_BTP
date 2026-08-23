@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'SRC Government Entity - Interface'
@Metadata.ignorePropagatedAnnotations: true
define view entity ZI_SrcGovEntity
  as select from zsrc_gov
  association to parent ZI_SrcNode as _Node
    on $projection.NodeUUID = _Node.NodeUUID
  association [0..1] to ZI_GovEntity_VH as _GEMaster on $projection.GovEntityCode = _GEMaster.GovEntityCode
{
  key ge_uuid                       as GovEntityRowUUID,
      node_uuid                     as NodeUUID,
      ge_code                       as GovEntityCode,   -- VH gov entity master
      collection_pct                as CollectionPct,   -- percentage of collection
      begin_date                    as BeginDate,
      end_date                      as EndDate,
      @Semantics.user.createdBy: true
      created_by                    as CreatedBy,
      @Semantics.systemDateTime.createdAt: true
      created_at                    as CreatedAt,
      @Semantics.user.lastChangedBy: true
      last_changed_by               as LastChangedBy,
      @Semantics.systemDateTime.localInstanceLastChangedAt: true
      local_last_changed_at         as LocalLastChangedAt,
      _Node,
      _GEMaster
}
