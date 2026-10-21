const cds = require('@sap/cds')

const CHILD_LISTS = ['classifications', 'prices', 'discounts', 'relations']

module.exports = class DetailsService extends cds.ApplicationService {
  init() {
    const { SrcDetails } = this.entities

    this.before(['CREATE', 'UPDATE'], SrcDetails, req => {
      const details = req.data
      if (details.begda && details.endda && details.endda < details.begda) {
        req.error(400, 'END_BEFORE_START', 'endda')
      }
      for (const list of CHILD_LISTS) {
        ;(details[list] ?? []).forEach((record, i) => {
          if (record.begda && record.endda && record.endda < record.begda) {
            req.error(400, 'END_BEFORE_START', `${list}[${i}]/endda`)
          }
          for (const amount of ['price', 'discount']) {
            if (record[amount] != null && record[amount] < 0) {
              req.error(400, 'NEGATIVE_AMOUNT', `${list}[${i}]/${amount}`)
            }
          }
        })
      }
    })

    return super.init()
  }
}
