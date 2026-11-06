/* Textos da página Let Me Be em EN / ES (chave = texto em português, HTML normalizado) */
(function () {
  var D = window.FYW_PAGE_I18N; if (!D) return;
  var H = function (spec, sm, cls, ex) { return '<span class="lmb-hier-spec"><b>' + spec + '</b><small>' + sm + '</small></span><span class="lmb-hier-ex ' + cls + '">' + ex + '</span>'; };
  var C = function (c, n, p) { return '<i style="--c:' + c + '"></i><span>' + n + '</span><b>' + p + '</b>'; };
  var S = function (b, s) { return '<span class="pp2-fx" aria-hidden="true"></span><b>' + b + '</b><span>' + s + '</span>'; };
  var PAL = function (n, m, hex, rgb) { return '<b>' + n + '</b><i>' + m + '</i><span>' + hex + '</span><span>' + rgb + '</span>'; };
  var L = {
    'Let Me Be — Rebranding | Fyw': ['Let Me Be — Rebranding | Fyw', 'Let Me Be — Rebranding | Fyw'],
    'Let Me Be: rebranding de uma marca brasileira de beleza capilar. Novo lettering, paleta, tipografia, redes sociais e embalagens criados pela Fyw.': ['Let Me Be: rebranding of a Brazilian hair beauty brand. New lettering, palette, typography, social media and packaging created by Fyw.', 'Let Me Be: rebranding de una marca brasileña de belleza capilar. Nuevo lettering, paleta, tipografía, redes sociales y empaques creados por Fyw.'],
    'Marília, Brasil': ['Marília, Brazil', 'Marília, Brasil'],
    'Cosméticos · Rebranding': ['Cosmetics · Rebranding', 'Cosméticos · Rebranding'],
    'Antes e depois': ['Before and after', 'Antes y después'],
    'Arraste para comparar': ['Drag to compare', 'Arrastra para comparar'],
    'Antes': ['Before', 'Antes'], 'Depois': ['After', 'Después'],
    'Construção do logo': ['Logo construction', 'Construcción del logo'],
    '<b>01</b>Assinatura de origem': ['<b>01</b>Original signature', '<b>01</b>Firma de origen'],
    '<b>02</b>Movimento dos fios': ['<b>02</b>Movement of the hair', '<b>02</b>Movimiento del cabello'],
    '<b>03</b>Brilho da beleza': ['<b>03</b>Glow of beauty', '<b>03</b>Brillo de la belleza'],
    'Uma marca brasileira de beleza capilar que cresceu, cruzou fronteiras e precisava de uma identidade à altura.': ['A Brazilian hair beauty brand that grew, crossed borders and needed an identity to match.', 'Una marca brasileña de belleza capilar que creció, cruzó fronteras y necesitaba una identidad a la altura.'],
    'A Let Me Be nasceu em 2015 em Marília, no interior de São Paulo, unindo tecnologia, inovação e alta performance em produtos para os cabelos. Hoje tem filial em Portugal e atua em países da Europa, da Ásia e das Américas.': ['Let Me Be was born in 2015 in Marília, in the countryside of São Paulo, bringing together technology, innovation and high performance in hair products. Today it has a branch in Portugal and operates in countries across Europe, Asia and the Americas.', 'Let Me Be nació en 2015 en Marília, en el interior de São Paulo, uniendo tecnología, innovación y alto rendimiento en productos para el cabello. Hoy tiene una filial en Portugal y está presente en países de Europa, Asia y las Américas.'],
    'O rebranding parte da assinatura do logo antigo e a transforma em uma linguagem mais sofisticada, contemporânea e conectada ao universo da beleza. A marca preserva sua origem e apresenta uma nova fase: mais elegante, madura e moderna.': ['The rebrand starts from the signature of the old logo and turns it into a more sophisticated, contemporary language connected to the world of beauty. The brand keeps its origins and presents a new phase: more elegant, mature and modern.', 'El rebranding parte de la firma del logo antiguo y la transforma en un lenguaje más sofisticado, contemporáneo y conectado con el universo de la belleza. La marca preserva su origen y presenta una nueva etapa: más elegante, madura y moderna.'],
    'A marca tinha crescido e saído do Brasil, mas o logo manuscrito ainda falava como no começo. Era preciso amadurecer a identidade sem perder a proximidade construída com as clientes desde 2015.': ['The brand had grown and gone beyond Brazil, but the handwritten logo still spoke like it did at the start. The identity had to mature without losing the closeness built with customers since 2015.', 'La marca había crecido y salido de Brasil, pero el logo manuscrito todavía hablaba como al principio. Había que madurar la identidad sin perder la cercanía construida con las clientas desde 2015.'],
    'Redesenhamos a assinatura em um lettering exclusivo de três linhas, com hastes grossas e finas, curvas que lembram o movimento dos fios e um brilho de quatro pontas. Em volta dele, criamos paleta, tipografia, tom de voz, direção de fotografia, redes sociais e embalagens.': ['We redrew the signature as an exclusive three-line lettering, with thick and thin strokes, curves that recall the movement of hair and a four-pointed sparkle. Around it, we created the palette, typography, tone of voice, photography direction, social media and packaging.', 'Rediseñamos la firma en un lettering exclusivo de tres líneas, con trazos gruesos y finos, curvas que recuerdan el movimiento del cabello y un brillo de cuatro puntas. A su alrededor creamos la paleta, la tipografía, el tono de voz, la dirección de fotografía, las redes sociales y los empaques.'],
    'Conceito': ['Concept', 'Concepto'],
    'Logo antigo': ['Old logo', 'Logo antiguo'], 'Enobrecimento capilar': ['Hair enhancement', 'Realce capilar'], 'Brilho da beleza': ['Glow of beauty', 'Brillo de la belleza'], 'Nova identidade': ['New identity', 'Nueva identidad'],
    'Origem': ['Origin', 'Origen'], 'Movimento': ['Movement', 'Movimiento'], 'Brilho': ['Glow', 'Brillo'],
    'O desenho parte da assinatura do logo anterior e a transforma em uma linguagem mais sofisticada e contemporânea.': ['The design starts from the signature of the previous logo and turns it into a more sophisticated, contemporary language.', 'El diseño parte de la firma del logo anterior y la transforma en un lenguaje más sofisticado y contemporáneo.'],
    'Formas fluidas fazem referência ao movimento e ao enobrecimento dos cabelos: cuidado e transformação, de maneira sutil.': ['Fluid shapes refer to the movement and enhancement of hair: care and transformation, in a subtle way.', 'Las formas fluidas hacen referencia al movimiento y al realce del cabello: cuidado y transformación, de manera sutil.'],
    'O elemento de brilho reforça luminosidade, resultado e valorização da beleza, e traz reconhecimento à identidade.': ['The sparkle reinforces radiance, results and the celebration of beauty, and makes the identity recognizable.', 'El brillo refuerza la luminosidad, el resultado y la valorización de la belleza, y aporta reconocimiento a la identidad.'],
    'Do lápis ao vetor': ['From pencil to vector', 'Del lápiz al vector'],
    '<b>Esboço</b><span>Quatro etapas à mão, da assinatura antiga até o novo lettering.</span>': ['<b>Sketch</b><span>Four hand-drawn steps, from the old signature to the new lettering.</span>', '<b>Boceto</b><span>Cuatro etapas a mano, de la firma antigua al nuevo lettering.</span>'],
    '<b>Construção</b><span>Curvas, alturas e espaçamentos definidos em um grid geométrico.</span>': ['<b>Construction</b><span>Curves, heights and spacing defined on a geometric grid.</span>', '<b>Construcción</b><span>Curvas, alturas y espaciados definidos en una retícula geométrica.</span>'],
    'Versões do logo': ['Logo versions', 'Versiones del logo'],
    '<b>Vertical · preferencial</b><span>Para embalagens, redes sociais, capas e peças quadradas ou verticais.</span>': ['<b>Vertical · primary</b><span>For packaging, social media, covers and square or vertical pieces.</span>', '<b>Vertical · preferente</b><span>Para empaques, redes sociales, portadas y piezas cuadradas o verticales.</span>'],
    '<b>Horizontal · secundária</b><span>Para cabeçalhos de sites, assinaturas de e-mail, papelaria, rodapés e espaços com pouca altura.</span>': ['<b>Horizontal · secondary</b><span>For website headers, email signatures, stationery, footers and short spaces.</span>', '<b>Horizontal · secundaria</b><span>Para encabezados de sitios, firmas de correo, papelería, pies de página y espacios con poca altura.</span>'],
    'Positiva': ['Positive', 'Positiva'], 'Negativa': ['Negative', 'Negativa'], 'Gradiente institucional': ['Brand gradient', 'Degradado institucional'], 'Sobre cor clara': ['On light color', 'Sobre color claro'],
    'Grafite sobre fundos claros': ['Graphite on light backgrounds', 'Grafito sobre fondos claros'],
    'Branco sobre fundos escuros': ['White on dark backgrounds', 'Blanco sobre fondos oscuros'],
    'Branco sobre o gradiente verde': ['White on the green gradient', 'Blanco sobre el degradado verde'],
    'Gradiente sobre fundos claros': ['Gradient on light backgrounds', 'Degradado sobre fondos claros'],
    '<span>Gradiente institucional</span>': ['<span>Brand gradient</span>', '<span>Degradado institucional</span>'],
    'Proporção de uso': ['Usage ratio', 'Proporción de uso'],
    'Tipografia': ['Typography', 'Tipografía'],
    'Geométrica, moderna e versátil. Une legibilidade e elegância e equilibra o lettering expressivo do logo.': ['Geometric, modern and versatile. It combines legibility and elegance and balances the expressive lettering of the logo.', 'Geométrica, moderna y versátil. Une legibilidad y elegancia y equilibra el lettering expresivo del logo.'],
    '<b>Light</b><span>Títulos e textos longos</span>': ['<b>Light</b><span>Headings and long texts</span>', '<b>Light</b><span>Títulos y textos largos</span>'],
    '<b>Regular</b><span>Corpo de texto</span>': ['<b>Regular</b><span>Body text</span>', '<b>Regular</b><span>Cuerpo de texto</span>'],
    '<b>SemiBold Italic</b><span>Nome da marca no texto</span>': ['<b>SemiBold Italic</b><span>Brand name in text</span>', '<b>SemiBold Italic</b><span>Nombre de la marca en el texto</span>'],
    '<b>ITALIC CAIXA-ALTA</b><span>Assinaturas</span>': ['<b>ITALIC UPPERCASE</b><span>Sign-offs</span>', '<b>ITALIC MAYÚSCULAS</b><span>Firmas</span>'],
    'Hierarquia tipográfica': ['Type hierarchy', 'Jerarquía tipográfica'],
    'Passe o mouse': ['Hover over it', 'Pasa el mouse'],
    'Símbolo': ['Symbol', 'Símbolo'], 'O brilho': ['The sparkle', 'El brillo'],
    'A estrela de quatro pontas simboliza luminosidade, beleza e transformação: a autenticidade, a autoestima e o brilho próprio de cada pessoa.': ['The four-pointed star symbolizes radiance, beauty and transformation: the authenticity, self-esteem and inner glow of each person.', 'La estrella de cuatro puntas simboliza luminosidad, belleza y transformación: la autenticidad, la autoestima y el brillo propio de cada persona.'],
    'Elemento gráfico de destaque nas composições': ['A highlight graphic element in compositions', 'Elemento gráfico destacado en las composiciones'],
    'Usado em títulos, detalhes e materiais institucionais': ['Used in headings, details and brand materials', 'Usado en títulos, detalles y materiales institucionales'],
    'Sempre nas proporções originais, sem distorções nem excessos': ['Always in its original proportions, never distorted or overused', 'Siempre en sus proporciones originales, sin distorsiones ni excesos'],
    'Tom de voz': ['Tone of voice', 'Tono de voz'],
    '<b>Confiante</b><span>sem arrogância</span>': ['<b>Confident</b><span>never arrogant</span>', '<b>Segura</b><span>sin arrogancia</span>'],
    '<b>Acolhedora</b><span>próxima e genuína</span>': ['<b>Welcoming</b><span>close and genuine</span>', '<b>Acogedora</b><span>cercana y genuina</span>'],
    '<b>Elegante</b><span>clara e objetiva</span>': ['<b>Elegant</b><span>clear and direct</span>', '<b>Elegante</b><span>clara y objetiva</span>'],
    '<b>Empoderada</b><span>inspira e convida à ação</span>': ['<b>Empowered</b><span>inspires and invites action</span>', '<b>Empoderada</b><span>inspira e invita a la acción</span>'],
    '<span><b>Faça</b>Verbos no imperativo, frases de até seis palavras, ritmo em três tempos.</span><span><b>Evite</b>Gírias, excesso de emojis, promessas milagrosas e jargão técnico.</span>': ['<span><b>Do</b>Imperative verbs, phrases of up to six words, a three-beat rhythm.</span><span><b>Avoid</b>Slang, too many emojis, miracle promises and technical jargon.</span>', '<span><b>Haz</b>Verbos en imperativo, frases de hasta seis palabras, ritmo en tres tiempos.</span><span><b>Evita</b>Jerga, exceso de emojis, promesas milagrosas y tecnicismos.</span>'],
    'Empodere sua beleza.': ['Empower your beauty.', 'Empodera tu belleza.'],
    'Liberdade para ser.': ['Freedom to be.', 'Libertad para ser.'],
    'Confiança para brilhar.': ['Confidence to shine.', 'Confianza para brillar.'],
    'Desperte sua beleza.': ['Awaken your beauty.', 'Despierta tu belleza.'],
    'Revele quem você é.': ['Reveal who you are.', 'Revela quién eres.'],
    'Cuide de si.': ['Take care of yourself.', 'Cuídate.'],
    'Transforme-se.': ['Transform yourself.', 'Transfórmate.'],
    'Brilhe do seu jeito.': ['Shine your way.', 'Brilla a tu manera.'],
    'Social media': ['Social media', 'Redes sociales'],
    'Um feed em xadrez, entre foto e gradiente.': ['A checkerboard feed, between photo and gradient.', 'Un feed en damero, entre foto y degradado.'],
    'Fotografias expressivas se alternam com posts no gradiente institucional. O ritmo cria reconhecimento imediato, e as frases curtas falam de autoestima, autenticidade e liberdade.': ['Expressive photos alternate with posts on the brand gradient. The rhythm creates instant recognition, and the short phrases speak of self-esteem, authenticity and freedom.', 'Fotografías expresivas se alternan con posts en el degradado institucional. El ritmo crea reconocimiento inmediato y las frases cortas hablan de autoestima, autenticidad y libertad.'],
    '<b>Foto</b><span>“Empodere sua beleza” no topo e o logo ao centro</span>': ['<b>Photo</b><span>“Empower your beauty” at the top and the logo in the center</span>', '<b>Foto</b><span>“Empodera tu belleza” arriba y el logo al centro</span>'],
    '<b>Gradiente</b><span>Logo pequeno no topo e a frase ao centro</span>': ['<b>Gradient</b><span>Small logo at the top and the phrase in the center</span>', '<b>Degradado</b><span>Logo pequeño arriba y la frase al centro</span>'],
    '<b>Base</b><span>URL sempre embaixo, em itálico caixa-alta, todo o texto em branco</span>': ['<b>Bottom</b><span>URL always at the bottom, in italic uppercase, all text in white</span>', '<b>Base</b><span>URL siempre abajo, en itálica mayúscula, todo el texto en blanco</span>'],
    'Produto e embalagem': ['Product and packaging', 'Producto y empaque'],
    'Frascos': ['Bottles', 'Frascos'], 'Caixas': ['Boxes', 'Cajas'], 'Acabamentos': ['Finishes', 'Acabados'],
    'Rótulo metálico, logo em grafite e uma faixa vertical com a gota recortada.': ['Metallic label, graphite logo and a vertical band with a cut-out drop.', 'Etiqueta metálica, logo en grafito y una franja vertical con la gota recortada.'],
    'Logo em destaque, com nome e ativos em caixa-alta para manter tudo elegante e organizado.': ['Prominent logo, with name and actives in uppercase to keep everything elegant and organized.', 'Logo destacado, con nombre y activos en mayúsculas para mantener todo elegante y ordenado.'],
    'Válvulas douradas, tampas em preto fosco e vidro translúcido, com contraste e percepção de qualidade.': ['Gold pumps, matte black caps and translucent glass, for contrast and a sense of quality.', 'Válvulas doradas, tapas en negro mate y vidrio translúcido, con contraste y percepción de calidad.'],
    'Fotografia': ['Photography', 'Fotografía'],
    'Retratos próximos, olhares expressivos e detalhes da pele e dos cabelos. Luz suave, tons quentes e diferentes tons de pele, texturas e expressões.': ['Close portraits, expressive looks and details of skin and hair. Soft light, warm tones and a range of skin tones, textures and expressions.', 'Retratos cercanos, miradas expresivas y detalles de la piel y el cabello. Luz suave, tonos cálidos y distintos tonos de piel, texturas y expresiones.'],
    'Liberdade para ser.<br>Confiança para brilhar.': ['Freedom to be.<br>Confidence to shine.', 'Libertad para ser.<br>Confianza para brillar.'],
    'O futuro da marca começa agora.': ['The future of the brand starts now.', 'El futuro de la marca empieza ahora.'],
    'Sua marca cresceu? Ela merece um rebranding.': ['Has your brand grown? It deserves a rebrand.', '¿Tu marca creció? Merece un rebranding.'],
    // textos alternativos e rótulos
    'Logo antigo da Let Me Be': ['Old Let Me Be logo', 'Logo antiguo de Let Me Be'],
    'Logo novo da Let Me Be': ['New Let Me Be logo', 'Logo nuevo de Let Me Be'],
    'Comparar o logo antigo com o novo': ['Compare the old logo with the new one', 'Comparar el logo antiguo con el nuevo'],
    'Repetir animação do logo': ['Replay the logo animation', 'Repetir la animación del logo'],
    'Caderno com quatro esboços à mão do novo lettering da Let Me Be': ['Notebook with four hand sketches of the new Let Me Be lettering', 'Cuaderno con cuatro bocetos a mano del nuevo lettering de Let Me Be'],
    'Grid de construção do logo Let Me Be com círculos e medidas': ['Let Me Be logo construction grid with circles and measurements', 'Retícula de construcción del logo Let Me Be con círculos y medidas'],
    'Frases da marca': ['Brand phrases', 'Frases de la marca'],
    'Post com foto: mulher de cabelo liso e longo com o logo ao centro': ['Photo post: woman with long straight hair and the logo in the center', 'Post con foto: mujer de cabello largo y liso con el logo al centro'],
    'Post no gradiente da marca: “Desperte sua beleza. Revele quem você é.”': ['Brand gradient post: “Awaken your beauty. Reveal who you are.”', 'Post en el degradado de la marca: “Despierta tu belleza. Revela quién eres.”'],
    'Post com foto: retrato com sardas e o logo ao centro': ['Photo post: freckled portrait with the logo in the center', 'Post con foto: retrato con pecas y el logo al centro'],
    'Post no gradiente da marca: “Sua beleza, sua força, sua melhor versão.”': ['Brand gradient post: “Your beauty, your strength, your best self.”', 'Post en el degradado de la marca: “Tu belleza, tu fuerza, tu mejor versión.”'],
    'Post com foto: mulher de cabelo cacheado com o logo ao centro': ['Photo post: woman with curly hair and the logo in the center', 'Post con foto: mujer de cabello rizado con el logo al centro'],
    'Post no gradiente da marca: “Beleza que cuida, transforma e empodera.”': ['Brand gradient post: “Beauty that cares, transforms and empowers.”', 'Post en el degradado de la marca: “Belleza que cuida, transforma y empodera.”'],
    'Post com foto: retrato de cabelo cacheado com o logo ao centro': ['Photo post: curly hair portrait with the logo in the center', 'Post con foto: retrato de cabello rizado con el logo al centro'],
    'Post no gradiente da marca: “Liberdade para ser. Confiança para brilhar.”': ['Brand gradient post: “Freedom to be. Confidence to shine.”', 'Post en el degradado de la marca: “Libertad para ser. Confianza para brillar.”'],
    'Post com foto: mulher ruiva de cabelo ondulado com o logo ao centro': ['Photo post: red-haired woman with wavy hair and the logo in the center', 'Post con foto: mujer pelirroja de cabello ondulado con el logo al centro'],
    'Post no gradiente da marca: “Transforme seus cabelos. Realce sua confiança.”': ['Brand gradient post: “Transform your hair. Boost your confidence.”', 'Post en el degradado de la marca: “Transforma tu cabello. Realza tu confianza.”'],
    'Post com foto: mulher ruiva sobre fundo escuro com o logo ao centro': ['Photo post: red-haired woman on a dark background with the logo in the center', 'Post con foto: mujer pelirroja sobre fondo oscuro con el logo al centro'],
    'Post no gradiente da marca: “Cuide de si. Transforme-se. Brilhe do seu jeito.”': ['Brand gradient post: “Take care of yourself. Transform yourself. Shine your way.”', 'Post en el degradado de la marca: “Cuídate. Transfórmate. Brilla a tu manera.”'],
    'Frascos Velvet Drops da Let Me Be ao ar livre': ['Let Me Be Velvet Drops bottles outdoors', 'Frascos Velvet Drops de Let Me Be al aire libre'],
    'Caixa da linha Terapia Cremosa com o logo Let Me Be': ['Terapia Cremosa box with the Let Me Be logo', 'Caja de la línea Terapia Cremosa con el logo Let Me Be'],
    'Mulher sorrindo com os frascos Velvet Drops': ['Smiling woman with Velvet Drops bottles', 'Mujer sonriendo con los frascos Velvet Drops'],
    'Retratos da direção fotográfica': ['Photography direction portraits', 'Retratos de la dirección fotográfica'],
    'Retrato da direção fotográfica da Let Me Be': ['Let Me Be photography direction portrait', 'Retrato de la dirección fotográfica de Let Me Be']
  };
  L['<b>Verde Let Me Be</b><i>Equilíbrio e confiança</i><span>#008575</span><span>RGB 0, 133, 117</span>'] = [PAL('Let Me Be green', 'Balance and trust', '#008575', 'RGB 0, 133, 117'), PAL('Verde Let Me Be', 'Equilibrio y confianza', '#008575', 'RGB 0, 133, 117')];
  L['<b>Menta</b><i>Frescor e delicadeza</i><span>#A7DED4</span><span>RGB 167, 222, 212</span>'] = [PAL('Mint', 'Freshness and delicacy', '#A7DED4', 'RGB 167, 222, 212'), PAL('Menta', 'Frescura y delicadeza', '#A7DED4', 'RGB 167, 222, 212')];
  L['<b>Sálvia suave</b><i>Naturalidade e harmonia</i><span>#D1D5BB</span><span>RGB 209, 213, 187</span>'] = [PAL('Soft sage', 'Naturalness and harmony', '#D1D5BB', 'RGB 209, 213, 187'), PAL('Salvia suave', 'Naturalidad y armonía', '#D1D5BB', 'RGB 209, 213, 187')];
  L['<b>Oliva dourado</b><i>Valor e luminosidade</i><span>#BFA777</span><span>RGB 191, 167, 119</span>'] = [PAL('Golden olive', 'Value and radiance', '#BFA777', 'RGB 191, 167, 119'), PAL('Oliva dorado', 'Valor y luminosidad', '#BFA777', 'RGB 191, 167, 119')];
  L['<b>Grafite</b><i>Confiança e modernidade</i><span>#404040</span><span>RGB 64, 64, 64</span>'] = [PAL('Graphite', 'Trust and modernity', '#404040', 'RGB 64, 64, 64'), PAL('Grafito', 'Confianza y modernidad', '#404040', 'RGB 64, 64, 64')];
  L['<b>Off-white</b><i>Leveza e pureza</i><span>#F8F5F1</span><span>RGB 248, 245, 241</span>'] = [PAL('Off-white', 'Lightness and purity', '#F8F5F1', 'RGB 248, 245, 241'), PAL('Blanco roto', 'Ligereza y pureza', '#F8F5F1', 'RGB 248, 245, 241')];
  [['#008575', 'Verde Let Me Be', 'Let Me Be green', 'Verde Let Me Be', '40%'], ['#F8F5F1', 'Off-white', 'Off-white', 'Blanco roto', '25%'], ['#D1D5BB', 'Sálvia suave', 'Soft sage', 'Salvia suave', '15%'], ['#BFA777', 'Oliva dourado', 'Golden olive', 'Oliva dorado', '10%'], ['#404040', 'Grafite', 'Graphite', 'Grafito', '7%'], ['#A7DED4', 'Menta', 'Mint', 'Menta', '3%']].forEach(function (r) { L[C(r[0], r[1], r[4])] = [C(r[0], r[2], r[4]), C(r[0], r[3], r[4])]; });
  L[H('Título', 'Light Italic, caixa-alta · 3× o corpo', 'is-kick', 'Empodere sua beleza')] = [H('Heading', 'Light Italic, uppercase · 3× body', 'is-kick', 'Empower your beauty'), H('Título', 'Light Italic, mayúsculas · 3× el cuerpo', 'is-kick', 'Empodera tu belleza')];
  L[H('Frase de campanha', 'Regular · 1,2× o corpo', 'is-phrase', 'Liberdade para ser. Confiança para brilhar.')] = [H('Campaign line', 'Regular · 1.2× body', 'is-phrase', 'Freedom to be. Confidence to shine.'), H('Frase de campaña', 'Regular · 1,2× el cuerpo', 'is-phrase', 'Libertad para ser. Confianza para brillar.')];
  L[H('Corpo de texto', 'Regular · tamanho base', 'is-body', 'A beleza é uma expressão de cuidado, autoestima e confiança.')] = [H('Body text', 'Regular · base size', 'is-body', 'Beauty is an expression of care, self-esteem and confidence.'), H('Cuerpo de texto', 'Regular · tamaño base', 'is-body', 'La belleza es una expresión de cuidado, autoestima y confianza.')];
  L[H('Nome da marca', 'Bold Italic · igual ao corpo', 'is-name', 'Let Me Be')] = [H('Brand name', 'Bold Italic · same as body', 'is-name', 'Let Me Be'), H('Nombre de la marca', 'Bold Italic · igual al cuerpo', 'is-name', 'Let Me Be')];
  L[H('Assinatura e URL', 'Italic, caixa-alta · 0,8× o corpo', 'is-url', 'www.letmebe.com.br')] = [H('Sign-off and URL', 'Italic, uppercase · 0.8× body', 'is-url', 'www.letmebe.com.br'), H('Firma y URL', 'Italic, mayúsculas · 0,8× el cuerpo', 'is-url', 'www.letmebe.com.br')];
  L[S('2015', 'ano em que a marca nasceu, em Marília (SP)')] = [S('2015', 'the year the brand was born, in Marília (Brazil)'), S('2015', 'año en que nació la marca, en Marília (Brasil)')];
  L[S('3', 'continentes com a marca presente')] = [S('3', 'continents where the brand is present'), S('3', 'continentes con presencia de la marca')];
  L[S('6', 'cores na nova paleta')] = [S('6', 'colors in the new palette'), S('6', 'colores en la nueva paleta')];
  for (var k in L) D[k] = L[k];
})();
