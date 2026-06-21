/* ============================================================
   Tie Laços — interações compartilhadas + carrinho Shopify
   ============================================================ */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.from((c || document).querySelectorAll(s)); };
  var brl = function (n) { return 'R$ ' + Number(n).toFixed(2).replace('.', ','); };

  /* ── Header scroll ─────────────────────────────────────── */
  var hdr = $('.hdr');
  if (hdr) {
    var onScroll = function () { hdr.classList.toggle('scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── Mobile nav ────────────────────────────────────────── */
  var mnav = $('.mnav');
  if (mnav) {
    var openNav  = function () { mnav.classList.add('open'); };
    var closeNav = function () { mnav.classList.remove('open'); };
    $$('.js-burger').forEach(function (b) { b.addEventListener('click', openNav); });
    var mc = $('.js-mnav-close', mnav); if (mc) mc.addEventListener('click', closeNav);
    var ms = $('.mnav__scrim', mnav);   if (ms) ms.addEventListener('click', closeNav);
    $$('.mnav__panel a', mnav).forEach(function (a) { a.addEventListener('click', closeNav); });
  }

  /* ── Toasts ────────────────────────────────────────────── */
  var toastWrap = $('.toast-wrap');
  if (!toastWrap) {
    toastWrap = document.createElement('div');
    toastWrap.className = 'toast-wrap';
    document.body.appendChild(toastWrap);
  }
  var BOW = '<span class="bow"><svg viewBox="0 0 48 32" aria-hidden="true"><polygon points="22,16 4,4 4,28" fill="currentColor"/><polygon points="26,16 44,4 44,28" fill="currentColor"/><rect x="20" y="11" width="8" height="10" rx="3" fill="currentColor"/></svg></span>';

  function toast(msg) {
    var t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = BOW + '<span>' + msg + '</span>';
    toastWrap.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('in'); });
    setTimeout(function () {
      t.classList.remove('in');
      setTimeout(function () { t.remove(); }, 400);
    }, 2600);
  }

  /* ── Carrinho Shopify ──────────────────────────────────── */
  var cartEl = $('.cart');

  function updateCount(n) {
    $$('.cart-count').forEach(function (el) {
      el.textContent = n;
      el.classList.toggle('show', n > 0);
    });
  }

  function renderShopifyCart(cart) {
    if (!cartEl) return;
    var box  = $('.cart__items', cartEl);
    var foot = $('.cart__foot', cartEl);
    if (!cart || !cart.lines || !cart.lines.edges.length) {
      box.innerHTML = '<div class="cart__empty">' + BOW +
        '<p><b>Seu carrinho está vazinho.</b><br>Que tal escolher um laço feito à mão?</p>' +
        '<a class="btn" href="Catalogo.html">Ver coleção</a></div>';
      if (foot) foot.style.display = 'none';
      updateCount(0);
      return;
    }
    updateCount(cart.totalQuantity || 0);
    box.innerHTML = cart.lines.edges.map(function (e) {
      var line  = e.node;
      var merch = line.merchandise;
      var img   = merch.image
        ? '<img src="' + merch.image.url + '" alt="' + merch.product.title + '" style="width:56px;height:56px;object-fit:cover;border-radius:8px" />'
        : '<div class="ph" style="width:56px;height:56px"></div>';
      var opts = (merch.selectedOptions || []).map(function (o) { return o.value; }).join(' · ');
      return '<div class="citem" data-line-id="' + line.id + '">' +
        img +
        '<div class="citem__t"><b>' + merch.product.title + '</b>' +
        '<span>' + opts + '</span>' +
        '<div class="qty">' +
          '<button data-dec="' + line.id + '" aria-label="menos">–</button>' +
          '<span>' + line.quantity + '</span>' +
          '<button data-inc="' + line.id + '" aria-label="mais">+</button>' +
        '</div></div>' +
        '<div class="price">' + brl(parseFloat(merch.price.amount) * line.quantity) + '</div>' +
      '</div>';
    }).join('');

    if (foot) {
      foot.style.display = '';
      var total = cart.cost && cart.cost.subtotalAmount
        ? parseFloat(cart.cost.subtotalAmount.amount) : 0;
      var b = $('.cart__total b', foot);
      if (b) b.textContent = brl(total);
      var btn = $('a[href="Checkout.html"]', foot);
      if (btn && cart.checkoutUrl) {
        btn.href = cart.checkoutUrl;
        btn.removeAttribute('target');
      }
    }
  }

  function openCart()  { if (cartEl) cartEl.classList.add('open'); }
  function closeCart() { if (cartEl) cartEl.classList.remove('open'); }

  function loadCart() {
    if (!window.SHOPIFY) return;
    window.SHOPIFY.cartFetch().then(function (cart) { renderShopifyCart(cart); });
  }

  if (cartEl) {
    var cs = $('.cart__scrim', cartEl); if (cs) cs.addEventListener('click', closeCart);
    var cc = $('.js-cart-close', cartEl); if (cc) cc.addEventListener('click', closeCart);
    cartEl.addEventListener('click', function (e) {
      var incId = e.target.getAttribute('data-inc');
      var decId = e.target.getAttribute('data-dec');
      var lineId = incId || decId;
      if (!lineId || !window.SHOPIFY) return;
      var citem  = e.target.closest('.citem');
      var qSpan  = citem && citem.querySelector('.qty span');
      var qty    = qSpan ? parseInt(qSpan.textContent) : 1;
      var newQty = incId ? qty + 1 : Math.max(0, qty - 1);
      window.SHOPIFY.cartLinesUpdate(lineId, newQty).then(function (cart) { renderShopifyCart(cart); });
    });
  }

  $$('.js-cart-open').forEach(function (b) {
    b.addEventListener('click', function () { openCart(); loadCart(); });
  });

  /* ── Adicionar ao carrinho (cards) ─────────────────────── */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.js-add-shopify');
    if (!btn || !window.SHOPIFY) return;
    e.preventDefault();
    var variantId = btn.dataset.variantId;
    if (!variantId) { toast('Selecione uma variante.'); return; }
    btn.disabled = true;
    window.SHOPIFY.cartLinesAdd([{ merchandiseId: variantId, quantity: 1 }])
      .then(function (cart) {
        renderShopifyCart(cart);
        toast('Adicionado ao carrinho! 🎀');
        openCart();
        btn.disabled = false;
      })
      .catch(function () { toast('Erro ao adicionar.'); btn.disabled = false; });
  });

  /* ── Favoritos (visual) ────────────────────────────────── */
  document.addEventListener('click', function (e) {
    var f = e.target.closest('.prod__fav');
    if (!f) return;
    e.preventDefault();
    f.classList.toggle('on');
  });

  /* ── Newsletter ────────────────────────────────────────── */
  $$('.js-news').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = $('input', form);
      if (!/\S+@\S+\.\S+/.test(input.value)) {
        input.focus(); form.classList.add('err');
        setTimeout(function () { form.classList.remove('err'); }, 1200);
        return;
      }
      form.innerHTML = '<div class="news-ok">' + BOW +
        '<p><b>Prontinho!</b> Seu cupom <b>BEMVINDA10</b> já está a caminho do seu e-mail. 💌</p></div>';
    });
  });

  /* ── Reveal on scroll ──────────────────────────────────── */
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (ents) {
    ents.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 }) : null;

  function observeReveal() {
    $$('.reveal').forEach(function (el, i) {
      if (el.classList.contains('in')) return;
      el.style.transitionDelay = (Math.min(i % 4, 3) * 70) + 'ms';
      if (io) io.observe(el); else el.classList.add('in');
    });
  }
  observeReveal();
  setTimeout(function () {
    $$('.reveal:not(.in)').forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in');
    });
  }, 1200);

  /* ── Ano ───────────────────────────────────────────────── */
  $$('.js-year').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ── Kit presente ──────────────────────────────────────── */
  var kit = $('.js-kit');
  if (kit) {
    var recompute = function () {
      var sum = 0, n = 0;
      $$('.kit-item input:checked', kit).forEach(function (inp) {
        sum += parseFloat(inp.dataset.price); n++;
      });
      var disc = n >= 3 ? sum * 0.1 : 0;
      var fin  = sum - disc;
      var totalEl = $('.js-kit-total', kit);
      var discEl  = $('.js-kit-disc',  kit);
      var kbtn    = $('.js-kit-add',   kit);
      if (totalEl) totalEl.textContent = brl(fin);
      if (discEl)  discEl.style.display = disc > 0 ? '' : 'none';
      if (kbtn) {
        kbtn.disabled = n === 0;
        kbtn.dataset.price = fin;
        kbtn.dataset.name  = 'Kit Presente (' + n + ' ' + (n === 1 ? 'item' : 'itens') + ')';
      }
      $$('.kit-item', kit).forEach(function (it) {
        it.classList.toggle('on', $('input', it).checked);
      });
    };
    $$('.kit-item input', kit).forEach(function (inp) { inp.addEventListener('change', recompute); });
    recompute();
  }

  /* ── Init ──────────────────────────────────────────────── */
  loadCart();
  window.TIE = { toast: toast, openCart: openCart, closeCart: closeCart, loadCart: loadCart, observeReveal: observeReveal };
})();
