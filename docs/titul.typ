#let capitalize(str) = {
  if type(str) == "string" and str.len() > 0 {
    upper(str.slice(0, 1)) + str.slice(1)
  } else {
    str
  }
}

#let conf(
  number: none,
  name: none,
  doc,
) = {
  set page("a4", margin: (left: 30mm, right: 15mm, top: 20mm, bottom: 20mm))

  set text(size: 14pt, lang: "ru", font: "Times New Roman", hyphenate: false)

  set par(
    justify: false,
    first-line-indent: (amount: 12.5mm, all: true),
    leading: 1.5em - 0.75em,
    spacing: 1.5em,
  )

  set ref(supplement: none)
  set figure.caption(separator: [ -- ])
  set math.equation(numbering: "(1)")

  show image: set align(center)
  show figure.where(kind: image): set figure(supplement: [Рисунок])

  show figure.where(kind: table): it => {
    set block(breakable: true)
    set figure.caption(position: top)
    it
  }
  show figure.caption.where(kind: table): set align(left)
  show table.cell: set align(left)

  set list(marker: [–], indent: 12.5mm, spacing: 1em)
  set enum(indent: 12.5mm, spacing: 1em)

  set page(footer: context [
    #let page = here().page()
    #align(center)[#{
      if page == 1 {
        [Москва #int(datetime.today().display("[year]"))]
      } else {
        grid(
          columns: (1fr, 1fr, 1fr),
          align: center,
          [Балынин Е.Д. 241-3210], [ЛР #number], [Продвинутая работа в Git],
        )
      }
    }]
  ])

  show table: text.with(12pt)

  set bibliography(
    style: "gost-r-705-2008-numeric",
    title: [#text(size: 14pt)[Использованные ресурсы и источники]],
  )

  box(width: 100%, height: 40%)[
    #align(center + top)[
      Министерство науки и высшего образования Российской Федерации
      #linebreak()
      Федеральное государственное автономное образовательное учреждение высшего образования
      #linebreak()
      «МОСКОВСКИЙ ПОЛИТЕХНИЧЕСКИЙ УНИВЕРСИТЕТ»
      #linebreak()
      (МОСКОВСКИЙ ПОЛИТЕХ)
    ]
  ]


  align(center + top)[
    #upper[Лабораторная работа] № #number
    #linebreak()
    По курсу Проектирование пользовательских интерфейсов в веб
    #linebreak()
    #text(weight: "semibold")[#name]
  ]

  linebreak()

  box(width: 100%, height: 20%)[
    #align(center + top)[
      #upper[Тема]
      #linebreak()
      #text(weight: "bold")[#upper[Сайт для группы компаний оптовой продажи рыбной продукции]]
    ]
  ]

  align(right + top)[
    Выполнил: Балынин Е.Д. 241-3210
    #linebreak()
    Проверил(а): Даньшина М.В.
  ]

  set par(justify: true)
  show heading: set text(size: 14pt)

  pagebreak()

  show heading: set text(weight: "regular")
  show table: set par(justify: false)

  doc
}