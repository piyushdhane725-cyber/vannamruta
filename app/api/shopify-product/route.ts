export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const handle = searchParams.get("handle");

  try {
    const response = await fetch(
      `https://${process.env.SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": process.env.SHOPIFY_STOREFRONT_TOKEN!,
        },
        body: JSON.stringify({
          query: `
            query {
              product(handle: "${handle}") {
                variants(first: 1) {
                  edges {
                    node {
                      availableForSale
                      price {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
              }
            }
          `,
        }),
      }
    );

    const data = await response.json();

    return Response.json(data);
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
