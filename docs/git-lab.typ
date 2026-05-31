#import "titul.typ": conf

#show: conf.with(number: "8", name: "Продвинутый GIT")

== Цель работы

Изучить продвинутые возможности системы контроля версий Git: работу с историей коммитов, ветками, сташем, интерактивным rebase и инструментами отладки.

== Задачи

+ Изучить устройство рабочего каталога, индекса, репозитория, роль HEAD и веток.
+ Ознакомиться с файлом `.gitignore` и командой `git rm --cached`.
+ Изучить навигацию по истории: `git checkout`, `git switch`, `git log`.
+ Изучить отмену и изменение коммитов: `git revert`, `git reset`, `git commit --amend`.
+ Изучить команды `git diff`, `git blame`, `git stash`, `git cherry-pick`.
+ Изучить продвинутые операции: `git rebase`, `git bisect`, `git reflog`.

== Отчет по выполнению

=== 1. Устройство рабочего каталога, индекса, репозитория, роль HEAD и веток

Git работает с тремя зонами: *Working directory* (файлы на диске), *Index / Staging area* (изменения подготовленные к коммиту через `git add`) и *Repository* (база данных объектов в `.git/`). *HEAD* --- указатель на текущий коммит, *ветка* --- именованный указатель на конкретный коммит, который смещается при каждом новом коммите.

```bash
git status      # состояние рабочего каталога и индекса
ls .git/        # содержимое репозитория
cat .git/HEAD   # на что указывает HEAD
```

#figure(
  rect(image("../screenshots/1.png", width: 100%, fit: "contain")),
  caption: [Вывод `git status` и `ls .git/`],
) <p1-structure>

=== 2. Файл .gitignore

Файл `.gitignore` содержит список файлов и директорий, которые Git *не отслеживает*. Поддерживает glob-паттерны: `*.log`, `dist/`, `**/*.env`. Применяется для исключения `node_modules`, файлов сборки и конфиденциальных данных.

```bash
cat .gitignore  # содержимое файла игнорирования
git status      # убедиться, что node_modules не отслеживается
```

#figure(
  rect(image("../screenshots/2.png", width: 100%, fit: "contain")),
  caption: [Содержимое `.gitignore` и вывод `git status`],
) <p2-gitignore>

=== 3. Переход к конкретному коммиту — `git checkout <hash>`

Перемещает HEAD на указанный коммит. HEAD переходит в состояние *detached HEAD* --- не привязан к ветке. Изменения не теряются, это режим просмотра. Для возврата используется `git switch <ветка>`.

```bash
git log --oneline           # смотрим историю, выбираем хэш
git checkout af7f0fa        # переходим к коммиту (detached HEAD)
cat .git/HEAD               # содержит хэш, а не ref
git switch git-lab-demo     # возвращаемся на ветку
```

#figure(
  rect(image("../screenshots/3.png", width: 100%, fit: "contain")),
  caption: [Предупреждение о detached HEAD при `git checkout <hash>`],
) <p3-checkout-hash>

=== 4. Переход на другую ветку — `git checkout <branch>`, `git switch <branch>`

`git switch` --- современная замена `git checkout` для переключения веток. Флаг `-c` создаёт новую ветку и сразу переключается на неё. `git checkout -b` делает то же самое в старом синтаксисе.

```bash
git branch                      # список веток
git checkout -b demo-branch-1   # создать и переключиться (старый способ)
git switch git-lab-demo         # вернуться (новый способ)
git switch -c demo-branch-2     # создать и переключиться (новый способ)
git switch git-lab-demo
git branch -d demo-branch-1 demo-branch-2  # удалить тестовые ветки
```

#figure(
  rect(image("../screenshots/4.png", width: 100%, fit: "contain")),
  caption: [Создание веток и переключение между ними],
) <p4-switch>

=== 5. Отмена изменений через новый коммит — `git revert <hash>`

