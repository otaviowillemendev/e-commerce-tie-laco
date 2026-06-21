/* ============================================================
   Tie Laços — cliente Shopify Storefront API
   Fonte única de comunicação com o Shopify.
   Todas as páginas importam daqui.
   ============================================================ */
import { createStorefrontApiClient } from '@shopify/storefront-api-client';

// ── Cliente ──────────────────────────────────────────────────
export const shopify = createStorefrontApiClient({
  storeDomain: import.meta.env.VITE_SHOPIFY_DOMAIN,
  apiVersion:  import.meta.env.VITE_SHOPIFY_API_VERSION,
  publicAccessToken: import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN,
});

// ── Helpers ──────────────────────────────────────────────────

/** Calcula badge automaticamente — sem tags manuais */
function autoBadge(shopifyProduct, isBestSeller = false) {
  const type = (shopifyProduct.productType || '').toLowerCase();
  if (type === 'kits') return 'kit';
  if (isBestSeller) return 'mais vendido';
  const createdAt = new Date(shopifyProduct.createdAt);
  const diasAtras = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (diasAtras <= 30) return 'novo';
  return null;
}

/** Converte produto Shopify → formato interno Tie */
export function toTieProduct(shopifyProduct, isBestSeller = false) {
  const v = shopifyProduct.variants?.edges?.[0]?.node ?? {};
  const img = shopifyProduct.featuredImage?.url ?? null;
  const images = (shopifyProduct.images?.edges ?? []).map((e) => e.node.url);
  const price = parseFloat(v.price?.amount ?? 0);
  const old   = v.compareAtPrice ? parseFloat(v.compareAtPrice.amount) : null;

  // Cores: lê opção "Cor" ou "Color" — insensível a maiúsculas
  const corOption = shopifyProduct.options
    ?.find((o) => ['cor', 'color', 'colour'].includes(o.name.toLowerCase()));

  // Todas as variantes para montar seletor completo
  const variants = (shopifyProduct.variants?.edges ?? []).map((e) => e.node);

  return {
    id:          shopifyProduct.id,
    handle:      shopifyProduct.handle,
    name:        shopifyProduct.title,
    cat:         shopifyProduct.productType || 'Laços',
    price,
    old,
    badge:       autoBadge(shopifyProduct, isBestSeller),
    alt:         isBestSeller, // badge escuro para mais vendidos
    rating:      5.0,
    reviews:     0,
    cols:        corOption?.values ?? [],
    img,
    images,
    variantId:   v.id,
    available:   v.availableForSale ?? true,
    variants,    // lista completa de variantes com preço e opções
    createdAt:   shopifyProduct.createdAt,
  };
}

// ── Fragment reutilizável ─────────────────────────────────────

const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id handle title productType createdAt
    featuredImage { url altText }
    images(first: 8) { edges { node { url altText } } }
    options { name values }
    variants(first: 20) {
      edges {
        node {
          id title availableForSale
          selectedOptions { name value }
          price { amount currencyCode }
          compareAtPrice { amount currencyCode }
          image { url altText }
        }
      }
    }
  }
`;

// ── Queries ──────────────────────────────────────────────────

/**
 * Busca todos os produtos ordenados por relevância.
 * Os primeiros `bestSellerCount` recebem badge "mais vendido" automaticamente.
 */
export async function fetchProducts(first = 50, bestSellerCount = 3) {
  const { data, errors } = await shopify.request(`
    query Products($first: Int!) {
      products(first: $first, sortKey: BEST_SELLING) {
        edges { node { ...ProductFields } }
      }
    }
    ${PRODUCT_FRAGMENT}
  `, { variables: { first } });

  if (errors) { console.error('[Shopify] fetchProducts:', errors); return []; }
  return data.products.edges.map((e, i) =>
    toTieProduct(e.node, i < bestSellerCount)
  );
}

/**
 * Busca um produto pelo handle.
 * Retorna também descriptionHtml para a página de produto.
 */
export async function fetchProduct(handle) {
  const { data, errors } = await shopify.request(`
    query Product($handle: String!) {
      product(handle: $handle) {
        ...ProductFields
        descriptionHtml
        seo { title description }
      }
    }
    ${PRODUCT_FRAGMENT}
  `, { variables: { handle } });

  if (errors) { console.error('[Shopify] fetchProduct:', errors); return null; }
  return data.product ? toTieProduct(data.product) : null;
}

/**
 * Busca produtos de uma coleção pelo handle.
 * Coleções criadas no Shopify Admin controlam curadoria (ex: "Lançamentos", "Destaque").
 */
export async function fetchCollection(handle, first = 50) {
  const { data, errors } = await shopify.request(`
    query Collection($handle: String!, $first: Int!) {
      collection(handle: $handle) {
        title description
        products(first: $first, sortKey: BEST_SELLING) {
          edges { node { ...ProductFields } }
        }
      }
    }
    ${PRODUCT_FRAGMENT}
  `, { variables: { handle, first } });

  if (errors) { console.error('[Shopify] fetchCollection:', errors); return []; }
  const col = data.collection;
  if (!col) return [];
  return col.products.edges.map((e) => toTieProduct(e.node));
}

/**
 * Busca todas as coleções da loja.
 * Usado para montar menu de categorias dinamicamente.
 */
export async function fetchCollections(first = 20) {
  const { data, errors } = await shopify.request(`
    query Collections($first: Int!) {
      collections(first: $first) {
        edges {
          node {
            id handle title
            image { url altText }
            products(first: 1) { edges { node { id } } }
          }
        }
      }
    }
  `, { variables: { first } });

  if (errors) { console.error('[Shopify] fetchCollections:', errors); return []; }
  return data.collections.edges.map((e) => e.node);
}

/**
 * Busca produtos relacionados (mesma coleção/tipo, exceto o atual).
 */
export async function fetchRelated(productId, first = 4) {
  const { data, errors } = await shopify.request(`
    query Related($productId: ID!, $first: Int!) {
      productRecommendations(productId: $productId) {
        ...ProductFields
      }
    }
    ${PRODUCT_FRAGMENT}
  `, { variables: { productId, first } });

  if (errors) { console.error('[Shopify] fetchRelated:', errors); return []; }
  return (data.productRecommendations ?? []).slice(0, first).map((p) => toTieProduct(p));
}

// ── Carrinho ─────────────────────────────────────────────────

/** Cria um carrinho novo no Shopify e salva o ID no localStorage */
export async function cartCreate(lines = []) {
  const { data, errors } = await shopify.request(`
    mutation CartCreate($lines: [CartLineInput!]) {
      cartCreate(input: { lines: $lines }) {
        cart {
          id checkoutUrl
          lines(first: 50) { edges { node {
            id quantity
            merchandise { ... on ProductVariant {
              id title product { title featuredImage { url } }
              price { amount }
            }}
          }}}
          cost { subtotalAmount { amount } totalAmount { amount } }
        }
        userErrors { field message }
      }
    }
  `, { variables: { lines } });

  if (errors) { console.error('[Shopify] cartCreate:', errors); return null; }
  const cart = data.cartCreate.cart;
  if (cart) localStorage.setItem('tie_shopify_cart', cart.id);
  return cart;
}

/** Recupera o carrinho salvo */
export async function cartFetch(cartId) {
  const { data, errors } = await shopify.request(`
    query CartFetch($id: ID!) {
      cart(id: $id) {
        id checkoutUrl
        lines(first: 50) { edges { node {
          id quantity
          merchandise { ... on ProductVariant {
            id title product { title featuredImage { url } }
            price { amount }
          }}
        }}}
        cost { subtotalAmount { amount } totalAmount { amount } }
        discountCodes { code applicable }
      }
    }
  `, { variables: { id: cartId } });

  if (errors) { console.error('[Shopify] cartFetch:', errors); return null; }
  return data.cart;
}

/** Adiciona itens ao carrinho */
export async function cartLinesAdd(cartId, lines) {
  const { data, errors } = await shopify.request(`
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { id checkoutUrl
          lines(first: 50) { edges { node {
            id quantity
            merchandise { ... on ProductVariant {
              id title product { title featuredImage { url } }
              price { amount }
            }}
          }}}
          cost { subtotalAmount { amount } totalAmount { amount } }
        }
        userErrors { field message }
      }
    }
  `, { variables: { cartId, lines } });

  if (errors) { console.error('[Shopify] cartLinesAdd:', errors); return null; }
  return data.cartLinesAdd.cart;
}

/** Atualiza quantidade de uma linha do carrinho */
export async function cartLinesUpdate(cartId, lines) {
  const { data, errors } = await shopify.request(`
    mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart { id checkoutUrl
          lines(first: 50) { edges { node {
            id quantity
            merchandise { ... on ProductVariant {
              id title product { title featuredImage { url } }
              price { amount }
            }}
          }}}
          cost { subtotalAmount { amount } totalAmount { amount } }
        }
        userErrors { field message }
      }
    }
  `, { variables: { cartId, lines } });

  if (errors) { console.error('[Shopify] cartLinesUpdate:', errors); return null; }
  return data.cartLinesUpdate.cart;
}

/** Remove linhas do carrinho */
export async function cartLinesRemove(cartId, lineIds) {
  const { data, errors } = await shopify.request(`
    mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart { id checkoutUrl
          lines(first: 50) { edges { node {
            id quantity
            merchandise { ... on ProductVariant {
              id title product { title featuredImage { url } }
              price { amount }
            }}
          }}}
          cost { subtotalAmount { amount } totalAmount { amount } }
        }
        userErrors { field message }
      }
    }
  `, { variables: { cartId, lineIds } });

  if (errors) { console.error('[Shopify] cartLinesRemove:', errors); return null; }
  return data.cartLinesRemove.cart;
}

/** Aplica cupom de desconto */
export async function cartDiscountApply(cartId, discountCodes) {
  const { data, errors } = await shopify.request(`
    mutation CartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]!) {
      cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
        cart { id discountCodes { code applicable }
          cost { subtotalAmount { amount } totalAmount { amount } }
        }
        userErrors { field message }
      }
    }
  `, { variables: { cartId, discountCodes } });

  if (errors) { console.error('[Shopify] cartDiscountApply:', errors); return null; }
  return data.cartDiscountCodesUpdate.cart;
}

// ── Autenticação de cliente ───────────────────────────────────

/** Cria uma conta de cliente no Shopify */
export async function customerCreate({ firstName, lastName, email, password, phone }) {
  const { data, errors } = await shopify.request(`
    mutation CustomerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer { id email firstName }
        customerUserErrors { code field message }
      }
    }
  `, { variables: { input: { firstName, lastName, email, password, phone, acceptsMarketing: true } } });

  if (errors) { console.error('[Shopify] customerCreate:', errors); return { error: 'Erro de conexão' }; }
  const r = data.customerCreate;
  if (r.customerUserErrors?.length) return { error: r.customerUserErrors[0].message };
  return { customer: r.customer };
}

/** Faz login e retorna token de acesso */
export async function customerLogin({ email, password }) {
  const { data, errors } = await shopify.request(`
    mutation CustomerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken { accessToken expiresAt }
        customerUserErrors { code field message }
      }
    }
  `, { variables: { input: { email, password } } });

  if (errors) { console.error('[Shopify] customerLogin:', errors); return { error: 'Erro de conexão' }; }
  const r = data.customerAccessTokenCreate;
  if (r.customerUserErrors?.length) return { error: r.customerUserErrors[0].message };
  const token = r.customerAccessToken;
  localStorage.setItem('tie_customer_token', token.accessToken);
  localStorage.setItem('tie_customer_expires', token.expiresAt);
  return { token: token.accessToken };
}

/** Verifica se há sessão ativa */
export function getCustomerToken() {
  const token   = localStorage.getItem('tie_customer_token');
  const expires = localStorage.getItem('tie_customer_expires');
  if (!token || !expires) return null;
  if (new Date(expires) < new Date()) {
    localStorage.removeItem('tie_customer_token');
    localStorage.removeItem('tie_customer_expires');
    return null;
  }
  return token;
}

/** Faz logout */
export async function customerLogout() {
  const token = getCustomerToken();
  if (!token) return;
  await shopify.request(`
    mutation CustomerAccessTokenDelete($customerAccessToken: String!) {
      customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
        deletedAccessToken
      }
    }
  `, { variables: { customerAccessToken: token } });
  localStorage.removeItem('tie_customer_token');
  localStorage.removeItem('tie_customer_expires');
}
