const cds = require('@sap/cds')

/** Master data entity → [database entity, foreign key] pairs that reference it. */
const USAGES = {
  SrcTypes: [['SrcNodes', 'type_code']],
  SrcMethods: [['SrcNodes', 'method_code']],
  SrcNatures: [['SrcNodes', 'nature_code']],
  PaymentTypes: [['SrcPayMethods', 'payType_code']],
  GovEntities: [['SrcNodes', 'ownerGovEntity_code'], ['SrcGovEntities', 'govEntity_code']],
  ObjectTypes: [['SrcDetails', 'objectType_code'], ['SrcRelations', 'fromType_code'], ['SrcRelations', 'toType_code']],
  RelationTypes: [['SrcRelations', 'relationType_code']]
}

module.exports = class AdminService extends cds.ApplicationService {
  init() {
    const db = cds.entities('mof.src')

    for (const [name, usages] of Object.entries(USAGES)) {
      // codes that are still referenced must not be deleted
      this.before('DELETE', this.entities[name], async req => {
        const code = req.data.code
        for (const [target, column] of usages) {
          const used = await SELECT.one.from(db[target]).columns(column).where({ [column]: code })
          if (used) return req.reject(409, 'CODE_IN_USE', [code])
        }
      })
    }

    return super.init()
  }
}
