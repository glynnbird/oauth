export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
  'Access-Control-Max-Age': '86400'
}

export async function onRequest (context) {
  const request = context.request
  const CLIENT_ID = context.env.CLIENT_ID
  const CLIENT_SECRET = context.env.CLIENT_SECRET

  // handle OPTIONS requests for CORS
  if (request.method.toUpperCase() === 'OPTIONS') {
    return new Response(null, {
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Headers': request.headers.get(
          'Access-Control-Request-Headers'
        )
      }
    })
  }

  // redirect GET requests to the OAuth login page on github.com
  if (context.request.method === 'GET') {
    return Response.redirect(
      `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}`,
      302
    )
  }

  try {
    // parse the request as JSON
    const { code } = await request.json()

    const response = await fetch('https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'user-agent': 'cloudflare-worker-oauth',
          accept: 'application/json'
        },
        body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code })
      }
    )
    const result = await response.json()
    const headers = {
      'Access-Control-Allow-Origin': '*'
    }

    if (result.error) {
      return new Response(JSON.stringify(result), { status: 401, headers })
    }

    return new Response(JSON.stringify({ token: result.access_token }), {
      status: 201,
      headers
    })
  } catch (error) {
    console.error(error)
    return new Response(error.message, {
      status: 500
    })
  }
}
