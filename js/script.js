/* =========================================================
   VetMove — interacciones
========================================================= */

(function () {
    "use strict";


    /* =========================================================
       SIN COOKIES NI ANALÍTICA

       Esta web no instala ninguna cookie, no guarda nada en el
       navegador y no contacta con ningún servidor ajeno: las
       tipografías y las imágenes se sirven desde aquí mismo.

       Por eso no hay aviso de cookies que mostrar ni consentimiento
       que pedir. Si algún día se añade analítica, habrá que volver
       a poner el aviso y la política de cookies que lo explique.
    ========================================================= */


    /* ---------- Header con fondo al hacer scroll ---------- */

    var header = document.getElementById("header");

    function onScroll() {
        header.classList.toggle("scrolled", window.scrollY > 40);
    }

    if (header) {
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
    }


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


    /* ---------- Menú móvil ----------

       Las páginas legales y la 404 llevan una cabecera simplificada,
       sin menú. Por eso todo este bloque va dentro de un if: sin él,
       el script se rompía en esas páginas y dejaba de ejecutarse todo
       lo que viene después, incluidas las animaciones de entrada.     */

    var toggle = document.getElementById("menu-toggle");
    var menu = document.getElementById("nav-menu");

    function closeMenu() {
        menu.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Abrir menú");
    }

    if (toggle && menu) {

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