`git revert` создаёт *новый коммит*, отменяющий изменения указанного. История не переписывается --- безопасный способ отмены для коммитов, уже отправленных в удалённый репозиторий.

```bash
git log --oneline               # выбираем коммит для отмены
git revert 2d9b048 --no-edit    # отменяем "fix: fixed pagination page"
git log --oneline               # новый revert-коммит в истории
git revert HEAD --no-edit       # отменяем revert (возвращаем как было)
```

#figure(
  rect(image("../screenshots/5.png", width: 100%, fit: "contain")),
  caption: [`git log --oneline` с появившимся revert-коммитом],
) <p5-revert>

=== 6. Режим `--soft` и `--hard` для `git reset`

`git reset` перемещает HEAD и ветку назад по истории. Режим `--soft` отменяет коммит, но оставляет изменения в индексе. Режим `--hard` полностью удаляет изменения из рабочего каталога --- необратимая операция без `git reflog`.

```bash
# --soft: изменения остаются в staging
git reset --soft HEAD~1
git status                        # файлы в staged
git commit -m "chore: added readme"

# --hard: изменения удаляются полностью
git reset --hard HEAD~1
git log --oneline                 # коммита нет
git reset --hard c058d5c          # восстановить по хэшу из reflog
```

#figure(
  rect(image("../screenshots/6.png", width: 100%, fit: "contain")),
  caption: [`git status` после `--soft` (файлы в staged) и после `--hard` (чисто)],
) <p6-reset>

=== 7. Изменить сообщение последнего коммита — `git commit --amend`

`--amend` перезаписывает последний коммит: изменяет сообщение и/или добавляет файлы из индекса. Создаёт новый объект коммита с новым хэшем. *Не применять для коммитов, уже отправленных на удалённый репозиторий.*

```bash
git log --oneline
git commit --amend -m "chore: added readme"  # новое сообщение без редактора
git log --oneline                            # хэш изменился
```

#figure(
  rect(image("../screenshots/7.png", width: 100%, fit: "contain")),
  caption: [`git log --oneline` до и после `--amend`],
) <p7-amend>

=== 8. Содержимое HEAD — `cat .git/HEAD`

`.git/HEAD` --- текстовый файл, всегда указывающий на текущую позицию. В нормальном режиме содержит `ref: refs/heads/<ветка>`. В режиме detached HEAD содержит SHA-1 хэш коммита напрямую.

```bash
cat .git/HEAD                   # ref: refs/heads/git-lab-demo
git checkout af7f0fa
cat .git/HEAD                   # af7f0fa... (хэш — detached HEAD)
git switch git-lab-demo
cat .git/HEAD                   # снова ref: refs/heads/git-lab-demo
```

#figure(
  rect(image("../screenshots/8.png", width: 100%, fit: "contain")),
  caption: [`cat .git/HEAD` в обычном режиме и в detached HEAD],
) <p8-head>

=== 9. Куда указывает ветка — `cat .git/refs/heads/master`

Каждая ветка --- это файл в `.git/refs/heads/`, содержащий SHA-1 хэш коммита, на который ветка указывает. При создании нового коммита файл ветки обновляется автоматически.

```bash
cat .git/refs/heads/master  # хэш последнего коммита ветки
git log --oneline -1        # должен совпадать
```

#figure(
  rect(image("../screenshots/9.png", width: 100%, fit: "contain")),
  caption: [Совпадение хэша из файла ветки и из `git log`],
) <p9-refs>

=== 10. Команда `git log --oneline`

Компактный вывод истории: каждый коммит в одну строку (короткий хэш + сообщение). Флаг `--graph` добавляет ASCII-граф веток, `--all` показывает все ветки, `-N` ограничивает количество коммитов.

```bash
git log --oneline           # вся история
git log --oneline -5        # последние 5 коммитов
git log --oneline --graph --all  # граф всех веток
```

