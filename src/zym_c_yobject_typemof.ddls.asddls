@Metadata.allowExtensions: true
@Metadata.ignorePropagatedAnnotations: true
@Endusertext: {
  Label: '###GENERATED Core Data Service Entity'
}
@Objectmodel: {
  Sapobjectnodetype.Name: 'ZYM_yobjectMOF'
}
@AccessControl.authorizationCheck: #MANDATORY
define root view entity ZYM_C_YOBJECT_TYPEMOF
  provider contract TRANSACTIONAL_QUERY
  as projection on ZYM_R_YOBJECT_TYPEMOF
  association [1..1] to ZYM_R_YOBJECT_TYPEMOF as _BaseEntity on $projection.UUID = _BaseEntity.UUID
{
  key UUID,
  ObjectType,
  ObjectNameAr,
  ObjectNameEn,
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
