const cds = require('@sap/cds')
const { describe, it } = require('node:test')
const assert = require('node:assert/strict')

const { GET, POST, PATCH, DELETE } = cds.test(__dirname + '/..')

const SRC = '/odata/v4/src'
const ADMIN = '/odata/v4/admin'
const as = user => ({ auth: { username: user, password: user } })
const alice = as('alice') // editor + admin
const bob = as('bob') // approver
const carol = as('carol') // viewer

const MUNICIPAL_SECTION = '11111111-0000-4000-8000-000000000002'
const COMMERCE_ITEM_SUBMITTED = '11111111-0000-4000-8000-000000000006'

async function rejects(promise, status, code) {
  const err = await promise.then(() => null, e => e)
  assert.ok(err, 'request should fail')
  assert.equal(err.response?.status ?? err.status, status)
  if (code) {
    const body = err.response.data.error
    const codes = [body.message, ...(body.details ?? []).map(d => d.message)].join(' | ')
    assert.match(codes, code)
  }
}

async function createItem(code, extra = {}) {
  const { data } = await POST(`${SRC}/SrcNodes`, {
    code, name: `Item ${code}`, type_code: 'ITEM', parent_ID: MUNICIPAL_SECTION, ...extra
  }, alice)
  return data
}

describe('SRC hierarchy', () => {
  it('lets every role read and exposes the user roles', async () => {
    const { data } = await GET(`${SRC}/SrcNodes?$select=code`, carol)
    assert.ok(data.value.length >= 8)
    const { data: me } = await GET(`${SRC}/userInfo()`, bob)
    assert.deepEqual(me.roles, ['SrcViewer', 'SrcApprover'])
  })

  it('sets status, active flag and level on create', async () => {
    const node = await createItem('9001', { status: '03', isActive: true })
    assert.equal(node.status, '01')
    assert.equal(node.isActive, false)
    assert.equal(node.level, 3)
  })

  it('rejects writes from viewers', async () => {
    await rejects(POST(`${SRC}/SrcNodes`, { code: 'X', name: 'X', type_code: 'ITEM' }, carol), 403)
  })

  it('validates codes, dates, amounts and percentages', async () => {
    await rejects(createItem('1101'), 409, /already exists/)
    await rejects(createItem('9002', { startDate: '2025-05-01', endDate: '2025-01-01' }), 400, /end date/)
    await rejects(createItem('9003', { price: 10, discount: 11 }), 400, /discount/)
    await rejects(createItem('9004', { naturePct: 120 }), 400, /percentage/)
    await rejects(createItem('9005', {
      govEntities: [{ govEntity_code: 'MOF', collectionPct: 70 }, { govEntity_code: 'MUN', collectionPct: 40 }]
    }), 400, /110%/)
    await rejects(createItem('9006', {
      payMethods: [{ payType_code: 'SADAD' }, { payType_code: 'SADAD' }]
    }), 400, /more than once/)
  })

  it('runs submit → reject → resubmit → approve', async () => {
    const { ID } = await createItem('9010', { price: 100 })
    const url = `${SRC}/SrcNodes(${ID})`

    await rejects(POST(`${url}/SrcService.approve`, {}, bob), 409, /waiting for approval/)
    await rejects(POST(`${url}/SrcService.submitForApproval`, {}, bob), 403)

    let { data } = await POST(`${url}/SrcService.submitForApproval`, {}, alice)
    assert.equal(data.status, '02')
    assert.equal(data.submittedBy, 'alice')

    await rejects(PATCH(url, { name: 'changed' }, alice), 409, /waiting for approval/)
    await rejects(POST(`${url}/SrcService.approve`, {}, alice), 403)
    await rejects(POST(`${url}/SrcService.rejectNode`, { reason: ' ' }, bob), 400, /reason/)

    ;({ data } = await POST(`${url}/SrcService.rejectNode`, { reason: 'Price missing source' }, bob))
    assert.equal(data.status, '04')
    assert.equal(data.rejectionReason, 'Price missing source')

    await POST(`${url}/SrcService.submitForApproval`, {}, alice)
    ;({ data } = await POST(`${url}/SrcService.approve`, {}, bob))
    assert.equal(data.status, '03')
    assert.equal(data.isActive, true)
    assert.equal(data.decidedBy, 'bob')

    // changing an approved node sends it back to "new"
    ;({ data } = await PATCH(url, { price: 120 }, alice))
    assert.equal(data.status, '01')
    assert.equal(data.rejectionReason, null)
  })

  it('moves nodes, prevents cycles and recalculates levels', async () => {
    const parent = await createItem('9020')
    const child = await createItem('9021', { parent_ID: parent.ID })
    assert.equal(child.level, 4)

    await rejects(PATCH(`${SRC}/SrcNodes(${parent.ID})`, { parent_ID: child.ID }, alice), 400, /descendants/)
    await rejects(PATCH(`${SRC}/SrcNodes(${parent.ID})`, { parent_ID: parent.ID }, alice), 400, /descendants/)

    await PATCH(`${SRC}/SrcNodes(${parent.ID})`, { parent_ID: null }, alice)
    const { data } = await GET(`${SRC}/SrcNodes(${child.ID})?$select=level`, alice)
    assert.equal(data.level, 2)
  })

  it('protects nodes with children or pending approval from deletion', async () => {
    await rejects(DELETE(`${SRC}/SrcNodes(${MUNICIPAL_SECTION})`, alice), 409, /child nodes/)
    await rejects(DELETE(`${SRC}/SrcNodes(${COMMERCE_ITEM_SUBMITTED})`, alice), 409, /waiting for approval/)
    const { ID } = await createItem('9030')
    await DELETE(`${SRC}/SrcNodes(${ID})`, alice)
  })

  it('replaces payment methods and agent entities with a deep update', async () => {
    const { ID } = await createItem('9040', { payMethods: [{ payType_code: 'SADAD' }] })
    await PATCH(`${SRC}/SrcNodes(${ID})`, {
      payMethods: [{ payType_code: 'MADA' }, { payType_code: 'CARD' }],
      govEntities: [{ govEntity_code: 'MOF', collectionPct: 25 }]
    }, alice)
    const { data } = await GET(`${SRC}/SrcNodes(${ID})?$expand=payMethods,govEntities`, alice)
    assert.deepEqual(data.payMethods.map(p => p.payType_code).sort(), ['CARD', 'MADA'])
    assert.equal(data.govEntities.length, 1)
  })
})

describe('Master data', () => {
  it('only lets admins maintain codes and blocks deleting codes in use', async () => {
    await rejects(POST(`${ADMIN}/SrcTypes`, { code: 'NEW', name: 'New' }, bob), 403)
    await POST(`${ADMIN}/SrcTypes`, { code: 'NEW', name: 'New' }, alice)
    await DELETE(`${ADMIN}/SrcTypes('NEW')`, alice)
    await rejects(DELETE(`${ADMIN}/SrcTypes('ITEM')`, alice), 409, /in use/)
  })
})