#figure(
  rect(image("../screenshots/10.png", width: 100%, fit: "contain")),
  caption: [Вывод `git log --oneline --graph --all`],
) <p10-log>

=== 11. Команды `git diff` и `git diff <hash>`

`git diff` показывает построчную разницу между состояниями. Без аргументов --- изменения не в индексе. `--staged` --- изменения в индексе. С хэшем --- разница между текущим состоянием и указанным коммитом.

```bash
git diff                        # изменения не добавленные в staging
git diff --staged               # изменения в staging
git diff HEAD~1 HEAD            # разница между последними двумя коммитами
git diff 1ea8432 c058d5c        # разница между двумя конкретными коммитами
```

#figure(
  rect(width: 100%, height: 7cm, stroke: 0.5pt)[],
  caption: [Вывод `git diff HEAD~1 HEAD`],
) <p11-diff>

=== 12. Команда `git rm --cached <файл>`

Удаляет файл из индекса (перестаёт отслеживаться Git), но *оставляет его на диске*. Используется когда файл уже закоммичен, а его нужно добавить в `.gitignore`.

```bash
touch test_temp.txt
git add test_temp.txt
git status                      # файл в staged
git rm --cached test_temp.txt   # убираем из индекса
git status                      # файл теперь untracked
rm test_temp.txt
```

#figure(
  rect(width: 100%, height: 7cm, stroke: 0.5pt)[],
  caption: [`git status` до и после `git rm --cached`],
) <p12-rm-cached>

=== 13. Команда `git stash`

Временно сохраняет незакоммиченные изменения в стек, очищая рабочий каталог. Позволяет переключиться на другую задачу без коммита. `pop` восстанавливает и удаляет из стека, `apply` --- восстанавливает без удаления.

```bash
echo "test" >> README.md
git stash push -m "temp readme edit"  # спрятать с названием
git status                             # чисто
git stash list                         # список спрятанного
git stash pop                          # восстановить последнее
git stash apply stash@{0}              # применить без удаления из стека
git checkout -- README.md              # откат тестового изменения
```

#figure(
  rect(image("../screenshots/13.png", width: 100%, fit: "contain")),
  caption: [`git stash list` и `git stash pop`],
) <p13-stash>

=== 14. Восстановление удалённого через `reset --hard` коммита

`git reflog` хранит лог всех перемещений HEAD, включая «потерянные» после `reset --hard` коммиты. Позволяет восстановить их в течение 90 дней по хэшу из рефлога.

```bash
git reset --hard HEAD~1         # "удаляем" последний коммит
git log --oneline               # коммита нет
git reflog                      # находим хэш в reflog
git reset --hard c058d5c        # восстанавливаем
git log --oneline               # коммит вернулся
# Альтернатива: git switch -c recovered c058d5c
```

#figure(
  rect(image("../screenshots/14.png", width: 100%, fit: "contain")),
  caption: [`git reflog` с видимым «потерянным» коммитом],
) <p14-reflog>

=== 15. Команда `git cherry-pick`

Применяет изменения из конкретного коммита другой ветки в текущую. Создаёт новый коммит с теми же изменениями, но новым хэшем. В отличие от merge, берётся ровно один выбранный коммит.

```bash
git cherry-pick af7f0fa         # перенести коммит "refactor: added some a11y"
git log --oneline               # перенесённый коммит в истории
git revert HEAD --no-edit       # отменяем cherry-pick
```

#figure(
  rect(image("../screenshots/15.png", width: 100%, fit: "contain")),
  caption: [`git log --oneline` с перенесённым коммитом],
) <p15-cherry-pick>

=== 16. Объединение нескольких коммитов в один

`git reset --soft HEAD~N` разворачивает N коммитов, оставляя изменения в staging --- затем создаётся один новый коммит. `git rebase -i HEAD~N` позволяет интерактивно выбрать коммиты: `squash` объединяет с сохранением сообщений, `fixup` --- без.

