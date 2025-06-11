const faunadb = require('faunadb')

const q = faunadb.query
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET_KEY,
})

exports.handler = async (event, context) => {
  const { httpMethod, body, queryStringParameters } = event
  
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
        return await getShops()
      case 'POST':
        return await createShop(JSON.parse(body))
      case 'PUT':
        return await updateShop(JSON.parse(body))
      case 'DELETE':
        return await deleteShop(queryStringParameters)
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

async function createShop(shopData) {
  // Generate email and password
  const email = `${shopData.shopName.toLowerCase().replace(/\s+/g, '')}@mall.com`
  const password = generateSecurePassword()
  
  const shop = {
    ...shopData,
    email,
    password, // In production, this should be hashed
    createdAt: new Date().toISOString(),
    status: 'active',
    lastLogin: null
  }
  
  // Create shop record
  const result = await client.query(
    q.Create(q.Collection('shops'), { data: shop })
  )
  
  // Create corresponding user in Netlify Identity
  await createNetlifyUser({
    email,
    password,
    user_metadata: {
      role: 'tenant',
      shopId: result.ref.id,
      shopName: shopData.shopName
    }
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

function generateSecurePassword() {
  const length = 12
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
  let password = ""
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

async function createNetlifyUser(userData) {
  // This would integrate with Netlify Identity API
  // For now, we'll simulate the user creation
  console.log('Creating Netlify user:', userData.email)
  return { success: true }
}