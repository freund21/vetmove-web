# VetMove — veterinaria a domicilio

Sitio web de **VetMove**, servicio de veterinaria a domicilio en Ponferrada, El Bierzo y zonas limítrofes.

🔗 **[vetmove.es](https://vetmove.es)**

Diseño y desarrollo: **Zalezigo**
Cliente: María Elisa Isern Jarque, veterinaria colegiada

---

## Qué es

Una web estática de una sola página, más tres páginas legales y una de error. Sin framework, sin gestor de contenidos, sin paso de compilación y sin una sola dependencia de terceros en tiempo de ejecución.

La decisión de fondo fue esa: que la página no dependa de nada que no esté en este repositorio. No hay CDN, no hay Google Fonts, no hay librerías externas. Todo lo que el navegador descarga sale del mismo servidor.

## Decisiones que merecen explicación

**Cero peticiones a terceros antes del consentimiento.** Las tipografías están alojadas aquí, no en Google Fonts, así que ninguna visita envía su IP a un tercero solo por abrir la web. Google Analytics no se carga al entrar: el script se inserta únicamente cuando la persona pulsa «Aceptar» en el aviso de cookies. Si rechaza, o si cierra sin decidir, no se descarga nada de Google ni se instala ninguna cookie.

**Tipografías variables y recortadas.** Jost e Inter se sirven como un único fichero variable por familia, en lugar de uno por cada grosor. Cada fichero está recortado a los caracteres que la web necesita: ASCII más los acentos y signos de español, francés, alemán, portugués, italiano y catalán. Las cuatro tipografías juntas pesan 75 KB.

**Imágenes al tamaño en que se ven.** Cada foto está reescalada al doble del ancho máximo al que llega a mostrarse —el doble, para que siga nítida en pantallas de alta densidad— y recomprimida con mozjpeg.

**Peso de primera carga en móvil: unos 600 KB**, de los cuales 369 son imágenes. Antes de optimizar eran 1.070 KB.

**Cumplimiento legal.** Aviso legal conforme al artículo 10 de la Ley 34/2002, incluyendo colegio profesional y número de colegiada, que la norma exige para profesiones reguladas. Política de privacidad conforme al RGPD y a la LOPDGDD. Política de cookies que describe exactamente las que se instalan, ni una más.

## Estructura

```
index.html            portada (una sola página, con anclas por sección)
aviso-legal.html      \
privacidad.html        > páginas legales, marcadas como noindex
cookies.html          /
404.html              página de error
css/style.css         hoja de estilos única, por secciones numeradas
js/script.js          consentimiento, menú móvil y animaciones de entrada
fonts/                Jost e Inter, variables y recortadas
img/                  fotografías y logotipos
sitemap.xml           solo la portada: es la única página indexable
robots.txt
CNAME                 dominio personalizado (lo gestiona GitHub Pages)
google…….html          verificación de Search Console — no borrar: si
                      desaparece, Google retira la propiedad
```

## Cómo trabajar en él

No hace falta instalar nada. Se abre `index.html` en el navegador y listo.

Un detalle importante al editar: `index.html` y las demás páginas enlazan los estáticos con un número de versión (`css/style.css?v=80`). **Si cambias el CSS o el JavaScript, sube ese número en las cinco páginas.** Si no lo haces, quien ya haya visitado la web seguirá viendo la versión antigua guardada en su navegador.

## Despliegue

GitHub Pages, desde la rama `main`. Cada `git push` publica. El dominio se sirve por HTTPS con certificado de Let's Encrypt, renovado automáticamente.

---

## Licencia y propiedad

**Todos los derechos reservados.**

El código de este sitio —HTML, CSS y JavaScript— es propiedad de **Zalezigo**. Este repositorio es público para que GitHub Pages pueda servir la web, no como plantilla libre. No se concede permiso para copiarlo, reutilizarlo ni distribuirlo, total o parcialmente, sin autorización escrita.

**Las fotografías, el logotipo, el nombre VetMove y todos los textos son propiedad de María Elisa Isern Jarque** y no forman parte de ninguna cesión de uso. Aparecen aquí únicamente porque son parte de su web.

Las tipografías Jost e Inter se distribuyen bajo la SIL Open Font License 1.1 y conservan su licencia original.

¿Te interesa algo de lo que hay aquí? Escríbenos en vez de copiarlo.