```bash
# Через reset --soft
git log --oneline
git reset --soft HEAD~2                     # разворачиваем 2 коммита
git status                                  # изменения в staged
git commit -m "squashed commit message"

# Через rebase -i (откроется редактор)
git rebase -i HEAD~3  # меняем pick → squash для нужных коммитов
```

#figure(
  rect(image("../screenshots/16.png", width: 100%, fit: "contain")),
  caption: [`git log --oneline` до и после squash],
) <p16-squash>

=== 17. Перенос коммитов — `git rebase --onto`

`git rebase --onto <newbase> <upstream> <branch>` переносит серию коммитов из `upstream..branch` и применяет их поверх `newbase`. Полезно, если ветка была ответвлена не от того места.

```bash
git checkout -b feature-demo 1ea8432  # ветка от старого коммита
git switch git-lab-demo
git rebase --onto git-lab-demo 1ea8432 feature-demo
git log --oneline feature-demo        # коммиты теперь поверх git-lab-demo
git branch -d feature-demo
```

#figure(
  rect(image("../screenshots/17.png", width: 100%, fit: "contain")),
  caption: [`git log --oneline` ветки до и после `rebase --onto`],
) <p17-rebase-onto>

=== 18. Команда `git blame`

Для каждой строки файла показывает: хэш коммита, автора, дату и содержимое строки. Незаменимо для поиска того, кто и когда внёс конкретное изменение.

```bash
git blame README.md             # построчная история файла
git blame -L 1,10 README.md     # только строки 1–10
git blame --date=short README.md
```

#figure(
  rect(image("../screenshots/18.png", width: 100%, fit: "contain")),
  caption: [Вывод `git blame README.md`],
) <p18-blame>

=== 19. Команда `git bisect`

Находит коммит, «сломавший» что-то, методом бинарного поиска. Указываются «плохой» и «хороший» коммиты --- Git поочерёдно предлагает коммиты для проверки, сужая диапазон вдвое. Поддерживает автоматизацию через `git bisect run <команда>`.

```bash
git bisect start
git bisect bad                  # текущий коммит — плохой
git bisect good 540d787         # этот коммит — хороший
# Git переключает HEAD на середину — проверяем и отвечаем:
git bisect good                 # или: git bisect bad
# После нахождения первого плохого коммита:
git bisect reset                # выход из режима bisect

# Автоматизация:
git bisect start HEAD 540d787
git bisect run npm test
git bisect reset
```

#figure(
  rect(image("../screenshots/19.png", width: 100%, fit: "contain")),
  caption: [Вывод `git bisect` с найденным «плохим» коммитом],
) <p19-bisect>

== Контрольные вопросы и ответы

=== В чём разница между `git revert` и `git reset`?

`git revert` создаёт новый коммит, отменяющий изменения, не трогая историю --- безопасно для опубликованных веток. `git reset` перемещает HEAD назад, переписывая историю --- подходит только для локальных, ещё не запушенных коммитов.

=== Что такое detached HEAD и когда он возникает?

Состояние, при котором HEAD указывает напрямую на хэш коммита, а не на ветку. Возникает при `git checkout <hash>`. Изменения в этом состоянии не привязаны ни к одной ветке и могут быть «потеряны» при переключении.

=== Зачем нужен `git reflog`?

`git reflog` хранит лог всех перемещений HEAD за последние 90 дней, включая те, что не видны в `git log` после `reset --hard`. Позволяет восстановить «потерянные» коммиты.

=== Чем `git stash pop` отличается от `git stash apply`?

Оба восстанавливают последнее спрятанное состояние, но `pop` удаляет его из стека, а `apply` --- оставляет. `apply` полезен, когда нужно применить одно и то же состояние несколько раз.

=== Для чего используется `git bisect`?

Для поиска коммита, введшего регрессию, методом бинарного поиска. Позволяет быстро найти «виновный» коммит среди сотен, не проверяя каждый вручную. Поддерживает автоматизацию через `git bisect run`.
