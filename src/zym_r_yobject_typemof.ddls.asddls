@AccessControl.authorizationCheck: #MANDATORY
@Metadata.allowExtensions: true
@ObjectModel.sapObjectNodeType.name: 'ZYM_yobjectMOF'
@EndUserText.label: '###GENERATED Core Data Service Entity'
define root view entity ZYM_R_YOBJECT_TYPEMOF
  as select from ZYM_YBJCTTYPEMOF as yobject_type
{
  key uuid as UUID,
  object_type as ObjectType,
  object_name_ar as ObjectNameAr,
  object_name_en as ObjectNameEn,
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
