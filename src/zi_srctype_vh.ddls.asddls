@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'SRC Type - Value Help'
@ObjectModel.resultSet.sizeCategory: #XS
define view entity ZI_SrcType_VH as select from zsrc_type_t {
  key type_code as SrcType,
      type_name as SrcTypeName
}
