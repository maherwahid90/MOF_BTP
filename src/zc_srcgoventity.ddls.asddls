
@Metadata.allowExtensions: true
@EndUserText.label: 'SRC Government Entity - Projection'
@AccessControl.authorizationCheck: #NOT_REQUIRED
define view entity ZC_SrcGovEntity
  as projection on ZI_SrcGovEntity
{
  key GovEntityRowUUID,
      NodeUUID,

      @Consumption.valueHelpDefinition: [{ entity: { name: 'ZI_GovEntity_VH', element: 'GovEntityCode' } }]
      @ObjectModel.text.element: [ 'GovEntityName' ]
      GovEntityCode,
      _GEMaster.GovEntityName as GovEntityName,

      CollectionPct,
      BeginDate,
      EndDate,
      CreatedBy, CreatedAt, LastChangedBy, LocalLastChangedAt,
      _Node : redirected to parent ZC_SrcNode,
      _GEMaster
}
