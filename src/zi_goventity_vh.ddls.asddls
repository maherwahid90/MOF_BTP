@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'Government Entity - Value Help'
//@ObjectModel.resultSet.sizeCategory: #XS
define view entity ZI_GovEntity_VH as select from zsrc_ge_t {
  key ge_code as GovEntityCode,
      ge_name as GovEntityName,
      region  as Region
}
