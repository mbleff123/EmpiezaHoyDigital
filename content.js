window.SITE_CONTENT = {
  ui: {
    back: "Atrás",
    continue: "Continuar",
    selected: "seleccionado",
    maxTwo: "Elige hasta 2 opciones",
    chooseOne: "Elige una opción para continuar",
    startOver: "Empezar de nuevo",
    resume: "Continuar donde lo dejaste",
    resumeTitle: "Tu diagnóstico sigue aquí",
    resumeText: "Guardamos tus respuestas en este dispositivo.",
    questionProgress: "Pregunta {current} de {total}",
    copyMessage: "Copiar mensaje",
    copied: "Mensaje copiado",
    whatsappFallbackTitle: "¿WhatsApp no se abrió?",
    whatsappFallbackText: "Copia el mensaje y escribe al {number}.",
    close: "Cerrar"
  },
  landing: {
    eyebrow: "Diagnóstico gratuito · 2 min",
    title: "¿Tienes lo necesario para empezar tu primer negocio digital?",
    subtitle: "Responde 11 preguntas y recibe tu ruta de inicio personalizada.",
    cta: "Empezar mi diagnóstico",
    disclaimer: "Es un diagnóstico de tu punto de partida, no una promesa de ingresos.",
    trustLine: ["Gratis", "Sin registro", "Resultado al instante"]
  },
  questions: [
    {
      id: "nombre", type: "text", required: true,
      question: "Primero, ¿cómo te llamas?",
      placeholder: "Tu nombre", maxLength: 30,
      microcopy: "Mucho gusto, {nombre}. Vamos a hacerlo sencillo."
    },
    {
      id: "edad", type: "single",
      question: "{nombre}, ¿en qué rango de edad estás?",
      options: [
        { value: "menor", label: "Menos de 18" },
        { value: "18a24", label: "18 a 24" },
        { value: "25a34", label: "25 a 34" },
        { value: "35mas", label: "35 o más" }
      ],
      microcopy: "Lo preguntamos para darte consejos que apliquen a tu etapa."
    },
    {
      id: "situacion", type: "single", question: "¿Cuál es tu situación hoy?",
      options: [
        { value: "estudio", label: "Estudio" }, { value: "trabajo", label: "Trabajo" },
        { value: "ambos", label: "Estudio y trabajo" },
        { value: "ninguno", label: "Ahora mismo no estudio ni trabajo" }
      ],
      microcopy: "Gracias. Muchas personas empiezan justo desde ahí."
    },
    {
      id: "objetivo", type: "single", question: "¿Qué te gustaría lograr con un negocio digital?",
      options: [
        { value: "ingreso_extra", label: "Ganar un ingreso extra", result: "generar un ingreso extra" },
        { value: "independencia", label: "Independizarme económicamente", result: "independizarte económicamente" },
        { value: "habilidad", label: "Aprender una habilidad útil para mi futuro", result: "aprender una habilidad útil para tu futuro" },
        { value: "familia", label: "Ayudar a mi familia", result: "ayudar a tu familia" },
        { value: "sin_claro", label: "Todavía no lo tengo claro", result: "definir qué quieres lograr" }
      ],
      microcopy: "Buen objetivo. Lo tendremos presente en tu diagnóstico."
    },
    {
      id: "experiencia", type: "single", question: "¿Alguna vez intentaste ganar dinero por internet?",
      options: [
        { value: "nunca", label: "Nunca lo intenté" },
        { value: "intento_fallido", label: "Lo intenté, pero no me funcionó" },
        { value: "vendio", label: "He vendido algo (productos, servicios o contenido)" },
        { value: "experiencia", label: "Ya tengo experiencia en negocios online" }
      ]
    },
    {
      id: "frenos", type: "multi", max: 2, conditional: true,
      question: "¿Qué fue lo que más te frenó?",
      options: [
        { value: "perdio_dinero", label: "Perdí dinero en algo que no funcionó" },
        { value: "promesas", label: "Me prometieron resultados que nunca llegaron" },
        { value: "sin_rumbo", label: "No sabía por dónde empezar" },
        { value: "constancia", label: "Lo dejé por falta de constancia" },
        { value: "sin_apoyo", label: "Nadie me acompañó" }
      ],
      microcopy: "Es más común de lo que parece. Es justo lo que queremos evitar contigo."
    },
    {
      id: "dudas", type: "multi", max: 2, question: "¿Qué es lo que más te preocupa de empezar?",
      options: [
        { value: "estafa", label: "Que sea una estafa", natural: "que sea una estafa" },
        { value: "no_poder", label: "No poder hacerlo", natural: "no poder hacerlo" },
        { value: "sin_tiempo", label: "No tener tiempo", natural: "no tener tiempo" },
        { value: "sin_experiencia", label: "No tener experiencia", natural: "no tener experiencia" },
        { value: "sin_resultados", label: "Que no me dé resultados", natural: "que no me dé resultados" },
        { value: "sin_dinero", label: "No tener dinero para invertir", natural: "no tener dinero para invertir" }
      ],
      microcopy: "Gracias por ser sincero. Lo tendremos en cuenta en tu resultado."
    },
    {
      id: "tiempo", type: "single", question: "¿Cuánto tiempo podrías dedicarle al día?",
      options: [
        { value: "menos30", label: "Menos de 30 minutos" }, { value: "30a60", label: "De 30 a 60 minutos" },
        { value: "1a2h", label: "De 1 a 2 horas" }, { value: "mas2h", label: "Más de 2 horas" }
      ]
    },
    {
      id: "recursos", type: "multi", optional: true, question: "¿Con qué cuentas hoy?",
      options: [
        { value: "celular", label: "Celular" }, { value: "internet", label: "Internet (datos o wifi)" },
        { value: "tiktok", label: "TikTok" }, { value: "whatsapp", label: "WhatsApp" },
        { value: "computadora", label: "Computadora" }
      ],
      microcopy: "Con un celular y conexión ya se puede empezar."
    },
    {
      id: "aprender", type: "single", question: "¿Qué tan dispuesto estás a aprender cosas nuevas, aunque al principio cuesten?",
      options: [
        { value: "muy", label: "Muy dispuesto, me gusta aprender" },
        { value: "guiado", label: "Dispuesto, si me guían paso a paso" },
        { value: "inseguro", label: "Un poco inseguro" }, { value: "hecho", label: "Prefiero que me lo den hecho" }
      ]
    },
    {
      id: "vender", type: "single", question: "Un negocio implica hablar con personas y ofrecer algo. ¿Cómo te sientes con eso?",
      options: [
        { value: "gusta", label: "Me gusta hablar con la gente" },
        { value: "verguenza", label: "Me da algo de vergüenza, pero lo intentaría" },
        { value: "cuesta", label: "Me cuesta, pero quiero aprender" }, { value: "evito", label: "Prefiero no hablar con nadie" }
      ],
      microcopy: "A casi todos les pasa al inicio. Se aprende con práctica y guía."
    },
    {
      id: "compromiso", type: "single", question: "Si tuvieras una ruta clara, ¿cuál sería tu compromiso en las próximas 2 semanas?",
      options: [
        { value: "diario", label: "Practicar todos los días" }, { value: "varias", label: "Practicar varias veces por semana" },
        { value: "cuando_pueda", label: "Revisar el material cuando pueda" }, { value: "mirando", label: "Solo estoy mirando, por ahora" }
      ]
    }
  ],
  interlude: {
    eyebrow: "La idea clave",
    title: "Un dato antes de seguir, {nombre}",
    text: "Un negocio digital no empieza ganando dinero. Empieza aprendiendo a atraer, conversar y vender. Las siguientes preguntas nos ayudan a ver qué tan listo estás para eso.",
    cta: "Entendido, sigamos"
  },
  analysis: "Estamos revisando tus respuestas, {nombre}…",
  result: {
    eyebrow: "Tu punto de partida",
    title: "{nombre}, tu diagnóstico está listo",
    dimensions: { herramientas: "Herramientas", tiempo: "Tiempo", actitud: "Actitud", punto: "Punto de partida" },
    objective: "Tu objetivo", strength: "Tu fortaleza", challenge: "Tu reto principal", area: "Área a trabajar",
    routeTitle: "Tu ruta de inicio", route: ["Contenido", "Atracción", "Conversaciones", "Ventas"],
    disclaimer: "Este diagnóstico se basa solo en tus respuestas. No garantiza resultados.",
    levels: { ready: "Listo", building: "En construcción", reinforce: "Por reforzar" },
    strengths: { actitud: "Tu disposición para aprender", herramientas: "Tus herramientas", tiempo: "Tu tiempo disponible", punto: "Tu experiencia previa" },
    challenges: { actitud: "Constancia y confianza", herramientas: "Las herramientas básicas", tiempo: "Organizar tu tiempo", punto: "Empezar desde cero con guía" },
    areas: {
      ventas: { label: "Ventas", line: "Tu área a trabajar es Ventas: aprender a conversar con personas y ofrecer con naturalidad." },
      constancia: { label: "Constancia", line: "Tu área a trabajar es la Constancia: avanzar un poco cada día, aunque sea poco." },
      tiempo: { label: "Organización del tiempo", line: "Tu área a trabajar es organizar tu tiempo en bloques cortos." },
      practica: { label: "Práctica constante", line: "Tu área a trabajar es la práctica: aplicar lo que aprendes." }
    }
  },
  segments: {
    sin_base: { text: "{nombre}, para empezar necesitas al menos un celular con internet y todavía no lo tienes. No tendría sentido que compres hoy algo que no podrías usar. Cuando lo tengas, aquí estaremos.", cta: "Avísame cuando esté listo" },
    desconfiado: { text: "{nombre}, gracias por contarlo. Después de una mala experiencia es normal desconfiar. Por eso aquí no te prometemos ingresos: te mostramos exactamente qué recibes y puedes preguntarnos lo que quieras antes de decidir.", cta: "Resolver mis dudas por WhatsApp" },
    explorador: { text: "{nombre}, todavía estás explorando y eso está bien. Antes de decidir, mira cómo funciona un negocio digital en tres pasos: atraer, conversar y vender.", cta: "Ver qué incluye" },
    poco_tiempo: { text: "{nombre}, tu mayor reto es el tiempo. Con menos de 30 minutos al día se puede avanzar, pero necesitas organizarte. Tu ruta está pensada en bloques cortos. Avanzarás más despacio, y eso está bien.", cta: "Ver mi ruta corta" },
    con_experiencia: { text: "{nombre}, ya tienes una base. Probablemente no necesites lo más básico: tu valor está en el sistema de TikTok y las ventas por WhatsApp.", cta: "Quiero empezar" },
    decidido: { text: "{nombre}, tienes buena actitud y disposición. Lo que te falta no son ganas, es un sistema paso a paso.", cta: "Quiero empezar" },
    inseguro: { text: "{nombre}, lo que más te frena es la confianza, no la capacidad. Tu ruta empieza por pasos pequeños y con acompañamiento.", cta: "Ver cómo me acompañan" }
  },
  offer: {
    eyebrow: "Tu siguiente paso",
    bridgeTitle: "Ya sabes por dónde empezar. Ahora, cómo hacerlo.",
    bridge: "Tu diagnóstico te mostró tu punto de partida. Para recorrer ese camino creamos Tu Primer Negocio Digital: un sistema ordenado para aprender y practicar, paso a paso. Aquí abajo te explicamos qué incluye, cuánto cuesta y para quién es (y para quién no).",
    whatTitle: "¿Qué es Tu Primer Negocio Digital?",
    what: "Es un sistema paso a paso para que empieces tu primer negocio digital. Aprendes a atraer personas con TikTok, a conversar con ellas por WhatsApp y a venderles. Vas avanzando con guías, plantillas y ayuda de IA.",
    includesTitle: "Todo lo que incluye",
    includesIntro: "Esto es lo que vas a tener dentro:",
    pillars: [
      {
        label: "01 · APRENDE",
        title: "Aprende lo básico para vender por internet",
        items: [
          "Una ruta que te dice por dónde empezar",
          "Una academia con clases de ventas, marketing, creación de contenido y YouTube",
          "Una biblioteca de cursos y recursos para seguir aprendiendo",
          "Una guía para vender por chat"
        ]
      },
      {
        label: "02 · ATRAE",
        title: "Consigue que te vean y se interesen",
        items: [
          "Un sistema para crear contenido en TikTok",
          "Ideas de videos para atraer clientes",
          "Una ruta paso a paso para publicar",
          "Frases de inicio (ganchos) para captar atención en los primeros segundos y ganar seguidores"
        ]
      },
      {
        label: "03 · CONVERSA Y VENDE",
        title: "Aprende a hablar con clientes y cerrar ventas",
        items: [
          "Una estrategia para conseguir clientes",
          "Cómo vender por WhatsApp",
          "Cómo descubrir qué necesita la persona",
          "Cómo responder dudas como “está caro” o “lo voy a pensar”",
          "Cómo dar seguimiento y cerrar la venta",
          "Ebook con mensajes listos para cerrar ventas"
        ]
      },
      {
        label: "04 · AVANZA ACOMPAÑADO",
        title: "No te quedas solo en el proceso",
        items: [
          "Plantillas que te guían",
          "IA que te ayuda en cada paso",
          "Guías en PDF",
          "Ideas de contenido para que nunca te quedes sin qué publicar",
          "Acompañamiento directo conmigo por WhatsApp"
        ]
      }
    ],
    weekTitle: "Tu primera semana",
    weekIntro: "Una ruta en bloques simples:",
    week: [
      "Día 1 · Elige una ruta y prepara tus herramientas.",
      "Día 2 · Define a quién quieres ayudar y con qué.",
      "Día 3 · Crea tu primera idea de contenido.",
      "Día 4 · Publica, observa y aprende.",
      "Días 5–7 · Practica conversaciones y mejora un paso."
    ],
    honestFit: {
      eyebrow: "CLARO Y DIRECTO",
      title: "¿Es para ti? Te lo decimos claro",
      subtitle: "Mejor saberlo antes de pagar.",
      yesTitle: "Es para ti si…",
      yesItems: [
        "Quieres aprender paso a paso y practicar",
        "Puedes dedicarle al menos 20 minutos al día",
        "Te animas a preguntar cuando te trabes"
      ],
      noTitle: "No es para ti si…",
      noItems: [
        "Buscas ganar dinero rápido y sin esfuerzo",
        "Esperas resultados garantizados",
        "No puedes dedicarle ni 20 minutos al día"
      ],
      closingWhat: "Qué es:",
      closingWhatText: "un sistema para aprender y practicar.",
      closingNot: "Qué no es:",
      closingNotText: "una promesa de ingresos.",
      closingEnd: "Tus resultados dependen de que lo apliques."
    },
    priceTitle: "Empieza con un solo pago",
    onePayment: "{price} · pago único",
    noHidden: "Un solo pago. Sin suscripciones ni cobros ocultos.",
    payment: "Pagas por Yape, transferencia BCP u otros medios. Te enviamos el acceso por WhatsApp apenas confirmes el pago.",
    priceCta: "Quiero empezar por {price}",
    priceCtaNote: "Te llevaremos a WhatsApp para coordinar el pago.",
    sampleTitle: "Mira una muestra antes de decidir",
    sampleCta: "Ver muestra gratis",
    testimonialsTitle: "Lo que dicen quienes lo probaron",
    finalTitle: "Tu primer paso puede ser pequeño. Lo importante es que sea claro.",
    finalText: "Revisa lo que incluye y, si te hace sentido, escríbenos. Puedes preguntar antes de pagar.",
    finalCta: "Quiero empezar",
    checklistCta: "Descargar checklist gratis",
    explorerSteps: ["Atrae con contenido útil", "Conversa con personas reales", "Vende con claridad, sin presionar"],
    labels: {
      week: "Plan de arranque",
      testimonials: "Experiencias reales",
      faq: "Sin letra pequeña",
      what: "El sistema",
      includes: "Por dentro",
      price: "Acceso completo"
    }
  },
  faq: {
    title: "Preguntas antes de empezar",
    items: [
      { id: "estafa", question: "¿Es una estafa?", answer: "No prometemos dinero ni resultados. Te mostramos exactamente qué incluye y puedes escribirnos por WhatsApp para preguntar antes de pagar." },
      { id: "sin_resultados", question: "¿Voy a ganar dinero?", answer: "No lo garantizamos. Aprendes habilidades y un sistema; los resultados dependen de que lo apliques." },
      { id: "sin_experiencia", question: "No tengo experiencia, ¿puedo?", answer: "Sí. La ruta empieza desde cero y paso a paso." },
      { id: "sin_tiempo", question: "No tengo mucho tiempo", answer: "Con 20 a 30 minutos al día se puede avanzar. Avanzarás más despacio, pero avanzas." },
      { id: "sin_dinero", question: "¿Tengo que invertir más dinero?", answer: "No necesitas invertir más para empezar a aprender. Con celular e internet puedes comenzar." },
      { id: "pago", question: "¿Cómo pago y cuándo recibo el acceso?", answer: "Pagas por Yape, transferencia BCP u otros medios. Recibes el acceso apenas confirmemos tu pago." },
      { id: "devoluciones", question: "¿Hay devoluciones?", answer: "Es un producto digital de acceso inmediato, por eso no hay devoluciones. Si tienes dudas, escríbenos antes de pagar y te respondemos." },
      { id: "acompanamiento", question: "¿Qué incluye el acompañamiento?", answer: "Incluye una comunidad de apoyo, guías y recursos para avanzar. Si quieres confirmar el alcance exacto antes de pagar, escríbenos por WhatsApp." }
    ],
    minor: { id: "menor", question: "Soy menor de edad, ¿puedo?", answer: "Sí, puedes aprender. Si eres menor, pídele a un adulto que te ayude con el pago." }
  },
  whatsapp: {
    main: "Hola, soy {nombre}. Terminé el diagnóstico de Tu Primer Negocio Digital y quiero empezar. Mi objetivo es {objetivo} y mi mayor duda es {duda}. (Ref: {codigo})",
    doubts: "Hola, soy {nombre}. Hice el diagnóstico de Tu Primer Negocio Digital y quiero resolver unas dudas antes de decidir. Mi mayor duda es {duda}. (Ref: {codigo})",
    notify: "Hola, soy {nombre}. Hice el diagnóstico de Tu Primer Negocio Digital. Todavía no tengo todo para empezar, pero quiero que me avisen más adelante. (Ref: {codigo})"
  }
};

