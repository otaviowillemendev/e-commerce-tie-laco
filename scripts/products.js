/* ============================================================
   Tie Laços — catálogo de produtos (fonte única de dados)
   ============================================================ */
window.TIE_PRODUCTS = [
  { id:'p1',  name:'Laço Boutique Cereja',        cat:'Laços',     price:49.90, old:64.90, badge:'mais vendido', rating:4.9, reviews:128, cols:['#E0579A','#C4167A','#F8D7EA'] },
  { id:'p2',  name:'Faixa Pérola Recém-nascida',  cat:'Faixas',    price:39.90,            rating:4.8, reviews:74,  cols:['#F8D7EA','#FFFFFF','#E0579A'] },
  { id:'p3',  name:'Tiara Princesa Flor',         cat:'Tiaras',    price:59.90, badge:'novo', alt:true, rating:5.0, reviews:41, cols:['#7C2D6E','#E0579A'] },
  { id:'p4',  name:'Kit Presente Florescer',      cat:'Kits',      price:119.90, old:149.90, badge:'kit', rating:4.9, reviews:63, cols:['#E0579A','#7C2D6E','#F8D7EA'] },
  { id:'p5',  name:'Laço Gravatinha Veludo',      cat:'Laços',     price:54.90,            rating:4.7, reviews:52,  cols:['#7C2D6E','#C4167A'] },
  { id:'p6',  name:'Conjunto Body + Laço',        cat:'Roupinhas', price:89.90, badge:'mais vendido', rating:4.9, reviews:97, cols:['#F8D7EA','#E0579A'] },
  { id:'p7',  name:'Laço Duquesa Cetim',          cat:'Laços',     price:64.90, badge:'novo', alt:true, rating:4.8, reviews:34, cols:['#C4167A','#E0579A','#F8D7EA'] },
  { id:'p8',  name:'Faixa Borboleta',             cat:'Faixas',    price:44.90,            rating:4.6, reviews:28,  cols:['#E0579A','#7C2D6E'] },
  { id:'p9',  name:'Tiara Coroa Encantada',       cat:'Tiaras',    price:69.90,            rating:5.0, reviews:19,  cols:['#F8D7EA','#E0579A','#C4167A'] },
  { id:'p10', name:'Vestido Festa Florzinha',     cat:'Roupinhas', price:139.90, old:169.90, rating:4.9, reviews:56, cols:['#E0579A','#F8D7EA'] },
  { id:'p11', name:'Kit Maternidade Bem-vinda',   cat:'Kits',      price:99.90, badge:'kit', rating:4.9, reviews:47, cols:['#F8D7EA','#FFFFFF','#E0579A'] },
  { id:'p12', name:'Laço Mini Trio (3 un.)',      cat:'Laços',     price:34.90, badge:'kit', rating:4.8, reviews:88, cols:['#E0579A','#7C2D6E','#F8D7EA'] }
];

window.TIE_CATS = [
  { key:'Laços',     label:'Laços' },
  { key:'Tiaras',    label:'Tiaras' },
  { key:'Faixas',    label:'Faixas' },
  { key:'Roupinhas', label:'Roupinhas' },
  { key:'Kits',      label:'Kits Presente' }
];

window.tieBRL = function (n) { return 'R$ ' + n.toFixed(2).replace('.', ','); };
window.tieProduct = function (id) { return window.TIE_PRODUCTS.find(function (p) { return p.id === id; }); };

/* Renderiza um card de produto — botão "Adicionar" SEMPRE visível (sem hover) */
window.tieCard = function (p, opts) {
  opts = opts || {};
  var brl = window.tieBRL;
  var sw = p.cols.map(function (c) { return '<span class="swatch" style="background:' + c + '"></span>'; }).join('');
  var badge = p.badge ? '<span class="prod__badge' + (p.alt ? ' alt' : '') + '">' + p.badge + '</span>' : '';
  var oldp = p.old ? '<small>' + brl(p.old) + '</small>' : '';
  var href = 'Produto.html?id=' + p.id;
  return '' +
  '<article class="prod' + (opts.reveal ? ' reveal' : '') + '">' +
    '<a class="prod__media" href="' + href + '" aria-label="' + p.name + '">' +
      badge +
      '<button class="prod__fav" type="button" aria-label="Favoritar" data-fav="' + p.id + '">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.5-9.2-9C1.3 8 3 4.8 6.2 4.8c2 0 3.2 1.3 3.8 2.3.6-1 1.8-2.3 3.8-2.3 3.2 0 4.9 3.2 3.4 6.2C19 15.5 12 20 12 20Z"/></svg>' +
      '</button>' +
      '<span class="ph" data-label="foto · ' + p.name + '"></span>' +
    '</a>' +
    '<div class="prod__body">' +
      '<span class="prod__cat">' + p.cat + '</span>' +
      '<a class="prod__name" href="' + href + '">' + p.name + '</a>' +
      '<div class="prod__meta"><span class="stars" aria-label="' + p.rating + ' estrelas">★★★★★</span>' +
        '<span class="prod__reviews">(' + p.reviews + ')</span></div>' +
      '<div class="prod__row">' +
        '<span class="price">' + oldp + brl(p.price) + '</span>' +
        '<span class="swatches">' + sw + '</span>' +
      '</div>' +
      '<button class="btn btn--block prod__add js-add" type="button" data-id="' + p.id + '" data-name="' + p.name + '" data-price="' + p.price + '" data-cat="' + p.cat + '">' +
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/></svg>' +
        'Adicionar' +
      '</button>' +
    '</div>' +
  '</article>';
};
