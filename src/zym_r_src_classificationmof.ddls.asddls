@AccessControl.authorizationCheck: #MANDATORY
@Metadata.allowExtensions: true
@EndUserText.label: '###GENERATED Core Data Service Entity'
define view entity ZYM_R_SRC_CLASSIFICATIONMOF
  as select from ZYM_SRCCLSSFCMOF as SRC_classification
  association to parent ZYM_R_SRC_DETAILSMOF as _Src_details on $projection.ParentUuid = _Src_details.Uuid
{
  key uuid as UUID,
  parent_uuid as ParentUUID,
  object_type as ObjectType,
  object_id as ObjectID,
  begda as Begda,
  endda as Endda,
  gfs as Gfs,
  natural_account as NaturalAccount,
  _Src_details
}
