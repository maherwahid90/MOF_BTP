@AccessControl.authorizationCheck: #MANDATORY
@Metadata.allowExtensions: true
@ObjectModel.sapObjectNodeType.name: 'ZYM_yrelationMOF'
@EndUserText.label: '###GENERATED Core Data Service Entity'
define root view entity ZYM_R_YRELATIONMOF
  as select from ZYM_YRELATIONMOF as yrelation
{
  key uuid as UUID,
  relation_type as RelationType,
  relation as Relation,
  relation_name_ar as RelationNameAr,
  relation_name_en as RelationNameEn,
  @Semantics.user.createdBy: true
  local_created_by as LocalCreatedBy,
  @Semantics.systemDateTime.createdAt: true
  local_created_at as LocalCreatedAt,
  @Semantics.user.localInstanceLastChangedBy: true
  local_last_changed_by as LocalLastChangedBy,
  @Semantics.systemDateTime.localInstanceLastChangedAt: true
  local_last_changed_at as LocalLastChangedAt,
  @Semantics.systemDateTime.lastChangedAt: true
  last_changed_at as LastChangedAt
}
