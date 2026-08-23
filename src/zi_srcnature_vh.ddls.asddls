@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'SRC Nature - Value Help'
@ObjectModel.resultSet.sizeCategory: #XS
define view entity ZI_SrcNature_VH as select from zsrc_nat_t {
  key nature_code as SrcNature,
      nature_name as SrcNatureName
}
