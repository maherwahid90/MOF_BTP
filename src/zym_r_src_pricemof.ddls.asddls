@AccessControl.authorizationCheck: #MANDATORY
@Metadata.allowExtensions: true
@EndUserText.label: '###GENERATED Core Data Service Entity'
define view entity ZYM_R_SRC_PRICEMOF
  as select from ZYM_SRCPRICEMOF as SRC_Price
  association to parent ZYM_R_SRC_DETAILSMOF as _Src_details on $projection.ParentUuid = _Src_details.Uuid
{
  key uuid as UUID,
  parent_uuid as ParentUUID,
  object_type as ObjectType,
  object_id as ObjectID,
  begda as Begda,
  endda as Endda,
  price as Price,
  @Consumption.valueHelpDefinition: [ {
    entity.name: 'I_CurrencyStdVH', 
    entity.element: 'Currency', 
    useForValidation: true
  } ]
  currency_code as CurrencyCode,
  _Src_details
}
