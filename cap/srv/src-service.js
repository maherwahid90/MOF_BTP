const cds = require('@sap/cds')

const STATUS = { New: '01', Submitted: '02', Approved: '03', Rejected: '04' }
const ROLES = ['SrcViewer', 'SrcEditor', 'SrcApprover', 'SrcAdmin']

module.exports = class SrcService extends cds.ApplicationService {
  init() {
    const { SrcNodes } = this.entities
    const { SrcNodes: Nodes, SrcPayMethods, SrcGovEntities } = cds.entities('mof.src')

    // --- create ------------------------------------------------------------

    this.before('CREATE', SrcNodes, async req => {
      const node = req.data
      node.status = STATUS.New
      node.isActive = false
      if (node.parent_ID) {
        const parent = await SELECT.one.from(Nodes, node.parent_ID).columns('ID', 'level')
        if (!parent) return req.reject(400, 'PARENT_NOT_FOUND', 'parent_ID')
        node.level = parent.level + 1
      } else {
        node.level = 1
      }
      await validateNode(req, node)
    })

    // --- update ------------------------------------------------------------

    this.before('UPDATE', SrcNodes, async req => {
      const current = await SELECT.one.from(Nodes, req.data.ID)
      if (!current) return req.reject(404, 'NODE_NOT_FOUND')
      if (current.status === STATUS.Submitted) return req.reject(409, 'NODE_LOCKED_SUBMITTED')

      const changes = req.data
      if ('parent_ID' in changes && changes.parent_ID !== current.parent_ID) {
        changes.level = await levelForParent(req, current.ID, changes.parent_ID)
        req._parentChanged = true
      }
      // any change to an approved or rejected node sends it back through approval
      if (current.status !== STATUS.New) {
        Object.assign(changes, {
          status: STATUS.New,
          rejectionReason: null,
          decidedBy: null,
          decidedAt: null
        })
      }

      const merged = { ...current, ...changes }
      if (!changes.payMethods) merged.payMethods = await SELECT.from(SrcPayMethods).where({ node_ID: current.ID })
      if (!changes.govEntities) merged.govEntities = await SELECT.from(SrcGovEntities).where({ node_ID: current.ID })
      await validateNode(req, merged)
    })

    this.after('UPDATE', SrcNodes, async (_, req) => {
      if (req._parentChanged) await relevelSubtree(req.data.ID)
    })

    // --- delete ------------------------------------------------------------

    this.before('DELETE', SrcNodes, async req => {
      const ID = req.data.ID
      const node = await SELECT.one.from(Nodes, ID).columns('status')
      if (!node) return req.reject(404, 'NODE_NOT_FOUND')
      if (node.status === STATUS.Submitted) return req.reject(409, 'NODE_LOCKED_SUBMITTED')
      const child = await SELECT.one.from(Nodes).columns('ID').where({ parent_ID: ID })
      if (child) return req.reject(409, 'NODE_HAS_CHILDREN')
    })

    // --- workflow actions --------------------------------------------------

    this.on('submitForApproval', SrcNodes, async req => {
      const node = await nodeFor(req)
      if (node.status !== STATUS.New && node.status !== STATUS.Rejected) {
        return req.reject(409, 'INVALID_STATUS_SUBMIT')
      }
      await UPDATE(Nodes, node.ID).with({
        status: STATUS.Submitted,
        submittedBy: req.user.id,
        submittedAt: new Date().toISOString(),
        rejectionReason: null,
        decidedBy: null,
        decidedAt: null
      })
      return SELECT.one.from(SrcNodes, node.ID)
    })

    this.on('approve', SrcNodes, async req => {
      const node = await nodeFor(req)
      if (node.status !== STATUS.Submitted) return req.reject(409, 'INVALID_STATUS_DECIDE')
      await UPDATE(Nodes, node.ID).with({
        status: STATUS.Approved,
        isActive: true,
        decidedBy: req.user.id,
        decidedAt: new Date().toISOString()
      })
      return SELECT.one.from(SrcNodes, node.ID)
    })

    this.on('rejectNode', SrcNodes, async req => {
      const node = await nodeFor(req)
      if (node.status !== STATUS.Submitted) return req.reject(409, 'INVALID_STATUS_DECIDE')
      const reason = req.data.reason?.trim()
      if (!reason) return req.reject(400, 'REJECTION_REASON_REQUIRED', 'reason')
      await UPDATE(Nodes, node.ID).with({
        status: STATUS.Rejected,
        rejectionReason: reason,
        decidedBy: req.user.id,
        decidedAt: new Date().toISOString()
      })
      return SELECT.one.from(SrcNodes, node.ID)
    })

    this.on('userInfo', req => ({
      id: req.user.id,
      roles: ROLES.filter(role => req.user.is(role))
    }))

    // --- helpers -----------------------------------------------------------

    async function nodeFor(req) {
      const key = req.params[0]
      const ID = typeof key === 'object' ? key.ID : key
      const node = await SELECT.one.from(Nodes, ID)
      if (!node) req.reject(404, 'NODE_NOT_FOUND')
      return node
    }

    /** Level of a node moved under newParentID; rejects self-references and cycles. */
    async function levelForParent(req, ID, newParentID) {
      if (!newParentID) return 1
      if (newParentID === ID) return req.reject(400, 'PARENT_CYCLE', 'parent_ID')
      let parent = await SELECT.one.from(Nodes, newParentID).columns('ID', 'parent_ID', 'level')
      if (!parent) return req.reject(400, 'PARENT_NOT_FOUND', 'parent_ID')
      const level = parent.level + 1
      // walk up from the new parent: reaching the node itself means a cycle
      while (parent?.parent_ID) {
        if (parent.parent_ID === ID) return req.reject(400, 'PARENT_CYCLE', 'parent_ID')
        parent = await SELECT.one.from(Nodes, parent.parent_ID).columns('ID', 'parent_ID')
      }
      return level
    }

    async function relevelSubtree(rootID) {
      const root = await SELECT.one.from(Nodes, rootID).columns('ID', 'level')
      let layer = [root]
      while (layer.length) {
        const next = []
        for (const node of layer) {
          const children = await SELECT.from(Nodes).columns('ID').where({ parent_ID: node.ID })
          for (const child of children) {
            await UPDATE(Nodes, child.ID).with({ level: node.level + 1 })
            next.push({ ID: child.ID, level: node.level + 1 })
          }
        }
        layer = next
      }
    }

    async function validateNode(req, node) {
      if (node.code) {
        const duplicate = await SELECT.one.from(Nodes).columns('ID')
          .where({ code: node.code, ID: { '!=': node.ID ?? null } })
        if (duplicate && duplicate.ID !== node.ID) req.error(409, 'DUPLICATE_CODE', 'code', [node.code])
      }
      if (node.startDate && node.endDate && node.endDate < node.startDate) {
        req.error(400, 'END_BEFORE_START', 'endDate')
      }
      if (node.naturePct != null && (node.naturePct < 0 || node.naturePct > 100)) {
        req.error(400, 'PERCENT_RANGE', 'naturePct')
      }
      if (node.price != null && node.price < 0) req.error(400, 'NEGATIVE_AMOUNT', 'price')
      if (node.discount != null && node.discount < 0) req.error(400, 'NEGATIVE_AMOUNT', 'discount')
      if (node.price != null && node.discount != null && Number(node.discount) > Number(node.price)) {
        req.error(400, 'DISCOUNT_ABOVE_PRICE', 'discount')
      }

      const payMethods = node.payMethods ?? []
      const seenPayTypes = new Set()
      payMethods.forEach((pm, i) => {
        if (pm.payType_code && seenPayTypes.has(pm.payType_code)) {
          req.error(400, 'DUPLICATE_PAY_TYPE', `payMethods[${i}]/payType_code`, [pm.payType_code])
        }
        seenPayTypes.add(pm.payType_code)
        if (pm.beginDate && pm.endDate && pm.endDate < pm.beginDate) {
          req.error(400, 'END_BEFORE_START', `payMethods[${i}]/endDate`)
        }
      })

      const govEntities = node.govEntities ?? []
      const seenEntities = new Set()
      let totalPct = 0
      govEntities.forEach((ge, i) => {
        if (ge.govEntity_code && seenEntities.has(ge.govEntity_code)) {
          req.error(400, 'DUPLICATE_GOV_ENTITY', `govEntities[${i}]/govEntity_code`, [ge.govEntity_code])
        }
        seenEntities.add(ge.govEntity_code)
        const pct = Number(ge.collectionPct ?? 0)
        if (pct < 0 || pct > 100) req.error(400, 'PERCENT_RANGE', `govEntities[${i}]/collectionPct`)
        totalPct += pct
        if (ge.beginDate && ge.endDate && ge.endDate < ge.beginDate) {
          req.error(400, 'END_BEFORE_START', `govEntities[${i}]/endDate`)
        }
      })
      if (totalPct > 100) req.error(400, 'COLLECTION_PCT_TOTAL', 'govEntities', [totalPct])
    }

    return super.init()
  }
}
