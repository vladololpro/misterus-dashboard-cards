# DEFENSE — подготовка к защите ЛР №7 и №8

Документ построен по критериям из PDF-файлов в корне проекта. В каждой части сначала идут уровни оценок сверху вниз — «Удовлетворительно», «Хорошо», «Отлично». По каждому критерию показано, что сделано, где это открыть в коде и как объяснить преподавателю. Разбор работы тестов из ЛР №8 сохранён отдельно.

## Оглавление

- [Часть 1. ЛР №7 — типизация проекта на TypeScript](#часть-1-лр-7-типизация-проекта-на-typescript)
- [Часть 2. ЛР №8 — Unit и e2e-тестирование](#часть-2-лр-8-unit-и-e2e-тестирование)

---

## Часть 1. ЛР №7 — типизация проекта на TypeScript

Продолжение предыдущей лабораторной: тот же стек и данные, но код переведён на TypeScript. Ниже критерии идут в том же порядке, что и в PDF.

### 1. Подготовка по критериям

#### Удовлетворительно

##### 1. Проект переведён на TypeScript

**Что сделано**

- Все компоненты и страницы имеют расширения `.tsx`.
- В проекте есть `tsconfig.json`.
- В `package.json` есть скрипт `typecheck`.
- В `tsconfig.json` включён `jsx: react-jsx`.
- В проекте нет JavaScript-компонентов.

**Теория**

**База.** TypeScript — это JavaScript со статической типизацией. Типы проверяются до запуска программы: компилятор находит несовпадение аргументов, отсутствующие поля и неверные возвращаемые значения. Расширение `.tsx` означает, что файл содержит JSX. `tsc --noEmit` только проверяет типы, а Vite собирает код, но сам типы не проверяет.

**В проекте.** Например, в `CardItemProps` записано `onToggleBlock: (id: number) => Promise<void>`; если передать туда функцию, которая принимает `Card`, ошибка появится сразу в редакторе и в `npm run typecheck`. `tsc --noEmit` только проверяет типы и не меняет файлы, а `npm run build` вызывает `tsc` перед Vite, поэтому сборка не соберёт проект с ошибочной типизацией. Важно, что проверяются и `.tsx`-файлы с JSX, и тесты через `tsconfig.e2e.json`: Vite сам по себе типы не проверяет.

**Что показать**

1. Открыть `tsconfig.json`.
2. Показать файлы `src/App.tsx`, `src/main.tsx`, `src/pages/DashboardPage.tsx`.
3. Открыть `package.json` и показать скрипт:

```json
"typecheck": "tsc --noEmit && tsc --noEmit -p tsconfig.e2e.json"
```

4. Запустить:

```bash
npm run typecheck
```

5. Показать, что команда завершилась без ошибок.

##### 2. Описаны типы основной сущности и использованы в состоянии и props

**Что сделано**

- `Card` и `Operation` описаны в `src/shared/types/index.ts`.
- `Card` используется в `CardList`, `CardItem`, `CardDetails`, `BalanceWidget`, `QuickTransfer`.
- `Operation` используется в `OperationsList`, `TransactionDetails`, `OperationsPage`.
- `Card` используется в состоянии `selectedCard` и в пропсах компонентов.

**Теория**

**База.** Доменная модель — это описание объектов предметной области в виде типов. Такой тип служит единым контрактом: если он используется в API, состоянии и props, при изменении поля компилятор покажет все затронутые места. Это защищает от расхождений вроде `cardId` в одном слое и `id` в другом.

**В проекте.** В `DashboardPage` состояние `selectedCard` имеет тип `Card | null`, `CardList` получает `cards: Card[]`, а `OperationsList` получает `operations: Operation[]`. Если в типе `Card` переименовать поле `isBlocked`, компилятор покажет все места, которые нужно поправить: guard, модалку деталей, карточку и форму перевода. Так тип работает как единый словарь проекта: данные из API, состояние и props не расходятся в названиях полей.

**Что показать**

1. Открыть `src/shared/types/index.ts` и показать `Card`, `Operation`.
2. Открыть `src/components/CardList.tsx` и показать `cards: Card[]`.
3. Открыть `src/components/OperationsList.tsx` и показать `operations: Operation[]`.
4. Открыть `src/pages/DashboardPage.tsx` и показать `useState<Card | null>(null)`.

##### 3. Типизированы props и callbacks

**Что сделано**

- `CardItemProps` описывает все входные данные карточки.
- `CardListProps` описывает список карт и обработчики.
- `QuickTransferProps` описывает карты и активную карту.
- Callback-и типизированы функциями.

**Теория**

**База.** Props — это контракт компонента: какие данные он получает извне. Callback — это function prop, через который дочерний компонент сообщает родителю о событии. TypeScript проверяет и аргументы callback, и возвращаемое значение, поэтому неправильная сигнатура находится до запуска страницы.

**В проекте.** В `CardList` есть `onSelectCard: (id: number) => void`, `onToggleBlock: (id: number) => Promise<void>` и `onShowDetails: (card: Card) => void`; по этим сигнатурам видно, что выбор карты передаёт только ID, а открытие деталей — весь объект. `Promise<void>` у блокировки появился потому, что обработчик делает `await toggleCardBlock(cardId).unwrap()`: интерфейс должен дождаться ответа сервера. Без типов можно было бы случайно передать `setSelectedCard` туда, где ждут `number`, и ошибка проявилась бы только во время работы страницы.

**Что показать**

Открыть `src/components/CardItem.tsx`:

```ts
interface CardItemProps {
  card: Card
  isActive: boolean
  onSelect: (id: number) => void
  onToggleBlock: (id: number) => Promise<void>
  onShowDetails: (card: Card) => void
}
```

Объяснить:

- `onSelect` принимает `number` и ничего не возвращает;
- `onToggleBlock` возвращает `Promise<void>`, потому что внутри запрос;
- `onShowDetails` принимает объект карты.

##### 4. `useState` типизирован там, где вывод неочевиден

**Что сделано**

- `DashboardPage`: `useState<string | null>(null)` для ошибки.
- `DashboardPage`: `useState<Card | null>(null)` для выбранной карты.
- `OperationsPage`: `useState<Operation | null>(null)` для выбранной операции.
- `QuickTransfer`: `useState<TransferState>({ status: 'idle' })`.
- `CardItem`: `useState<boolean>(false)` для состояния блокировки.
- `useLocalStorage`: `useState<T>` внутри generic-хука.

**Теория**

**База.** `useState` выводит тип состояния из начального значения. Но `useState(null)` дал бы тип только `null`, поэтому позже нельзя было бы положить туда объект. Generic `useState<T>` явно задаёт все допустимые состояния и заставляет код сначала проверить значение, а затем читать его поля.

**В проекте.** Поэтому в `DashboardPage` явно написано `useState<Card | null>(null)`, а для ошибки — `useState<string | null>(null)`. Это же правило используется в `QuickTransfer`: `targetCardId` хранится как `number | null`, потому что получатель ещё не выбран. Из-за generic компилятор заставляет сначала проверить значение: модалка `CardDetails` открывается только внутри `selectedCard && ...`, а `activeCard` в форме проверяется до чтения `activeCard.currency`.

**Что показать**

Открыть `src/pages/DashboardPage.tsx`:

```ts
const [blockError, setBlockError] = useState<string | null>(null)
const [selectedCard, setSelectedCard] = useState<Card | null>(null)
```

Открыть `src/components/QuickTransfer.tsx`:

```ts
const [transferState, setTransferState] = useState<TransferState>({
  status: 'idle',
})
```

##### 5. Число из поля формы: строка, `ChangeEvent<HTMLInputElement>`, проверка

**Что сделано**

- Сумма перевода хранится как `string`.
- Используется `ChangeEvent<HTMLInputElement>`.
- Значение приводится к числу через `Number(...)`.
- Проверяется пустая строка.
- Проверяется `Number.isFinite`.
- Проверяется `amount > 0`.
- Проверяется достаточность средств.
- Сумма округляется до копеек.

**Теория**

**База.** Значение поля формы в браузере всегда строка — даже у `type="number"`. `ChangeEvent<HTMLInputElement>` описывает событие ввода и даёт доступ к `e.target.value`. Число нужно получить отдельно: преобразовать строку, отсечь `NaN`/`Infinity`, проверить диапазон и только потом использовать.

**В проекте.** В `QuickTransfer` инпут суммы имеет `type="text"`, и `handleAmountChange` получает `ChangeEvent<HTMLInputElement>`. Пользователь может ввести `1500,50`, `abc`, пустую строку или `-10`, поэтому код сначала делает `amount.replace(',', '.')`, затем `Number(...)`, потом проверяет `Number.isFinite` и `> 0`. После этого сумма округляется до копеек. Та же проблема есть у `<select>`: `e.target.value` тоже строка, поэтому для ID карты вызывается `Number(value)`. Такой пример показывает, почему нельзя доверять «цифровому» виду поля без явного преобразования.

**Что показать**

Открыть `src/components/QuickTransfer.tsx`:

```ts
const [amount, setAmount] = useLocalStorage<string>('last_transfer_amount', '')

const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
  setAmount(e.target.value)
  resetStatus()
}

const normalizedAmount = amount.replace(',', '.').trim()
const numericAmount = Number(normalizedAmount)

if (!normalizedAmount || !Number.isFinite(numericAmount) || numericAmount <= 0) {
  setTransferState({
    status: 'error',
    message: 'Введите корректную сумму больше нуля',
  })
  return
}
```

Также показать input:

```tsx
<input
  type="text"
  inputMode="decimal"
  value={amount}
  onChange={handleAmountChange}
/>
```

##### 6. `npm run typecheck` проходит без ошибок, `any` и `@ts-ignore` отсутствуют

**Что сделано**

- В коде нет `any`.
- В коде нет `@ts-ignore`.
- В коде нет `@ts-expect-error`.
- `npm run typecheck` проходит.
- `npm run lint` проходит.

**Теория**

**База.** `any` полностью отключает проверку типа для значения. `@ts-ignore` подавляет ошибку компилятора, но не исправляет причину. Поэтому зелёный `typecheck` имеет смысл только тогда, когда ошибки реально исправлены типами, guard-функциями и проверками, а не спрятаны.

**В проекте.** Если бы `apiClient.request` возвращал `any`, то `transformResponse` в `bankApiSlice` перестал бы сигнализировать о неверном формате, а ошибка проявилась бы уже при обращении к `card.number`. `@ts-ignore` ещё хуже: он убирает сообщение компилятора, но оставляет саму причину в коде. В проекте вместо этого ответ API сначала объявляется `unknown`, затем проходит `isCardArray` / `isOperationArray`, а ошибка — `getApiErrorMessage`. Скрипт `npm run typecheck` проверяет и приложение, и e2e-файлы, поэтому его зелёный результат означает, что типы согласованы во всех слоях.

**Что показать**

Запустить:

```bash
npm run typecheck
npm run lint
```

При необходимости показать поиск по проекту:

```bash
grep -R "any\|@ts-ignore\|@ts-expect-error" src server
```

В текущей версии совпадений нет.

#### Хорошо

Выполняются все условия «Удовлетворительно» плюс:

##### 1. Утилиты типов `Pick`, `Omit` и `Record` на своём домене

**Что сделано**

- `Pick` — `CardBalanceInfo` для виджета баланса.
- `Omit` — `NewOperation` для создания операции без ID.
- `Record` — `statsByCategory` и `statsByCurrency` в статистике.

**Теория**

**База.** `Pick<T, K>` создаёт новый тип только с указанными полями `K` из типа `T`. `Omit<T, K>` делает наоборот: исключает указанные поля. `Record<K, V>` описывает словарь, где каждый ключ `K` соответствует значению типа `V`. Все три утилиты выводят типы из существующих моделей, вместо того чтобы копировать интерфейсы вручную.

**В проекте.** В `types/index.ts` есть `NewOperation = Omit<Operation, 'id'>`: форму перевода создаёт объект без ID, потому что ID операции присваивает mock-сервер. Там же `CardWithStats = Card & { opsCount: number; total: number }` добавляет к карте расчётные поля для аналитики. В `operationsStats.ts` используется `Record<string, CategoryStat>` — словарь, где ключом становится категория операции. Если базовый `Operation` изменится, все такие производные типы автоматически останутся согласованными.

**Что показать**

`src/shared/types/index.ts`:

```ts
export type CardBalanceInfo = Pick<Card, 'balance' | 'currency' | 'isBlocked'>
export type NewOperation = Omit<Operation, 'id'>
```

`src/components/BalanceWidget.tsx`:

```ts
interface BalanceWidgetProps {
  card: CardBalanceInfo | undefined
}
```

`src/components/QuickTransfer.tsx`:

```ts
const outgoingOperation: NewOperation = {
  cardId: activeCard.id,
  title: `Перевод на карту ${formatCardNumber(targetCard.number)}`,
  amount: -transferAmount,
  date: new Date().toISOString().slice(0, 10),
}
```

`src/shared/lib/operationsStats.ts`:

```ts
const statsByCategory: Record<string, CategoryStat> = {}
const statsByCurrency: Record<string, CurrencyStat> = {}
```

##### 2. Состояние загрузки описано union и разбирается по значению

**Что сделано**

- `LoadingState` описан как discriminated union.
- `DashboardPage` формирует состояние по `isLoading`, `isError`, `hasData`.
- Компоненты проверяют `status` перед использованием `message`.
- `TransferState` использует тот же подход.

**Теория**

**База.** Discriminated union — это объединение объектных вариантов с общим полем-меткой, например `status`. Компилятор сужает тип по значению метки: в ветке `error` доступны только поля ошибки. Так невозможно получить бессмысленное сочетание флагов вроде `isLoading: true` и `isError: true`.

**В проекте.** В `types/index.ts` тип `LoadingState` имеет варианты `idle`, `loading`, `success` и `error`, причём `message` есть только в `error`. `DashboardPage` собирает это состояние из `isLoading`, `isError` и `hasData`, а затем разбирает его через `loadingState.status`. Благодаря этому в ветке `error` доступен `loadingState.message`, а в ветке `success` обратиться к несуществующему сообщению нельзя. Набор из трёх независимых boolean-флагов позволил бы получить противоречивое сочетание `isLoading: true` и `isError: true`; union такое состояние просто не описывает.

**Что показать**

`src/shared/types/index.ts`:

```ts
export type LoadingState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success' }
  | { status: 'error'; message: string }
```

`src/pages/DashboardPage.tsx`:

```ts
const loadingState: LoadingState = isLoading
  ? { status: 'loading' }
  : isError
    ? { status: 'error', message: 'Не удалось загрузить данные...' }
    : hasData
      ? { status: 'success' }
      : { status: 'idle' }
```

Показать разбор:

```ts
if (loadingState.status === 'loading' && !hasData) {
  // ...
}

if (loadingState.status === 'error') {
  // loadingState.message доступен только здесь
}
```

##### 3. Осознанный выбор `type` и `interface`, расширение через `extends` и `&`

**Что сделано**

- `interface` используется для объектов: `Card`, `Operation`, `TransferPayload`, `TransferResult`, props компонентов.
- `type` используется для union, utility types и пересечений.
- `ButtonProps extends ComponentProps<'button'>`.
- `CardWithStats = Card & { opsCount, total }`.

**Теория**

**База.** `interface` описывает форму объекта и поддерживает расширение через `extends`. `type` задаёт имя любому типу: объекту, union, intersection или утилитарному преобразованию. Оператор `&` объединяет поля типов в один тип. Выбор зависит от намерения: фиксированная объектная модель или комбинация/вариант.

**В проекте.** В проекте `interface` используется для объектных моделей `Card`, `Operation`, `TransferPayload` и `TransferResult`: у них фиксированный набор полей. А `FilterValue`, `LoadingState` и `TransferState` объявлены через `type`, потому что это варианты значений, а не один объект. `ButtonProps extends ComponentProps<'button'>` расширяет нативные props кнопки, а `CardWithStats = Card & { opsCount: number; total: number }` добавляет к карте поля статистики. Разница не в самом синтаксисе, а в намерении: интерфейс задаёт структуру объекта, `type` удобен для объединений и преобразований, `extends` и `&` показывают, откуда эта структура выросла.

**Что показать**

`src/shared/ui/Button.tsx`:

```ts
interface ButtonProps extends ComponentProps<'button'> {
  children: ReactNode
}
```

`src/shared/types/index.ts`:

```ts
export type CardWithStats = Card & {
  opsCount: number
  total: number
}
```

Объяснить:

- `extends` расширяет интерфейс;
- `&` создаёт пересечение типов;
- `type` удобен для union и utility types;
- `interface` удобен для объектных моделей и расширения.

##### 4. Включён `strict`, есть проверка на `null` перед чтением полей

**Что сделано**

- В `tsconfig.json` включён `strict`.
- `getCardById` возвращает `Card | undefined`.
- `BalanceWidget` проверяет `if (!card) return null`.
- `QuickTransfer` проверяет `if (!activeCard) return null`.
- `useActiveCard` использует `cards[0]?.id`.
- `TransactionDetails` принимает `Card | undefined`.
- В API-слое используются optional chaining и проверки.

**Теория**

**База.** `strict` — это набор строгих проверок TypeScript. Часть из них — `strictNullChecks`: `null` и `undefined` считаются отдельными типами и не могут использоваться как объект без проверки. Это заставляет явно обработать отсутствие значения через `if`, optional chaining или значение по умолчанию.

**В проекте.** Для `QuickTransfer` есть `const activeCard = cards.find(...)`, а `find` может вернуть `undefined`; поэтому сразу стоит `if (!activeCard) return null`. В `DashboardPage` `selectedCard` может быть `null`, и модалка отображается только после проверки. Без строгой проверки можно было бы написать `activeCard.currency` и получить падение на пустом результате поиска. `strict` не усложняет код, а заставляет явно решать, что делать с отсутствующим значением.

**Что показать**

`tsconfig.json`:

```json
"strict": true
```

`src/shared/lib/getCardById.ts`:

```ts
export function getCardById(cards: Card[], cardId: number): Card | undefined {
  return cards.find((card) => card.id === cardId)
}
```

`src/components/BalanceWidget.tsx`:

```ts
if (!card) return null
```

`src/components/TransactionDetails.tsx`:

```ts
interface TransactionDetailsProps {
  operation: Operation
  card: Card | undefined
  onClose: () => void
}
```

##### 5. Данные из API принимаются как `unknown` и проверяются, а не `as`

**Что сделано**

- `transformResponse` принимает `response: unknown`.
- `isCardArray` и `isOperationArray` проверяют структуру.
- В API-слое нет приведения ответа через `as Card[]` или `as Operation[]`.
- Ошибки обрабатываются через `isAxiosError`.
- Текст ошибки извлекается через `getApiErrorMessage`.

**Теория**

**База.** `unknown` — безопасный тип для внешних данных: его нельзя использовать, пока не доказана структура. `as Card[]` — это только утверждение компилятору, во время выполнения ничего не проверяющее. Type guard отличается тем, что действительно проверяет поля и возвращает предикат `data is Card[]`, после чего TypeScript сужает тип.

**В проекте.** В `bankApiSlice` ответ сначала приходит как `unknown`, а `transformResponse` вызывает `isCardArray` или `isOperationArray`. Guard проверяет не только наличие массива, но и типы полей: `id` и `balance` — числа, `number` и `expiry` — строки, `type` входит в `Mir | Visa | MasterCard`. Если сервер вернёт `{ cards: [...] }`, тест `rejects an invalid response format` ожидает ошибку, а не тихий успех. `as Card[]` создал бы иллюзию безопасности: компилятор поверил бы, а `card.number.slice(-4)` упал бы в рантайме. Исключения есть только вне API: `JSON.parse(item) as T` в `useLocalStorage` и `getElementById(...) as HTMLElement` в `main.tsx`.

**Что показать**

`src/shared/api/bankApiSlice.ts`:

```ts
transformResponse: (response: unknown) => {
  if (!isCardArray(response)) {
    throw new Error('Invalid response format for cards')
  }
  return response
}
```

`src/shared/api/guards.ts`:

```ts
export const isCardArray = (data: unknown): data is Card[] => {
  if (!Array.isArray(data)) return false
  return data.every((item) => {
    // проверка полей
  })
}
```

`src/shared/api/errors.ts`:

```ts
export const getApiErrorMessage = (
  error: unknown,
  fallback: string
): string => {
  // безопасное извлечение сообщения
}
```

#### Отлично

Выполняются все условия «Хорошо» плюс:

##### 1. Свой generic, полезный в проекте: `useLocalStorage<T>`

**Что сделано**

- Написан generic-хук `useLocalStorage<T>`.
- Он используется с `string` и `number | null`.
- Сеттер стабизирован через `useCallback`.
- Ошибки чтения и записи обрабатываются.
- Дополнительно есть generic-функция `request<T>`, которая возвращает `Promise<T>`.

**Теория**

**База.** Generic — это параметр типа, который связывает вход и результат функции или хука. Он позволяет написать один универсальный код без `any`: тип начального значения, возвращаемого значения и сеттера остаётся одинаковым. Если вместо `T` использовать `any`, ошибки типов найдутся только в браузере.

**В проекте.** Generic здесь не абстрактный пример, а рабочий инструмент: `useLocalStorage<string>('last_transfer_amount', '')` хранит введённую сумму, а `useLocalStorage<number | null>('last_transfer_target', null)` — ID выбранной карты. Возвращаемый тип `[T, (value: T) => void]` не даёт записать в сумму число или объект. Внутри хука `JSON.parse` действительно возвращает `any`, поэтому там есть `as T`, но наружу хук отдаёт уже типизированное значение. Если бы вместо generic был `any`, ошибка вроде `setTargetCardId('2')` нашлась бы только в браузере.

**Что показать**

`src/hooks/useLocalStorage.ts`:

```ts
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    // ...
  })

  const setValue = useCallback((value: T) => {
    // ...
  }, [key])

  return [storedValue, setValue]
}
```

Использование в `QuickTransfer.tsx`:

```ts
const [amount, setAmount] = useLocalStorage<string>(
  'last_transfer_amount',
  ''
)

const [targetCardId, setTargetCardId] = useLocalStorage<number | null>(
  'last_transfer_target',
  null
)
```

##### 2. Запрос возвращает `Promise<T>`, ошибка обрабатывается с типом

**Что сделано**

- `request<T>` возвращает `Promise<T>`.
- `axiosBaseQuery` использует `request<unknown>`.
- Для ошибок используется `isAxiosError`.
- Для извлечения текста ошибки используется `getApiErrorMessage`.
- В `QuickTransfer` ошибка обрабатывается как `unknown`.

**Теория**

**База.** `Promise<T>` означает, что когда-нибудь появится значение типа `T`; `await` это значение извлекает. Ошибка в JavaScript может быть чем угодно, поэтому в TypeScript она считается `unknown`, пока не проверена. Типизированная обработка ошибки — это превращение `unknown` в понятную структуру через проверки.

**В проекте.** `request<T>` в `bankApiSlice` объявлен как `Promise<T>` и возвращает `result.data`, поэтому для `getCards` тип успешного результата известен заранее — `Card[]`. После `dispatch(...).unwrap()` тест работает именно с массивом карт, а не с `unknown`. Ошибка в JavaScript не имеет одного фиксированного типа: `axiosBaseQuery` ловит `unknown`, проверяет `isAxiosError` и превращает её в `{ status?, data? }`. В UI `getApiErrorMessage` дополнительно проверяет структуру и достаёт текст из `data.error`. Так асинхронный код знает и тип успеха, и безопасный способ обработать неуспех.

**Что показать**

`src/shared/api/bankApiSlice.ts`:

```ts
const request = async <T,>({
  url,
  method,
  data,
}: AxiosQueryArgs): Promise<T> => {
  const result = await apiClient.request<T>({ url, method, data })
  return result.data
}
```

```ts
} catch (axiosError) {
  if (isAxiosError(axiosError)) {
    return {
      error: {
        status: axiosError.response?.status,
        data: axiosError.response?.data ?? axiosError.message,
      },
    }
  }

  return {
    error: {
      data: axiosError instanceof Error
        ? axiosError.message
        : 'Unknown error',
    },
  }
}
```

`src/components/QuickTransfer.tsx`:

```ts
} catch (error: unknown) {
  setTransferState({
    status: 'error',
    message: getApiErrorMessage(error, 'Не удалось выполнить перевод'),
  })
}
```

##### 3. `ReactNode` и `ComponentProps` вместо дублирования props

**Что сделано**

- `Button` расширяет `ComponentProps<'button'>`.
- `Button` принимает `children: ReactNode`.
- `Modal` принимает `children: ReactNode`.
- Не нужно вручную перечислять все нативные props кнопки.

**Теория**

**База.** `ReactNode` — это любой контент, который React может отобразить: строка, число, элемент, массив, фрагмент или `null`. `ComponentProps<'button'>` берёт все props нативной кнопки. Вместо ручного перечисления `onClick`, `disabled`, `type` и ARIA-атрибутов можно переиспользовать готовый тип.

**В проекте.** В `Button.tsx` тип написан как `interface ButtonProps extends ComponentProps<'button'> { children: ReactNode }`. Благодаря `ComponentProps<'button'>` кнопка сразу поддерживает `onClick`, `disabled`, `type`, ARIA-атрибуты и всё остальное, что пробрасывается через `...rest`. `ReactNode` нужен для `children`, потому что внутрь кнопки можно передать строку, иконку, элемент или фрагмент — не только `string`. Если бы props перечислялись вручную, любой новый атрибут нативной кнопки пришлось бы добавлять в наш интерфейс отдельно.

**Что показать**

`src/shared/ui/Button.tsx`:

```ts
import { ComponentProps, ReactNode } from 'react'

interface ButtonProps extends ComponentProps<'button'> {
  children: ReactNode
}
```

`src/components/Modal.tsx`:

```ts
interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
}
```

##### 4. Discriminated union с разбором по полю-метке

**Что сделано**

- `TransferState` описывает состояния перевода.
- Поле `status` является меткой.
- Компонент проверяет `status` перед доступом к `message`.
- `LoadingState` использует тот же подход для загрузки.

**Теория**

**База.** Discriminated union хранит набор состояний с общей меткой и различает их по значению этой метки. Поля, которые есть только в одном варианте, недоступны в остальных. Это заменяет отдельные флаги, которые могут противоречить друг другу.

**В проекте.** В `QuickTransfer` состояние формы описано через `TransferState`: `idle`, `submitting`, `success` и `error`. Поле `message` есть только в последних двух вариантах, поэтому проверка `transferState.status === 'error'` открывает доступ к `transferState.message` законно. Из этого же статуса выводится `isSubmitting`, и кнопка «Перевести» блокируется во время запроса. Если бы хранились отдельные флаги `isSuccess` и `isError`, интерфейс мог бы одновременно показать зелёное уведомление и ошибку; union делает такие комбинации ненаписанными.

**Что показать**

`src/components/QuickTransfer.tsx`:

```ts
type TransferState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string }
```

```ts
const isSubmitting = transferState.status === 'submitting'

{transferState.status === 'error' && (
  <NoticeBanner message={transferState.message} />
)}

{transferState.status === 'success' && (
  <NoticeBanner variant="success" message={transferState.message} />
)}
```

##### 5. `noUncheckedIndexedAccess` и `noUnusedLocals`, проверка после `npm ci`

**Что сделано**

- В `tsconfig.json` включён `noUncheckedIndexedAccess`.
- В `tsconfig.json` включён `noUnusedLocals`.
- В `tsconfig.json` включён `noUnusedParameters`.
- Код проверен после чистой установки `npm ci`.
- `npm run typecheck` проходит.
- `npm run lint` проходит.
- `npm run build` проходит.

**Теория**

**База.** `noUncheckedIndexedAccess` добавляет `undefined` к результату доступа по индексу, потому что элемент массива или словаря может отсутствовать. `noUnusedLocals` и `noUnusedParameters` запрещают неиспользуемые переменные и аргументы. `npm ci` устанавливает зависимости строго из lock-файла, обеспечивая воспроизводимость.

**В проекте.** В `operationsStats.ts` `statsByCategory[category]` становится `CategoryStat | undefined`, поэтому написана проверка `if (stat) stat.total += ...`. В `QuickTransfer` первый доступный получатель берётся как `availableTargets[0]`, а затем используется `?? null`. `noUnusedLocals` и `noUnusedParameters` не дают оставить неиспользуемые переменные после рефакторинга. Проверка после `npm ci` важна отдельно: она подтверждает, что проект проверяется с чистыми зависимостями из `package-lock.json`, а не только на машине, где пакеты уже установлены.

**Что показать**

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

Команды:

```bash
npm ci
npm run typecheck
npm run lint
npm run build
```

Пример обработки индекса в `QuickTransfer.tsx`:

```ts
const firstAvailableTarget = availableTargets[0]
setTargetCardId(firstAvailableTarget?.id ?? null)
```
### 2. Намеренная ошибка компилятора

На защите нужно показать ошибку компилятора и объяснить её сообщение.

#### Вариант 1. Ошибка в доменном типе

1. Открыть `src/shared/types/index.ts`.
2. Найти поле:

```ts
balance: number
```

3. Временно заменить на:

```ts
balance: string
```

4. Запустить:

```bash
npm run typecheck
```

5. Ожидаемый результат: ошибки в местах, где `balance` используется как число, например:

```text
Type 'string' is not assignable to type 'number'
```

или ошибки операторов сравнения и арифметики.

6. Объяснить: TypeScript проверил все использования типа `Card` и нашёл несовпадение.
7. Вернуть `balance: number`.
8. Снова запустить `npm run typecheck` и показать, что ошибок нет.

#### Вариант 2. Короткая локальная ошибка

Если не хочется менять доменный тип, можно временно добавить в любой `.ts`-файл:

```ts
const wrongAmount: number = '100'
```

Ожидаемая ошибка:

```text
TS2322: Type 'string' is not assignable to type 'number'
```

Объяснить:

- `'100'` — это строка;
- `number` — это число;
- TypeScript не выполняет неявное преобразование;
- нужно использовать `Number('100')`, если действительно нужна конверсия.

После показа удалить строку.

### 3. Записка к сдаче и список сдачи

Готовый текст для записки:

```text
В проекте осознанно типизированы:
- доменные сущности Card и Operation;
- props и callbacks компонентов;
- события формы через ChangeEvent<HTMLInputElement>;
- состояния загрузки и перевода через discriminated union;
- API-ответы через unknown и type guards;
- ошибки API через unknown и isAxiosError;
- переиспользуемая логика через generic useLocalStorage<T> и request<T>;
- общие props через ReactNode и ComponentProps;
- строгие настройки tsconfig: strict, noUncheckedIndexedAccess, noUnusedLocals.

Проверки:
- npm ci;
- npm run typecheck;
- npm run lint;
- npm run build.

Все команды проходят без ошибок. any и @ts-ignore не используются.
```

#### Что сдавать

- Ссылку на репозиторий.
- Лог `npm run typecheck`.
- Короткую записку о том, что типизировано осознанно.
- При необходимости — ссылку на запущенное приложение или скриншоты.

Лог можно сохранить так:

```bash
npm run typecheck > typecheck.log 2>&1
```

### 4. План защиты ЛР7

#### Чек-лист

- [ ] `npm ci` проходит без ошибок.
- [ ] `npm run typecheck` проходит без ошибок.
- [ ] `npm run lint` проходит без ошибок.
- [ ] `npm run build` проходит без ошибок.
- [ ] Запущен `npm run server`.
- [ ] Запущен `npm run dev`.
- [ ] Главная страница загружает карты и операции.
- [ ] Блокировка и разблокировка работают.
- [ ] Перевод между картами одной валюты работает.
- [ ] После перевода обновляются балансы и история.
- [ ] Фильтры «Все», «Доходы», «Расходы» работают.
- [ ] Модальные окна открываются и закрываются.
- [ ] Страница `/operations` показывает статистику и диаграммы.
- [ ] Страница 404 работает.
- [ ] Подготовлена намеренная ошибка компилятора.
- [ ] Подготовлена короткая записка о типизации.

#### Сценарий показа

1. Показать структуру проекта и объяснить слои: `pages`, `components`, `features`, `hooks`, `shared`, `server`.
2. Показать `tsconfig.json`: `strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`.
3. Запустить `npm run typecheck` и показать успешный результат.
4. Открыть `src/shared/types/index.ts` и показать `Card`, `Operation`, `FilterValue`, `LoadingState`.
5. Показать props и callbacks в `CardItem.tsx` и `CardList.tsx`.
6. Показать обработку формы в `QuickTransfer.tsx`: `ChangeEvent<HTMLInputElement>`, строка, проверка суммы.
7. Показать `Pick`, `Omit` и `Record` в реальном использовании.
8. Показать `useLocalStorage<T>` и generic-запрос `request<T>` с `Promise<T>`.
9. Показать `Button` на `ComponentProps<'button'>` и `Modal` с `ReactNode`.
10. Показать discriminated union `TransferState` и разбор по `status`.
11. Показать API-слой: `unknown`, guard-функции, `isAxiosError`, `getApiErrorMessage`.
12. Показать в браузере карты, блокировку, перевод, фильтры и историю.
13. Показать намеренную ошибку компилятора и объяснить сообщение.
14. Вернуть файл в исходное состояние и ещё раз запустить `npm run typecheck`.

#### Возможные вопросы преподавателя

##### Почему не `any`?

`any` отключает проверку типов и позволяет ошибке проявиться только во время выполнения. В проекте вместо `any` используются конкретные типы, `unknown` и type guards.

##### Чем `unknown` лучше `any`?

`unknown` требует сначала проверить значение. `any` разрешает делать с ним что угодно без проверки. Для внешних данных `unknown` безопаснее.

##### Почему не использовать `as` для ответа API?

`as` не проверяет данные во время выполнения. Если сервер вернёт другую структуру, приложение упадёт. Guard-функция действительно проверяет поля и только потом сужает тип.

##### Чем `type` отличается от `interface`?

`interface` удобен для объектных моделей и расширения через `extends`. `type` удобен для union, intersections, utility types и алиасов. В проекте оба используются по назначению.

##### Что такое discriminated union?

Это union объектов с общим полем-меткой, например `status`. По значению метки TypeScript сужает тип и разрешает доступ только к полям конкретного варианта.

##### Зачем нужен generic `useLocalStorage<T>`?

Он сохраняет связь между типом значения и типом сеттера. Нельзя случайно записать в строковое значение число или объект.

##### Зачем `Promise<T>`?

Он показывает, какой тип будет после `await`. В проекте `request<T>` возвращает `Promise<T>`, поэтому результат запроса типизирован.

##### Что делает `noUncheckedIndexedAccess`?

Он делает результат индексации `T | undefined`. Код обязан проверить значение перед использованием. Это защищает от выхода за границы массива и отсутствующих ключей.

##### Почему TypeScript версии 6, а не 7?

`typescript-eslint@8.72.1` поддерживает TypeScript в диапазоне `>=4.8.4 <6.1.0`. TypeScript 7 несовместим с текущей версией линтера. Для стабильной проверки типов и линтинга используется TypeScript 6.

##### Что будет, если API вернёт неверные данные?

`transformResponse` получит `unknown`, guard-функция вернёт `false`, и запрос завершится ошибкой. В интерфейсе появится уведомление, а не частично неверные данные.

##### Где хранится состояние?

Глобальное состояние — в Redux Store: активная карта и фильтр. Данные API — в кеше RTK Query. Локальное состояние компонентов — в `useState`. Часть пользовательских настроек — в `localStorage`.

##### Почему `useBankData` вызывается в нескольких местах?

RTK Query дедуплицирует одинаковые запросы и использует кеш. Это позволяет `Layout` и страницам независимо получать одни и те же данные без дублирования сетевых запросов.

##### Как обновляются данные после перевода?

Mutation `createTransfer` инвалидирует теги `Card/LIST` и `Operation/LIST`. RTK Query автоматически повторно загружает карты и операции, поэтому балансы и история обновляются без ручного перезапуска.

---

## Часть 2. ЛР №8 — Unit и e2e-тестирование

Проект ЛР7 продолжается: тесты добавляются к уже существующему TypeScript-проекту, приложение не переписывается с нуля. Ниже критерии идут в том же порядке, что и в PDF.

### 1. Подготовка по критериям

#### Удовлетворительно

##### 1. Тесты на Jest для синхронных функций своего проекта

**Что сделано**

- Синхронные тесты лежат в `src/shared/lib/__tests__` и `src/features/filter/__tests__`.
- Проверяются утилиты `formatMoney`, `formatCardNumber`, `sortOperationsByNewest`, `getCardById`, `getMerchantIcon`, `buildOperationsStats`, guards и reducer фильтра.
- Это чистые функции: они не обращаются к сети, не открывают браузер и возвращают результат сразу.

**Теория**

**База.** Unit-тест проверяет наименьшую единицу кода — обычно одну функцию — в изоляции. Для чистых функций один и тот же вход всегда даёт один и тот же выход, поэтому тесты быстрые и предсказуемые. Им не нужны браузер, сеть и сервер.

**В проекте.** Например, `formatCardNumber` из `src/shared/lib/formatCard.ts` получает строку и сразу возвращает `**** 5678`, поэтому для неё не нужны браузер, Redux и mock API. `sortOperationsByNewest` проверяет граничный случай: если у операции есть `createdAt`, берётся он, иначе `date`, а исходный массив не меняется благодаря `[...operations]`. Jest запускает такие тесты в Node, а `jest.setup.cjs` подготавливает минимальный `localStorage`. Ошибка в форматировании или сортировке находится без запуска всего дашборда.

**Где показать**

- `src/shared/lib/__tests__/formatMoney.test.ts`
- `src/shared/lib/__tests__/formatCard.test.ts`
- `src/shared/lib/__tests__/sortOperations.test.ts`
- `src/features/filter/__tests__/filterSlice.test.ts`

**Что сказать**

Unit-тест проверяет одну небольшую функцию изолированно. Для ЛР7 у нас было много чистой логики — форматирование сумм и карт, сортировка операций, статистика, поиск карты, guard-функции. На этих функциях удобно показать, что мы умеем тестировать обычное поведение без браузера и сервера.

##### 2. Правильный результат на обычных данных, а также на пустых или неверных, где это уместно

**Что сделано**

- Обычный случай: `formatCardNumber('2200240012345678')` возвращает `'**** 5678'`.
- Граничный случай: короткий номер и пустая строка в `formatCard.test.ts`.
- Невалидные данные: `guards.test.ts` проверяет отсутствующие поля, строковые числа, неизвестный тип карты и `null`.
- Пустые данные: `operationsStats.test.ts` проверяет пустые массивы, а `filterSlice.test.ts` — мусорное значение фильтра.
- Неизменность входа: `sortOperations.test.ts` проверяет, что исходный массив не мутируется.

**Теория**

**База.** Позитивный тест фиксирует нормальную работу функции. Граничные и негативные тесты проверяют пустые значения, неверные типы, отсутствующие поля и предельные случаи. Именно там чаще всего проявляются ошибки, не видимые на обычном примере.

**В проекте.** Обычный случай фиксирует договорённость: `formatCardNumber('2200240012345678')` должен вернуть только последние четыре цифры. Граничные случаи проверяют поведение там, где легко ошибиться: пустая строка в `formatCard.test.ts`, пустой массив в `operationsStats.test.ts`, мусорное значение фильтра в `filterSlice.test.ts`. Для внешних данных важны тесты `guards.test.ts`: отсутствующее поле, строковый `balance`, неизвестный тип карты и `null` должны привести к `false`, а не к падению. Вместе эти тесты проверяют не только «функция работает», но и «функция предсказуемо ведёт себя на границе».

**Где показать**

- `src/shared/lib/__tests__/formatCard.test.ts`
- `src/shared/api/__tests__/guards.test.ts`
- `src/shared/lib/__tests__/operationsStats.test.ts`
- `src/features/filter/__tests__/filterSlice.test.ts`

**Что сказать**

Обычный тест показывает, что функция работает на типичных данных. Пустой и невалидный случаи проверяют границы: если придёт пустой массив, отсутствует поле или неверный тип, функция должна вернуть предсказуемый результат, а не упасть. Это и есть критерий «обычные и пустые/неверные данные».

##### 3. Тесты запускаются командой `npm test` и проходят

**Что сделано**

- В `package.json` настроен скрипт `npm test`.
- Jest запускает все 9 тестовых файлов через `ts-jest`.
- В тестах нет `.only` и `.skip`, все проверки активны.

**Теория**

**База.** Test runner находит тестовые файлы по шаблону, компилирует их при необходимости и запускает все проверки одной командой. Конфиг задаёт окружение, алиасы и очистку состояния между тестами. Скрипт в `package.json` делает запуск одинаковым для всех разработчиков.

**В проекте.** `jest.config.cjs` задаёт `roots: ['<rootDir>/src']` и шаблон `**/__tests__/**/*.test.ts`, поэтому новые тесты подхватываются автоматически. `ts-jest` компилирует TypeScript-файлы с настройками из конфига, а `moduleNameMapper` понимает алиасы `@/`, `@components/` и `@shared/`. Поведение между тестами не протекает: включены `clearMocks` и `restoreMocks`. Скрипт `npm test` в `package.json` — это один вход для всех девяти файлов; результат `76 passed` показывает, что ни один тест не пропущен через `.skip` и не выделен через `.only`.

**Что сделать**

```bash
npm test
```

**Ожидаемый результат**

```text
Test Suites: 9 passed, 9 total
Tests:       76 passed, 76 total
```

**Что сказать**

Все тесты запускаются одной командой через скрипт `npm test` в `package.json`. Сейчас это 9 тестовых файлов и 76 тестов. Мы не отключали тесты через `.only` или `.skip`, все проверки активны.

**Опора:** `package.json`, `jest.config.cjs`.

#### Хорошо

Выполняются все условия «Удовлетворительно» плюс async-тесты.

##### 1. Тесты на Jest для асинхронных функций: загрузка и сохранение данных

**Что сделано**

- Добавлен `src/shared/api/__tests__/bankApiAsync.test.ts`.
- Добавлен helper `src/shared/api/__tests__/testStore.ts` с настоящим middleware RTK Query.
- Async-тесты проверяют `getCards`, `getOperations`, `toggleCardBlock` и `createTransfer`.
- Всего 10 async-тестов.

**Теория**

**База.** Асинхронный тест проверяет код, который возвращает Promise. Нужно дождаться завершения операции и проверить не только факт вызова, но и итоговые данные или ошибку. Внешние эффекты подменяются, а внутренняя логика остаётся настоящей.

**В проекте.** Асинхронные тесты проверяют путь от эндпоинта RTK Query до состояния store. В `bankApiAsync.test.ts` создаётся настоящий store через `createTestStore()`, поэтому работают middleware RTK Query, теги кеша и `transformResponse`. Тесты вызывают `getCards`, `getOperations`, `toggleCardBlock` и `createTransfer`, подменяя только ответ транспорта. Так проверяется не вызов функции, а реальный сценарий: данные загрузились, блокировка изменила карту, перевод создал две операции. Для синхронных утилит такой уровень избыточен, но для запросов он необходим.

**Где показать**

- `src/shared/api/__tests__/bankApiAsync.test.ts`
- `src/shared/api/__tests__/testStore.ts`

**Что сказать**

Async-тесты нужны, чтобы проверить не только функцию форматирования, а реальные сценарии загрузки и сохранения: карты и операции пришли с сервера, блокировка сохранилась, перевод создал новые данные. Для этого мы создаём настоящий store с RTK Query middleware.

##### 2. Успешный результат и ошибка; ожидание завершения через `await`

**Что сделано**

- Успех проверяется через `await store.dispatch(...).unwrap()`.
- Ошибка проверяется через `await expect(...).rejects`.
- Покрыты ошибки `500`, `403`, `404`, `400`, неверный формат ответа и обычная `Error`.

**Теория**

**База.** `await` приостанавливает тест до завершения Promise. Метод `.unwrap()` возвращает данные успешного запроса или выбрасывает ошибку. Без ожидания тест может закончиться раньше запроса и ложно пройти.

**В проекте.** В успешном тесте `await store.dispatch(...).unwrap()` возвращает `[card, otherCard]`, и только после этого вызывается `expect(result).toEqual(...)`. В error-тесте используется `await expect(...).rejects.toEqual({ status: 500, data: { error: 'Server error' } })` — так тест дожидается именно отклонения запроса. Вспомогательные функции `ok()` и `failed()` создают реалистичные `AxiosResponse` и `AxiosError`, чтобы проверяемый код шёл по настоящему пути успеха или ошибки.

**Где показать**

`src/shared/api/__tests__/bankApiAsync.test.ts`:

- success-тест `loads cards from the server`;
- error-тест `returns an error from the server`;
- тест `rejects an invalid response format`;
- тесты мутаций `toggleCardBlock` и `createTransfer`.

**Что сказать**

`unwrap()` возвращает данные успешного запроса или выбрасывает ошибку. Поэтому и успех, и ошибку мы дожидаемся через `await`. Это важнее, чем просто запустить dispatch: тест гарантированно дождётся завершения запроса и проверит итог.

##### 3. Ответ сервера можно подменить; саму проверяемую функцию подменять нельзя

**Что сделано**

- Подменяется только `apiClient.request` через `jest.mock('../client')`.
- Эндпоинты RTK Query, base query, guard-функции, `transformResponse` и error-маппинг остаются настоящими.
- `beforeEach` вызывает `requestMock.mockReset()`, поэтому тесты независимы.

**Теория**

**База.** Подменять нужно внешнюю зависимость, а не объект тестирования. Иначе тест проверит mock, а не реальный код. Граница mock проходит там, где проверяемый код обращается к сети, файлам или времени.

**В проекте.** Граница подмены выбрана намеренно: `jest.mock('../client')` заменяет только `apiClient.request`. Всё остальное остаётся настоящим: `bankApiSlice`, base query, guard-функции, `transformResponse`, инвалидация тегов и store. Если подменить, например, `bankApiSlice.endpoints.getCards`, то тест не сможет поймать неверный формат ответа — он просто вернул бы готовый результат. `beforeEach(() => requestMock.mockReset())` очищает мок перед каждым сценарием, поэтому один тест не влияет на другой. Так проверяется приложение, а не подмена.

**Где показать**

`src/shared/api/__tests__/bankApiAsync.test.ts`:

```ts
jest.mock('../client', () => ({
  apiClient: {
    request: jest.fn(),
  },
}))
```

**Что сказать**

Мы подменяем транспорт, то есть ответ сервера. Нельзя подменить сам `getCards` или `createTransfer`, иначе тест будет проверять mock, а не реальную логику приложения. Поэтому работают настоящие эндпоинты, а меняется только то, что вернул сервер.

#### Отлично

Выполняются все условия «Хорошо» плюс браузерные тесты.

##### 1. Тесты на Playwright: открыть сайт и выполнить действия пользователя

**Что сделано**

- Добавлен `e2e/dashboard.spec.ts` с 5 сценариями.
- Тесты открывают сайт через `page.goto('/')` или `page.goto('/operations')`.
- Сценарии кликают по картам, нажимают кнопки, выбирают получателя, вводят сумму и отправляют форму.

**Теория**

**База.** E2E-тест управляет приложением через браузер так же, как пользователь: переходит по страницам, кликает, вводит данные. Он не импортирует внутренние функции и не трогает состояние напрямую. Так проверяется интеграция интерфейса, API, состояния и отображения.

**В проекте.** В `e2e/dashboard.spec.ts` сценарий открывает `page.goto('/')`, находит карту по тексту `**** 1234`, кликает по ней, выбирает получателя в `.quick-transfer__select`, вводит `100` в `.quick-transfer__input` и нажимает `.quick-transfer__submit`. Ни Redux, ни `createTransfer`, ни утилиты форматирования в тест не импортируются. Так проверяется весь путь пользователя: React-компонент → форма → RTK Query → mock API → обновление интерфейса.

**Где показать**

- `e2e/dashboard.spec.ts`
- `playwright.config.ts`

**Что сказать**

Playwright управляет реальным браузером. Тест не вызывает внутренние функции приложения, а делает то же, что пользователь: открывает страницу, кликает, вводит данные. Это проверяет работу интерфейса, API, Redux и отображения результата вместе.

##### 2. Проверка результата на странице

**Что сделано**

- После блокировки проверяется появление текста «Заблокирована».
- После разблокировки проверяется исчезновение статуса через `toHaveCount(0)`.
- После перевода проверяется уведомление и новая операция `-100` в истории.
- На `/operations` проверяется знак сумм после выбора «Доходы» и «Расходы».
- На неизвестном маршруте проверяется заголовок `404` и текст «Страница не найдена».

**Теория**

**База.** E2E-тест должен проверять видимый пользователю результат: текст, статусы, уведомления и списки. Внутренний state может измениться, но если интерфейс ничего не показал, сценарий нельзя считать работающим.

**В проекте.** После блокировки тест ожидает текст «Заблокирована», а после разблокировки — `toHaveCount(0)`, то есть элемент должен исчезнуть из DOM. После перевода проверяется уведомление `.notice-banner--success` с текстом `Перевод на карту **** 5678` и суммой `100`, а также новая операция в `.dashboard-operations li` со знаком `-100`. Для фильтрации берутся все `.history-item__amount` и проверяется, что доход начинается с `+`, а расход с `-`. Это важнее проверки внутреннего состояния: пользователь видит именно текст, статусы и суммы на странице.

**Где показать**

`e2e/dashboard.spec.ts`, сценарий `выполняет перевод и показывает результат на странице`.

**Что сказать**

E2E-тест должен проверять видимый результат, а не внутреннее состояние. Мы смотрим, что появилось в уведомлении, что изменилась история операций, что статус карты виден или исчез. Это и есть проверка результата на странице.

##### 3. `npm run test:e2e` запускает тесты; README описывает запуск сайта и тестов

**Что сделано**

- В `package.json` настроен скрипт `test:e2e`.
- В `playwright.config.ts` настроен `webServer` для API и Vite.
- В README описаны запуск сайта, установка браузера и запуск e2e-тестов.

**Теория**

**База.** Воспроизводимость тестов означает, что для запуска достаточно установленных зависимостей, браузера и известных команд. Playwright не включает сам браузер в `node_modules`, поэтому его устанавливают отдельно. Конфиг может сам поднимать нужные серверы.

**В проекте.** `playwright.config.ts` задаёт `baseURL: http://127.0.0.1:5173`, проект Chromium, `workers: 1` и два `webServer`: сначала поднимается mock API на `3001`, затем Vite на `5173`. Поэтому перед e2e не нужно вручную запускать `npm run server` и `npm run dev`, но порты должны быть свободны. На новой машине перед первым запуском нужен `npx playwright install chromium`, потому что в `node_modules` входит библиотека Playwright, а не сам браузер. README содержит команды `npm ci`, запуска сайта и полного набора проверок, чтобы другой человек мог повторить всё без устных пояснений.

**Что сделать**

```bash
npx playwright install chromium
npm run test:e2e
```

**Ожидаемый результат**

```text
5 passed
```

**Где показать**

- `package.json` — скрипт `test:e2e`.
- `playwright.config.ts` — `webServer` автоматически поднимает API и Vite.
- `README.md` — разделы «Быстрый старт» и «Тесты».

**Что сказать**

Одной командой `npm run test:e2e` запускаются все браузерные сценарии. Playwright сам поднимает mock API и Vite через `webServer`, поэтому не нужно вручную запускать серверы. README описывает и запуск сайта, и запуск тестов.

#### Дополнение из PDF

- Все тесты независимы друг от друга: в Jest включены `clearMocks` и `restoreMocks`, в async-тестах есть `mockReset()`, в e2e — `workers: 1` и helper `ensureUnblocked`.
- Проверки не отключены: нет `.only`, `.skip` и `@ts-ignore` в тестах.
- Рабочая проверка типов сохранена: `npm run typecheck` проверяет приложение и тесты, включая e2e через `tsconfig.e2e.json`.

### 2. Разбор кода тестов

Этот раздел — главная шпаргалка по ЛР №8. Его достаточно прочитать один раз перед парой. Ниже разобраны все группы тестов, показано, какие строки открывать, и даны готовые формулировки ответов.

#### 1. Инфраструктура тестов

| Файл | Зачем |
| --- | --- |
| `package.json` | Скрипты `npm test` и `npm run test:e2e` |
| `jest.config.cjs` | Настройка Jest и `ts-jest`, алиасы, mocks |
| `jest.setup.cjs` | Простой `localStorage` для Node |
| `jest.mocked` / `jest.mock` | Подмена ответа сервера в async-тестах |
| `tsconfig.e2e.json` | Проверка типов e2e-файлов |
| `playwright.config.ts` | Запуск браузера, сайта и mock API |
| `e2e/dashboard.spec.ts` | Пользовательские сценарии в браузере |

В `jest.config.cjs` важны эти строки:

```js
testEnvironment: 'node',
roots: ['<rootDir>/src'],
setupFiles: ['<rootDir>/jest.setup.cjs'],
transform: {
  '^.+\\.tsx?$': ['ts-jest', { tsconfig: { /* ... */ } }],
},
clearMocks: true,
restoreMocks: true,
maxWorkers: 2,
```

**Что сказать:**

- `ts-jest` выбран потому, что проект на TypeScript; SWC не используется.
- `testEnvironment: 'node'` — unit-тестам не нужен браузер.
- `jest.setup.cjs` создаёт mock `localStorage`: в Node его нет, а редьюсеры читают оттуда значения.
- `clearMocks` и `restoreMocks` очищают моки между тестами, поэтому тесты не зависят друг от друга.
- `maxWorkers: 2` ограничивает параллелизм, чтобы worker-процессы не завершались принудительно на слабой машине.
- Тесты лежат внутри `src`, поэтому попадают в `npm run typecheck` и линтер.

#### 2. Карта всех unit-файлов

| Файл | Тестов | Что проверяет |
| --- | --- | --- |
| `formatMoney.test.ts` | 4 | Обычные суммы, отрицательные значения, знак `+`, валюта |
| `formatCard.test.ts` | 3 | Маскирование карты: полный номер, короткий, пустой |
| `sortOperations.test.ts` | 6 | Сортировка по `createdAt`, fallback на `date`, одинаковое время, неизменность массива |
| `getCardById.test.ts` | 4 | Найденная карта, неизвестный id, отрицательный id, пустой список |
| `getMerchantIcon.test.ts` | 12 | Категории продавцов и fallback |
| `operationsStats.test.ts` | 8 | Статистика по валютам, картам, диаграммам, конвертация USD |
| `guards.test.ts` | 16 | Проверка массивов карт и операций, валидные и невалидные поля |
| `filterSlice.test.ts` | 13 | Допустимые и недопустимые значения фильтра, работа редьюсера |
| `bankApiAsync.test.ts` | 10 | Async-загрузка и сохранение, успех и ошибки |

Итого: **9 тестовых файлов, 76 тестов**.

Важно: в `guards.test.ts`, `filterSlice.test.ts` и `getMerchantIcon.test.ts` используется `test.each`. Один вызов `test.each([...])` создаёт несколько отдельных тестов. Поэтому когда преподаватель открывает файл и видит мало строк с `test(`, нужно объяснить: массив разворачивается в отдельные check-ы.

#### 3. Синхронные тесты: что открыть и как объяснить

##### `formatCard.test.ts` — обычный, короткий и пустой случай

```ts
test('masks all digits except the last four', () => {
  expect(formatCardNumber('2200240012345678')).toBe('**** 5678')
})

test('handles a short value', () => {
  expect(formatCardNumber('123')).toBe('**** 123')
})

test('handles an empty value', () => {
  expect(formatCardNumber('')).toBe('**** ')
})
```

**Что сказать:** это чистые синхронные тесты. Функция не делает запросов и не меняет внешнее состояние: передали строку — получили результат. Первый тест — обычный случай, второй и третий — граничные. Так закрывается критерий «обычные и пустые/неверные данные».

##### `sortOperations.test.ts` — бизнес-логика сортировки

```ts
const makeOperation = (id: number, overrides: Partial<Operation> = {}): Operation => ({
  id,
  cardId: 1,
  title: `operation-${id}`,
  amount: -id,
  date: '2026-01-01',
  createdAt: '2026-01-01T00:00:00Z',
  ...overrides,
})
```

**Что сказать:** helper `makeOperation` нужен, чтобы не повторять одинаковый объект в каждом тесте. Через `overrides` можно поменять только нужное поле.

Ключевой тест:

```ts
test('sorts by createdAt descending', () => {
  const operations = [
    makeOperation(1, { createdAt: '2026-01-01T00:00:00Z' }),
    makeOperation(2, { createdAt: '2026-01-03T00:00:00Z' }),
    makeOperation(3, { createdAt: '2026-01-02T00:00:00Z' }),
  ]

  expect(sortOperationsByNewest(operations).map((operation) => operation.id)).toEqual([2, 3, 1])
})
```

**Что сказать:** проверяем не просто «функция что-то вернула», а точный порядок ID: сначала самая новая операция.

Второй важный тест:

```ts
test('does not mutate the source array', () => {
  const operations = [makeOperation(1), makeOperation(2)]
  const originalIds = operations.map((operation) => operation.id)

  const result = sortOperationsByNewest(operations)

  expect(result).not.toBe(operations)
  expect(operations.map((operation) => operation.id)).toEqual(originalIds)
})
```

**Что сказать:** функция сортирует копию и не портит исходный массив. Это важно для React: изменение входных данных может привести к лишним перерисовкам.

##### `getCardById.test.ts` — поиск и отсутствие результата

```ts
test('returns the matching card', () => {
  expect(getCardById(cards, 2)).toBe(cards[1])
})

test('returns undefined for an unknown id', () => {
  expect(getCardById(cards, 999)).toBeUndefined()
})

test('returns undefined for an empty list', () => {
  expect(getCardById([], 1)).toBeUndefined()
})
```

**Что сказать:** функция не бросает ошибку, если карта не найдена, а возвращает `undefined`. Это удобно в UI: можно показать состояние «карта не выбрана».

##### `guards.test.ts` — валидация внешних данных

```ts
test.each([
  ['missing id', { ...validCard, id: undefined }],
  ['string balance', { ...validCard, balance: '100' }],
  ['string isBlocked', { ...validCard, isBlocked: 'false' }],
  ['unknown type', { ...validCard, type: 'PayPal' }],
  ['null item', null],
])('rejects %s', (_label, value) => {
  expect(isCardArray([value])).toBe(false)
})
```

**Что сказать:** guard-функция проверяет данные из API. Если поле имеет неверный тип или отсутствует, функция возвращает `false`. Это защищает приложение от невалидного ответа сервера. Параметризованный тест проверяет сразу несколько видов неверных данных, но каждый случай считается отдельным тестом.

##### `filterSlice.test.ts` — допустимые и недопустимые значения

```ts
test.each(['all', 'income', 'expense'])('accepts %s', (value) => {
  expect(isFilterValue(value)).toBe(true)
})

test.each(['', 'ALL', 'unknown', null, undefined, 1, {}])('rejects %p', (value) => {
  expect(isFilterValue(value)).toBe(false)
})
```

**Что сказать:** это проверка type guard для фильтра. Даже если в `localStorage` попадёт мусор, приложение не сломается: значение будет отклонено.

##### `operationsStats.test.ts` — проверка расчётов

```ts
test('keeps currency stats in original currency while charts use rubles', () => {
  const stats = buildOperationsStats(
    [makeCard(1, '$')],
    [makeOperation(1, 1, -25, 'Покупка в Steam')]
  )

  expect(stats.currencyStats).toEqual([{ currency: '$', income: 0, expense: 25 }])
  expect(stats.expenseChartData).toEqual([{ category: 'Развлечения', total: 2250 }])
})
```

**Что сказать:** тест фиксирует два разных правила: статистика по валютам остаётся в исходной валюте, а категорийные диаграммы переводятся в рубли по курсу `USD_TO_RUB`. Это бизнес-требование проекта.

#### 4. Async-тесты: разбор `bankApiAsync.test.ts`

##### Подготовка мока

```ts
jest.mock('../client', () => ({
  apiClient: {
    request: jest.fn(),
  },
}))

const requestMock = jest.mocked(apiClient.request)

beforeEach(() => {
  requestMock.mockReset()
})
```

**Что сказать:** подменяется только `apiClient.request`. Это ответ сервера, а не проверяемая функция. Сами RTK Query-эндпоинты, base query, guard-функции, error-маппинг и store работают по-настоящему.

`beforeEach` очищает мок перед каждым тестом, поэтому результат одного теста не влияет на другой.

##### Вспомогательные функции

```ts
const ok = <T,>(data: T): AxiosResponse<T> => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: new AxiosHeaders(),
  config: { headers: new AxiosHeaders() },
})

const failed = (status: number, data: unknown): AxiosError => {
  const error = new AxiosError('Request failed')
  error.response = {
    status,
    data,
    statusText: 'Failed',
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  }
  return error
}
```

**Что сказать:** `ok` создаёт успешный ответ Axios, `failed` — ошибку с HTTP-статусом. Так можно проверить и успешный путь, и путь обработки ошибки.

##### Настоящий store

`src/shared/api/__tests__/testStore.ts`:

```ts
export const createTestStore = () =>
  configureStore({
    reducer: {
      [bankApiSlice.reducerPath]: bankApiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(bankApiSlice.middleware),
  })
```

**Что сказать:** это не mock store. RTK Query middleware подключён по-настоящему, поэтому тест проверяет реальный вызов эндпоинта.

##### Успешная загрузка

```ts
test('loads cards from the server', async () => {
  requestMock.mockResolvedValue(ok([card, otherCard]))

  const store = createTestStore()
  const result = await store.dispatch(bankApiSlice.endpoints.getCards.initiate(undefined)).unwrap()

  expect(result).toEqual([card, otherCard])
  expect(requestMock).toHaveBeenCalledWith({ url: '/api/cards', method: 'GET', data: undefined })
})
```

**Как объяснять по шагам:**

1. Готовим ответ сервера через `mockResolvedValue`.
2. Создаём настоящий store.
3. Вызываем настоящий эндпоинт `getCards`.
4. `await ...unwrap()` дожидается завершения и возвращает данные.
5. Проверяем и результат, и то, что запрос ушёл на правильный URL.

##### Ошибка сервера

```ts
test('returns an error from the server', async () => {
  requestMock.mockRejectedValue(failed(500, { error: 'Server error' }))

  const store = createTestStore()

  await expect(
    store.dispatch(bankApiSlice.endpoints.getCards.initiate(undefined)).unwrap()
  ).rejects.toEqual({ status: 500, data: { error: 'Server error' } })
})
```

**Что сказать:** ошибка тоже проверяется через `await`. `.unwrap()` выбрасывает ошибку наружу, поэтому `await expect(...).rejects` позволяет сравнить её с ожидаемой.

##### Неверный формат ответа

```ts
test('rejects an invalid response format', async () => {
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
  requestMock.mockResolvedValue(ok({ cards: [card] }))

  const store = createTestStore()

  await expect(
    store.dispatch(bankApiSlice.endpoints.getCards.initiate(undefined)).unwrap()
  ).rejects.toMatchObject({ message: 'Invalid response format for cards' })
  expect(consoleErrorSpy).toHaveBeenCalled()
})
```

**Что сказать:** сервер вернул объект вместо массива. Guard-функция не пропустила эти данные в приложение. Это пример проверки «неверные данные».

##### Сохранение и ошибки мутаций

В файле есть пять тестов на мутации:

| Тест | Что проверяет |
| --- | --- |
| `toggleCardBlock` success | Сохранение заблокированной карты и правильный URL `POST /api/cards/:id/toggle-block` |
| `toggleCardBlock` 404 | Ошибку, если карта не найдена |
| `createTransfer` success | Сохранение результата перевода и тела запроса |
| `createTransfer` 400 | Ошибку валидации от сервера |
| `createTransfer` non-Axios | Нормализацию обычной `Error` в ошибку API |

**Что сказать:** async-тесты закрывают и загрузку, и сохранение данных. Всего их 10.

#### 5. E2E-тесты: разбор `e2e/dashboard.spec.ts`

##### Конфигурация

`playwright.config.ts`:

```ts
testDir: './e2e',
fullyParallel: false,
workers: 1,
use: {
  baseURL: 'http://127.0.0.1:5173',
  trace: 'retain-on-failure',
  screenshot: 'only-on-failure',
},
webServer: [
  { command: 'npm run server', url: 'http://127.0.0.1:3001/api/cards' },
  {
    command: 'npm run dev -- --host 127.0.0.1 --port 5173 --strictPort',
    url: 'http://127.0.0.1:5173',
  },
],
```

**Что сказать:**

- Playwright сам поднимает API и Vite, поэтому перед `npm run test:e2e` не нужно вручную запускать серверы.
- `baseURL` позволяет писать `page.goto('/')` вместо полного адреса.
- `workers: 1` выбран потому, что mock-сервер хранит состояние в памяти, и тесты меняют данные. Последовательный запуск исключает гонки.
- `trace` и `screenshot` сохраняются только при падении.
- `tsconfig.e2e.json` подключает e2e-файлы к проверке типов.

##### Нормализация состояния

```ts
const ensureUnblocked = async (card: Locator) => {
  if (await card.getByText('Заблокирована').count()) {
    await card.getByRole('button', { name: 'Разблокировать' }).click()
    await expect(card.getByText('Заблокирована')).toHaveCount(0)
  }
}
```

**Что сказать:** тесты работают с реальным mock-сервером, состояние которого сохраняется между сценариями. Этот helper разблокирует карту, если она осталась заблокированной после предыдущего теста. Так тесты не зависят от порядка.

##### Ключевой сценарий — перевод

```ts
await sourceCard.click()
await expect(page.locator('.quick-transfer__source-number')).toHaveText('**** 1234')

await page.locator('.quick-transfer__select').selectOption('2')
await page.locator('.quick-transfer__input').fill('100')
await page.locator('.quick-transfer__submit').click()

const notice = page.locator('.notice-banner--success')
await expect(notice).toContainText('Перевод на карту **** 5678')
await expect(notice).toContainText(/100/)

const newOperation = page
  .locator('.dashboard-operations li')
  .filter({ hasText: 'Перевод на карту **** 5678' })
  .first()

await expect(newOperation).toBeVisible()
await expect(newOperation).toContainText(/-100/)
```

**Как объяснять по шагам:**

1. Кликаем по карте-источнику — это реальное действие пользователя.
2. Проверяем, что карта действительно выбрана.
3. Выбираем карту-получателя в `select`.
4. Вводим сумму в поле.
5. Нажимаем кнопку перевода.
6. Проверяем успешное уведомление на странице.
7. Проверяем, что в истории появилась новая операция с `-100`.

Главное: тест не вызывает внутренние функции приложения и не мокнет API. Он проверяет видимый результат в браузере.

##### Остальные сценарии

| Сценарий | Действия | Результат на странице |
| --- | --- | --- |
| Загрузка данных | Открыть `/` | Видны карта `**** 1234`, операция «Пятёрочка», форма перевода |
| Блокировка | Клик «Заблокировать», затем «Разблокировать» | Появляется/исчезает текст «Заблокирована», меняется кнопка |
| Перевод | Выбрать карты, ввести `100`, отправить | Уведомление и новая операция `-100` |
| Фильтрация | Открыть `/operations`, нажать «Доходы», затем «Расходы» | Все суммы начинаются с `+` или `-` соответственно |
| 404 | Открыть `/unknown-page` | Заголовок `404`, текст «Страница не найдена», ссылка на главную |

#### 6. Подробный разбор каждого тестового файла

Ниже разбор в формате: где лежит файл, что проверяет и зачем, как работает по шагам. Этот подраздел удобно использовать, если преподаватель просит объяснить конкретный тест, а не всю систему тестирования сразу.

##### `src/shared/lib/__tests__/formatMoney.test.ts`

**Что проверяет и зачем:** 4 теста проверяют форматирование сумм. Это самая простая синхронная группа: она показывает, что функция не ломается на обычных числах, отрицательных значениях, знаке `+` и явно переданной валюте. Тесты нужны, чтобы деньги в интерфейсе всегда отображались предсказуемо.

**Как работает по шагам:**

1. Импортируется `formatMoney` из `../formatMoney`.
2. Создаётся helper `normalize`: он заменяет неразрывные пробелы на обычные, потому что `Intl.NumberFormat` может вернуть `\u00a0` или `\u202f`.
3. Первый тест передаёт `12500` и ожидает `12 500 ₽`.
4. Второй тест проверяет отрицательное значение `-640`.
5. Третий тест с опцией `withSign: true` проверяет три случая: плюс для положительного, минус для отрицательного и отсутствие знака для нуля.
6. Четвёртый тест передаёт валюту `USD` и убеждается, что она не заменяется на рубль.

##### `src/shared/lib/__tests__/formatCard.test.ts`

**Что проверяет и зачем:** 3 теста проверяют маскирование номера карты. Зачем: в UI нельзя показывать полный номер карты, но нужно оставить пользователю возможность узнать карту по последним цифрам.

**Как работает по шагам:**

1. Импортируется чистая функция `formatCardNumber`.
2. Передаётся полный номер `2200240012345678`.
3. Ожидается результат `**** 5678`: все цифры скрыты, кроме последних четырёх.
4. Отдельно проверяется короткое значение `123`: функция должна вернуть `**** 123`, а не выбросить ошибку.
5. Отдельно проверяется пустая строка: результат `**** ` показывает, что функция устойчива к отсутствию данных.

##### `src/shared/lib/__tests__/sortOperations.test.ts`

**Что проверяет и зачем:** 6 тестов проверяют бизнес-правило порядка операций: сначала новые, при равенстве времени — с большим `id`. Тесты нужны, чтобы история операций всегда отображалась в правильном порядке.

**Как работает по шагам:**

1. Создаётся helper `makeOperation(id, overrides)`: он собирает объект `Operation` со значениями по умолчанию, а нужные поля можно переопределить.
2. Первый тест задаёт три разные даты `createdAt` и проверяет точный порядок ID: `[2, 3, 1]`.
3. Второй тест убирает `createdAt` (`undefined`) и проверяет, что функция переключается на обычное поле `date`.
4. Третий тест задаёт разные `createdAt` и `date` и проверяет, что приоритет у `createdAt`.
5. Четвёртый тест задаёт одинаковое время и проверяет сортировку по убыванию `id`: `[9, 5, 2]`.
6. Пятый тест передаёт невалидную дату `not-a-date` и ожидает, что такая операция окажется последней.
7. Шестой тест сохраняет исходные ID, вызывает функцию и проверяет `result !== operations`: исходный массив не мутируется.

##### `src/shared/lib/__tests__/getCardById.test.ts`

**Что проверяет и зачем:** 4 теста проверяют поиск карты по `id`. Зачем: активная карта хранится как ID, поэтому функция должна надёжно находить карту и возвращать `undefined`, если карты нет.

**Как работает по шагам:**

1. В файле есть фикстура `cards` с двумя картами.
2. Первый тест ищет `id: 2` и проверяет через `toBe(cards[1])`, что вернулся тот же самый объект, а не копия.
3. Второй тест ищет несуществующий `id: 999` и ожидает `undefined`.
4. Третий тест проверяет отрицательный `id: -1`.
5. Четвёртый тест передаёт пустой массив и тоже ожидает `undefined`.

##### `src/shared/lib/__tests__/getMerchantIcon.test.ts`

**Что проверяет и зачем:** 12 тестов проверяют определение категории продавца, иконки и цвета. Зачем: иконки и цвета используются в истории операций и диаграммах, поэтому важны и известные продавцы, и fallback для неизвестных.

**Как работает по шагам:**

1. Через `test.each` задаются 11 названий операций: Steam, Пятёрочка, Магнит, кофейня, аптека, такси, метро, перевод, зарплата и другие варианты написания.
2. Для каждого случая проверяется `category` и `color` через `toMatchObject`.
3. Отдельный тест передаёт неизвестный магазин.
4. Для неизвестного случая ожидается первая буква `Н`, нейтральный цвет `#78909c` и категория `Прочее`.

##### `src/shared/lib/__tests__/operationsStats.test.ts`

**Что проверяет и зачем:** 8 тестов проверяют расчёты для страницы `/operations`: сводку по валютам, количество операций по картам, диаграммы доходов и расходов, общие суммы и поведение на пустых/неизвестных данных.

**Как работает по шагам:**

1. Helper `makeCard` создаёт карту с заданным `id` и валютой.
2. Helper `makeOperation` создаёт операцию с заданными `cardId`, `amount` и `title`.
3. В `describe` подготовлены общие фикстуры: три карты, включая долларовую, и пять операций, одна из которых ссылается на несуществующую карту `999`.
4. Первый тест проверяет суммы доходов и расходов по валютам: рубли и доллары считаются отдельно.
5. Второй тест проверяет группировку по картам и то, что карты без операций не попадают в результат.
6. Третий и четвёртый тесты проверяют данные для диаграмм доходов и расходов.
7. Пятый тест проверяет общие `totalIncome` и `totalExpense` только по известным картам.
8. Шестой тест передаёт пустые массивы и ожидает полностью пустую статистику с нулями.
9. Седьмой тест показывает, что операция с неизвестным `cardId` игнорируется.
10. Восьмой тест фиксирует важное правило: `currencyStats` остаётся в исходной валюте, а диаграммы расходов переводятся в рубли по `USD_TO_RUB`.

##### `src/shared/api/__tests__/guards.test.ts`

**Что проверяет и зачем:** 16 тестов проверяют guard-функции `isCardArray` и `isOperationArray`. Зачем: данные приходят из API как `unknown`, и перед попаданием в приложение их нужно реально проверить, а не просто привести через `as`.

**Как работает по шагам:**

1. Создаются валидные объекты `validCard` и `validOperation`.
2. Для `isCardArray` проверяется пустой массив и массив с валидными картами.
3. Отдельно проверяется, что `null`, объект и одиночная карта не принимаются как массив.
4. Через `test.each` перебираются невалидные карты: отсутствует `id`, `balance` строкой, `isBlocked` строкой, неизвестный `type`, `null` вместо карты.
5. Аналогично для `isOperationArray`: пустой массив, валидные операции с `createdAt` и без него, отказ от не-массивов.
6. Второй `test.each` проверяет невалидные операции: строковый `amount`, числовой `createdAt`, отсутствующие `date` и `cardId`, `null`.
7. Каждый случай `test.each` считается отдельным тестом, поэтому 8 вызовов `test`/`test.each` превращаются в 16 проверок.

##### `src/features/filter/__tests__/filterSlice.test.ts`

**Что проверяет и зачем:** 13 тестов проверяют тип guard фильтра, константу `FILTERS` и редьюсер. Зачем: фильтр хранится в Redux и частично восстанавливается из `localStorage`, поэтому невалидное значение не должно ломать страницу.

**Как работает по шагам:**

1. `test.each(['all', 'income', 'expense'])` проверяет, что три допустимых значения принимаются.
2. Второй `test.each` передаёт мусор: пустую строку, `ALL`, `unknown`, `null`, `undefined`, число и объект.
3. Тест `FILTERS` проверяет точный массив кнопок с подписями «Все», «Доходы», «Расходы».
4. Тест редьюсера передаёт состояние `{ value: 'all' }` и действие `setFilter('income')`.
5. Последний тест передаёт неизвестное действие и проверяет, что состояние остаётся прежним.

##### `src/shared/api/__tests__/bankApiAsync.test.ts`

**Что проверяет и зачем:** 10 async-тестов проверяют загрузку и сохранение данных через настоящие RTK Query-эндпоинты. Зачем: это уровень «Хорошо» — нужно дождаться запроса через `await`, проверить успех и ошибку, но подменить только ответ сервера, а не проверяемую логику.

**Как работает по шагам:**

1. `jest.mock('../client')` подменяет модуль клиента и оставляет в нём `apiClient.request` как `jest.fn()`.
2. `requestMock = jest.mocked(apiClient.request)` даёт типизированный доступ к моку.
3. `beforeEach` вызывает `requestMock.mockReset()`, чтобы каждый тест начинался чистыми моками.
4. Helper `ok(data)` собирает успешный `AxiosResponse` со статусом `200`.
5. Helper `failed(status, data)` создаёт `AxiosError` с полем `response`, чтобы проверить HTTP-ошибки.
6. `createTestStore()` создаёт настоящий store с reducer и middleware RTK Query.
7. Для успешной загрузки мок возвращает данные через `mockResolvedValue`, тест вызывает endpoint через `dispatch(...initiate(...)).unwrap()` и сравнивает результат.
8. Для ошибки мок возвращает `mockRejectedValue(failed(...))`, а тест проверяет ошибку через `await expect(...).rejects`.
9. Отдельный тест возвращает объект вместо массива и проверяет, что guard отклонил неверный формат.
10. Мутации `toggleCardBlock` и `createTransfer` проверяются отдельно: успех, ошибки `404`/`400` и нормализация обычной `Error`.

##### `src/shared/api/__tests__/testStore.ts`

**Что проверяет и зачем:** это не тестовый файл, а helper для async-тестов. Он нужен, чтобы `bankApiAsync.test.ts` работал с настоящим RTK Query, а не с поддельным store.

**Как работает по шагам:**

1. Импортируется `configureStore` из Redux Toolkit.
2. Подключается reducer `bankApiSlice.reducer`.
3. Через `getDefaultMiddleware().concat(bankApiSlice.middleware)` подключается middleware RTK Query.
4. Функция `createTestStore` возвращает новый store для каждого теста.

##### `e2e/dashboard.spec.ts`

**Что проверяет и зачем:** 5 браузерных сценариев проверяют приложение целиком: интерфейс, API, Redux и видимый результат. Зачем: это уровень «Отлично» — тест должен не вызывать внутренние функции, а действовать как пользователь.

**Как работает по шагам:**

1. Helper `ensureUnblocked` смотрит, есть ли в карточке текст «Заблокирована», и если есть — нажимает «Разблокировать». Это убирает зависимость сценариев от порядка выполнения.
2. Первый тест открывает `/` и проверяет видимость карты `**** 1234`, операции «Пятёрочка» и формы «Быстрый перевод».
3. Второй тест блокирует карту, проверяет появление статуса и кнопки «Разблокировать», затем разблокирует и проверяет исчезновение статуса через `toHaveCount(0)`.
4. Третий тест выбирает карту-источник, проверяет `**** 1234`, выбирает получателя `2`, вводит сумму `100`, нажимает кнопку и проверяет уведомление и новую операцию `-100` в истории.
5. Четвёртый тест открывает `/operations`, нажимает «Доходы» и «Расходы» и проверяет знак у всех отображаемых сумм.
6. Пятый тест открывает `/unknown-page` и проверяет заголовок `404`, текст «Страница не найдена» и ссылку на главную.
7. Все проверки ищут элементы на странице, а не читают внутреннее состояние приложения.

#### 7. Независимость тестов

- В Jest включены `clearMocks` и `restoreMocks`.
- В async-тестах есть `requestMock.mockReset()` в `beforeEach`.
- Unit-тесты не обращаются к реальному серверу.
- Каждый e2e-тест начинается с перехода `page.goto(...)`.
- E2E-тесты идут последовательно: `workers: 1`.
- helper `ensureUnblocked` убирает зависимость от предыдущего состояния карты.

**Что сказать:** тесты не используют `.only` и `.skip`, проверки не отключены. Результат одного теста не влияет на другой.

#### 8. Готовый ответ на защиту

> В ЛР8 я добавил два уровня тестирования. Unit-тесты на Jest проверяют чистые функции и API-слой: обычные, пустые и невалидные данные, а также успешные и ошибочные async-запросы. В async-тестах я подменяю только `apiClient.request`, то есть ответ сервера, а сами эндпоинты RTK Query и store остаются настоящими. E2E-тесты на Playwright открывают сайт в браузере, выполняют действия пользователя и проверяют результат прямо на странице. Для запуска есть скрипты `npm test` и `npm run test:e2e`; README описывает запуск сайта и тестов.

#### 9. Частые вопросы по тестам

- **Почему `ts-jest`, а не SWC?** Потому что проект на TypeScript, и `ts-jest` совместим с текущей версией TypeScript.
- **Почему нельзя замокнуть сам эндпоинт?** Тогда тест будет проверять mock, а не реальную логику RTK Query.
- **Что делает `.unwrap()`?** Возвращает данные успешного запроса или выбрасывает ошибку, которую можно поймать через `await expect(...).rejects`.
- **Почему в e2e используется `toHaveCount(0)`?** Чтобы убедиться, что элемент исчез, а не просто скрылся.
- **Почему `workers: 1`?** Mock-сервер хранит состояние в памяти, поэтому сценарии идут последовательно.
- **Почему добавлен `tsconfig.e2e.json`?** Чтобы e2e-тесты тоже попадали под `npm run typecheck`.
- **Где запускается браузер?** Playwright использует Chromium headless; на новой машине нужно `npx playwright install chromium`.

---

Ниже находятся подробные материалы защиты: критерии, ответы на теоретические вопросы, намеренная ошибка компилятора, сценарий показа и записка к сдаче.

### 3. План защиты ЛР8

#### Что сдавать

- Ссылка на репозиторий.
- README с описанием запуска сайта и тестов.
- Вывод команд `npm test`, `npm run test:e2e`, `npm run typecheck`.

#### Чек-лист

- [ ] `npm run typecheck` проходит, включая e2e.
- [ ] `npm test` проходит без ошибок.
- [ ] `npx playwright install chromium` выполнен на новой машине.
- [ ] `npm run test:e2e` проходит без ошибок.
- [ ] Прочитан раздел «Разбор кода тестов».
- [ ] Умею объяснить, чем подмена ответа сервера отличается от подмены проверяемой функции.
- [ ] Умею объяснить, почему e2e-тест проверяет страницу, а не внутренние функции.

#### Сценарий показа

1. Показать `jest.config.cjs`, `jest.setup.cjs` и каталоги `src/**/__tests__`.
2. Открыть `formatCard.test.ts`: показать обычный и пустой случай.
3. Открыть `sortOperations.test.ts`: показать helper и проверку точного порядка ID.
4. Открыть `guards.test.ts`: показать `test.each` и объяснить, почему это несколько отдельных тестов.
5. Запустить `npm test` и показать, что все unit-тесты проходят.
6. Открыть `bankApiAsync.test.ts` и показать `jest.mock('../client')`, `ok`, `failed`, `createTestStore`.
7. Показать success-тест с `await ...unwrap()` и error-тест с `await expect(...).rejects`.
8. Показать, что подменяется только ответ сервера, а эндпоинт RTK Query не подменяется.
9. Показать `playwright.config.ts`: `webServer`, `baseURL`, `workers: 1`, `trace`.
10. Открыть `e2e/dashboard.spec.ts` и показать сценарий перевода: действия пользователя и проверки на странице.
11. Запустить `npm run test:e2e` и показать 5 пройденных браузерных сценариев.
12. При необходимости открыть `README.md` и показать, что запуск сайта и тестов описан.
