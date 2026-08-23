@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'SRC Node - Interface'
@Metadata.ignorePropagatedAnnotations: true
@ObjectModel.usageType:{ serviceQuality: #X, sizeCategory: #S, dataClass: #MIXED }
define root view entity ZI_SrcNode
  as select from zsrc_node
  composition [0..*] of ZI_SrcPayMethod as _PayMethod
  composition [0..*] of ZI_SrcGovEntity as _GovEntity
  association [0..1] to ZI_SrcNode      as _Parent
    on $projection.ParentUUID = _Parent.NodeUUID
  association [0..1] to ZI_SrcType_VH   as _SrcType   on $projection.SrcType   = _SrcType.SrcType
  association [0..1] to ZI_SrcMethod_VH as _SrcMethod on $projection.SrcMethod = _SrcMethod.SrcMethod
  association [0..1] to ZI_SrcNature_VH as _SrcNature on $projection.SrcNature = _SrcNature.SrcNature
  association [0..1] to ZI_GovEntity_VH as _OwnerGE   on $projection.OwnerGECode = _OwnerGE.GovEntityCode
{
  key node_uuid                     as NodeUUID,
      parent_uuid                   as ParentUUID,
      node_level                    as NodeLevel,
      // ---- SRC master data ----
      src_code                      as SrcCode,
      src_type                      as SrcType,
      src_name                      as SrcName,
      src_desc                      as SrcDesc,
      gfs_code                      as GfsCode,
      natural_account               as NaturalAccount,
      is_refundable                 as IsRefundable,
      src_method                    as SrcMethod,
      g2c                           as G2C,
      g2b                           as G2B,
      g2g                           as G2G,
      src_nature                    as SrcNature,
      src_nature_pct                as SrcNaturePct,
      owner_ge_code                 as OwnerGECode,
      start_date                    as StartDate,
      end_date                      as EndDate,
      @Semantics.amount.currencyCode: 'CurrencyCode'
      price                         as Price,
      @Semantics.amount.currencyCode: 'CurrencyCode'
      discount                      as Discount,
   //   @Semantics.currencyCode: true
      currency_code                 as CurrencyCode,
      // ---- workflow ----
      processing_status             as ProcessingStatus,
      is_active                     as IsActive,
      // ---- admin ----
      @Semantics.user.createdBy: true
      created_by                    as CreatedBy,
      @Semantics.systemDateTime.createdAt: true
      created_at                    as CreatedAt,
      @Semantics.user.lastChangedBy: true
      last_changed_by               as LastChangedBy,
      @Semantics.systemDateTime.lastChangedAt: true
      last_changed_at               as LastChangedAt,
      @Semantics.systemDateTime.localInstanceLastChangedAt: true
      local_last_changed_at         as LocalLastChangedAt,
      // ---- associations ----
     _PayMethod,
      _GovEntity,
      _Parent,
      _SrcType,
      _SrcMethod,
      _SrcNature,
      _OwnerGE
}
