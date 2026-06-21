/* ============================================================
   Tie Laços — helpers de produto compartilhados
   TIE_PRODUCTS fica vazio; dados reais vêm do Shopify.
   ============================================================ */
window.TIE_PRODUCTS = [];

window.TIE_CATS = [
  { key:'Laços',     label:'Laços' },
  { key:'Tiaras',    label:'Tiaras' },
  { key:'Faixas',    label:'Faixas' },
  { key:'Roupinhas', label:'Roupinhas' },
  { key:'Kits',      label:'Kits Presente' }
];

window.tieBRL = function (n) {
  return 'R$ ' + Number(n).toFixed(2).replace('.', ',');
};

window.tieProduct = function (id) {
  return window.TIE_PRODUCTS.find(function (p) { return p.id === id; });
};

/* ── Card de produto ─────────────────────────────────────── */
window.tieCard = function (p, opts) {
  opts = opts || {};
  var brl  = window.tieBRL;
  var href = 'Produto.html?handle=' + (p.handle || p.id);

  // Imagem: real (Shopify CDN) ou placeholder
  var media = p.img
    ? '<img src="' + p.img + '" alt="' + p.name + '" loading="lazy" />'
    : '<span class="ph" data-label="foto · ' + p.name + '"></span>';

  // Swatches: cores vindas do Shopify são nomes ("Rosa"), não hex
  var sw = (p.cols || []).map(function (c) {
    var isHex = c.charAt(0) === '#';
    if (isHex) return '<span class="swatch" style="background:' + c + '" title="' + c + '"></span>';
    return '<span class="swatch swatch--label" title="' + c + '">' + c.charAt(0) + '</span>';
  }).join('');

  var badge = p.badge
    ? '<span class="prod__badge' + (p.alt ? ' alt' : '') + '">' + p.badge + '</span>'
    : '';

  var oldp = p.old ? '<small>' + brl(p.old) + '</small>' : '';

  // Variante padrão para o botão de adicionar
  var variantId = p.variantId || '';

  return '' +
    '<article class="prod' + (opts.reveal ? ' reveal' : '') + '">' +
      '<a class="prod__media" href="' + href + '" aria-label="' + p.name + '">' +
        badge +
        '<button class="prod__fav" type="button" aria-label="Favoritar" data-fav="' + p.id + '">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.5-9.2-9C1.3 8 3 4.8 6.2 4.8c2 0 3.2 1.3 3.8 2.3.6-1 1.8-2.3 3.8-2.3 3.2 0 4.9 3.2 3.4 6.2C19 15.5 12 20 12 20Z"/></svg>' +
        '</button>' +
        media +
      '</a>' +
      '<div class="prod__body">' +
        '<span class="prod__cat">' + p.cat + '</span>' +
        '<a class="prod__name" href="' + href + '">' + p.name + '</a>' +
        '<div class="prod__meta">' +
          '<span class="stars" aria-label="' + p.rating + ' estrelas">★★★★★</span>' +
          (p.reviews ? '<span class="prod__reviews">(' + p.reviews + ')</span>' : '') +
        '</div>' +
        '<div class="prod__row">' +
          '<span class="price">' + oldp + brl(p.price) + '</span>' +
          '<span class="swatches">' + sw + '</span>' +
        '</div>' +
        '<button class="btn btn--block prod__add js-add-shopify" type="button"' +
          ' data-variant-id="' + variantId + '"' +
          ' data-name="' + p.name + '"' +
          ' data-price="' + p.price + '"' +
          ' data-cat="' + p.cat + '"' +
          ' data-handle="' + (p.handle || '') + '">' +
          '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/></svg>' +
          'Adicionar' +
        '</button>' +
      '</div>' +
    '</article>';
};
