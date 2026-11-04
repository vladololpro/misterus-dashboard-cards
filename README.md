# misteRus Dashboard Cards
- Приложение для управления банковскими картами на React + Vite.

## Возможности
- Список карт с балансами и типами (Mir, Visa, MasterCard)
- Выбор активной карты
- Блокировка и разблокировка карт
- Быстрый перевод между своими картами в одной валюте
- Баланс активной карты
- Операции по активной карте
- Фильтр операций: все / доходы / расходы
- Сортировка операций от новых к старым
- Детали операции в модальном окне
- Аналитика: диаграммы зачислений и расходов по категориям
- Форматирование сумм с валютой
- Обработка ошибок сети и уведомления (успех / ошибка / предупреждение)

## Стек
- React 19
- Vite
- TypeScript
- Redux Toolkit
- RTK Query
- React Router
- Express (мок-сервер)
- CSS
- ESLint

## Структура проекта
src/
├── app/ # настройка Redux store
│ └── store.ts
├── components/ # компоненты приложения
│ ├── Header.tsx
│ ├── Footer.tsx
│ ├── CardList.tsx
│ ├── CardItem.tsx
│ ├── CardDetails.tsx
│ ├── BalanceWidget.tsx
│ ├── OperationsList.tsx
│ ├── FilterBar.tsx
│ ├── QuickTransfer.tsx
│ ├── TransactionDetails.tsx
│ ├── CategoryPieChart.tsx
│ ├── Modal.tsx
│ └── NoticeBanner.tsx
├── features/ # Redux-слайсы
│ ├── cards/
│ │ └── cardsSlice.ts
│ └── filter/
│ └── filterSlice.ts
├── hooks/ # собственные хуки
│ ├── useActiveCard.ts
│ ├── useBankData.ts
│ └── useLocalStorage.ts
├── pages/ # страницы приложения
│ ├── DashboardPage.tsx
│ ├── OperationsPage.tsx
│ └── NotFoundPage.tsx
├── shared/ # переиспользуемый код
│ ├── api/ # работа с API и проверки типов
│ │ ├── bankApiSlice.ts
│ │ ├── client.ts
│ │ ├── errors.ts
│ │ └── guards.ts
│ ├── config/ # конфигурация
│ │ ├── api.ts
│ │ └── constants.ts
│ ├── types/ # общие типы
│ │ └── index.ts
│ ├── ui/ # UI-компоненты
│ │ └── Button.tsx
│ └── lib/ # утилиты
│ ├── formatMoney.ts
│ ├── formatCard.ts
│ ├── getCardById.ts
│ ├── getMerchantIcon.ts
│ ├── operationsStats.ts
│ └── sortOperations.ts
├── App.tsx
├── App.css
├── index.css
└── main.tsx

## Алиасы
- В проекте настроены алиасы для импортов:
  - `@components` -> `src/components`
  - `@shared` -> `src/shared`

- Пример использования:
  - import CardList from '@components/CardList';
  - import { formatMoney } from '@shared/lib/formatMoney'.

## Команды
- `npm install` - установка зависимостей;
- `npm run dev` - запуск dev-сервера;
- `npm run server` - запуск мок-сервера;
- `npm run typecheck` - проверка типов;
- `npm run lint` - проверка ESLint для JS и TypeScript;
- `npm run build` - сборка проекта.

## Хуки

### useLocalStorage
- Сохраняет значение в `localStorage` и возвращает типизированную пару `[value, setValue]`.

### useBankData
- Загружает карты и операции через RTK Query. Объединяет состояния загрузки и ошибок для двух запросов.
- Возвращает `cards` - массив карт, `operations` - массив операций, `isLoading` - первая загрузка (данных нет), `isFetching` - любой запрос (включая фоновое обновление), `isError` - ошибка сети и `refresh` - повторный запрос.

### useActiveCard
- Управляет активной картой и производными данными.

- Принимает:
  - `cards` - массив карт;
  - `operations` - массив операций;
  - `filter` - текущий фильтр.

- Возвращает:
  - `activeCardId` - ID активной карты;
  - `setActiveCardId` - функция выбора карты;
  - `activeCard` - объект активной карты;
  - `activeOperations` - отфильтрованные и отсортированные операции.

## Типы и утилиты
- В src/shared/types/index.ts описаны основные сущности и утилиты типов:
  - Card, Operation - интерфейсы основных сущностей
  - FilterValue - union-тип для фильтра
  - CardBalanceInfo = Pick<Card, ...> - урезанный тип для виджета баланса
  - NewOperation = Omit<Operation, 'id'> - тип для создания операции без ID
  - CardWithStats = Card & { opsCount, total } - карта с аналитикой
  - LoadingState, TransferState - discriminated union для состояний загрузки и перевода

- В src/shared/api/guards.ts - guard-функции для проверки данных из API:
  - isCardArray
  - isOperationArray

#### Автор
- misteRus - [Steam](https://steamcommunity.com/id/misteRus/)
