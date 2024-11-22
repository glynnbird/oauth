export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
  'Access-Control-Max-Age': '86400'
}

export async function onRequest (context) {
  const request = context.request
  const CLIENT_ID = context.env.CLIENT_ID
  const CLIENT_SECRET = context.env.CLIENT_SECRET
  const headers = {
    'Access-Control-Allow-Origin': '*'
  }

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

  console.log('url', request.url)
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  console.log('code', code)

  // redirect GET requests to the OAuth login page on github.com
  if (!code) {
    return Response.redirect(
      `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}`,
      302
    )
  }

  try {
    let response = await fetch('https://github.com/login/oauth/access_token',
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
    console.log('result', result)
    const token = result.access_token

    if (result.error) {
      return new Response(JSON.stringify(result), { status: 401, headers })
    }

    response = await fetch('https://api.github.com/user', {
      headers: {
        accept: 'application/vnd.github+json',
        authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
    console.log('user response', response.status, response.headers )
    const json = await response.json()

    return new Response(JSON.stringify(json), {
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
