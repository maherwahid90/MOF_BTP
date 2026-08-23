@Metadata.allowExtensions: true
@Metadata.ignorePropagatedAnnotations: true
@Endusertext: {
  Label: '###GENERATED Core Data Service Entity'
}
@Objectmodel: {
  Sapobjectnodetype.Name: 'ZZM_SRC_GE_TMOF'
}
@AccessControl.authorizationCheck: #MANDATORY
define root view entity ZZM_C_SRC_GE_TMOF
  provider contract TRANSACTIONAL_QUERY
  as projection on ZZM_R_SRC_GE_TMOF
  association [1..1] to ZZM_R_SRC_GE_TMOF as _BaseEntity on $projection.GECODE = _BaseEntity.GECODE
{
  key GeCode,
  GeName,
  Region,
  Iban,
  IsActive,
  @Semantics: {
    User.Createdby: true
  }
  LocalCreatedBy,
  @Semantics: {
    Systemdatetime.Createdat: true
  }
  LocalCreatedAt,
  @Semantics: {
    User.Localinstancelastchangedby: true
  }
  LocalLastChangedBy,
  @Semantics: {
    Systemdatetime.Localinstancelastchangedat: true
  }
  LocalLastChangedAt,
  @Semantics: {
    Systemdatetime.Lastchangedat: true
  }
  LastChangedAt,
  _BaseEntity
}
