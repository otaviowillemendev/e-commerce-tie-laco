/* ============================================================
   Tie Laços — interações compartilhadas
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Helpers ---------- */
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const brl = (n) => 'R$ ' + n.toFixed(2).replace('.', ',');

  /* ---------- Header scroll shadow ---------- */
  const hdr = $('.hdr');
  if (hdr) {
    const onScroll = () => hdr.classList.toggle('scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile drawer nav ---------- */
  const mnav = $('.mnav');
  if (mnav) {
    const open = () => mnav.classList.add('open');
    const close = () => mnav.classList.remove('open');
    $$('.js-burger').forEach((b) => b.addEventListener('click', open));
    $('.js-mnav-close', mnav)?.addEventListener('click', close);
    $('.mnav__scrim', mnav)?.addEventListener('click', close);
    $$('.mnav__panel a', mnav).forEach((a) => a.addEventListener('click', close));
  }

  /* ---------- Toasts ---------- */
  let toastWrap = $('.toast-wrap');
  if (!toastWrap) {
    toastWrap = document.createElement('div');
    toastWrap.className = 'toast-wrap';
    document.body.appendChild(toastWrap);
  }
  const BOW = '<span class="bow"><svg viewBox="0 0 48 32" aria-hidden="true"><polygon points="22,16 4,4 4,28" fill="currentColor"/><polygon points="26,16 44,4 44,28" fill="currentColor"/><rect x="20" y="11" width="8" height="10" rx="3" fill="currentColor"/></svg></span>';
  function toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = BOW + '<span>' + msg + '</span>';
    toastWrap.appendChild(t);
    requestAnimationFrame(() => t.classList.add('in'));
    setTimeout(() => {
      t.classList.remove('in');
      setTimeout(() => t.remove(), 400);
    }, 2600);
  }

  /* ---------- Carrinho (localStorage) ---------- */
  const KEY = 'tie_cart';
  const readCart = () => {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch (e) { return {}; }
  };
  const writeCart = (c) => localStorage.setItem(KEY, JSON.stringify(c));

  function count() {
    const c = readCart();
    return Object.values(c).reduce((s, i) => s + i.qty, 0);
  }
  function total() {
    const c = readCart();
    return Object.values(c).reduce((s, i) => s + i.qty * i.price, 0);
  }
  function updateCount() {
    const n = count();
    $$('.cart-count').forEach((el) => {
      el.textContent = n;
      el.classList.toggle('show', n > 0);
    });
  }
  function addToCart(item) {
    const c = readCart();
    const id = item.id;
    if (c[id]) c[id].qty += (item.qty || 1);
    else c[id] = { ...item, qty: item.qty || 1 };
    writeCart(c);
    updateCount();
    renderCart();
  }
  function setQty(id, delta) {
    const c = readCart();
    if (!c[id]) return;
    c[id].qty += delta;
    if (c[id].qty <= 0) delete c[id];
    writeCart(c);
    updateCount();
    renderCart();
  }

  /* ---------- Cart drawer ---------- */
  const cart = $('.cart');
  function openCart() { cart && cart.classList.add('open'); }
  function closeCart() { cart && cart.classList.remove('open'); }
  function renderCart() {
    if (!cart) return;
    const box = $('.cart__items', cart);
    const foot = $('.cart__foot', cart);
    const c = readCart();
    const ids = Object.keys(c);
    if (!ids.length) {
      box.innerHTML = '<div class="cart__empty">' + BOW +
        '<p><b>Seu carrinho está vazinho.</b><br>Que tal escolher um laço feito à mão?</p>' +
        '<a class="btn" href="Catalogo.html">Ver coleção</a></div>';
      if (foot) foot.style.display = 'none';
      return;
    }
    box.innerHTML = ids.map((id) => {
      const i = c[id];
      return '<div class="citem">' +
        '<div class="ph" data-label="foto"></div>' +
        '<div class="citem__t"><b>' + i.name + '</b><span>' + (i.cat || '') + '</span>' +
        '<div class="qty"><button data-dec="' + id + '" aria-label="menos">–</button>' +
        '<span>' + i.qty + '</span><button data-inc="' + id + '" aria-label="mais">+</button></div></div>' +
        '<div class="price">' + brl(i.price * i.qty) + '</div></div>';
    }).join('');
    if (foot) {
      foot.style.display = '';
      $('.cart__total b', foot).textContent = brl(total());
    }
  }
  if (cart) {
    $('.cart__scrim', cart)?.addEventListener('click', closeCart);
    $('.js-cart-close', cart)?.addEventListener('click', closeCart);
    cart.addEventListener('click', (e) => {
      const inc = e.target.getAttribute('data-inc');
      const dec = e.target.getAttribute('data-dec');
      if (inc) setQty(inc, 1);
      if (dec) setQty(dec, -1);
    });
  }
  $$('.js-cart-open').forEach((b) => b.addEventListener('click', openCart));

  /* ---------- Add to cart buttons ---------- */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.js-add');
    if (!btn) return;
    e.preventDefault();
    addToCart({
      id: btn.dataset.id,
      name: btn.dataset.name,
      price: parseFloat(btn.dataset.price),
      cat: btn.dataset.cat || '',
    });
    toast('Adicionado ao carrinho!');
  });

  /* ---------- Favoritos (visual) ---------- */
  document.addEventListener('click', (e) => {
    const f = e.target.closest('.prod__fav');
    if (!f) return;
    e.preventDefault();
    f.classList.toggle('on');
  });

  /* ---------- Monte seu kit ---------- */
  const kit = $('.js-kit');
  if (kit) {
    const recompute = () => {
      let sum = 0, n = 0;
      $$('.kit-item input:checked', kit).forEach((inp) => {
        sum += parseFloat(inp.dataset.price); n++;
      });
      // desconto carinhoso: 10% a partir de 3 itens
      const disc = n >= 3 ? sum * 0.1 : 0;
      const fin = sum - disc;
      const totalEl = $('.js-kit-total', kit);
      const discEl = $('.js-kit-disc', kit);
      const btn = $('.js-kit-add', kit);
      if (totalEl) totalEl.textContent = brl(fin);
      if (discEl) discEl.style.display = disc > 0 ? '' : 'none';
      if (btn) {
        btn.disabled = n === 0;
        btn.dataset.price = fin;
        btn.dataset.name = n ? 'Kit Presente (' + n + ' ' + (n === 1 ? 'item' : 'itens') + ')' : 'Kit Presente';
      }
      $$('.kit-item', kit).forEach((it) => {
        it.classList.toggle('on', $('input', it).checked);
      });
    };
    $$('.kit-item input', kit).forEach((inp) => inp.addEventListener('change', recompute));
    const kbtn = $('.js-kit-add', kit);
    if (kbtn) kbtn.addEventListener('click', () => {
      const n = $$('.kit-item input:checked', kit).length;
      if (!n) return;
      addToCart({
        id: 'kit-' + Date.now(),
        name: kbtn.dataset.name,
        price: parseFloat(kbtn.dataset.price),
        cat: 'Kit Presente',
      });
      toast('Kit presente montado com carinho!');
      $$('.kit-item input:checked', kit).forEach((i) => (i.checked = false));
      recompute();
    });
    recompute();
  }

  /* ---------- Newsletter ---------- */
  $$('.js-news').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = $('input', form);
      const ok = /\S+@\S+\.\S+/.test(input.value);
      if (!ok) {
        input.focus();
        form.classList.add('err');
        setTimeout(() => form.classList.remove('err'), 1200);
        return;
      }
      form.innerHTML = '<div class="news-ok">' + BOW +
        '<p><b>Prontinho!</b> Seu cupom <b>BEMVINDA10</b> já está a caminho do seu e-mail. 💌</p></div>';
    });
  });

  /* ---------- Reveal on scroll ---------- */
  const io = ('IntersectionObserver' in window) ? new IntersectionObserver((ents) => {
    ents.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 }) : null;
  $$('.reveal').forEach((el, i) => {
    el.style.transitionDelay = (Math.min(i % 4, 3) * 70) + 'ms';
    if (io) io.observe(el); else el.classList.add('in');
  });
  // Fallback de segurança: garante visibilidade mesmo se o observer falhar
  setTimeout(() => $$('.reveal:not(.in)').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight) el.classList.add('in');
  }), 1200);

  /* ---------- Year ---------- */
  $$('.js-year').forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---------- Init ---------- */
  updateCount();
  renderCart();

  window.TIE = { addToCart, toast, openCart };
})();
