@AccessControl.authorizationCheck: #MANDATORY
@Metadata.allowExtensions: true
@ObjectModel.sapObjectNodeType.name: 'ZZM_SRC_GE_TMOF'
@EndUserText.label: '###GENERATED Core Data Service Entity'
define root view entity ZZM_R_SRC_GE_TMOF
  as select from ZSRC_GE_T
{
  key ge_code as GeCode,
  ge_name as GeName,
  region as Region,
  iban as Iban,
  is_active as IsActive,
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
