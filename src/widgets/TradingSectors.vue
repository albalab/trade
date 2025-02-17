<template>
  <div class="trading-sectors">
      <div>Trading sectors</div>
      <div v-for="(sector, key) in sectors" :key="key">
        <div v-for="(obj, key2) in sector" :key="key2">

          <h2 v-if="key2 === 'name'">{{obj}}</h2>
<!--          <div v-if="key2 === 'description'">{{subsector[0]}}</div>-->
          <div v-if="key2 === 'groups'" style="margin: 0 0 20px;">

            <div v-for="(subsector, key3) in obj" :key="key3" style="margin: 0 0 5px;">

              {{key3}}: <span v-for="(item, key4) in subsector.tickers" :key="key4">
              MOEX:{{item}}:TQBR;
            </span>
            </div>

          </div>

        </div>
      </div>
  </div>
</template>

<script>

export default {

  name: 'TradingSectors',

  setup() {
    //const openaiStore = useOpenaiStore();

    return {
      //openaiStore,
    }
  },
  data() {
    return {

      sectors: [
        {
          name: "Chaos",
          description: [
            "Ниже приведён один из вариантов группировки российских акций с учётом «предсказуемости» их динамики – то есть разделения на те бумаги, поведение которых высококоррелировано с общим рыночным индексом и новостным фоном, и те, чьи движения отличаются высокой волатильностью и кажутся более «хаотичными». Такой подход можно интерпретировать через статистические показатели: высокие коэффициенты корреляции, низкая волатильность и устойчивая динамика говорят о большей предсказуемости, тогда как низкая корреляция с индексом и высокая дисперсия сигнализируют о случайных, «шумовых» движениях.",
            "Предсказуемые. Эти бумаги обладают устойчивыми фундаментальными показателями, высокой ликвидностью и значительной долей в индексе. Их динамика часто отражает общие тренды экономики, что позволяет строить вероятностные модели движения, опираясь на исторические данные и новости.",
            "Хаотичные. Здесь доминируют компании, чья цена зависит от быстрых новостных импульсов, рыночных ожиданий и спекуляций. Такие акции характеризуются высокой волатильностью и менее стабильной корреляцией с базовыми индексными движениями, что затрудняет их математическое прогнозирование.",
              "Такое разделение помогает аналитикам и инвесторам выбирать подходы к моделированию и оценке риска: стабильные, «предсказуемые» бумаги позволяют строить более надежные прогнозы, а «хаотичные» – требуют учета более сложных, часто нелинейных моделей с повышенной неопределенностью."
          ],

          groups: {

            "predictableEnergy": {
              tickers: ["LKOH", "ROSN", "GAZP", "TATN", "TATNP"],
              description: "Крупные нефтегазовые гиганты – их котировки обычно тесно связаны с макроэкономическими тенденциями и общим индексом.",
            },

            "predictableMetallist": {
              tickers: ["GMKN", "NLMK", "MAGN", "ALRS", "PLZL"],
              description: "Добыча и переработка металлов – стабильный сектор, отражающий мировые сырьевые тренды и обладающий высокой ликвидностью.",
            },


            "predictableFinance": {
              tickers: ["SBER", "SBERP", "VTBR"],
              description: "Крупнейшие банки, регулярно демонстрирующие высокую корреляцию с рынком благодаря устойчивым бизнес-моделям и значимой доле в индексе.",
            },


            "chaosTechnology": {
              tickers: ["YDEX", "OZON", "MVID", "HEAD", "DIAS", "DATA", "SOFL", "DELI", "QIWI", "SFIN"],
              description: "Акции IT и цифровых платформ зачастую реагируют на новости, инновационные анонсы и спекулятивные ожидания, что приводит к высокой волатильности и менее стабильной динамике.",
            },

            "chaosRetail": {
              tickers: ["MGNT", "LENT", "OKEY", "DSKY", "APTK", "PIKK", "CIAN", "LEAS", "RENI", "LSRG", "GCHE"],
              description: "Компании, зависящие от потребительских трендов и настроений, могут резко менять своё поведение при появлении новых данных о спросе, что делает их динамику менее предсказуемой.",
            },

            "chaosIndustry": {
              tickers: ["KMAZ", "TRNFP", "AFLT", "FLOT", "UNKL", "TRMK", "IRKT", "ROLO", "MDMG", "GEMC", "HNFG"],
              description: "Промышленные и транспортные компании зачастую подвержены цикличности и внешним шокам, что приводит к более «шумным» котировкам и меньшей корреляции с общим индексом.",
            },
          }

        },

        {
          name: "Многогранные активы",
          description: [
            "Ниже приведён анализ, какие тикеры (бумаги) появляются в большинстве наших сегментаций и как можно интерпретировать их многогранную роль.",
            "Фундаментальные константы: Тикеры, которые повторяются почти во всех группировках, выступают как базис рынка. Они отражают ключевые отраслевые сегменты (энергетика, металлургия, финансы) и задают общий вектор движения индекса, являясь «опорными столпами» экономики.",
            "Стабилизаторы и драйверы: Повторное попадание одних и тех же бумаг в различных сегментах свидетельствует о том, что эти активы оказывают влияние как на стабильность рынка, так и на его развитие, поддерживая ликвидность и кредитование.",
            "Мультифункциональные активы: Компании, появляющиеся в разных разрезах, выполняют несколько ролей одновременно, влияя на сырьевой сектор, инфраструктуру и финансовую систему.",
            "Вывод: Энергетические гиганты, металлургические лидеры и финансовые институты – это базовые индикаторы здоровья экономики и ключевые драйверы индекса МосБиржи."
          ],
          groups: {
            energyGiants: {
              tickers: ["LKOH", "ROSN", "GAZP", "TATN", "TATNP"],
              description: "Энергетические гиганты: Компании, связанные с нефтью, газом и энергетикой. Их повторное появление в различных сегментациях подчёркивает их фундаментальную роль за счёт огромной капитализации, устойчивости и влияния на индекс."
            },
            metallurgicalLeaders: {
              tickers: ["GMKN", "NLMK", "MAGN", "ALRS", "PLZL"],
              description: "Металлургические лидеры: Тикеры, отражающие ключевую роль сырьевого сектора в промышленном развитии. Они стабильны, обладают высокой ликвидностью и задают тон движению фондового индекса."
            },
            financialInstitutions: {
              tickers: ["SBER", "SBERP", "VTBR"],
              description: "Финансовые институты: Крупнейшие банки, которые регулярно фигурируют в финансовых сегментах. Их стабильность, ликвидность и значимость для кредитования делают их основными драйверами рыночного тренда."
            }
          }
        },

        {
          name: "Эшелоны MOEX",
          description: [
            "Ниже приведён один из вариантов разделения российского рынка по влиянию компаний на индекс МосБиржи – «эшелоны» по убыванию веса. Это приближённая классификация, основанная на капитализации и исторической важности для индекса.",
            "Пояснение: Эшелон 1 включает крупнейших игроков (энергетические, металлургические гиганты и ведущие банки), формирующих основную капитализацию и определяющих динамику индекса. Эшелон 2 объединяет компании со стабильными, но менее доминирующими позициями – это часто крупные региональные или отраслевые лидеры, а также значимые игроки IT, телекоммуникаций, ритейла и инфраструктуры. Эшелон 3 – нишевые и мелкие компании, вес которых в индексе невелик, но они могут вносить дополнительную динамику и разнообразие."
          ],
          groups: {
            // Эшелон 1 – Лидеры
            leadersEnergy: {
              tickers: ["LKOH", "ROSN", "GAZP", "NVTK", "SIBN"],
              description: "Лидеры: Энергетика – «Гиганты» энергетического сектора, задающие тон индексу MOEX."
            },
            leadersMetallurgy: {
              tickers: ["GMKN", "NLMK", "MAGN", "RUAL", "ALRS", "PLZL"],
              description: "Лидеры: Металлургия – Металлургические гиганты, формирующие значительную долю индекса."
            },
            leadersFinance: {
              tickers: ["SBER", "SBERP", "VTBR"],
              description: "Лидеры: Финансы – Ведущие финансовые институты, определяющие динамику рынка."
            },
            leadersHydro: {
              tickers: ["HYDR"],
              description: "Лидеры: Гидроэнергетика – Компании гидроэнергетического сектора с устойчивым развитием."
            },

            // Эшелон 2 – Стабилизаторы
            stabilizersEnergy: {
              tickers: ["TATN", "TATNP", "SNGS", "SNGSP"],
              description: "Стабилизаторы: Энергия (нефть/газ вторичного уровня) – Компании второго уровня в энергетике, обеспечивающие стабильность."
            },
            stabilizersIndustry: {
              tickers: ["LNZL", "LNZLP", "MTLR", "MTLRP", "FESH", "CHMK", "CHMF", "KLVZ", "MAGEP"],
              description: "Стабилизаторы: Металлургия и Промышленность – Крупные региональные и отраслевые игроки с заметным весом, уступающие лидерам."
            },
            stabilizersTelecomFintech: {
              tickers: ["YDEX", "MGTSP", "MTSS", "VEON-RX", "VRSB", "TTLK", "QIWI", "SFIN", "MBNK", "CBOM", "SVCB"],
              description: "Стабилизаторы: Телеком и IT, Финтех – Значимые игроки в области технологий и финансовых услуг."
            },
            stabilizersRetailDev: {
              tickers: ["MGNT", "LENT", "OKEY", "DSKY", "APTK", "OZON", "MVID", "PIKK", "CIAN", "LEAS", "RENI", "LSRG", "GCHE"],
              description: "Стабилизаторы: Ритейл и Девелопмент – Компании, влияющие на динамику индекса через потребительский сектор и недвижимость."
            },
            stabilizersUtilities: {
              tickers: ["RKKE", "ENPG", "MSNG", "ELFV", "LSNG", "LSNGP", "MRKP", "MRKU", "MRKY", "MRKZ", "MRKV", "FEES", "MSRS", "IRAO", "YAKG", "UGLD", "TGKN", "TGKB", "TGKA", "OGKB", "TGKBP", "PMSBP", "PMSB", "MRKS"],
              description: "Стабилизаторы: Энергосети и коммунальные – Компании коммунального и энергетического сетевого секторов, обеспечивающие стабильность инфраструктуры."
            },

            // Эшелон 3 – Нишевые
            nicheIndustryTransport: {
              tickers: ["UNKL", "KMAZ", "TRNFP", "EUTR", "AFLT", "FLOT", "RTKM", "KLSB", "AMEZ", "TRMK", "IRKT", "ROLO", "MDMG", "RASP", "PRFN", "UPRO", "DVEC", "CARM", "UNAC", "SGZH", "MGKL"],
              description: "Нишевые: Промышленность и Транспорт – Компании промышленного и транспортного секторов с меньшим влиянием на индекс."
            },
            nicheITTelecom: {
              tickers: ["DIAS", "CNTL", "CNTLP", "ETLN", "DATA", "SOFL", "WUSH", "IVAT"],
              description: "Нишевые: IT и Телеком (малые игроки) – Небольшие компании в IT и телекоммуникациях, вносящие дополнительную динамику."
            },
            nicheSmallCaps: {
              tickers: ["AQUA", "NKHP", "NSVZ", "SVAV", "ABRD", "FIXP", "SPBE", "DELI", "ZAYM", "NKNCP", "BLNG", "GECO", "LIFE", "RBCM", "AFKS", "SELG"],
              description: "Нишевые: Прочие мелкие компании – Компании с небольшим весом, обеспечивающие диверсифицирующее влияние на индекс."
            }
          }
        },

        {
          name: "Архитектура рынка",
          description: [
            "Ниже представлен один из вариантов продвинутой сегментации с акцентом на модульную архитектуру, где рыночные активы представлены как компоненты «системы» – от «ядра» (Core) и «промежуточного слоя» (Middleware) до «платформ» и «краевых» (Edge) решений, а также «операционных» модулей.",
            "Такой подход будет понятен разработчикам, IT‑архитекторам и системным аналитикам, поскольку он использует метафоры архитектуры сложных систем."
          ],
          groups: {
            coreEnergy: {
              tickers: [
                "LKOH", "ROSN", "TATN", "TATNP", "BANE", "BANEP", "KRKNP",
                "GAZP", "NVTK", "SIBN", "RNFT", "SNGS", "SNGSP"
              ],
              description: "Core:Energy – Фундаментальные энергетические активы, являющиеся «ядром» системы."
            },
            coreMaterials: {
              tickers: [
                "ALRS", "LNZL", "LNZLP", "PLZL", "VSMO", "GMKN", "NLMK", "MAGN", "RUAL",
                "MTLR", "MTLRP", "FESH", "CHMK", "CHMF", "KLVZ", "MAGEP", "PHOR", "AKRN",
                "AGRO", "KAZT", "KAZTP", "KZOS", "SELG", "GECO", "LIFE", "PRMD", "NKNCP",
                "ABIO", "BLNG"
              ],
              description: "Core:Materials – Фундаментальные активы в сфере материалов, поддерживающие ресурсную базу системы."
            },
            middlewareNetwork: {
              tickers: [
                "RKKE", "ENPG", "HYDR", "MSNG", "ELFV", "LSNG", "LSNGP", "MRKP", "MRKU",
                "MRKY", "MRKZ", "MRKV", "FEES", "MSRS", "IRAO", "YAKG", "UGLD", "TGKN",
                "TGKB", "TGKA", "OGKB", "TGKBP", "PMSBP", "PMSB", "MRKS"
              ],
              description: "Middleware:Network – Компании, обеспечивающие инфраструктуру и сети, аналогичные промежуточному слою системы."
            },
            middlewareTelecom: {
              tickers: [
                "MGTSP", "MTSS", "VEON-RX", "VRSB", "TTLK", "CNTL", "CNTLP", "ETLN", "RTKM"
              ],
              description: "Middleware:Telecom – Телекоммуникационные компании, предоставляющие каналы связи между модулями."
            },
            platformDigital: {
              tickers: [
                "YDEX", "OZON", "MVID", "HEAD", "DIAS", "DATA", "SOFL", "DELI", "WUSH",
                "IVAT", "POSI", "NSVZ", "GTRK", "T"
              ],
              description: "Platform:Digital – Цифровые экосистемы, предоставляющие API‑сервисы и интерфейсы для взаимодействия."
            },
            platformFintech: {
              tickers: [
                "SBER", "SBERP", "VTBR", "MBNK", "CBOM", "BSPB", "MOEX", "SPBE", "RBCM",
                "SVCB", "QIWI", "SFIN", "FIXP", "ZAYM", "AFKS", "NMTP"
              ],
              description: "Platform:Fintech – Финансовые экосистемы, обеспечивающие платежи, кредитование и другие сервисы."
            },
            edgeRetail: {
              tickers: [
                "MGNT", "LENT", "OKEY", "DSKY", "APTK", "BELU", "ABRD", "KROT", "SVAV",
                "AQUA", "NKHP"
              ],
              description: "Edge:Retail – Краевые решения, взаимодействующие непосредственно с конечным пользователем в сфере ритейла."
            },
            edgePropTech: {
              tickers: ["PIKK", "CIAN", "LEAS", "RENI", "MRKC", "LSRG", "GCHE"],
              description: "Edge:PropTech – Компании в сфере недвижимости и технологий, ориентированные на конечного пользователя."
            },
            opsTransport: {
              tickers: ["KMAZ", "TRNFP", "EUTR", "AFLT", "FLOT"],
              description: "Ops:Transport – Транспортные активы, обеспечивающие логистику и перемещение товаров."
            },
            opsIndustry: {
              tickers: [
                "UNKL", "SMLT", "AMEZ", "TRMK", "IRKT", "ROLO", "MDMG", "GEMC", "HNFG",
                "RASP", "PRFN", "UPRO", "DVEC", "CARM", "UNAC", "SGZH", "MGKL", "MSTT",
                "KLSB", "ELMT"
              ],
              description: "Ops:Industry – Промышленные активы, выполняющие ключевые функции в производстве и операционных процессах."
            }
          }
        },

        {
          name: "Поэтическая сегментация рынка",
          description: [
            "Ниже – один из вариантов «поэтической» сегментации рынка, рассчитанный на тех, кто чувствует ритмы и гармонию, видит в цифрах музыку и воспринимает экономику как живую картину. Каждая группа – это своего рода нота в симфонии рынка, где бизнес превращается в искусство.",
            "Пояснение: «Сердце Природы» олицетворяет компании, корни которых уходят в первобытные стихии: огонь (нефть и газ), металл и химия – как базовые материалы, из которых соткана наша планета. «Симфония Прогресса» – это динамичная мелодия инноваций, где цифровые платформы, финансы и телекоммуникации звучат в унисон, задавая ритм современности. «Гармония Жизни» отражает пульс общества – компании, делающие нашу повседневность ярче, как мазки на холсте городской жизни. «Архитектура Времени» – фундамент, на котором строится будущее: индустриальные гиганты и энергетические сети, задающие стабильность и создающие условия для новых свершений."
          ],
          groups: {
            natureFlames: {
              tickers: ["LKOH", "ROSN", "TATN", "TATNP", "BANE", "BANEP", "KRKNP", "GAZP", "NVTK", "SIBN", "RNFT", "SNGS", "SNGSP"],
              description: "Сердце Природы: Огненные Ноты – компании, олицетворяющие огненный импульс рынка, связанные с нефтью, газом и энергетикой."
            },
            natureMetal: {
              tickers: ["ALRS", "LNZL", "LNZLP", "PLZL", "VSMO", "GMKN", "NLMK", "MAGN", "RUAL", "MTLR", "MTLRP", "FESH", "KLVZ", "MAGEP"],
              description: "Сердце Природы: Металлические Оттенки – металлургические компании, отражающие прочность и устойчивость, как стальные ноты в симфонии экономики."
            },
            natureChemistry: {
              tickers: ["PHOR", "AKRN", "AGRO", "KAZT", "KAZTP", "KZOS", "CHMK", "CHMF", "SELG", "GECO", "LIFE", "PRMD", "NKNCP", "ABIO"],
              description: "Сердце Природы: Химический Зов – компании, связанные с химией и агробизнесом, передающие призыв природы к трансформации и росту."
            },
            symphonyDigital: {
              tickers: ["YDEX", "OZON", "MVID", "HEAD", "DIAS", "DATA", "SOFL", "DELI", "WUSH", "IVAT", "POSI", "T", "NSVZ", "VSEH"],
              description: "Симфония Прогресса: Цифровые Аккорды – цифровые платформы и IT-компании, создающие инновационные мелодии современной экономики."
            },
            symphonyFinance: {
              tickers: ["SBER", "SBERP", "VTBR", "MBNK", "CBOM", "BSPB", "MOEX", "SPBE", "RBCM", "SVCB", "QIWI", "SFIN", "FIXP", "ZAYM", "AFKS", "NMTP"],
              description: "Симфония Прогресса: Финансовые Ритмы – финансовые институты и экосистемы, задающие стабильный и динамичный ритм денежного потока."
            },
            symphonyTelecom: {
              tickers: ["MGTSP", "MTSS", "VEON-RX", "VRSB", "TTLK", "CNTL", "CNTLP", "ETLN", "RTKMP", "RTKM"],
              description: "Симфония Прогресса: Телеком Биты – телекоммуникационные компании, чьи быстрые сигналы связывают ритмы современности."
            },
            harmonyRetail: {
              tickers: ["MGNT", "LENT", "OKEY", "DSKY", "APTK", "BELU", "ABRD", "KROT", "SVAV", "AQUA", "NKHP"],
              description: "Гармония Жизни: Ритмы Ритейла – компании, оживляющие повседневность, как яркие мазки на холсте городской жизни, задавая пульс потребительского рынка."
            },
            harmonySpace: {
              tickers: ["PIKK", "CIAN", "LEAS", "RENI", "MRKC", "LSRG", "GCHE"],
              description: "Гармония Жизни: Цвета Пространства – компании, преображающие пространство через недвижимость и дизайн, придающие рынку эстетическую глубину."
            },
            architectureIndustry: {
              tickers: [
                "UNKL", "KMAZ", "TRNFP", "EUTR", "AFLT", "FLOT", "SMLT", "AMEZ", "TRMK", "IRKT",
                "ROLO", "MDMG", "GEMC", "HNFG", "RASP", "PRFN", "UPRO", "DVEC", "CARM", "BLNG",
                "GLTR", "KLSB", "ELMT", "ASTR", "UWGN", "UNAC", "SGZH", "MGKL", "GTRK"
              ],
              description: "Архитектура Времени: Индустриальные Ритмы – промышленные гиганты, задающие структурную основу экономики, как мощные ритмы времени."
            },
            architectureEnergy: {
              tickers: ["RKKE", "ENPG", "HYDR", "MSNG", "ELFV", "LSNG", "LSNGP", "MRKP", "MRKU", "MRKY", "MRKZ", "MRKV", "FEES", "MSRS", "IRAO", "YAKG", "UGLD", "TGKN", "TGKB", "TGKA", "OGKB", "TGKBP", "MRKS"],
              description: "Архитектура Времени: Энергетическая Палитра – энергетические компании и сети, создающие гармонию мощных потоков энергии, определяющие стабильность рынка."
            }
          }
        },

        {
          /*
          * Это разбиение позволяет «прочитать» рынок под разными углами:

Константы показывают фундаментальные экономические базисы, устойчивые во времени.
Фрактальные динамики – для тех, кто умеет находить закономерности в хаотичных, цикличных движениях котировок.
Алгоритмы капитала дают возможность анализировать потоки денег и цифровые процессы с математической точностью.
Инфраструктурные регуляторы отражают работу основных «двигателей» экономики в сфере энергообеспечения и строительства.
Эволюция демонстрирует, как изменяется спрос и поведение потребителей.*/
          name: "Продвинутая сегментация: динамические классы",
          description: [
            "Ниже приведён один из вариантов продвинутой сегментации, рассчитанной на людей, привыкших к нетривиальному анализу, оценке вероятностей и чтению графиков. Здесь компании сгруппированы по «динамическим классам» – от стабильных «констант» фундаментальной экономики до компаний, чьи рыночные траектории напоминают фрактальные модели, а также по тем областям, где процессы можно трактовать алгоритмически или где проявляются эволюционные изменения в потреблении.",
            "Константы показывают фундаментальные экономические базисы, устойчивые во времени. Фрактальные динамики – для тех, кто умеет находить закономерности в хаотичных, цикличных движениях котировок. Алгоритмы капитала дают возможность анализировать потоки денег и цифровые процессы с математической точностью. Инфраструктурные регуляторы отражают работу основных «двигателей» экономики в сфере энергообеспечения и строительства. Эволюция демонстрирует, как изменяется спрос и поведение потребителей. Такой подход рассчитан на аналитиков, учёных, физиков и изобретателей, способных воспринимать многомерные данные и видеть скрытые корреляции, что помогает глубже понять рыночные процессы и принимать обоснованные решения."
          ],
          groups: {
            // 1. Константы
            constantsOilGas: {
              tickers: ["LKOH", "ROSN", "TATN", "TATNP", "BANE", "BANEP", "KRKNP", "GAZP", "NVTK", "SIBN", "RNFT"],
              description: "Константы:Нефть&Газ – Компании с проверенными временем фундаментальными бизнес-моделями в нефтегазовом секторе."
            },
            constantsMetallurgy: {
              tickers: ["ALRS", "LNZL", "LNZLP", "PLZL", "VSMO", "GMKN", "NLMK", "MAGN", "RUAL", "MTLR", "MTLRP", "FESH", "CHMK", "CHMF", "KLVZ", "MAGEP"],
              description: "Константы:Металлургия – Компании, задающие базовые экономические константы через металлургический сектор."
            },
            constantsChemistry: {
              tickers: ["PHOR", "AKRN", "AGRO", "KAZT", "KAZTP", "SELG", "KZOS", "KZOSP", "GECO", "LIFE", "PRMD", "NKNCP", "ABIO"],
              description: "Константы:Химия – Компании, представляющие химическую отрасль как фундамент экономических процессов."
            },

            // 2. Фрактальные динамики
            fractalIndustry: {
              tickers: ["UNKL", "KMAZ", "TRNFP", "EUTR", "AFLT", "FLOT", "SMLT", "AMEZ", "TRMK", "IRKT", "ROLO", "MDMG", "GEMC", "HNFG", "RASP", "PRFN", "UPRO", "DVEC", "CARM", "UNAC", "SGZH", "MGKL"],
              description: "Фрактальные динамики: Промышленность – Компании с цикличными, нелинейными трендами и фрактальной изменчивостью в промышленном секторе."
            },
            fractalInnovation: {
              tickers: ["YDEX", "OZON", "MVID", "HEAD", "DIAS", "SOFL", "DATA", "DELI", "WUSH", "NSVZ", "POSI"],
              description: "Фрактальные динамики: Инновации – Компании, демонстрирующие сложные, инновационные рыночные тренды."
            },

            // 3. Алгоритмы капитала
            capitalAlgorithmsFinance: {
              tickers: ["SBER", "SBERP", "VTBR", "MBNK", "CBOM", "BSPB", "MOEX", "SPBE", "RBCM", "SVCB", "FIXP", "ZAYM", "AFKS", "NMTP"],
              description: "Алгоритмы капитала: Финансы – Компании, где потоки капитала и финансовые процессы поддаются количественному анализу."
            },
            capitalAlgorithmsDigital: {
              tickers: ["MGTSP", "MTSS", "VEON-RX", "VRSB", "QIWI", "SFIN", "T", "IVAT", "CNTL", "CNTLP", "TTLK", "VKCO", "ETLN", "VSEH", "RTKMP", "RTKM"],
              description: "Алгоритмы капитала: Цифровые платформы – Компании, демонстрирующие алгоритмические и цифровые процессы в экономике."
            },

            // 4. Инфраструктурные регуляторы
            infrastructureNetworks: {
              tickers: ["RKKE", "ENPG", "HYDR", "MSNG", "ELFV", "LSNG", "LSNGP", "MRKP", "MRKU", "MRKY", "MRKZ", "MRKV", "FEES", "MSRS", "IRAO", "YAKG", "UGLD", "TGKN", "TGKB", "TGKA", "OGKB", "TGKBP", "PMSBP", "PMSB", "SNGS", "SNGSP", "MRKS"],
              description: "Инфраструктурные регуляторы: Энергосети – Компании, обеспечивающие распределительные энергосети и поддерживающие инфраструктурную стабильность."
            },
            infrastructureConstruction: {
              tickers: ["LSRG", "GCHE", "ELMT", "MSTT"],
              description: "Инфраструктурные регуляторы: Строй & Девелопмент – Компании, стабилизирующие экономику через строительные и девелоперские механизмы."
            },

            // 5. Эволюция (Потребление и сервисы)
            evolutionRetail: {
              tickers: ["MGNT", "LENT", "OKEY", "DSKY", "APTK"],
              description: "Эволюция: Ритейл – Компании, отражающие изменения потребительских трендов в розничном секторе."
            },
            evolutionBrands: {
              tickers: ["BELU", "ABRD", "SVAV", "KROT", "BLNG"],
              description: "Эволюция: Бренды & Сервисы – Компании, демонстрирующие трансформацию брендов и сервисов под влиянием эволюционных процессов."
            },
            evolutionRealEstate: {
              tickers: ["PIKK", "CIAN", "LEAS", "RENI", "MRKC"],
              description: "Эволюция: Недвижимость – Компании, отражающие изменения в спросе и динамику развития сектора недвижимости."
            }
          }
        },

        {
          name: "Сегментация: Сырьевой и Сервисный секторы",
          description: [
            "Ниже приведён один из самых простых вариантов, понятных для большинства – делим рынок на две широкие группы: сектор сырьё (ресурсный, где преобладают добыча и первичная переработка) и всё остальное, то есть сервис, технологии, производство, финансы, ритейл и пр.",
            "Это деление сводит всю российскую рыночную вселенную к двум интуитивно понятным «полюсам»: – Компании, напрямую зависящие от природных ресурсов, добычи и первичной переработки, – «Сырьевой сектор». – Всё остальное, где доминируют услуги, технологии, промышленное производство, финансы, ритейл и инфраструктура, – «Сервисный сектор».",
            "Такой подход помогает быстро оценить, насколько экономика ориентирована на сырьё (традиционный фактор) или же на более диверсифицированные, инновационные направления – понятное и удобное для анализа большинству инвесторов."
          ],
          groups: {
            resource: {
              tickers: [
                "LKOH", "ROSN", "TATN", "TATNP", "BANE", "BANEP", "KRKNP", "GAZP", "NVTK", "SIBN", "RNFT",
                "ALRS", "LNZL", "LNZLP", "PLZL", "GMKN", "NLMK", "MAGN", "RUAL", "MTLR", "MTLRP", "FESH",
                "PHOR", "AKRN", "AGRO", "KAZT", "KAZTP", "KZOS", "CHMK", "CHMF", "NKNCP", "SELG", "KLVZ"
              ],
              description: "Сырьевой:Сырье – Компании, напрямую зависящие от природных ресурсов, добычи и первичной переработки."
            },
            service: {
              tickers: [
                "UNKL", "RKKE", "MGTSP", "DIAS", "MBNK", "AQUA", "GCHE", "NKHP", "NSVZ", "SVAV", "OZON", "MGNT",
                "SMLT", "CIAN", "ABRD", "YDEX", "T", "VRSB", "QIWI", "SFIN", "PMSBP", "GTRK", "KMAZ", "GEMC", "HNFG",
                "POSI", "LEAS", "VKCO", "PIKK", "MDMG", "PMSB", "FIXP", "SPBE", "DELI", "GLTR", "LSRG", "ENPG", "IRKT",
                "IVAT", "PRMD", "EUTR", "MTSS", "MVID", "RASP", "MSTT", "RTKMP", "LSNGP", "ASTR", "VEON-RX", "UWGN",
                "DSKY", "ABIO", "VSEH", "YAKG", "CNTL", "ETLN", "CNTLP", "DATA", "AMEZ", "TRMK", "SOFL", "BSPB", "RENI",
                "ZAYM", "BLNG", "AFLT", "LSNG", "OKEY", "GECO", "FLOT", "RTKM", "KLSB", "MAGEP", "WUSH", "SBER", "SBERP",
                "NMTP", "MOEX", "VTBR", "SNGS", "LIFE", "RBCM", "SVCB", "AFKS", "PRFN", "SNGSP", "CBOM", "UPRO", "DVEC",
                "APTK", "CARM", "MRKS", "TTLK", "UNAC", "SGZH", "MGKL", "MSRS", "MRKC", "IRAO", "ELFV", "ROLO", "MRKU",
                "MRKY", "MRKZ", "HYDR", "MRKV", "TGKN", "TGKB", "OGKB", "FEES", "MSNG", "ELMT", "TGKBP", "UGLD", "TGKA", "MRKP"
              ],
              description: "Сервисный:Сервис – Компании, где доминируют услуги, технологии, промышленное производство, финансы, ритейл и инфраструктура."
            }
          }
        },

        {
          name: "Сегментация: Традиция vs Трансформация",
          description: [
            "Ниже приведён альтернативный взгляд на рынок, где вместо традиционных отраслевых групп мы разделяем активы по модели «старых традиций» против «новых трансформаций».",
            "Мы смотрим на то, какие компании опираются на проверенные временем сырьевые и производственные бизнесы, а какие – активно двигают цифровую трансформацию, а также выделяем базовую инфраструктуру и компании, ориентированные на конечного потребителя."
          ],
          groups: {
            traditionRaw: {
              tickers: ["LKOH", "ROSN", "TATN", "TATNP", "BANE", "BANEP", "KRKNP", "SIBN", "GAZP", "NVTK"],
              description: "Традиция:Сырье – Компании, работающие по классическим бизнес-моделям с сырьевой базой и тяжёлой промышленностью."
            },
            traditionMetallChem: {
              tickers: ["VSMO", "GMKN", "NLMK", "MAGN", "ALRS", "LNZL", "LNZLP", "PLZL", "RUAL", "CHMK", "CHMF", "FESH", "KZOS", "PHOR", "AKRN", "AGRO", "KAZT", "KAZTP"],
              description: "Традиция:Металл и химия – Компании, работающие по классическим бизнес-моделям в металлургии и химической промышленности."
            },
            traditionTransport: {
              tickers: ["KMAZ", "TRNFP", "EUTR", "AFLT", "FLOT", "UNKL"],
              description: "Традиция:Транспорт и машиностроение – Компании, работающие по классическим бизнес-моделям в транспортном и машиностроительном секторах."
            },
            transformationDigital: {
              tickers: ["YDEX", "OZON", "MVID", "HEAD", "DIAS", "DATA", "SOFL", "VKCO", "DELI", "WUSH"],
              description: "Трансформация:Цифровые платформы – Активы, являющиеся драйверами цифровизации и новых форматов обслуживания."
            },
            transformationFintech: {
              tickers: ["MGTSP", "MTSS", "VEON-RX", "VRSB", "QIWI", "SFIN", "T", "IVAT", "CNTL", "CNTLP", "TTLK"],
              description: "Трансформация:Финтех и телеком – Компании, активно двигающие цифровую трансформацию в финансовой и телекоммуникационной сферах."
            },
            infrastructureNetworks: {
              tickers: ["RKKE", "ENPG", "HYDR", "MSNG", "ELFV", "LSNG", "LSNGP", "MRKP", "MRKU", "MRKY", "MRKZ", "MRKV", "FEES", "MSRS", "IRAO", "YAKG", "UGLD", "TGKN", "TGKB", "TGKA", "OGKB", "TGKBP"],
              description: "Инфраструктура:Энергосети – Компании, обеспечивающие работу ключевых систем страны через распределительные энергосети."
            },
            infrastructureConstruction: {
              tickers: ["LSRG", "PIKK", "LEAS", "RENI", "CIAN", "ELMT", "MSTT", "GCHE"],
              description: "Инфраструктура:Строй и девелопмент – Компании, обеспечивающие работу строительных и девелоперских механизмов."
            },
            consumptionRetail: {
              tickers: ["MGNT", "LENT", "OKEY", "DSKY", "APTK"],
              description: "Потребление:Ритейл – Компании, ориентированные на внутренний рынок, розничную торговлю и брендовое потребление."
            },
            consumptionBrands: {
              tickers: ["BELU", "SVAV", "ABRD", "ZAYM", "CBOM", "BSPB", "SVCB", "RBCM", "MOEX", "SPBE", "FIXP"],
              description: "Потребление:Бренды и сервисы – Компании, ориентированные на брендовое потребление и сервисы."
            }
          }
        },

        {
          name: "Sector Segmentation",
          description: [
            "Below is one variant of sector segmentation in the format 'Group:Subgroup: list of tickers', where tickers are separated by commas:",
            "This segmentation allows a quick assessment of the dynamics of major market sectors: from the oil and gas complex—with its division into oil, gas, and network operations—to metallurgy, agro-chemical sectors, finance, digital technologies, retail, construction, and industrial production. Other segmentation options may be used depending on the analysis goals."
          ],
          groups: {
            baseEnergyOil: {
              tickers: [
                "LKOH", "ROSN", "TATN", "TATNP", "BANE", "BANEP", "KRKNP", "SIBN", "RNFT", "SNGS", "SNGSP"
              ],
              description: "Energy:Oil"
            },
            baseEnergyGas: {
              tickers: [
                "GAZP", "NVTK"
              ],
              description: "Energy:Gas"
            },
            baseEnergyNetworks: {
              tickers: [
                "RKKE", "ENPG", "HYDR", "MSNG", "ELFV", "PMSBP", "TGKN", "TGKB", "TGKA", "OGKB", "TGKBP",
                "LSNG", "LSNGP", "MRKP", "MRKU", "MRKY", "MRKZ", "MRKV", "FEES", "MSRS", "MRKS", "IRAO", "YAKG", "UGLD"
              ],
              description: "Energy:Networks"
            },
            baseMetallurgyMetals: {
              tickers: [
                "VSMO", "GMKN", "NLMK", "MAGN", "MTLR", "MTLRP", "RUAL", "CHMK", "CHMF", "KLVZ", "MAGEP"
              ],
              description: "Metallurgy:Metals"
            },
            baseMetallurgyPrecious: {
              tickers: [
                "ALRS", "LNZL", "LNZLP", "PLZL"
              ],
              description: "Metallurgy:Precious"
            },
            baseChemicals: {
              tickers: [
                "PHOR", "AKRN", "KZOS"
              ],
              description: "Agro-Chemicals:Chemicals"
            },
            baseAgro: {
              tickers: [
                "AGRO", "KAZT", "KAZTP", "NKNCP", "SELG"
              ],
              description: "Agro-Chemicals:Agro"
            },
            basePharma: {
              tickers: [
                "LIFE", "PRMD", "ABIO", "GECO"
              ],
              description: "Agro-Chemicals:Pharma"
            },
            baseFinanceBanks: {
              tickers: [
                "SBER", "SBERP", "VTBR", "MBNK", "CBOM", "SVCB", "BSPB"
              ],
              description: "Finance:Banks"
            },
            baseFinanceExchanges: {
              tickers: [
                "MOEX", "SPBE", "RBCM"
              ],
              description: "Finance:Exchanges"
            },
            baseFinanceFintech: {
              tickers: [
                "QIWI", "SFIN", "FIXP", "ZAYM", "AFKS"
              ],
              description: "Finance:Fintech"
            },
            baseTechnologyTelecom: {
              tickers: [
                "MGTSP", "MTSS", "VEON-RX", "VRSB", "RTKMP", "RTKM", "TTLK"
              ],
              description: "Technology:Telecom"
            },
            baseTechnologyIT: {
              tickers: [
                "YDEX", "DIAS", "HEAD", "DATA", "SOFL", "CNTL", "CNTLP", "T", "WUSH", "IVAT", "DELI", "POSI", "VKCO", "ETLN", "VSEH", "GTRK"
              ],
              description: "Technology:IT"
            },
            baseRetailOffline: {
              tickers: [
                "MGNT", "LENT", "OKEY", "DSKY", "MVID", "APTK"
              ],
              description: "Retail:Offline"
            },
            baseRetailOnline: {
              tickers: [
                "OZON"
              ],
              description: "Retail:Online"
            },
            baseRetailBrands: {
              tickers: [
                "BELU", "KROT", "ABRD", "SVAV", "AQUA", "NKHP", "HNFG"
              ],
              description: "Retail:Brands"
            },
            baseConstructionDeveloper: {
              tickers: [
                "CIAN", "LEAS", "PIKK", "LSRG", "RENI", "ELMT"
              ],
              description: "Construction:Developer"
            },
            baseConstructionInfrastructure: {
              tickers: [
                "GCHE", "MSTT", "MRKC"
              ],
              description: "Construction:Infrastructure"
            },
            baseIndustryMachinery: {
              tickers: [
                "UNKL", "SMLT", "MDMG", "IRKT", "RASP", "AMEZ", "TRMK", "GLTR", "ASTR", "UWGN", "PRFN", "UPRO", "DVEC", "CARM", "NMTP", "BLNG", "FESH", "UNAC", "SGZH", "MGKL", "ROLO", "GEMC", "KLSB"
              ],
              description: "Industry:Machinery"
            },
            baseIndustryTransport: {
              tickers: [
                "KMAZ", "TRNFP", "EUTR", "AFLT", "FLOT"
              ],
              description: "Industry:Transport"
            }
          }
        },

        {
          name: "Кластеры корреляций",
          description: [
            "Ниже приведены уникальные кластеры акций, демонстрирующих схожие корреляционные зависимости в динамике рынка.",
            "Каждая группа получила уникальное название, отражающее её тематическую направленность и общую динамику.",
            "Примечание: Если бы у меня была достоверная информация о корреляциях, я бы рассмотрел, например, объединение групп «Нефтяные титаны» и «Газовая динамика» в единое целое «Нефтегазовые титаны», а тикер «T», встречающийся в нескольких группах, отнес бы исключительно к группе «Банковские гиганты» для устранения дублирования."
          ],
          groups: {
            corrAerodynamics: {
              tickers: ["IRKT", "UNAC"],
              description: "Аэродинамика – компании, связанные с авиационными технологиями и аэрокосмическим производством."
            },
            corrVectorImpulse: {
              tickers: ["ROLO", "TTLK"],
              description: "Векторный импульс – пара акций, демонстрирующая схожие рыночные тренды и резкие изменения направления."
            },
            corrOceanStream: {
              tickers: ["NMTP", "FESH", "FLOT"],
              description: "Морской поток – акции, колеблющиеся подобно волнам, отражающие высокую изменчивость рынка."
            },
            corrClinicalInnovations: {
              tickers: ["GEMC", "MDMG"],
              description: "Клинические инновации – компании, работающие в сфере медицины и клинических исследований с общими динамическими характеристиками."
            },
            corrNetworkTitans: {
              tickers: ["TGKN", "TGKB", "TGKA"],
              description: "Титаны сетей – ключевые игроки энергетического сектора, обеспечивающие инфраструктуру передачи энергии."
            },
            corrHealthSector: {
              tickers: ["ABIO", "GECO", "LIFE", "APTK"],
              description: "Здоровье – компании сектора здравоохранения, демонстрирующие синхронное движение акций."
            },
            corrItPioneers: {
              tickers: ["VKCO", "YNDX"],
              description: "ИТ-пионеры – лидеры цифровых технологий с высокой взаимной корреляцией."
            },
            corrEnergyMight: {
              tickers: ["MRKS", "MRKY", "MRKC", "DVEC", "MRKV", "MRKZ", "LSNG"],
              description: "Энергетическая мощь – крупные энергетические компании, движущиеся синхронно и оказывающие существенное влияние на сектор."
            },
            corrMetalGiants: {
              tickers: ["MAGN", "CHMF", "NLMK"],
              description: "Металлические гиганты – ведущие металлургические компании с устойчивой корреляцией в динамике."
            },
            corrAlcoholLeaders: {
              tickers: ["ABRD", "BELU"],
              description: "Алкогольные лидеры – компании алкогольного сектора, демонстрирующие схожие рыночные движения."
            },
            corrGoldenStandard: {
              tickers: ["SELG", "POLY", "PLZL", "UGLD"],
              description: "Золотой стандарт – акции, связанные с добычей и переработкой золота и драгоценных металлов."
            },
            corrNewHorizons: {
              tickers: ["OZON", "AGRO", "T", "FIVE"],
              description: "Новые горизонты – группа компаний, представляющих современные тренды в цифровой и аграрной сферах."
            },
            /*corrFertilizerLeaders: {
              tickers: ["ACRN", "PHOR"],
              description: "Лидеры удобрений – компании, ведущие производство удобрений и агрохимикатов с похожей динамикой."
            },*/
            corrOilTitans: {
              tickers: ["BANE", "LKOH", "RNFT", "ROSN", "TATN"],
              description: "Нефтяные титаны – крупные нефтяные компании, задающие тон в нефтегазовом секторе."
            },
            corrDynamicTrio: {
              tickers: ["BLNG", "MSTT", "KROT"],
              description: "Динамичное трио – небольшая группа акций с уникальными корреляционными особенностями."
            },
            corrBankingGiants: {
              tickers: ["SBER", "BSPB", "VTBR", "T"],
              description: "Банковские гиганты – ведущие банки, обеспечивающие ликвидность и стабильность финансового рынка."
            },
            corrConstructionLeaders: {
              tickers: ["CIAN", "PIKK", "LSRG", "SMLT", "ETLN"],
              description: "Строительные лидеры – компании, работающие в сфере строительства и девелопмента, демонстрирующие общую динамику."
            },
            corrAluminumLeaders: {
              tickers: ["ENPG", "RUAL"],
              description: "Алюминиевые лидеры – ведущие компании алюминиевой отрасли с устойчивым рыночным поведением."
            },
            corrConsumerGoods: {
              tickers: ["MGNT", "FIVE", "OKEY", "GCHE"],
              description: "Потребительские товары – компании, выпускающие товары широкого потребления с похожими динамическими характеристиками."
            },
            corrGasDynamics: {
              tickers: ["GAZP", "NVTK", "SIBN", "OGKB", "TGKA"],
              description: "Газовая динамика – акции газового сектора, движущиеся синхронно и отражающие колебания рынка газа."
            },
            corrEnergyInnovators: {
              tickers: ["KLSB", "VRSB"],
              description: "Энергетические инноваторы – компании, внедряющие новые технологии в энергетике и демонстрирующие высокую корреляцию."
            },
            corrAutoIndustry: {
              tickers: ["KMAZ", "SVAV"],
              description: "Автомобильная промышленность – акции компаний, связанных с автопроизводством и транспортом, с общими рыночными тенденциями."
            },
            corrChemicalIndustry: {
              tickers: ["KZOS", "NKNC"],
              description: "Химическая отрасль – компании, работающие в области химии, демонстрирующие схожие динамические паттерны."
            },
            corrExchangePlatforms: {
              tickers: ["MOEX", "SPBE"],
              description: "Биржевые платформы – ведущие фондовые биржи, определяющие ликвидность и прозрачность рынка."
            },
            corrCoalSector: {
              tickers: ["MTLR", "RASP"],
              description: "Угольный сектор – акции компаний, занимающихся добычей и переработкой угля, с синхронными изменениями."
            },
            corrDigitalTech: {
              tickers: ["POSI", "SOFL", "ASTR"],
              description: "Цифровые технологии – инновационные IT-компании, демонстрирующие общие цифровые тренды."
            },
            corrRocketLaunch: {
              tickers: ["RKKE", "VSMO"],
              description: "Ракетный старт – компании, демонстрирующие резкий рост и динамику, схожую с запуском ракеты."
            }
          }
        }





      ],


    };
  },
  methods: {

  },
  mounted() {

  },
  beforeUnmount() {

  }
};
</script>

<style>

</style>
