async function checkScopes() {
  const domain = 'ezt0bc-df.myshopify.com';
 const token = process.env.NEXT_PUBLIC_SHOPIFY_TOKEN;
  const url = `https://${domain}/admin/oauth/access_scopes.json`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
    });

    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

checkScopes();
