const faunadb = require('faunadb')

const q = faunadb.query
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET_KEY,
})

exports.handler = async (event, context) => {
  const { httpMethod, body, queryStringParameters } = event
  
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  }

  if (httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  try {
    switch (httpMethod) {
      case 'GET':
        return await getPermits(queryStringParameters)
      case 'POST':
        return await createPermit(JSON.parse(body))
      case 'PUT':
        return await updatePermit(JSON.parse(body))
      case 'DELETE':
        return await deletePermit(queryStringParameters)
      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' })
        }
    }
  } catch (error) {
    console.error('Function error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    }
  }
}

async function getPermits(params) {
  const { status, shopId, department } = params || {}
  
  let query = q.Map(
    q.Paginate(q.Documents(q.Collection('permits'))),
    q.Lambda(x => q.Get(x))
  )
  
  // Apply filters based on parameters
  if (status) {
    query = q.Map(
      q.Paginate(
        q.Match(q.Index('permits_by_status'), status)
      ),
      q.Lambda(x => q.Get(x))
    )
  }
  
  const result = await client.query(query)
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      permits: result.data.map(item => ({
        id: item.ref.id,
        ...item.data
      }))
    })
  }
}

async function createPermit(permitData) {
  const permit = {
    ...permitData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'pending',
    approvalHistory: [],
    currentApprover: 'technical'
  }
  
  const result = await client.query(
    q.Create(q.Collection('permits'), { data: permit })
  )
  
  // Send notifications to relevant departments
  await sendNotification({
    type: 'new_permit',
    permitId: result.ref.id,
    message: `New permit request: ${permit.permitId}`,
    recipients: ['technical@mall.com']
  })
  
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: result.ref.id,
      ...result.data
    })
  }
}

async function updatePermit(updateData) {
  const { id, ...data } = updateData
  
  const updated = {
    ...data,
    updatedAt: new Date().toISOString()
  }
  
  const result = await client.query(
    q.Update(q.Ref(q.Collection('permits'), id), { data: updated })
  )
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: result.ref.id,
      ...result.data
    })
  }
}

async function sendNotification(notificationData) {
  // Store notification in database
  await client.query(
    q.Create(q.Collection('notifications'), { 
      data: {
        ...notificationData,
        createdAt: new Date().toISOString(),
        read: false
      }
    })
  )
  
  // Here you would typically send emails using a service like SendGrid
  // For now, we'll just log it
  console.log('Notification sent:', notificationData)
}