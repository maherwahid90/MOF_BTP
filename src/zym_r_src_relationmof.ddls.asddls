@AccessControl.authorizationCheck: #MANDATORY
@Metadata.allowExtensions: true
@EndUserText.label: '###GENERATED Core Data Service Entity'
define view entity ZYM_R_SRC_RELATIONMOF
  as select from ZYM_SRCRLTIONMOF as src_relation
  association to parent ZYM_R_SRC_DETAILSMOF as _Src_details on $projection.ParentUuid = _Src_details.Uuid
{
  key uuid as UUID,
  parent_uuid as ParentUUID,
  fotype as Fotype,
  fobjid as Fobjid,
  begda as Begda,
  endda as Endda,
  relation_type as RelationType,
  relation_id as RelationID,
  totype as Totype,
  tobjid as Tobjid,
  _Src_details
}
