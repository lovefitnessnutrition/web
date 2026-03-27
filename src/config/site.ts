export const site = {
  siteName: "LFN Nutrición y Entrenamiento",

  // WhatsApp principal (E164 sin "+")
  whatsappNumberMain: "34600111222",
  whatsappDefaultMessage: "Hola, quiero información sobre vuestros planes de nutrición y entrenamiento.",

  // Dirección física
  addressText: "Calle Ejemplo 123, 08001 Barcelona",

  // Google Maps – URL del iframe "Insertar mapa"
  googleMapsEmbedSrc:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6181.596345241739!2d-3.7485041222542463!3d40.29246277146005!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd418a7f1e8bc8d5%3A0x11b2416a40739706!2sLoveFitness%20Nutrition!5e1!3m2!1sen!2ses!4v1772322195421!5m2!1sen!2ses",

  // Google Maps – Place ID
  googleMapsPlaceId: "ChIJ1ciLHn-KQQ0RBpdzQGpBshE",

  // Google Maps – link al perfil (para "Ver en Google")
  googleMapsProfileUrl:
    "https://www.google.com/maps/place/?q=place_id:ChIJ1ciLHn-KQQ0RBpdzQGpBshE",

  // Cal.com URL
  calUrl: "https://cal.com/llalu/revision",

  // Instagram
  instagramProfileUrl: "https://www.instagram.com/lovefitnessincouple/",

  // Instagram widget embed HTML (snippet del proveedor)
  instagramWidgetEmbedHtml: `<div class="embedsocial-hashtag" data-ref="abf6726f1ce402ad21b1401883b54e2bbb6d823d"> <a class="feed-powered-by-es feed-powered-by-es-slider-img es-widget-branding" href="https://embedsocial.com/instagram-widget/" target="_blank" title="Instagram widget" > <img src="https://embedsocial.com/cdn/icon/embedsocial-logo.webp" alt="EmbedSocial"> <div class="es-widget-branding-text">Instagram widget</div> </a> </div> <script> (function(d, s, id) { var js; if (d.getElementById(id)) {return;} js = d.createElement(s); js.id = id; js.src = "https://embedsocial.com/cdn/ht.js"; d.getElementsByTagName("head")[0].appendChild(js); }(document, "script", "EmbedSocialHashtagScript")); </script>`,

  // Email de contacto
  email: "info@lfn-nutricion.com",

  // Teléfono
  phone: "+34 600 111 222",
} as const;