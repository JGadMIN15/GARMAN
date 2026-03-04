/* ── NAV HEIGHT ── */
    function setNavOffset() {
        const nav = document.getElementById('mainNav');
        const h = nav.offsetHeight;
        document.documentElement.style.setProperty('--nav-h', h + 'px');
    }
    setNavOffset();
    window.addEventListener('resize', setNavOffset);

    /* ── SIZE SELECTORS ── */
    document.querySelectorAll('.size-selector').forEach(group => {
        group.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                group.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    });

    /* ── STRIPE SETUP ── */
    // ⚠️  Reemplaza 'pk_test_...' con tu Publishable Key de Stripe Dashboard
    const stripePublishableKey = 'pk_test_XXXXXXXXXXXXXXXXXXXXXXXX';
    let stripe, elements, cardElements = {};

    function initStripe() {
        if (typeof Stripe === 'undefined') {
            console.warn('Stripe.js no cargado. Comprueba conexión a internet.');
            return;
        }
        stripe = Stripe(stripePublishableKey);

        const appearance = {
            theme: 'stripe',
            variables: {
                colorPrimary: '#00d4ff',
                colorBackground: '#ffffff',
                colorText: '#1a1a1a',
                colorDanger: '#c0392b',
                fontFamily: 'Lato, sans-serif',
                borderRadius: '4px',
            }
        };

        ['travis', 'corteiz', 'moncler'].forEach(id => {
            const el = document.getElementById('card-element-' + id);
            if (!el) return;

            const elems = stripe.elements({ appearance });
            const card = elems.create('card', {
                style: {
                    base: {
                        color: '#1a1a1a',
                        fontFamily: 'Lato, sans-serif',
                        fontSize: '14px',
                        '::placeholder': { color: '#aaa' }
                    }
                }
            });
            card.mount('#card-element-' + id);
            card.on('focus', () => el.classList.add('focused'));
            card.on('blur', () => el.classList.remove('focused'));
            cardElements[id] = card;
        });
    }

    window.addEventListener('load', initStripe);

    /* ── PAYMENT HANDLER ── */
    async function handlePayment(productId, amount) {
        if (!stripe) {
            showMsg(productId, 'Stripe no está disponible. Comprueba tu conexión.', 'error');
            return;
        }

        const emailInput = document.getElementById('email-' + productId);
        const sizeGroup = document.getElementById('sizes-' + productId);
        const activeSize = sizeGroup ? sizeGroup.querySelector('.size-btn.active') : null;

        if (!emailInput.value || !emailInput.value.includes('@')) {
            showMsg(productId, 'Por favor introduce un email válido.', 'error');
            emailInput.focus();
            return;
        }
        if (!activeSize) {
            showMsg(productId, 'Selecciona una talla antes de continuar.', 'error');
            return;
        }

        // En producción: crea un PaymentIntent en tu backend y usa el client_secret aquí.
        // Este ejemplo muestra el flujo de integración. Necesitas un servidor que llame a:
        // stripe.paymentIntents.create({ amount: amount*100, currency: 'eur' })
        // y devuelva el client_secret.

        showMsg(productId,
            `✅ Selección: Talla ${activeSize.dataset.size} · €${amount}\n` +
            `Para procesar el pago real, configura tu backend con tu clave secreta de Stripe.`,
            'success'
        );

        /*
        // Código real con backend:
        const res = await fetch('/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: amount * 100, currency: 'eur' })
        });
        const { clientSecret } = await res.json();

        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElements[productId],
                billing_details: { email: emailInput.value }
            }
        });

        if (error) {
            showMsg(productId, error.message, 'error');
        } else if (paymentIntent.status === 'succeeded') {
            showMsg(productId, '✅ ¡Pago realizado! Recibirás un email de confirmación.', 'success');
        }
        */
    }

    function showMsg(id, text, type) {
        const el = document.getElementById('msg-' + id);
        if (!el) return;
        el.textContent = text;
        el.className = 'payment-message ' + type;
        el.style.display = 'block';
        setTimeout(() => { el.style.display = 'none'; }, 6000);
    }

    /* ── LIGHTBOX ── */
    function openLightbox(img) {
        document.getElementById('lightbox-img').src = img.src;
        document.getElementById('lightbox').classList.add('open');
        document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
        document.getElementById('lightbox').classList.remove('open');
        document.body.style.overflow = '';
    }
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });