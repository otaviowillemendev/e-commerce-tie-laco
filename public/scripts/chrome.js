/* ============================================================
   Tie Laços — chrome compartilhado (header, footer, busca, carrinho)
   Injeta em #tie-top e #tie-bottom. Carregar ANTES de tie.js.
   body[data-active] marca o item de menu ativo.
   ============================================================ */
(function () {
  'use strict';
  var active = document.body.getAttribute('data-active') || '';
  var L = '/assets/tie-logo.png';

  function navLinks(cls) {
    var items = [
      ['Home.html', 'Início', 'inicio'],
      ['Catalogo.html', 'Laços', 'lacos'],
      ['Catalogo.html', 'Roupinhas', 'roupinhas'],
      ['Catalogo.html', 'Kits Presente', 'kits'],
      ['Catalogo.html', 'Catálogo', 'catalogo']
    ];
    return items.map(function (i) {
      var on = i[2] === active ? ' class="active"' : '';
      return '<a href="' + i[0] + '"' + on + '>' + i[1] + '</a>';
    }).join('');
  }

  var icoSearch = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>';
  var icoUser = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/></svg>';
  var icoCart = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/></svg>';
  var icoBurger = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  var icoClose = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>';

  /* ---------- TOP: topbar + header + mobile nav + busca ---------- */
  var top =
  '<div class="topbar">' +
    '<span>Frete grátis acima de R$ 150</span><span class="dot"></span>' +
    '<span>Cada peça feita à mão, só pra ela</span><span class="dot"></span>' +
    '<span>10% off na 1ª compra: BEMVINDA10</span>' +
  '</div>' +
  '<header class="hdr" data-screen-label="Cabeçalho">' +
    '<div class="wrap hdr__in">' +
      '<a class="brand" href="Home.html" aria-label="Tie Laços — início"><img src="' + L + '" alt="Tie Laços" /></a>' +
      '<nav class="nav" aria-label="Principal">' + navLinks() + '</nav>' +
      '<div class="hdr__tools">' +
        '<button class="iconbtn js-search-open" type="button" aria-label="Buscar">' + icoSearch + '</button>' +
        '<a class="iconbtn" href="Conta.html" aria-label="Minha conta">' + icoUser + '</a>' +
        '<button class="iconbtn js-cart-open" type="button" aria-label="Carrinho">' + icoCart + '<span class="cart-count">0</span></button>' +
        '<button class="iconbtn burger js-burger" type="button" aria-label="Menu">' + icoBurger + '</button>' +
      '</div>' +
    '</div>' +
  '</header>' +
  '<div class="mnav">' +
    '<div class="mnav__scrim"></div>' +
    '<div class="mnav__panel">' +
      '<div class="mnav__head"><img src="' + L + '" alt="Tie Laços" style="height:52px" />' +
        '<button class="iconbtn js-mnav-close" type="button" aria-label="Fechar">' + icoClose + '</button></div>' +
      navLinks() +
      '<a href="Conta.html">Minha conta</a>' +
      '<div class="mnav__foot"><a class="btn btn--block" href="Conta.html">Entrar / Cadastrar</a></div>' +
    '</div>' +
  '</div>' +
  '<div class="search" aria-hidden="true">' +
    '<div class="search__scrim"></div>' +
    '<div class="search__panel">' +
      '<div class="wrap search__bar">' +
        '<span class="search__ico">' + icoSearch + '</span>' +
        '<input class="js-search-input" type="search" placeholder="Buscar laços, tiaras, kits…" aria-label="Buscar" autocomplete="off" />' +
        '<button class="iconbtn js-search-close" type="button" aria-label="Fechar busca">' + icoClose + '</button>' +
      '</div>' +
      '<div class="wrap search__body">' +
        '<div class="search__sugs"><span>Populares:</span>' +
          '<button type="button" data-q="laço">Laços</button>' +
          '<button type="button" data-q="tiara">Tiaras</button>' +
          '<button type="button" data-q="kit">Kits Presente</button>' +
          '<button type="button" data-q="vestido">Vestidos</button>' +
        '</div>' +
        '<div class="search__results js-search-results"></div>' +
      '</div>' +
    '</div>' +
  '</div>';

  /* ---------- BOTTOM: footer + cart drawer ---------- */
  var bottom =
  '<footer class="foot">' +
    '<div class="wrap">' +
      '<div class="foot__top">' +
        '<div class="foot__brand">' +
          '<img src="' + L + '" alt="Tie Laços" />' +
          '<p>Laços e acessórios infantis feitos à mão, com amor. Pra ela se sentir tão especial quanto ela é.</p>' +
          '<div class="foot__social">' +
            '<a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg></a>' +
            '<a href="#" aria-label="WhatsApp"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.6 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5-4.5-.2-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.4.6c-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.2.1.4.1.6-.1l.7-.8c.2-.2.4-.2.6-.1l1.8.9c.3.1.4.2.5.3.1.3.1.8-.1 1.4Z"/></svg></a>' +
            '<a href="#" aria-label="Pinterest"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.2-2 0-2.9l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.4 1.8-2.4.9 0 1.3.6 1.3 1.4 0 .9-.5 2.2-.8 3.4-.2 1 .5 1.8 1.5 1.8 1.8 0 3-2.3 3-5 0-2.1-1.4-3.6-3.9-3.6-2.9 0-4.6 2.1-4.6 4.5 0 .8.2 1.4.6 1.9.2.2.2.3.1.5l-.2.8c-.1.3-.2.4-.5.2-1.3-.5-1.9-2-1.9-3.6 0-2.7 2.3-5.9 6.8-5.9 3.6 0 6 2.6 6 5.4 0 3.7-2 6.4-5 6.4-1 0-2-.5-2.3-1.2l-.6 2.4c-.2.8-.7 1.7-1 2.3A10 10 0 1 0 12 2Z"/></svg></a>' +
          '</div>' +
        '</div>' +
        '<div><h4>Loja</h4><ul>' +
          '<li><a href="Catalogo.html">Laços</a></li><li><a href="Catalogo.html">Tiaras &amp; Faixas</a></li>' +
          '<li><a href="Catalogo.html">Roupinhas</a></li><li><a href="Catalogo.html">Kits Presente</a></li>' +
          '<li><a href="Catalogo.html">Novidades</a></li></ul></div>' +
        '<div><h4>Ajuda</h4><ul>' +
          '<li><a href="#">Como comprar</a></li><li><a href="#">Trocas e devoluções</a></li>' +
          '<li><a href="#">Prazos de entrega</a></li><li><a href="#">Fale conosco</a></li></ul></div>' +
        '<div><h4>Conta</h4><ul>' +
          '<li><a href="Conta.html">Entrar</a></li><li><a href="Conta.html">Criar conta</a></li>' +
          '<li><a href="Checkout.html">Meu carrinho</a></li><li><a href="#">Meus pedidos</a></li></ul></div>' +
      '</div>' +
      '<div class="foot__bottom">' +
        '<span>© <span class="js-year">2026</span> Tie Laços · Feito à mão com amor · CNPJ 00.000.000/0001-00</span>' +
        '<div class="pay"><span>PIX</span><span>VISA</span><span>MASTER</span><span>ELO</span><span>BOLETO</span></div>' +
      '</div>' +
    '</div>' +
  '</footer>' +
  '<div class="cart">' +
    '<div class="cart__scrim"></div>' +
    '<aside class="cart__panel" aria-label="Carrinho">' +
      '<div class="cart__head"><h3>Seu carrinho</h3>' +
        '<button class="iconbtn js-cart-close" type="button" aria-label="Fechar">' + icoClose + '</button></div>' +
      '<div class="cart__items"></div>' +
      '<div class="cart__foot">' +
        '<div class="cart__total"><span>Subtotal</span><b>R$ 0,00</b></div>' +
        '<a href="Checkout.html" class="btn btn--block btn--lg">Finalizar compra</a>' +
        '<p style="text-align:center;color:var(--muted);font-size:.82rem;margin-top:.7rem">Frete grátis acima de R$ 150 🎀</p>' +
      '</div>' +
    '</aside>' +
  '</div>';

  var topEl = document.getElementById('tie-top');
  var botEl = document.getElementById('tie-bottom');
  if (topEl) topEl.innerHTML = top;
  if (botEl) botEl.innerHTML = bottom;

  /* ---------- Busca: abrir/fechar + filtro ao vivo ---------- */
  var search = document.querySelector('.search');
  if (search) {
    var input = search.querySelector('.js-search-input');
    var results = search.querySelector('.js-search-results');
    var openSearch = function () {
      search.classList.add('open'); search.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      setTimeout(function () { input && input.focus(); }, 80);
    };
    var closeSearch = function () {
      search.classList.remove('open'); search.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };
    document.querySelectorAll('.js-search-open').forEach(function (b) { b.addEventListener('click', openSearch); });
    search.querySelector('.js-search-close').addEventListener('click', closeSearch);
    search.querySelector('.search__scrim').addEventListener('click', closeSearch);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSearch(); });

    var render = function (q) {
      q = (q || '').trim().toLowerCase();
      var list = (window.TIE_PRODUCTS || []);
      var found = q ? list.filter(function (p) {
        return (p.name + ' ' + p.cat).toLowerCase().indexOf(q) > -1;
      }) : list.slice(0, 6);
      if (!found.length) {
        results.innerHTML = '<p class="search__empty">Nada encontrado para “' + q + '”. Tente outra palavra. 🎀</p>';
        return;
      }
      results.innerHTML = '<div class="search__head">' + (q ? found.length + ' resultado(s)' : 'Sugestões pra você') + '</div>' +
        '<div class="search__grid">' + found.map(function (p) {
          return '<a class="sres" href="Produto.html?id=' + p.id + '">' +
            '<span class="ph" data-label="foto"></span>' +
            '<span class="sres__t"><b>' + p.name + '</b><span>' + p.cat + ' · ' + window.tieBRL(p.price) + '</span></span></a>';
        }).join('') + '</div>';
    };
    if (input) input.addEventListener('input', function () { render(input.value); });
    search.querySelectorAll('.search__sugs button').forEach(function (b) {
      b.addEventListener('click', function () { input.value = b.dataset.q; render(b.dataset.q); input.focus(); });
    });
    render('');
  }
})();
