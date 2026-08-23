@AccessControl.authorizationCheck: #MANDATORY
@Metadata.allowExtensions: true
@ObjectModel.sapObjectNodeType.name: 'ZYM_Src_detailsMOF'
@EndUserText.label: '###GENERATED Core Data Service Entity'
define root view entity ZYM_R_SRC_DETAILSMOF
  as select from zym_srcdtailsmof as Src_details
  composition [1..*] of ZYM_R_SRC_CLASSIFICATIONMOF as _SRC_classification
  composition [1..*] of ZYM_R_SRC_PRICEMOF as _SRC_Price
  composition [1..*] of ZYM_R_SRC_DISCOUNTMOF as _SRC_discount
  composition [1..*] of ZYM_R_SRC_RELATIONMOF as _src_relation
{
  key uuid as UUID,
  object_type as ObjectType,
  object_id as ObjectID,
  begda as Begda,
  endda as Endda,
  stext as Stext,
  ltext as Ltext,
  @Semantics.user.createdBy: true
  local_created_by as LocalCreatedBy,
  @Semantics.systemDateTime.createdAt: true
  local_created_at as LocalCreatedAt,
  @Semantics.user.localInstanceLastChangedBy: true
  local_last_changed_by as LocalLastChangedBy,
  @Semantics.systemDateTime.localInstanceLastChangedAt: true
  local_last_changed_at as LocalLastChangedAt,
  @Semantics.systemDateTime.lastChangedAt: true
  last_changed_at as LastChangedAt,
  _SRC_classification,
  _SRC_Price,
  _SRC_discount,
  _src_relation
}
