@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'SRC Payment Method - Interface'
@Metadata.ignorePropagatedAnnotations: true
define view entity ZI_SrcPayMethod
  as select from zsrc_paym
  association to parent ZI_SrcNode as _Node
    on $projection.NodeUUID = _Node.NodeUUID
  association [0..1] to ZI_PayType_VH as _PayTypeMaster on $projection.PayType = _PayTypeMaster.PayType
{
  key pm_uuid                       as PayMethodUUID,
      node_uuid                     as NodeUUID,
      pay_type                      as PayType,         -- VH payment type master
      pay_name                      as PayName,
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
      _PayTypeMaster
}
