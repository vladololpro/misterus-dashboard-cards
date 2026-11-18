# DEFENSE — подготовка к защите ЛР №7 и №8

> Вспомогательный файл для защиты. Его можно удалить из репозитория после сдачи: `README.md` не зависит от этого файла. Каждая лабораторная описана отдельно: сначала ЛР №7, затем ЛР №8.

## Оглавление

- [Часть 1. ЛР №7 — типизация проекта на TypeScript](#часть-1-лр-7-типизация-проекта-на-typescript)
- [Часть 2. ЛР №8 — Unit и e2e-тестирование](#часть-2-лр-8-unit-и-e2e-тестирование)

## Часть 1. ЛР №7 — типизация проекта на TypeScript

### 1. Сценарий проверки работоспособности и соответствия критериям

#### Автоматические проверки ЛР7

```bash
npm ci
npm run typecheck
npm run lint
npm run build
```

| Команда | Что должно получиться |
| --- | --- |
| `npm ci` | Зависимости установлены по `package-lock.json` |
| `npm run typecheck` | Нет ошибок TypeScript, `any` и `@ts-ignore` не используются |
| `npm run lint` | Нет ошибок ESLint |
| `npm run build` | Production-сборка создана без ошибок |

Для проверки текущего состояния проекта дополнительно запускаются `npm test` и `npm run test:e2e`, но это уже проверки ЛР №8.

#### Живая проверка ЛР7

1. Открыть `src/shared/types/index.ts`: типы `Card`, `Operation`, `FilterValue`, `LoadingState`.
2. Открыть props и callbacks в `CardItem.tsx` и `CardList.tsx`.
3. Показать форму перевода в `QuickTransfer.tsx`: строка из `ChangeEvent<HTMLInputElement>` превращается в число.
4. Показать `unknown` и guard-функции в `src/shared/api/guards.ts`.
5. Показать generic `useLocalStorage<T>` и `request<T>`.
6. Показать `Button` на `ComponentProps<'button'>` и `Modal` с `ReactNode`.

#### Карта критериев ЛР7

| Лабораторная | Уровень | Критерий | Где показать |
| --- | --- | --- | --- |
| ЛР №7 | Удовлетворительно | Проект переведён на TypeScript, типы основной сущности используются в состоянии и props | `src/shared/types/index.ts`, `src/features`, `src/components` |
| ЛР №7 | Удовлетворительно | Типизированы props и callbacks, число из формы, `npm run typecheck` зелёный | `CardItem.tsx`, `QuickTransfer.tsx`, `tsconfig.json` |
| ЛР №7 | Хорошо | `Pick`, `Omit`, `Record`, union состояния, `strict`, `unknown` и guard-функции | `src/shared/api/guards.ts`, `src/shared/types/index.ts`, `tsconfig.json` |
| ЛР №7 | Отлично | Generic `useLocalStorage<T>`, `Promise<T>`, `ReactNode`, `ComponentProps`, discriminated union, строгие флаги | `useLocalStorage.ts`, `client.ts`, `Button.tsx`, `Modal.tsx` |

### 2. Базовая теория ЛР7

#### Зачем нужен TypeScript

TypeScript — это надмножество JavaScript, которое добавляет статическую типизацию. Типы проверяются на этапе компиляции и стираются во время выполнения. Это значит, что TypeScript помогает найти ошибки до запуска приложения, но не заменяет проверку внешних данных во время работы.

В проекте TypeScript используется для:

- описания доменных сущностей;
- типизации props и callbacks;
- типизации событий формы;
- типизации состояния;
- типизации API-ответов и ошибок;
- создания переиспользуемых generic-абстракций;
- включения строгих проверок компилятора.

#### `type` и `interface`

`interface` удобно использовать для описания объектов и расширения через `extends`.

Пример из проекта:

```ts
interface ButtonProps extends ComponentProps<'button'> {
  children: ReactNode
}
```

`type` удобно использовать для union-типов, утилитарных типов и пересечений.

Примеры из проекта:

```ts
type FilterValue = 'all' | 'income' | 'expense'

type LoadingState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success' }
  | { status: 'error'; message: string }

type NewOperation = Omit<Operation, 'id'>

type CardWithStats = Card & {
  opsCount: number
  total: number
}
```

Оба подхода допустимы. Главное — использовать их осознанно и не дублировать одну и ту же структуру без причины.

#### Union-типы

Union-тип означает, что значение может быть одним из нескольких вариантов.

```ts
type FilterValue = 'all' | 'income' | 'expense'
```

Если попытаться передать `'other'`, компилятор выдаст ошибку. Это защищает от опечаток и неверных значений.

#### Discriminated union

Discriminated union — это union объектов, у которых есть общее поле-метка. В проекте это поле `status`.

```ts
type TransferState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string }
```

TypeScript умеет сужать тип по значению `status`. В ветке `if (transferState.status === 'error')` компилятор точно знает, что у объекта есть `message`.

#### Generics

Generic позволяет сохранить связь между входным и выходным типом, не теряя конкретику.

```ts
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void]
```

Если вызвать `useLocalStorage<string>`, то и значение, и сеттер будут работать со строкой.

Generic-запрос:

```ts
const request = async <T,>({ url, method, data }: AxiosQueryArgs): Promise<T> => {
  const result = await apiClient.request<T>({ url, method, data })
  return result.data
}
```

`Promise<T>` означает, что после `await` будет значение типа `T`.

#### Utility types

`Pick<T, K>` создаёт тип только с выбранными полями:

```ts
type CardBalanceInfo = Pick<Card, 'balance' | 'currency' | 'isBlocked'>
```

`Omit<T, K>` создаёт тип без указанных полей:

```ts
type NewOperation = Omit<Operation, 'id'>
```

`Record<K, V>` создаёт объект с ключами типа `K` и значениями типа `V`:

```ts
const statsByCategory: Record<string, CategoryStat> = {}
```

#### `unknown` и `any`

`any` отключает проверку типов. С `any` можно вызвать любое свойство, и компилятор не поможет.

`unknown` означает «значение неизвестного типа». Его нельзя использовать напрямую, пока не выполнено сужение типа.

В проекте данные API приходят как `unknown`:

```ts
transformResponse: (response: unknown) => {
  if (!isCardArray(response)) {
    throw new Error('Invalid response format for cards')
  }
  return response
}
```

Guard-функция — это функция, которая проверяет значение и возвращает type predicate:

```ts
export const isCardArray = (data: unknown): data is Card[] => {
  // проверки
}
```

После успешной проверки TypeScript знает, что `data` — это `Card[]`.

#### `strict` и проверки на `null`

`strict` включает набор строгих проверок, включая `strictNullChecks`. Без него `null` и `undefined` могут неявно попадать туда, где ожидается объект.

В проекте есть проверки:

- `if (!card) return null`;
- `if (!activeCard) return`;
- `card?.currency`;
- `getCardById` возвращает `Card | undefined`;
- `TransactionDetails` принимает `card: Card | undefined`.

#### `noUncheckedIndexedAccess`

Флаг `noUncheckedIndexedAccess` делает обращение по индексу потенциально опасным:

```ts
const firstCard = cards[0] // Card | undefined
```

Поэтому код обязан проверить значение перед использованием. В проекте это видно в `useActiveCard`, `QuickTransfer`, `CategoryPieChart` и `operationsStats`.

#### `noUnusedLocals` и `noUnusedParameters`

Эти флаги не дают оставлять неиспользуемые переменные и параметры. Они помогают поддерживать код в чистоте и убирать мёртвый код.

#### Типизация React props

Props описываются через `interface` или `type`:

```ts
interface CardItemProps {
  card: Card
  isActive: boolean
  onSelect: (id: number) => void
  onToggleBlock: (id: number) => Promise<void>
  onShowDetails: (card: Card) => void
}
```

Callback типизируется как функция:

```ts
onSelect: (id: number) => void
```

Это значит, что обработчик обязан принимать число и не обязан возвращать значение.

#### Типизация событий

В React события имеют свои типы:

```ts
const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
  setAmount(e.target.value)
}
```

`e.target.value` у `HTMLInputElement` всегда строка. Поэтому сумма хранится как `string`, а число получается через `Number(...)` после проверки.

#### Типизация состояния

Если TypeScript не может вывести тип или вывод неочевиден, используется generic:

```ts
const [selectedCard, setSelectedCard] = useState<Card | null>(null)
const [blockError, setBlockError] = useState<string | null>(null)
const [transferState, setTransferState] = useState<TransferState>({ status: 'idle' })
```

#### `ReactNode` и `ComponentProps`

`ReactNode` описывает любой React-контент: элемент, строку, число, фрагмент, массив, `null`.

`ComponentProps<'button'>` описывает все props нативной кнопки. Это лучше, чем вручную перечислять `onClick`, `disabled`, `type`, `className` и другие атрибуты.

#### `Promise<T>` и обработка ошибок

Функция, которая возвращает `Promise<T>`, после `await` даёт значение типа `T`.

```ts
const request = async <T,>(...): Promise<T> => {
  const result = await apiClient.request<T>(...)
  return result.data
}
```

Ошибки обрабатываются как `unknown`:

```ts
catch (error: unknown) {
  setTransferState({
    status: 'error',
    message: getApiErrorMessage(error, 'Не удалось выполнить перевод'),
  })
}
```

Сначала ошибка проверяется, и только потом из неё извлекается сообщение. Это безопаснее, чем сразу приводить ошибку к `any`.

#### React, Redux и RTK Query в этом проекте

- React отвечает за отображение и локальное состояние компонентов.
- Redux Toolkit хранит активную карту и фильтр.
- RTK Query загружает данные, кеширует их и обновляет после mutations.
- `useBankData` объединяет два запроса в один удобный интерфейс.
- `useActiveCard` связывает Redux-состояние активной карты с операциями.

### 3. Что сделано, как и зачем

#### 1. Проект переведён на TypeScript

**Что сделано**

- Все компоненты и страницы имеют расширения `.tsx`.
- В проекте есть `tsconfig.json`.
- В `package.json` есть скрипт `typecheck`.
- В `tsconfig.json` включён `jsx: react-jsx`.
- В проекте нет JavaScript-компонентов.

**Что показать**

1. Открыть `tsconfig.json`.
2. Показать файлы `src/App.tsx`, `src/main.tsx`, `src/pages/DashboardPage.tsx`.
3. Открыть `package.json` и показать скрипт:

```json
"typecheck": "tsc --noEmit"
```

4. Запустить:

```bash
npm run typecheck
```

5. Показать, что команда завершилась без ошибок.

**Теория**

TypeScript проверяет типы на этапе компиляции. `tsc --noEmit` запускает только проверку и не создаёт JS-файлы. Vite при этом собирает проект отдельно, но `npm run build` сначала запускает `tsc`, чтобы не собрать проект с ошибками типов.

#### 2. Описаны типы основной сущности и использованы в состоянии и props

**Что сделано**

- `Card` и `Operation` описаны в `src/shared/types/index.ts`.
- `Card` используется в `CardList`, `CardItem`, `CardDetails`, `BalanceWidget`, `QuickTransfer`.
- `Operation` используется в `OperationsList`, `TransactionDetails`, `OperationsPage`.
- `Card` используется в состоянии `selectedCard` и в пропсах компонентов.

**Что показать**

1. Открыть `src/shared/types/index.ts` и показать `Card`, `Operation`.
2. Открыть `src/components/CardList.tsx` и показать `cards: Card[]`.
3. Открыть `src/components/OperationsList.tsx` и показать `operations: Operation[]`.
4. Открыть `src/pages/DashboardPage.tsx` и показать `useState<Card | null>(null)`.

**Теория**

Доменная сущность — это тип, который описывает объект предметной области. В данном случае карта и операция. Если тип описан один раз, его можно переиспользовать в API, состоянии, пропсах и утилитах. Это уменьшает рассинхронизацию между частями приложения.

#### 3. Типизированы props и callbacks

**Что сделано**

- `CardItemProps` описывает все входные данные карточки.
- `CardListProps` описывает список карт и обработчики.
- `QuickTransferProps` описывает карты и активную карту.
- Callback-и типизированы функциями.

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

**Теория**

Props — это входные данные компонента. Callback — это функция, которую компонент вызывает, чтобы сообщить родителю о действии. Типизация callback-ов не даёт перепутать аргументы и возвращаемое значение.

#### 4. `useState` типизирован там, где вывод неочевиден

**Что сделано**

- `DashboardPage`: `useState<string | null>(null)` для ошибки.
- `DashboardPage`: `useState<Card | null>(null)` для выбранной карты.
- `OperationsPage`: `useState<Operation | null>(null)` для выбранной операции.
- `QuickTransfer`: `useState<TransferState>({ status: 'idle' })`.
- `CardItem`: `useState<boolean>(false)` для состояния блокировки.
- `useLocalStorage`: `useState<T>` внутри generic-хука.

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

**Теория**

`useState` может вывести тип из начального значения. Но если начальное значение `null`, вывод будет слишком узким или неочевидным. Generic помогает явно сказать, что в состоянии может быть `Card | null` или `string | null`.

#### 5. Число из поля формы: строка, `ChangeEvent<HTMLInputElement>`, проверка

**Что сделано**

- Сумма перевода хранится как `string`.
- Используется `ChangeEvent<HTMLInputElement>`.
- Значение приводится к числу через `Number(...)`.
- Проверяется пустая строка.
- Проверяется `Number.isFinite`.
- Проверяется `amount > 0`.
- Проверяется достаточность средств.
- Сумма округляется до копеек.

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

**Теория**

Значение любого текстового поля в браузере — строка. Даже `type="number"` в React возвращает строку. Поэтому нельзя просто сказать «это число». Нужно привести значение к числу и проверить его. `Number.isFinite` отсекает `NaN`, `Infinity` и `-Infinity`.

#### 6. `npm run typecheck` проходит без ошибок, `any` и `@ts-ignore` отсутствуют

**Что сделано**

- В коде нет `any`.
- В коде нет `@ts-ignore`.
- В коде нет `@ts-expect-error`.
- `npm run typecheck` проходит.
- `npm run lint` проходит.

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

**Теория**

`any` отключает проверку типов. `@ts-ignore` подавляет ошибку компилятора без объяснения. Для учебного проекта важно не скрывать ошибки, а исправлять их типами, guard-функциями и корректными проверками.

#### Критерии «Хорошо»

#### 1. Утилиты типов `Pick`, `Omit` и `Record` на своём домене

**Что сделано**

- `Pick` — `CardBalanceInfo` для виджета баланса.
- `Omit` — `NewOperation` для создания операции без ID.
- `Record` — `statsByCategory` и `statsByCurrency` в статистике.

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

**Теория**

`Pick` уменьшает существующий тип до нужных полей. `Omit` исключает поля. `Record` описывает словарь. Все три утилиты полезны, когда не нужно создавать новый независимый интерфейс вручную.

#### 2. Состояние загрузки описано union и разбирается по значению

**Что сделано**

- `LoadingState` описан как discriminated union.
- `DashboardPage` формирует состояние по `isLoading`, `isError`, `hasData`.
- Компоненты проверяют `status` перед использованием `message`.
- `TransferState` использует тот же подход.

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

**Теория**

Union из объектов с общим полем-меткой называется discriminated union. Компилятор использует метку для сужения типа. Это лучше, чем набор независимых boolean-флагов, потому что невозможно одновременно находиться в состояниях `loading` и `error` без явного описания такого варианта.

#### 3. Осознанный выбор `type` и `interface`, расширение через `extends` и `&`

**Что сделано**

- `interface` используется для объектов: `Card`, `Operation`, `TransferPayload`, `TransferResult`, props компонентов.
- `type` используется для union, utility types и пересечений.
- `ButtonProps extends ComponentProps<'button'>`.
- `CardWithStats = Card & { opsCount, total }`.

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

**Теория**

`interface` и `type` во многом взаимозаменяемы, но есть различия. `interface` можно расширять через `extends` и объединять декларациями. `type` лучше подходит для union, intersections и утилитарных преобразований. В проекте выбор сделан по назначению типа, а не случайно.

#### 4. Включён `strict`, есть проверка на `null` перед чтением полей

**Что сделано**

- В `tsconfig.json` включён `strict`.
- `getCardById` возвращает `Card | undefined`.
- `BalanceWidget` проверяет `if (!card) return null`.
- `QuickTransfer` проверяет `if (!activeCard) return null`.
- `useActiveCard` использует `cards[0]?.id`.
- `TransactionDetails` принимает `Card | undefined`.
- В API-слое используются optional chaining и проверки.

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

**Теория**

`strict` включает `strictNullChecks`. Без него `null` и `undefined` могут незаметно попасть в код, где ожидается объект. С ним компилятор требует явно обработать отсутствие значения.

#### 5. Данные из API принимаются как `unknown` и проверяются, а не `as`

**Что сделано**

- `transformResponse` принимает `response: unknown`.
- `isCardArray` и `isOperationArray` проверяют структуру.
- В API-слое нет приведения ответа через `as Card[]` или `as Operation[]`.
- Ошибки обрабатываются через `isAxiosError`.
- Текст ошибки извлекается через `getApiErrorMessage`.

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

**Теория**

`as` — это утверждение типа. Оно не проверяет данные во время выполнения, а только говорит компилятору «поверь мне». Если API вернёт другую структуру, приложение может упасть. `unknown` заставляет сначала проверить данные. Type guard возвращает `data is Card[]`, после чего TypeScript доверяет проверке.

Важно: в проекте остаются два приведения, не связанные с API:

- `JSON.parse(item) as T` внутри generic-хука `useLocalStorage`;
- `document.getElementById('root') as HTMLElement` в точке входа.

Это не ответы API. Для API используется проверка через `unknown` и guard-функции.

#### Критерии «Отлично»

#### 1. Свой generic, полезный в проекте: `useLocalStorage<T>`

**Что сделано**

- Написан generic-хук `useLocalStorage<T>`.
- Он используется с `string` и `number | null`.
- Сеттер стабизирован через `useCallback`.
- Ошибки чтения и записи обрабатываются.
- Дополнительно есть generic-функция `request<T>`, которая возвращает `Promise<T>`.

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

**Теория**

Generic связывает тип начального значения, тип состояния и тип сеттера. Если бы хук возвращал `any`, можно было бы записать в сумму число, объект или массив. С generic компилятор требует один и тот же тип.

#### 2. Запрос возвращает `Promise<T>`, ошибка обрабатывается с типом

**Что сделано**

- `request<T>` возвращает `Promise<T>`.
- `axiosBaseQuery` использует `request<unknown>`.
- Для ошибок используется `isAxiosError`.
- Для извлечения текста ошибки используется `getApiErrorMessage`.
- В `QuickTransfer` ошибка обрабатывается как `unknown`.

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

**Теория**

`Promise<T>` описывает асинхронный результат. Ошибка в JavaScript может быть чем угодно, поэтому её тип — `unknown`. Перед использованием ошибку нужно проверить: является ли она ошибкой Axios, обычной ошибкой или неизвестным значением.

#### 3. `ReactNode` и `ComponentProps` вместо дублирования props

**Что сделано**

- `Button` расширяет `ComponentProps<'button'>`.
- `Button` принимает `children: ReactNode`.
- `Modal` принимает `children: ReactNode`.
- Не нужно вручную перечислять все нативные props кнопки.

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

**Теория**

`ComponentProps<'button'>` — это готовый тип всех props нативной кнопки. `ReactNode` — это любой React-контент. Такой подход уменьшает дублирование и автоматически поддерживает новые атрибуты React.

#### 4. Discriminated union с разбором по полю-метке

**Что сделано**

- `TransferState` описывает состояния перевода.
- Поле `status` является меткой.
- Компонент проверяет `status` перед доступом к `message`.
- `LoadingState` использует тот же подход для загрузки.

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

**Теория**

Discriminated union делает невозможным доступ к `message`, если состояние `idle` или `submitting`. Компилятор понимает это через метку `status`. Это безопаснее, чем хранить отдельные `isLoading`, `isSuccess`, `isError` и `errorMessage`, которые могут противоречить друг другу.

#### 5. `noUncheckedIndexedAccess` и `noUnusedLocals`, проверка после `npm ci`

**Что сделано**

- В `tsconfig.json` включён `noUncheckedIndexedAccess`.
- В `tsconfig.json` включён `noUnusedLocals`.
- В `tsconfig.json` включён `noUnusedParameters`.
- Код проверен после чистой установки `npm ci`.
- `npm run typecheck` проходит.
- `npm run lint` проходит.
- `npm run build` проходит.

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

**Теория**

`noUncheckedIndexedAccess` заставляет относиться к результату индексации как к `T | undefined`. Это особенно важно для массивов, где индекс может выйти за границы. `noUnusedLocals` и `noUnusedParameters` помогают не оставлять мёртвый код. `npm ci` проверяет, что проект собирается с чистыми зависимостями по lock-файлу, а не только на локальной машине с уже установленными пакетами.

### 4. Намеренная ошибка компилятора

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

### 5. Записка к сдаче и список сдачи

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

### 6. План защиты ЛР7

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

### 1. Сценарий проверки работоспособности и соответствия критериям

#### Автоматические проверки

На новой машине один раз установить браузер Playwright:

```bash
npx playwright install chromium
```

Затем выполнить полный прогон:

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
```

Ожидаемый результат:

| Команда | Что должно получиться |
| --- | --- |
| `npm ci` | Зависимости установлены по `package-lock.json` |
| `npm run typecheck` | Нет ошибок TypeScript в приложении, unit- и e2e-тестах |
| `npm run lint` | Нет ошибок ESLint |
| `npm test` | `9 passed`, `76 passed` |
| `npm run test:e2e` | `5 passed` в Chromium |
| `npm run build` | Production-сборка Vite создана без ошибок |

#### Живая проверка в браузере

1. Запустить `npm run server`.
2. Запустить `npm run dev`.
3. Открыть `http://localhost:5173/` — должны загрузиться карты и операции.
4. Выбрать другую карту — баланс и список операций должны переключиться.
5. Заблокировать и разблокировать карту — меняется статус и доступность перевода.
6. Сделать перевод между картами одной валюты — появляется уведомление, балансы и история обновляются.
7. Открыть `/operations` — проверить фильтры «Все», «Доходы», «Расходы», статистику и диаграммы.
8. Открыть неизвестный адрес — должна появиться страница 404.
9. Остановить `npm run server` — приложение должно показать ошибку загрузки.
10. Запустить сервер снова и нажать «Повторить» — данные должны вернуться.

#### Карта критериев ЛР8

| Лабораторная | Уровень | Критерий | Где показать |
| --- | --- | --- | --- |
| ЛР №8 | Удовлетворительно | Jest-тесты синхронных функций, обычные и пустые/невалидные данные, `npm test` | `src/**/__tests__`, `jest.config.cjs` |
| ЛР №8 | Хорошо | Async-тесты загрузки/сохранения, успех и ошибка через `await`, подменяется только ответ сервера | `bankApiAsync.test.ts`, `testStore.ts` |
| ЛР №8 | Отлично | Playwright-сценарии действий пользователя, проверка результата на странице, `npm run test:e2e`, README с запуском | `e2e/dashboard.spec.ts`, `playwright.config.ts`, `README.md` |

### 2. Базовая теория тестирования

#### Зачем нужны тесты

Тест — это автоматическая проверка отдельного поведения программы. Хороший тест отвечает на три вопроса: какие данные подаём, какое действие выполняем, что именно ожидаем увидеть.

В проекте используются два уровня:

| Уровень | Что проверяет | Чем запускается |
| --- | --- | --- |
| Unit | Отдельную функцию, Redux-редьюсер или API-эндпоинт | `npm test` |
| E2E | Пользовательский сценарий в реальном браузере | `npm run test:e2e` |

Unit-тесты быстрее и точнее указывают на сломанную функцию. E2E-тесты медленнее, но подтверждают, что приложение работает целиком: интерфейс, API, состояние и отображение результата.

#### Jest и `ts-jest`

Jest — тестовый раннер: он находит файлы `*.test.ts`, запускает тесты и считает результаты. `ts-jest` нужен, потому что тесты написаны на TypeScript. Он компилирует их перед запуском, поэтому тесты используют те же типы, что и приложение.

SWC в проекте не используется: выбран лекционный вариант Jest + `ts-jest`, который совместим с текущим TypeScript 6.

#### Mock: что можно подменять, а что нет

Mock — это подмена зависимости, чтобы тест был управляемым. В async-тестах подменяется только `apiClient.request`, то есть ответ сервера. Нельзя подменять саму проверяемую функцию или эндпоинт RTK Query: иначе тест будет проверять mock, а не реальную логику.

#### Async-тесты и `.unwrap()`

`await` дожидается завершения запроса. Метод `.unwrap()` у RTK Query возвращает данные успешного запроса или выбрасывает ошибку. Поэтому:

- успех проверяется через `await dispatch(...).unwrap()`;
- ошибка — через `await expect(...).rejects`.

#### Playwright

Playwright управляет реальным браузером. Тест не вызывает внутренние функции, а делает то же, что пользователь: переходит по URL, кликает, выбирает значение в `select`, вводит текст. После этого он проверяетвидимый результат прямо на странице.

`webServer` в конфиге сам поднимает mock API и Vite, поэтому e2e-тест запускается одной командой.

#### Независимость тестов

Тесты не должны зависеть от порядка запуска. Для этого:

- моки очищаются через `clearMocks`, `restoreMocks` и `mockReset()`;
- unit-тесты не обращаются к реальному серверу;
- каждый e2e-тест начинается с `page.goto(...)`;
- e2e-тесты идут последовательно через `workers: 1`;
- не используются `.only` и `.skip`.


### 3. Разбор кода тестов

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

#### 6. Независимость тестов

- В Jest включены `clearMocks` и `restoreMocks`.
- В async-тестах есть `requestMock.mockReset()` в `beforeEach`.
- Unit-тесты не обращаются к реальному серверу.
- Каждый e2e-тест начинается с перехода `page.goto(...)`.
- E2E-тесты идут последовательно: `workers: 1`.
- helper `ensureUnblocked` убирает зависимость от предыдущего состояния карты.

**Что сказать:** тесты не используют `.only` и `.skip`, проверки не отключены. Результат одного теста не влияет на другой.

#### 7. Готовый ответ на защиту

> В ЛР8 я добавил два уровня тестирования. Unit-тесты на Jest проверяют чистые функции и API-слой: обычные, пустые и невалидные данные, а также успешные и ошибочные async-запросы. В async-тестах я подменяю только `apiClient.request`, то есть ответ сервера, а сами эндпоинты RTK Query и store остаются настоящими. E2E-тесты на Playwright открывают сайт в браузере, выполняют действия пользователя и проверяют результат прямо на странице. Для запуска есть скрипты `npm test` и `npm run test:e2e`; README описывает запуск сайта и тестов.

#### 8. Частые вопросы по тестам

- **Почему `ts-jest`, а не SWC?** Потому что проект на TypeScript, и `ts-jest` совместим с текущей версией TypeScript.
- **Почему нельзя замокнуть сам эндпоинт?** Тогда тест будет проверять mock, а не реальную логику RTK Query.
- **Что делает `.unwrap()`?** Возвращает данные успешного запроса или выбрасывает ошибку, которую можно поймать через `await expect(...).rejects`.
- **Почему в e2e используется `toHaveCount(0)`?** Чтобы убедиться, что элемент исчез, а не просто скрылся.
- **Почему `workers: 1`?** Mock-сервер хранит состояние в памяти, поэтому сценарии идут последовательно.
- **Почему добавлен `tsconfig.e2e.json`?** Чтобы e2e-тесты тоже попадали под `npm run typecheck`.
- **Где запускается браузер?** Playwright использует Chromium headless; на новой машине нужно `npx playwright install chromium`.

---

Ниже находятся подробные материалы защиты: критерии, ответы на теоретические вопросы, намеренная ошибка компилятора, сценарий показа и записка к сдаче.

### 4. Что сделано, как и зачем

> Статус: все уровни — «Удовлетворительно», «Хорошо» и «Отлично» — выполнены.
>
> Подробный разбор кода тестов и готовые формулировки ответов находятся в разделе «Разбор кода тестов» этой части.

#### Критерии лабораторной

| Уровень | Требование | Статус |
| --- | --- | --- |
| Удовлетворительно | Unit-тесты на Jest для синхронных функций; обычные и пустые/невалидные данные; `npm test` проходит | Готово |
| Хорошо | Async-тесты загрузки и сохранения; успех и ошибка через `await`; ответ сервера можно подменить, проверяемую функцию подменять нельзя | Готово |
| Отлично | Playwright e2e-тесты действий пользователя, проверка результата на странице, `npm run test:e2e`, README с запуском сайта и тестов | Готово |

#### Удовлетворительно: что сделано

- Добавлены зависимости `jest`, `ts-jest`, `@types/jest`.
- Добавлен скрипт `npm test`.
- Добавлены `jest.config.cjs` и `jest.setup.cjs`.
- На этом уровне добавлены 8 тестовых файлов в каталогах `src/**/__tests__`.
- Написано 66 тестов для форматирования, сортировки, поиска, категорий, статистики, guard-функций и фильтра.
- Тесты проверяются не только запуском Jest, но и `npm run typecheck` и `npm run lint`.

**Что показать преподавателю**

1. Открыть `package.json` и показать скрипт `npm test`.
2. Показать `jest.config.cjs` и объяснить выбор `ts-jest`.
3. Показать структуру `src/**/__tests__`.
4. Открыть любой тест и показать обычный и граничный/невалидный случай.
5. Запустить:

```bash
npm test
```

6. Показать итог: `9 passed`, `76 passed`.

**Теория для ответа**

- Unit-тест проверяет одну небольшую функцию изолированно и не требует запуска браузера или сервера.
- Обычный случай показывает ожидаемую работу функции на типичных данных.
- Граничный и невалидный случаи проверяют поведение на пустых массивах, отсутствующих полях, неверных типах и некорректных строках.
- Тесты должны быть независимыми: результат одного теста не должен влиять на другой.
- `ts-jest` компилирует TypeScript для Jest, поэтому тесты используют те же типы, что и приложение.
- `jest.setup.cjs` подменяет только окружение Node — `localStorage`, а не проверяемую функцию.

#### Хорошо: что сделано

- Добавлены `src/shared/api/__tests__/bankApiAsync.test.ts` и helper `src/shared/api/__tests__/testStore.ts`.
- Подменяется только `apiClient.request` через `jest.mock('../client')`: это имитирует ответ сервера.
- Проверяемые эндпоинты RTK Query (`getCards`, `getOperations`, `toggleCardBlock`, `createTransfer`) не подменяются и вызываются через реальный store.
- Успех проверяется через `await dispatch(...).unwrap()`, ошибка — через `await expect(...).rejects.toEqual(...)`.
- Покрыты загрузка карт и операций, сохранение блокировки, сохранение перевода, ошибки `500`, `403`, `404`, `400`, некорректный формат ответа и не-Axios ошибка.
- Добавлено 10 async-тестов. Итого: 9 файлов, 76 тестов.

**Что показать преподавателю**

1. Открыть `bankApiAsync.test.ts` и показать тесты загрузки и сохранения.
2. Показать `jest.mock('../client')` и объяснить, что подменяется транспорт, а не проверяемая функция.
3. Показать `createTestStore`: эндпоинт выполняется через настоящий RTK Query middleware.
4. Показать success-тест с `await ...unwrap()` и error-тест с `await expect(...).rejects`.
5. Запустить `npm test` и показать 76 пройденных тестов.

**Теория для ответа**

- `async/await` позволяет дождаться завершения запроса и получить уже готовый результат или ошибку.
- `.unwrap()` у RTK Query возвращает данные запроса, а при ошибке выбрасывает её наружу, поэтому удобно проверять и успех, и ошибку через `await`.
- Подмена `apiClient.request` заменяет только ответ сервера. Base query, guard-функции, `transformResponse`, error-маппинг и сам эндпоинт остаются настоящими.
- `isAxiosError` отделяет ошибки HTTP от обычных `Error`: для HTTP возвращаются `status` и `data`, для обычной ошибки — только текстовое сообщение.
- Guard-функция проверяет невалидный ответ до попадания данных в приложение.
- Каждый тест сбрасывает мок через `mockReset()` в `beforeEach`, поэтому тесты не зависят друг от друга.

#### Отлично: что сделано

- Добавлена зависимость `@playwright/test`.
- Добавлен `playwright.config.ts` и скрипт `npm run test:e2e`.
- Добавлена директория `e2e/` с 5 браузерными сценариями.
- `webServer` автоматически поднимает mock API и Vite, поэтому тесты запускаются одной командой.
- Сценарии выполняют реальные действия пользователя и проверяют результат на странице.
- В `README.md` описана подготовка браузера, запуск сайта и запуск тестов.

**Что показать преподавателю**

1. Показать `playwright.config.ts` и объяснить `webServer`, `baseURL` и `trace`.
2. Открыть `e2e/dashboard.spec.ts` и показать сценарий перевода.
3. Показать, что тест выбирает карту, вводит сумму, нажимает кнопку и проверяет уведомление и историю на странице.
4. Запустить:

```bash
npm run test:e2e
```

5. Показать итог: `5 passed`.

**Теория для ответа**

- E2E-тест проверяет приложение целиком через браузер: интерфейс, API, состояние Redux и отображение результата.
- Playwright управляет реальным браузером и автоматически ждёт появления элементов, поэтому проверки устойчивее ручного чек-листа.
- `webServer` убирает ручной шаг запуска серверов: Playwright сам поднимает API и Vite перед прогоном.
- `trace` и `screenshot` позволяют разобрать падение теста после прогона.
- E2E-тесты не мокнут внутренние функции приложения; это отличает их от unit-тестов API-слоя.

#### Итог ЛР №8

| Команда | Результат |
| --- | --- |
| `npm test` | 9 файлов, 76 unit-тестов |
| `npm run test:e2e` | 5 браузерных сценариев |
| `npm run typecheck` | без ошибок, включая e2e |
| `npm run lint` | без ошибок |
| `npm run build` | успешная production-сборка |

### 5. План защиты ЛР8

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
