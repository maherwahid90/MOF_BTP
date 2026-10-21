const cds = require('@sap/cds')
const fs = require('node:fs')
const path = require('node:path')

const LOG = cds.log('seed')
const DIR = path.join(__dirname, 'sample-data')

// parents before children
const FILES = [
  'SrcTypes', 'SrcMethods', 'SrcNatures', 'PaymentTypes', 'GovEntities', 'ObjectTypes', 'RelationTypes',
  'SrcNodes', 'SrcPayMethods', 'SrcGovEntities',
  'SrcDetails', 'SrcClassifications', 'SrcPrices', 'SrcRelations'
]

/**
 * Loads the demo data from srv/sample-data once, when the database has no master data yet.
 * Unlike CSV files in db/data, this never overwrites data on later deployments.
 * Runs by default in development; on BTP it is controlled by SEED_SAMPLE_DATA (see mta.yaml).
 */
module.exports = async function seed() {
  const setting = process.env.SEED_SAMPLE_DATA ?? (cds.env.production ? 'false' : 'true')
  if (setting !== 'true') return

  const entities = cds.entities('mof.src')
  if (await SELECT.one.from(entities.SrcTypes).columns('code')) return

  await cds.tx(async tx => {
    for (const name of FILES) {
      const entity = entities[name]
      const rows = parseCsv(fs.readFileSync(path.join(DIR, `mof.src-${name}.csv`), 'utf8'), entity)
      if (rows.length) await tx.run(INSERT.into(entity).entries(rows))
    }
  })
  LOG.info('loaded sample data from', DIR)
}

function parseCsv(text, entity) {
  const [header, ...lines] = text.split(/\r?\n/).filter(line => line.trim())
  const columns = header.split(';')
  return lines.map(line => {
    const values = line.split(';')
    const row = {}
    columns.forEach((column, i) => {
      const value = values[i] ?? ''
      if (value === '') return
      const type = entity.elements[column]?.type
      if (type === 'cds.Boolean') row[column] = value === 'true'
      else if (type === 'cds.Integer') row[column] = Number(value)
      else row[column] = value
    })
    return row
  })
}
