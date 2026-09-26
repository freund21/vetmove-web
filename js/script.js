/* =========================================================
   VetMove — interacciones
========================================================= */

(function () {
    "use strict";


    /* =========================================================
       CONSENTIMIENTO DE COOKIES Y GOOGLE ANALYTICS

       Pega aquí el ID de medición de Analytics, con formato
       G-XXXXXXXXXX. Mientras esté vacío no se carga Analytics,
       no se instala ninguna cookie y el aviso no aparece.
    ========================================================= */

    var ID_ANALYTICS = "";

    var CLAVE = "vetmove-cookies";
    var aviso = document.getElementById("cookies");

    function decision() {
        try { return localStorage.getItem(CLAVE); } catch (e) { return null; }
    }

    function guardar(valor) {
        try { localStorage.setItem(CLAVE, valor); } catch (e) { /* modo privado */ }
    }

    function cargarAnalytics() {
        if (!ID_ANALYTICS) return;
        if (window.gtagCargado) return;
        window.gtagCargado = true;

        var s = document.createElement("script");
        s.async = true;
        s.src = "https://www.googletagmanager.com/gtag/js?id=" + ID_ANALYTICS;
        document.head.appendChild(s);

        window.dataLayer = window.dataLayer || [];
        window.gtag = function () { window.dataLayer.push(arguments); };
        window.gtag("js", new Date());
        window.gtag("config", ID_ANALYTICS, { anonymize_ip: true });
    }

    function cerrarAviso() {
        if (aviso) aviso.hidden = true;
    }

    if (aviso) {
        var previa = decision();

        if (!ID_ANALYTICS) {
            // Sin Analytics configurado no hay cookies que consentir
            aviso.hidden = true;
        } else if (previa === "si") {
            cargarAnalytics();
        } else if (previa === "no") {
            aviso.hidden = true;
        } else {
            aviso.hidden = false;
        }

        var btnSi = document.getElementById("cookies-aceptar");
        var btnNo = document.getElementById("cookies-rechazar");

        if (btnSi) btnSi.addEventListener("click", function () {
            guardar("si");
            cerrarAviso();
            cargarAnalytics();
        });

        if (btnNo) btnNo.addEventListener("click", function () {
            guardar("no");
            cerrarAviso();
        });
    }

    // Permite volver a decidir desde la política de cookies
    window.vetmoveReabrirCookies = function () {
        try { localStorage.removeItem(CLAVE); } catch (e) { }
        if (aviso && ID_ANALYTICS) aviso.hidden = false;
    };


    /* ---------- Header con fondo al hacer scroll ---------- */

    var header = document.getElementById("header");

    function onScroll() {
        header.classList.toggle("scrolled", window.scrollY > 40);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();


    /* ---------- "Leer más" de Sobre mí (solo en móvil) ---------- */

    var extra = document.getElementById("about-extra");
    var extraToggle = document.getElementById("about-toggle");
    var movil = window.matchMedia("(max-width: 700px)");

    function ajustarExtra() {
        if (!extra || !extraToggle) return;
        if (movil.matches) {
            // Se pliega solo si el visitante no lo ha abierto ya
            if (extraToggle.getAttribute("aria-expanded") !== "true") {
                extra.hidden = true;
            }
        } else {
            // En escritorio siempre visible: el texto completo
            extra.hidden = false;
        }
    }

    if (extra && extraToggle) {
        extraToggle.addEventListener("click", function () {
            var abierto = extra.hidden;
            extra.hidden = !abierto;
            extraToggle.setAttribute("aria-expanded", String(abierto));
            extraToggle.textContent = abierto ? "Leer menos" : "Leer más";
            if (!abierto) {
                extraToggle.scrollIntoView({ block: "center", behavior: "smooth" });
            }
        });

        ajustarExtra();
        if (movil.addEventListener) movil.addEventListener("change", ajustarExtra);
    }


    /* ---------- Menú móvil ---------- */

    var toggle = document.getElementById("menu-toggle");
    var menu = document.getElementById("nav-menu");

    function closeMenu() {
        menu.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Abrir menú");
    }

    toggle.addEventListener("click", function () {
        var open = menu.classList.toggle("open");
        toggle.classList.toggle("open", open);
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    });

    menu.addEventListener("click", function (e) {
        if (e.target.tagName === "A") closeMenu();
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeMenu();
    });


    /* ---------- Marcar en el menú la sección visible ---------- */

    var links = Array.prototype.slice.call(menu.querySelectorAll('a[href^="#"]'));
    var sections = links
        .map(function (a) { return document.querySelector(a.getAttribute("href")); })
        .filter(Boolean);

    if ("IntersectionObserver" in window && sections.length) {

        var navObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;

                links.forEach(function (a) {
                    a.classList.toggle(
                        "active",
                        a.getAttribute("href") === "#" + entry.target.id
                    );
                });
            });
        }, { rootMargin: "-45% 0px -50% 0px" });

        sections.forEach(function (s) { navObserver.observe(s); });
    }


    /* ---------- Aparición progresiva de bloques ---------- */

    var revealables = document.querySelectorAll(".reveal");

    if ("IntersectionObserver" in window) {

        var revealObserver = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry, i) {
                if (!entry.isIntersecting) return;

                entry.target.style.transitionDelay = (i * 70) + "ms";
                entry.target.classList.add("visible");
                obs.unobserve(entry.target);
            });
        }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });

        revealables.forEach(function (el) { revealObserver.observe(el); });

    } else {
        revealables.forEach(function (el) { el.classList.add("visible"); });
    }


    /* ---------- Marcador visible si una foto aún no existe ----------
       Evita el icono de "imagen rota" mientras no se suban las fotos
       definitivas a la carpeta /img.                                  */

    document.querySelectorAll(".media img").forEach(function (img) {

        function flag() {
            var figure = img.closest(".media");
            if (figure) figure.classList.add("is-missing");
        }

        img.addEventListener("error", flag);

        // Ya había fallado antes de que se ejecutara este script
        if (img.complete && img.naturalWidth === 0) flag();
    });

}());
