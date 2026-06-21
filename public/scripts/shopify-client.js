/* ============================================================
   Tie Laços — Shopify Storefront API client (plain script)
   Token público — seguro no browser por design do Shopify.
   ============================================================ */
(function () {
  'use strict';

  var DOMAIN  = 'rfs0bg-kb.myshopify.com';
  var TOKEN   = '92add46c4aa5cfecd16c1ffc2d5a7c65';
  var VERSION = '2026-04';
  var ENDPOINT = 'https://' + DOMAIN + '/api/' + VERSION + '/graphql.json';

  /* ── GraphQL fetch ─────────────────────────────────────── */
  function gql(query, variables) {
    return fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': TOKEN,
      },
      body: JSON.stringify({ query: query, variables: variables || {} }),
    }).then(function (r) { return r.json(); });
  }

  /* ── Helpers ───────────────────────────────────────────── */
  var DIAS_NOVO = 30;

  function capitalize(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  }

  function autoBadge(p, isBestSeller) {
    var type = (p.productType || '').toLowerCase();
    if (type === 'kits') return 'kit';
    if (isBestSeller) return 'mais vendido';
    var dias = (Date.now() - new Date(p.createdAt).getTime()) / 864e5;
    if (dias <= DIAS_NOVO) return 'novo';
    return null;
  }

  function toProduct(node, isBestSeller) {
    var variants = (node.variants && node.variants.edges || []).map(function (e) { return e.node; });
    var v = variants[0] || {};
    var price = parseFloat(v.price && v.price.amount || 0);
    var old   = v.compareAtPrice ? parseFloat(v.compareAtPrice.amount) : null;
    var images = (node.images && node.images.edges || []).map(function (e) { return e.node.url; });

    // Opção de cor: aceita "Color", "Cor", "Colour"
    var corOpt = (node.options || []).find(function (o) {
      return ['cor', 'color', 'colour'].indexOf(o.name.toLowerCase()) > -1;
    });

    return {
      id:        node.id,
      handle:    node.handle,
      name:      node.title,
      cat:       capitalize(node.productType) || 'Laços',
      price:     price,
      old:       old,
      badge:     autoBadge(node, isBestSeller),
      alt:       isBestSeller,
      rating:    5.0,
      reviews:   0,
      cols:      corOpt ? corOpt.values : [],
      img:       node.featuredImage ? node.featuredImage.url : null,
      images:    images,
      variantId: v.id,
      available: v.availableForSale !== false,
      variants:  variants,
      descriptionHtml: node.descriptionHtml || '',
      createdAt: node.createdAt,
    };
  }

  /* ── Fragment ──────────────────────────────────────────── */
  var FRAG = '\
    fragment PF on Product {\
      id handle title productType createdAt\
      featuredImage { url altText }\
      images(first: 8) { edges { node { url altText } } }\
      options { name values }\
      variants(first: 20) {\
        edges { node {\
          id title availableForSale\
          selectedOptions { name value }\
          price { amount currencyCode }\
          compareAtPrice { amount }\
          image { url altText }\
        }}\
      }\
    }\
  ';

  /* ── Queries ───────────────────────────────────────────── */

  function fetchProducts(first, bestSellerCount) {
    first = first || 50;
    bestSellerCount = bestSellerCount !== undefined ? bestSellerCount : 3;
    return gql('\
      query Products($first: Int!) {\
        products(first: $first, sortKey: BEST_SELLING) {\
          edges { node { ...PF } }\
        }\
      }' + FRAG,
      { first: first }
    ).then(function (res) {
      if (res.errors) { console.error('[Shopify]', res.errors); return []; }
      return res.data.products.edges.map(function (e, i) {
        return toProduct(e.node, i < bestSellerCount);
      });
    });
  }

  function fetchProduct(handle) {
    return gql('\
      query Product($handle: String!) {\
        product(handle: $handle) {\
          ...PF\
          descriptionHtml\
          seo { title description }\
        }\
      }' + FRAG,
      { handle: handle }
    ).then(function (res) {
      if (res.errors) { console.error('[Shopify]', res.errors); return null; }
      return res.data.product ? toProduct(res.data.product) : null;
    });
  }

  function fetchRelated(productId) {
    return gql('\
      query Related($productId: ID!) {\
        productRecommendations(productId: $productId) { ...PF }\
      }' + FRAG,
      { productId: productId }
    ).then(function (res) {
      if (res.errors) { console.error('[Shopify]', res.errors); return []; }
      return (res.data.productRecommendations || []).slice(0, 4).map(function (p) {
        return toProduct(p);
      });
    });
  }

  /* ── Carrinho ──────────────────────────────────────────── */
  var CART_KEY = 'tie_shopify_cart_id';

  var CART_FIELDS = '\
    id checkoutUrl totalQuantity\
    lines(first: 50) { edges { node {\
      id quantity\
      merchandise { ... on ProductVariant {\
        id title\
        image { url }\
        price { amount currencyCode }\
        product { title handle }\
        selectedOptions { name value }\
      }}\
    }}}\
    cost {\
      subtotalAmount { amount currencyCode }\
      totalAmount { amount currencyCode }\
    }\
    discountCodes { code applicable }\
  ';

  function cartCreate(lines) {
    return gql('\
      mutation CartCreate($lines: [CartLineInput!]) {\
        cartCreate(input: { lines: $lines }) {\
          cart { ' + CART_FIELDS + ' }\
          userErrors { field message }\
        }\
      }',
      { lines: lines || [] }
    ).then(function (res) {
      if (res.errors) { console.error('[Shopify] cartCreate', res.errors); return null; }
      var cart = res.data.cartCreate.cart;
      if (cart) localStorage.setItem(CART_KEY, cart.id);
      return cart;
    });
  }

  function cartFetch() {
    var id = localStorage.getItem(CART_KEY);
    if (!id) return Promise.resolve(null);
    return gql('\
      query Cart($id: ID!) {\
        cart(id: $id) { ' + CART_FIELDS + ' }\
      }',
      { id: id }
    ).then(function (res) {
      if (res.errors) { console.error('[Shopify] cartFetch', res.errors); return null; }
      return res.data.cart;
    });
  }

  function cartLinesAdd(lines) {
    var id = localStorage.getItem(CART_KEY);
    if (!id) {
      return cartCreate(lines);
    }
    return gql('\
      mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {\
        cartLinesAdd(cartId: $cartId, lines: $lines) {\
          cart { ' + CART_FIELDS + ' }\
          userErrors { field message }\
        }\
      }',
      { cartId: id, lines: lines }
    ).then(function (res) {
      if (res.errors) { console.error('[Shopify] cartLinesAdd', res.errors); return null; }
      return res.data.cartLinesAdd.cart;
    });
  }

  function cartLinesUpdate(lineId, quantity) {
    var id = localStorage.getItem(CART_KEY);
    if (!id) return Promise.resolve(null);
    return gql('\
      mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {\
        cartLinesUpdate(cartId: $cartId, lines: $lines) {\
          cart { ' + CART_FIELDS + ' }\
          userErrors { field message }\
        }\
      }',
      { cartId: id, lines: [{ id: lineId, quantity: quantity }] }
    ).then(function (res) {
      if (res.errors) { console.error('[Shopify] cartLinesUpdate', res.errors); return null; }
      return res.data.cartLinesUpdate.cart;
    });
  }

  function cartLinesRemove(lineId) {
    var id = localStorage.getItem(CART_KEY);
    if (!id) return Promise.resolve(null);
    return gql('\
      mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {\
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {\
          cart { ' + CART_FIELDS + ' }\
          userErrors { field message }\
        }\
      }',
      { cartId: id, lineIds: [lineId] }
    ).then(function (res) {
      if (res.errors) { console.error('[Shopify] cartLinesRemove', res.errors); return null; }
      return res.data.cartLinesRemove.cart;
    });
  }

  function cartDiscountApply(code) {
    var id = localStorage.getItem(CART_KEY);
    if (!id) return Promise.resolve(null);
    return gql('\
      mutation CartDiscount($cartId: ID!, $codes: [String!]!) {\
        cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $codes) {\
          cart { ' + CART_FIELDS + ' }\
          userErrors { field message }\
        }\
      }',
      { cartId: id, codes: [code] }
    ).then(function (res) {
      if (res.errors) { console.error('[Shopify] cartDiscount', res.errors); return null; }
      return res.data.cartDiscountCodesUpdate.cart;
    });
  }

  /* ── Clientes ──────────────────────────────────────────── */
  var CUSTOMER_KEY = 'tie_customer_token';
  var CUSTOMER_EXP = 'tie_customer_expires';

  function customerCreate(input) {
    return gql('\
      mutation CustomerCreate($input: CustomerCreateInput!) {\
        customerCreate(input: $input) {\
          customer { id email firstName lastName }\
          customerUserErrors { code field message }\
        }\
      }',
      { input: input }
    ).then(function (res) {
      if (res.errors) return { error: 'Erro de conexão' };
      var r = res.data.customerCreate;
      if (r.customerUserErrors && r.customerUserErrors.length) {
        return { error: r.customerUserErrors[0].message };
      }
      return { customer: r.customer };
    });
  }

  function customerLogin(email, password) {
    return gql('\
      mutation Login($input: CustomerAccessTokenCreateInput!) {\
        customerAccessTokenCreate(input: $input) {\
          customerAccessToken { accessToken expiresAt }\
          customerUserErrors { code field message }\
        }\
      }',
      { input: { email: email, password: password } }
    ).then(function (res) {
      if (res.errors) return { error: 'Erro de conexão' };
      var r = res.data.customerAccessTokenCreate;
      if (r.customerUserErrors && r.customerUserErrors.length) {
        return { error: r.customerUserErrors[0].message };
      }
      var t = r.customerAccessToken;
      localStorage.setItem(CUSTOMER_KEY, t.accessToken);
      localStorage.setItem(CUSTOMER_EXP, t.expiresAt);
      return { token: t.accessToken };
    });
  }

  function getCustomerToken() {
    var token   = localStorage.getItem(CUSTOMER_KEY);
    var expires = localStorage.getItem(CUSTOMER_EXP);
    if (!token || !expires) return null;
    if (new Date(expires) < new Date()) {
      localStorage.removeItem(CUSTOMER_KEY);
      localStorage.removeItem(CUSTOMER_EXP);
      return null;
    }
    return token;
  }

  function customerLogout() {
    var token = getCustomerToken();
    if (!token) return Promise.resolve();
    return gql('\
      mutation Logout($token: String!) {\
        customerAccessTokenDelete(customerAccessToken: $token) {\
          deletedAccessToken\
        }\
      }',
      { token: token }
    ).then(function () {
      localStorage.removeItem(CUSTOMER_KEY);
      localStorage.removeItem(CUSTOMER_EXP);
    });
  }

  /* ── Expõe API global ──────────────────────────────────── */
  window.SHOPIFY = {
    fetchProducts:    fetchProducts,
    fetchProduct:     fetchProduct,
    fetchRelated:     fetchRelated,
    cartFetch:        cartFetch,
    cartLinesAdd:     cartLinesAdd,
    cartLinesUpdate:  cartLinesUpdate,
    cartLinesRemove:  cartLinesRemove,
    cartDiscountApply: cartDiscountApply,
    customerCreate:   customerCreate,
    customerLogin:    customerLogin,
    customerLogout:   customerLogout,
    getCustomerToken: getCustomerToken,
  };
})();
