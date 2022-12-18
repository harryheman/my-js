---
slug: react-query
title: Разработка приложения с помощью React Query
description: Туториал по разработке приложения с помощью React Query
authors: harryheman
tags: [react.js, reactjs, react, react query]
---

Привет, друзья!

Представляю вашему вниманию перевод [этой замечательной статьи](https://www.smashingmagazine.com/2022/01/building-real-app-react-query/), в которой рассказывается о разработке приложения с помощью [React Query](https://tanstack.com/query/v4/?from=reactQueryV3&original=https://react-query-v3.tanstack.com/).

> [Репозиторий с кодом проекта](https://github.com/horprogs/react-query).

> [Руководство по React Query](https://my-js.org/docs/guide/react-query).

Прим. пер.: автор рассказывает лишь о ключевых особенностях приложения, поэтому я рекомендую клонировать репозиторий, установить зависимости и запустить сервер для разработки, чтобы иметь возможность выполнять необходимые операции при чтении статьи. _Обратите внимание_: если у вас возникнут проблемы при запуске сервера для разработки с помощью команды `npm start`, перенесите переменные, определенные в этой команде в файле `package.json`, в файл `.env`:

```bash
SKIP_PREFLIGHT_CHECK=true
TSC_COMPILE_ON_ERROR=true
ESLINT_NO_DEV_ERRORS=true
```

И отредактируйте команду `start` следующим образом:

```json
"start": "react-scripts start"
```

<!--truncate-->

Если вам когда-либо приходилось разрабатывать `React-приложение`, в котором используются асинхронные данные (а это практически любое приложение), вы наверняка знаете, насколько утомительным может быть обработка различных состояний (загрузка, ошибка и т.д.), распределение состояния между компонентами, обращающимися к одной и той же конечной точке `API` и обеспечение согласованности состояния в компонентах.

Для обновления данных нам приходится выполнять множество операций: определять хуки `useState` и `useEffect`, получать данные из `API`, помещать обновленные данные в состояние, менять состояние загрузки, обрабатывать ошибки и т.п. К счастью, у нас есть `React Query` - библиотека, которая значительно облегчает получение, кэширование и управление данными.

## Преимущества использования нового подхода

`React Query` предоставляет впечатляющий перечень возможностей:

- кэширование;
- дедупликация одинаковых запросов;
- обновление устаревших данных в фоновом режиме (при установке фокуса, повторном подключении, периодически и др.);
- оптимизация производительности за счет пагинации и ленивой загрузки данных;
- мемоизация результатов запроса;
- предварительное получение данных;
- мутации, облегчающие реализацию оптимистичных обновлений etc.

Для демонстрации всех этих возможностей я разработал приложение, в котором реализована большая часть функционала, предоставляемого `React Query`. Приложение написано на `TypeScript`, в нем используется [CRA](https://create-react-app.dev/), `React Query`, [Axios Mock Adapter](https://www.npmjs.com/package/axios-mock-adapter) и [Material UI](https://mui.com/) для быстрого прототипирования.

## Функционал приложения

Приложение представляет собой реализацию системы обслуживания автомобилей. Функционал приложения следующий:

- авторизация пользователей с помощью адреса электронной почты и пароля;
- отображение списка предстоящих встреч (appointments - ТО) с возможностью загрузки дополнительных данных;
- отображение информации о конкретной встрече;
- сохранение и отображение истории изменений;
- предварительное получение дополнительной информации;
- добавление и изменение необходимых работ/задач.

## Взаимодействие на стороне клиента

В качестве замены реального сервера в приложении используется `axios-mock-adapter`. Я подготовил своего рода `REST API` с конечными точками для `GET/POST/PATCH/DELETE-запросов`. Для хранения данных используются фикстуры (fixtures). Ничего особенного - всего лишь мутируемые переменные.

Кроме того, для визуализации модификации состояния добавлена задержка в 1 секунду для ответа на каждый запрос.

## Подготовка к использованию React Query

Для того, чтобы иметь возможность использовать фичи, предоставляемые `React Query`, основной компонент приложения необходимо обернуть в соответствующий провайдер:

```tsx
const queryClient = new QueryClient();

ReactDOM.render(
 <React.StrictMode>
   <Router>
     <QueryClientProvider client={queryClient}>
       <App />
       <ToastContainer />
     </QueryClientProvider>
   </Router>
 </React.StrictMode>,
 document.getElementById('root')
);
```

Конструктор `QueryClient` позволяет устанавливать некоторые глобальные настройки.

Для облегчения разработки мы создадим собственные абстракции для хуков `React Query`. Для подписки на запрос (query) необходимо передать уникальный ключ. Простейшим способов является использование строк, но также можно использовать массивоподобные ключи.

В официальной документации используются строки, но я нахожу это немного избыточным, поскольку у нас имеются адреса запросов (`URL`). Мы вполне можем использовать эти `URL` в качестве ключей.

Однако существуют некоторые ограничения: если вы собираетесь использовать разные `URL` для `GET/PATCH`, например, вы должны использовать одинаковый ключ, в противном случае, `React Query` не сможет сопоставить эти запросы.

Также важно помнить о необходимости включения не только самого `URL`, но и всех параметров, которые содержатся в запросе. Комбинация `URL` и параметров позволяет создавать уникальные ключи, используемые `React Query` для кэширования.

В качестве средства получения данных (fetcher) в приложении используется [Axios](https://github.com/axios/axios), которому передается `URL` и параметры из `queryKey`:

```tsx
export const useFetch = <T>(
 url: string | null,
 params?: object,
 config?: UseQueryOptions<T, Error, T, QueryKeyT>
) => {
 const context = useQuery<T, Error, T, QueryKeyT>(
   [url!, params],
   ({ queryKey }) => fetcher({ queryKey }),
   {
     enabled: !!url,
     ...config,
   }
 );

 return context;
};

export const fetcher = <T>({
 queryKey,
 pageParam,
}: QueryFunctionContext<QueryKeyT>): Promise<T> => {
 const [url, params] = queryKey;
 return api
   .get<T>(url, { params: { ...params, pageParam } })
   .then((res) => res.data);
};
```

Здесь `[url!, params]` - это наш ключ, а настройка `enabled: !!url` предназначена для отмены выполнения запроса при отсутствии `url` (об этом немного позже). В качестве средства получения данных можно использовать что угодно, это не имеет особого значения.

Для улучшения опыта разработки можно использовать инструменты разработчика `React Query`:

```tsx
import { ReactQueryDevtools } from 'react-query/devtools';

ReactDOM.render(
 <React.StrictMode>
   <Router>
     <QueryClientProvider client={queryClient}>
       <App />
       <ToastContainer />
       <ReactQueryDevtools initialIsOpen={false} />
     </QueryClientProvider>
   </Router>
 </React.StrictMode>,
 document.getElementById('root')
);
```

<img src="https://habrastorage.org/webt/e8/ec/ko/e8eckowkat8s9gorjl655mobks8.png" />
<br />

## Аутентификация

Для того, чтобы пользоваться нашим приложением, пользователь должен авторизоваться с помощью email и пароля. Сервер возвращает токен, который записывается в куки (в приложении работает любая комбинация email/пароль). Впоследствии токен прикрепляется к каждому запросу.

С помощью токена запрашивается профиль пользователя. В шапке (header) отображается имя пользователя или индикатор загрузки, если запрос находится в стадии выполнения. Интересной частью является то, что мы можем обрабатывать перенаправление на страницу авторизации в корневом компоненте `App`, а имя пользователя отображать в отдельном компоненте.

Вот где начинается магия `React Query`. С помощью хуков мы легко можем распределять данные о пользователе без их передачи в качестве пропов.

`App.tsx`:

```tsx
const { error } = useGetProfile();

useEffect(() => {
 if (error) {
   history.replace(pageRoutes.auth);
 }
}, [error]);
```

`UserProfile.tsx`:

```tsx
const UserProfile = ({}: Props) => {
 const { data: user, isLoading } = useGetProfile();

 if (isLoading) {
   return (
     <Box display="flex" justifyContent="flex-end">
       <CircularProgress color="inherit" size={24} />
     </Box>
   );
 }

 return (
   <Box display="flex" justifyContent="flex-end">
     {user ? `User: ${user.name}` : 'Unauthorized'}
   </Box>
 );
};
```

Запрос к `API` будет выполняться только один раз (это называется дедупликацией запросов, о чем мы поговорим в следующем разделе).

Хук для получения данных профиля:

```tsx
export const useGetProfile = () => {
 const context = useFetch<{ user: ProfileInterface }>(
   apiRoutes.getProfile,
   undefined,
   { retry: false }
 );
 return { ...context, data: context.data?.user };
};
```

Настройка `retry: false` определяет, что запрос выполняется однократно. Если запрос завершается неудачно, мы считаем, что пользователь неавторизован и выполняем перенаправление.

После ввода пользователем email и пароля отправляется обычный `POST-запрос`. Теоретически, мы можем использовать здесь мутации `React Query`, но в данном случае у нас нет необходимости определять состояние `const [btnLoading, setBtnLoading] = useState(false)` и управлять им, я думаю, что это будет лишним.

Если запрос выполняется успешно, мы инвалидируем все запросы для получения свежих данных. В нашем приложении речь идет об одном запросе - запросе профиля пользователя для обновления имени в шапке:

```tsx
if (resp.data.token) {
 Cookies.set('token', resp.data.token);
 history.replace(pageRoutes.main);
 queryClient.invalidateQueries();
}
```

Для инвалидации одного запроса можно использовать `queryClient.invalidateQueries(apiRoutes.getProfile)`.

## Дедупликация запросов

Предположим, что у нас есть 2 разных компонента, которые обращаются к одинаковой конечной точке `API`. Обычно, требуется выполнить 2 идентичных запроса, что является пустой тратой ресурсов сервера. `React Query` позволяет дедуплицировать такие запросы. Это означает, что вместо нескольких запросов будет выполнен лишь один.

В приложении есть 2 компонента: компонент, отвечающий за отображение общего количества встреч, и компонент, содержащий список встреч.

Компонент общего количества встреч:

```tsx
const UsersSummary = () => {
 const { data: list, isLoading } = useGetAppointmentsList();

 if (!isLoading && !list) {
   return null;
 }

 return (
   <Box mb={2}>
     <Card>
       <Box p={2}>
         <Typography>
           Total appointments:{' '}
           {isLoading ? (
             <Skeleton
               animation="wave"
               variant="rectangular"
               height={15}
               width="60%"
             />
           ) : (
             list!.pages[0].count
           )}
         </Typography>
       </Box>
     </Card>
   </Box>
 );
};
```

Компонент списка:

```tsx
const UsersList = () => {
 const {
   data: list,
   isLoading,
   fetchNextPage,
   hasNextPage,
   isFetchingNextPage,
 } = useGetAppointmentsList();

 return (
   <>
     <Card>
       {isLoading ? (
         <List>
           <Box mb={1}>
             <UserItemSkeleton />
           </Box>
           <Box mb={1}>
             <UserItemSkeleton />
           </Box>
           <Box mb={1}>
             <UserItemSkeleton />
           </Box>
         </List>
       ) : (
         <List>
           {list!.pages.map((page) => (
             <React.Fragment key={page.nextId || 0}>
               {page.data.map((item) => (
                 <UserItem
                   key={item.id}
                   id={item.id}
                   name={item.name}
                   date={item.appointment_date}
                 />
               ))}
             </React.Fragment>
           ))}
         </List>
       )}
     </Card>
     {hasNextPage && (
       <Box mt={2}>
         <Button
           variant="contained"
           color="primary"
           onClick={() => {
             fetchNextPage();
           }}
           disabled={isFetchingNextPage}
         >
           {isFetchingNextPage ? 'Loading more...' : 'Load more users'}
         </Button>
       </Box>
     )}
   </>
 );
};
```

Они используют хук `useGetAppointmentsList`, который отправляет запрос к `API`. Как вы можете увидеть в инструментах разработчика, запрос `GET /api/getUserList` выполняется только один раз.

## Загрузка дополнительных данных

В приложении имеется бесконечный список с кнопкой `Load more` (Загрузить еще). Для реализации такого списка вместо хука `useQuery` следует использовать хук `useInfiniteQuery`, который позволяет обрабатывать пагинацию с помощью функции `fetchNextPage`:

```tsx
export const useGetAppointmentsList = () =>
 useLoadMore<AppointmentInterface[]>(apiRoutes.getUserList);
```

Наша абстракция для рассматриваемого хука:

```tsx
export const useLoadMore = <T>(url: string | null, params?: object) => {
 const context = useInfiniteQuery<
   GetInfinitePagesInterface<T>,
   Error,
   GetInfinitePagesInterface<T>,
   QueryKeyT
 >(
   [url!, params],
   ({ queryKey, pageParam = 1 }) => fetcher({ queryKey, pageParam }),
   {
     getPreviousPageParam: (firstPage) => firstPage.previousId ?? false,
     getNextPageParam: (lastPage) => {
       return lastPage.nextId ?? false;
     },
   }
 );

 return context;
};
```

Данный хук похож на хук `useFetch`, за исключением того, что мы определяем функции `getPreviousPageParam` и `getNextPageParam` на основе ответа `API` и передаем свойство `pageParam` в фетчер.

```tsx
const UsersList = () => {
 const {
   data: list,
   isLoading,
   fetchNextPage,
   hasNextPage,
   isFetchingNextPage,
 } = useGetAppointmentsList();

 return (
   <>
     <Card>
       {isLoading ? (
         <List>
           <Box mb={1}>
             <UserItemSkeleton />
           </Box>
           <Box mb={1}>
             <UserItemSkeleton />
           </Box>
           <Box mb={1}>
             <UserItemSkeleton />
           </Box>
         </List>
       ) : (
         <List>
           {list!.pages.map((page) => (
             <React.Fragment key={page.nextId || 0}>
               {page.data.map((item) => (
                 <UserItem
                   key={item.id}
                   id={item.id}
                   name={item.name}
                   date={item.appointment_date}
                 />
               ))}
             </React.Fragment>
           ))}
         </List>
       )}
     </Card>
     {hasNextPage && (
       <Box mt={2}>
         <Button
           variant="contained"
           color="primary"
           onClick={() => {
             fetchNextPage();
           }}
           disabled={isFetchingNextPage}
         >
           {isFetchingNextPage ? 'Loading more...' : 'Load more users'}
         </Button>
       </Box>
     )}
   </>
 );
};
```

Хук `useInfiniteQuery` предоставляет несколько дополнительных полей, таких как `fetchNextPage`, `hasNextPage`, `isFetchingNextPage`, а также методы `fetchNextPage` и `fetchPreviousPage`, которые можно использовать для загрузки дополнительных данных.

## Фоновый индикатор получения данных/повторный запрос данных

Интересной фичей, предоставляемой `React Query`, является возможность выполнения повторного запроса при установке фокуса на область просмотра, например, при переключении вкладок. Это может быть полезным, например, когда данные могут модифицироваться несколькими авторами. Если вкладка браузера открыта, необходимости в перезагрузки страницы нет. Но при возвращении на вкладку мы должны видеть актуальные данные. `React Query` имеет несколько настроек, связанных с повторным выполнением запросов:

- `refetchInterval`;
- `refetchIntervalInBackground`;
- `refetchOnMount`;
- `refetchOnReconnect`;
- `refetchOnWindowFocus`.

Эти настройки можно устанавливать глобально:

```tsx
const queryClient = new QueryClient({
 defaultOptions: {
   queries: {
     refetchOnWindowFocus: false,
   },
 },
});
```

В качестве индикатора повторного выполнения запроса можно использовать флаг `isFetching`.

## Выполнение условных запросов

Поскольку мы используем хуки для получения данных, возникает закономерный вопрос: как отменять выполнение запросов? Как вы знаете, мы не можем вызывать хуки условно, например, так делать нельзя:

```tsx
if (data?.hasInsurance) {
 const { data: insurance } = useGetInsurance(
   data?.hasInsurance ? +id : null
 );
}
```

Предположим, что необходимо выполнять дополнительный запрос на получение данных о страховке на основе информации о встрече.

Если мы хотим выполнить запрос, то передаем ключ, если не хотим - передаем `null`:

```tsx
const { data: insurance } = useGetInsurance(data?.hasInsurance ? +id : null);

export const useGetInsurance = (id: number | null) =>
 useFetch<InsuranceDetailsInterface>(
   id ? pathToUrl(apiRoutes.getInsurance, { id }) : null
 );
```

В хуке `useFetch` установлена настройка `enabled`. В случае, когда данная настройка имеет значение `false`, запрос не выполняется.

Для встречи с `id === 1` `hasInsurance` имеет значение `true`. Выполняем дополнительный запрос и показываем иконку двойной галочки рядом с именем. Это означает, что мы получили флаг `allCovered` от конечной точки `getInsurance`:

<img src="https://habrastorage.org/webt/h0/tz/69/h0tz69qkzj_0rbq8p_ygakb1fzo.png" />
<br />

Для встречи с `id === 2` `hasInsurance` имеет значение `false`. Дополнительный запрос для этой встречи не выполняется:

<img src="https://habrastorage.org/webt/kw/fe/8z/kwfe8zr3llnd5e1zeyero_tzgkq.png" />
<br />

## Простая мутация с инвалидацией данных

Для создания/обновления/удаления данных в `React Query` используются мутации. Это означает, что мы отправляем запрос на сервер, получаем ответ и на основе определенной функции обновления мутируем состояние для обеспечения его актуальности без выполнения дополнительного запроса.

Для таких операций у нас имеется общая абстракция:

```tsx
const useGenericMutation = <T, S>(
 func: (data: S) => Promise<AxiosResponse<S>>,
 url: string,
 params?: object,
 updater?: ((oldData: T, newData: S) => T) | undefined
) => {
 const queryClient = useQueryClient();

 return useMutation<AxiosResponse, AxiosError, S>(func, {
   onMutate: async (data) => {
     await queryClient.cancelQueries([url!, params]);

     const previousData = queryClient.getQueryData([url!, params]);

queryClient.setQueryData<T>([url!, params], (oldData) => {
 return updater ? (oldData!, data) : data;
});


     return previousData;
   },
   // Если мутация провалилась, использовать контекст, возвращенный `onMutate` для восстановления предыдущего состояния (отката - rollback)
   onError: (err, _, context) => {
     queryClient.setQueryData([url!, params], context);
   },

   onSettled: () => {
     queryClient.invalidateQueries([url!, params]);
   },
 });
};
```

Рассмотрим этот хук подробнее. У нас есть несколько коллбэков:

- `onMutate` (если запрос выполнен):
  - отменяем выполняющиеся запросы;
  - сохраняем текущие данные в переменную;
  - используем функцию `updater` (при наличии) для мутирования состояния тем или иным образом, иначе просто перезаписываем состояние новыми данными. В большинстве случаев имеет смысл определять `updater`;
  - возвращаем предыдущие данные;
- `onError` (если запрос провалился):
  - восстанавливаем предыдущее состояние;
- `onSettled` (при любом завершении запроса):
  - инвалидируем запрос для обеспечения актуальности состояния.

Примеры использования этой абстракции для выполнения мутаций:

```tsx
export const useDelete = <T>(
 url: string,
 params?: object,
 updater?: (oldData: T, id: string | number) => T
) => {
 return useGenericMutation<T, string | number>(
   (id) => api.delete(`${url}/${id}`),
   url,
   params,
   updater
 );
};

export const usePost = <T, S>(
 url: string,
 params?: object,
 updater?: (oldData: T, newData: S) => T
) => {
 return useGenericMutation<T, S>(
   (data) => api.post<S>(url, data),
   url,
   params,
   updater
 );
};

export const useUpdate = <T, S>(
 url: string,
 params?: object,
 updater?: (oldData: T, newData: S) => T
) => {
 return useGenericMutation<T, S>(
   (data) => api.patch<S>(url, data),
   url,
   params,
   updater
 );
};
```

Вот почему так важно иметь одинаковый набор `[url!, params]` (который используется в качестве ключа) во всех хуках. Без этого библиотека не сможет инвалидировать состояние и сопоставлять запросы.

Посмотрим, как это работает в приложении. У нас есть раздел `History`. При нажатии кнопки `Save` отправляется запрос `PATCH`, в ответ на который возвращается обновленный объект встречи.

Сначала определяется мутация. В данном случае нас устраивает возврат нового состояния, поэтому мы не определяем `updater`:

```tsx
const mutation = usePatchAppointment(+id);

export const usePatchAppointment = (id: number) =>
 useUpdate<AppointmentInterface, AppointmentInterface>(
   pathToUrl(apiRoutes.appointment, { id })
 );
```

_Обратите внимание_: здесь используется общий хук `useUpdate`.

В конце вызывается метод `mutate` с данными для обновления: `mutation.mutate([data!])`.

_Обратите внимание_: в данном компоненте используется флаг `isFetching` для индикации обновления данных при установке фокуса на область просмотра, поэтому мы можем отслеживать состояние загрузки при каждом выполнении запроса. Когда мы нажимаем на `Save`, мутируем состояние и выполняем запрос, мы также отображаем индикатор загрузки:

```tsx
const History = ({ id }: Props) => {
 const { data, isFetching } = useGetAppointment(+id);
 const mutation = usePatchAppointment(+id);

 if (isFetching) {
   return (
     <Box>
       <Box pt={2}>
         <Skeleton animation="wave" variant="rectangular" height={15} />
       </Box>
       <Box pt={2}>
         <Skeleton animation="wave" variant="rectangular" height={15} />
       </Box>
       <Box pt={2}>
         <Skeleton animation="wave" variant="rectangular" height={15} />
       </Box>
     </Box>
   );
 }

 const onSubmit = () => {
   mutation.mutate(data!);
 };

 return (
   <>
     {data?.history.map((item) => (
       <Typography variant="body1" key={item.date}>
         Date: {item.date} <br />
         Comment: {item.comment}
       </Typography>
     ))}

     {!data?.history.length && !isFetching && (
       <Box mt={2}>
         <span>Nothing found</span>
       </Box>
     )}
     <Box mt={3}>
       <Button
         variant="outlined"
         color="primary"
         size="large"
         onClick={onSubmit}
         disabled={!data || mutation.isLoading}
       >
         Save
       </Button>
     </Box>
   </>
 );
};
```

## Мутация с оптимистичным обновлением

Теперь рассмотрим более сложный пример: в приложении есть список, в котором должна быть возможность добавлять и удалять элементы. Мы хотим сделать пользовательский опыт настолько плавным, насколько это возможно. Поэтому реализуем оптимистичное обновление для создания/удаления задач.

Для этого необходимо выполнить следующие операции:

- пользователь вводит название задачи и нажимает кнопку `Add`;
- мы сразу добавляем задачу в список и отображаем индикатор загрузки на `Add`;
- в это же время выполняется запрос к `API`;
- при получении ответа индикатор скрывается;
- если запрос выполнен, новая задача сохраняется, обновляется ее `id` в списке и очищается инпут;
- если запрос провалился, показываем уведомление об ошибке, удаляем задачу из списка и сохраняем значение инпута;
- в обоих случаях отправляется запрос `GET` для обеспечения актуальности состояния.

Логика:

```tsx
const { data, isLoading } = useGetJobs();

const mutationAdd = useAddJob((oldData, newData) => [...oldData, newData]);
const mutationDelete = useDeleteJob((oldData, id) =>
 oldData.filter((item) => item.id !== id)
);

const onAdd = async () => {
 try {
   await mutationAdd.mutateAsync({
     name: jobName,
     appointmentId,
   });
   setJobName('');
 } catch (e) {
   pushNotification(`Cannot add the job: ${jobName}`);
 }
};

const onDelete = async (id: number) => {
 try {
   await mutationDelete.mutateAsync(id);
 } catch (e) {
   pushNotification(`Cannot delete the job`);
 }
};
```

В данном случае определяется функция `updater` для мутации состояния посредством кастомной логики: создания массива с новым элементом или фильтрация массива по `id` при удалении элемента. Логика может быть любой в зависимости от потребностей компонента или приложения.

После нажатия `Add` мы сразу видим обновленный список, после чего сначала отправляется `POST`, а затем `GET-запрос`. Это работает благодаря коллбэку `onSettled`, определенному в хуке `useGenericMutation` - независимо от результата выполнения запроса, всегда запрашиваются свежие данные:

```tsx
onSettled: () => {
 queryClient.invalidateQueries([url!, params]);
},
```

Если сервер возвращает ошибку, оптимистичное обновление откатывается и отображается уведомление. Это работает благодаря коллбэку `onError` в хуке `useGenericMutation` - мы восстанавливаем предыдущие данные в случае ошибки:

```tsx
onError: (err, _, context) => {
 queryClient.setQueryData([url!, params], context);
},
```

## Предварительное получение данных

Предварительное получение данных может быть полезным, когда существует высокая вероятность того, что пользователь запросит эти данные в ближайшем будущем.

В приложении информация об автомобиле запрашивается при наведение пользователем курсора на раздел `Additional`.

Это позволяет рендерить данные незамедлительно при нажатии пользователем кнопки `Show`:

```tsx
const prefetchCarDetails = usePrefetchCarDetails(+id);

onMouseEnter={() => {
 if (!prefetched.current) {
   prefetchCarDetails();
   prefetched.current = true;
 }
}}

export const usePrefetchCarDetails = (id: number | null) =>
 usePrefetch<InsuranceDetailsInterface>(
   id ? pathToUrl(apiRoutes.getCarDetail, { id }) : null
 );
```

Абстракция для предварительного получения данных выглядит следующим образом:

```tsx
export const usePrefetch = <T>(url: string | null, params?: object) => {
 const queryClient = useQueryClient();

 return () => {
   if (!url) {
     return;
   }

   queryClient.prefetchQuery<T, Error, T, QueryKeyT>(
     [url!, params],
     ({ queryKey }) => fetcher({ queryKey })
   );
 };
};
```

Для рендеринга информации об автомобиле используется компонент `CarDetails`, в котором определяется хук для получения данных:

```tsx
const CarDetails = ({ id }: Props) => {
 const { data, isLoading } = useGetCarDetail(id);

 if (isLoading) {
   return <CircularProgress />;
 }

 if (!data) {
   return <span>Nothing found</span>;
 }

 return (
   <Box>
     <Box mt={2}>
       <Typography>Model: {data.model}</Typography>
     </Box>

     <Box mt={2}>
       <Typography>Number: {data.number}</Typography>
     </Box>
   </Box>
 );
};

export const useGetCarDetail = (id: number | null) =>
 useFetch<CarDetailInterface>(
   pathToUrl(apiRoutes.getCarDetail, { id }),
   undefined,
   { staleTime: 2000 }
 );
```

У нас нет необходимости передавать пропы этому компоненту. В компоненте `Appointment` данные предварительно получаются, а в компоненте `CarDetails` для извлечения этих данных используется хук `useGetCarDetail`.

Настройка `staleTime` определяет задержку перед выполнением запроса. Без нее запрос может быть выполнен дважды, если пользователь будет слишком медленно двигать курсором.

## Suspense

`Suspense` - это экспериментальная возможность `React`, позволяющая ждать некоторые данные декларативным способом. Другими словами, мы можем вызвать компонент `Suspense` и определить компонент `fallback`, который будет отображаться в период ожидания данных. Нам даже не нужен флаг `isLoading` из `React Query`. Для получения более подробной информации обратитесь к [официальной документации](https://reactjs.org/docs/concurrent-mode-suspense.html).

Предположим, что у нас есть компонент `Service`, и мы хотим показывать ошибку и кнопку `Try again` (Попробовать снова), если что-то пошло не так.

Давайте применим комбинацию `Suspense`, `React Query` и `Error Boundary`. В качестве последнего используется библиотека [react-error-boundary](https://www.npmjs.com/package/react-error-boundary):

```tsx
<QueryErrorResetBoundary>
 {({ reset }) => (
   <ErrorBoundary
     fallbackRender={({ error, resetErrorBoundary }) => (
       <Box width="100%" mt={2}>
         <Alert severity="error">
           <AlertTitle>
             <strong>Error!</strong>
           </AlertTitle>
           {error.message}
         </Alert>

         <Box mt={2}>
           <Button
             variant="contained"
             color="error"
             onClick={() => resetErrorBoundary()}
           >
             Try again
           </Button>
         </Box>
       </Box>
     )}
     onReset={reset}
   >
     <React.Suspense
       fallback={
         <Box width="100%">
           <Box mb={1}>
             <Skeleton variant="text" animation="wave" />
           </Box>
           <Box mb={1}>
             <Skeleton variant="text" animation="wave" />
           </Box>
           <Box mb={1}>
             <Skeleton variant="text" animation="wave" />
           </Box>
         </Box>
       }
     >
       <ServicesCheck checked={checked} onChange={onChange} />
     </React.Suspense>
   </ErrorBoundary>
 )}
</QueryErrorResetBoundary>
```

Внутри `Suspense` рендерится компонент `ServiceCheck`, в котором выполняется запрос на получение перечня услуг:

```tsx
const { data } = useGetServices();
```

В хуке мы устанавливаем `suspense: true` и `retry: 0`:

```tsx
export const useGetServices = () =>
 useFetch<ServiceInterface[]>(apiRoutes.getServices, undefined, {
   suspense: true,
   retry: 0,
 });
```

На сервере мы произвольно отправляем ответ со статус-кодом `200` или `500`:

```tsx
mock.onGet(apiRoutes.getServices).reply((config) => {
 if (!getUser(config)) {
   return [403];
 }

 const failed = !!Math.round(Math.random());

 if (failed) {
   return [500];
 }

 return [200, services];
});
```

При получении ошибки отображается соответствующее уведомление с сообщением. Нажатие `Try again` приводит к вызову метода `resetErrorBoundary`, который повторно выполняет запрос. Во время выполнения запроса отображается скелетон, переданный в проп `fallback` компонента `Suspense`.

Как видите, `Suspense` предоставляет простой и удобный способ обработки ошибок, связанных с асинхронным получением данных, но помните, что эта возможность является нестабильной и, по всей видимости, не должна использоваться в продакшне.

## Тестирование

Тестирование приложения, в котором используется `React Query`, почти ничем не отличается от тестирования любого другого `React-приложения`. Для тестирования нашего приложения используются [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) и [Jest](https://jestjs.io/ru/).

Создаем абстракцию для рендеринга компонентов:

```tsx
export const renderComponent = (children: React.ReactElement, history: any) => {
 const queryClient = new QueryClient({
   defaultOptions: {
     queries: {
       retry: false,
     },
   },
 });
 const options = render(
   <Router history={history}>
     <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
   </Router>
 );

 return {
   ...options,
   debug: (
     el?: HTMLElement,
     maxLength = 300000,
     opt?: prettyFormat.OptionsReceived
   ) => options.debug(el, maxLength, opt),
 };
};
```

Устанавливаем `retry: false` в качестве настройки по умолчанию в `QueryClient` и оборачиваем компонент в `QueryClientProvider`.

Протестируем компонент `Appointment`.

Проверяем, что компонент правильно рендерится:

```tsx
test('should render the main page', async () => {
 const mocked = mockAxiosGetRequests({
   '/api/appointment/1': {
     id: 1,
     name: 'Hector Mckeown',
     appointment_date: '2021-08-25T17:52:48.132Z',
     services: [1, 2],
     address: 'London',
     vehicle: 'FR14ERF',
     comment: 'Car does not work correctly',
     history: [],
     hasInsurance: true,
   },
   '/api/job': [],
   '/api/getServices': [
     {
       id: 1,
       name: 'Replace a cambelt',
     },
     {
       id: 2,
       name: 'Replace oil and filter',
     },
     {
       id: 3,
       name: 'Replace front brake pads and discs',
     },
     {
       id: 4,
       name: 'Replace rare brake pads and discs',
     },
   ],
   '/api/getInsurance/1': {
     allCovered: true,
   },
 });
 const history = createMemoryHistory();
 const { getByText, queryByTestId } = renderComponent(
   <Appointment />,
   history
 );

 expect(queryByTestId('appointment-skeleton')).toBeInTheDocument();

 await waitFor(() => {
   expect(queryByTestId('appointment-skeleton')).not.toBeInTheDocument();
 });

 expect(getByText('Hector Mckeown')).toBeInTheDocument();
 expect(getByText('Replace a cambelt')).toBeInTheDocument();
 expect(getByText('Replace oil and filter')).toBeInTheDocument();
 expect(getByText('Replace front brake pads and discs')).toBeInTheDocument();
 expect(queryByTestId('DoneAllIcon')).toBeInTheDocument();
 expect(
   mocked.mock.calls.some((item) => item[0] === '/api/getInsurance/1')
 ).toBeTruthy();
});
```

Определяем вспомогательные функции для установки `URL` и ответа на запросы `Axios` фиктивными данными:

```tsx
const getMockedData = (
 originalUrl: string,
 mockData: { [url: string]: any },
 type: string
) => {
 const foundUrl = Object.keys(mockData).find((url) =>
   originalUrl.match(new RegExp(`${url}$`))
 );

 if (!foundUrl) {
   return Promise.reject(
     new Error(`Called unmocked api ${type} ${originalUrl}`)
   );
 }

 if (mockData[foundUrl] instanceof Error) {
   return Promise.reject(mockData[foundUrl]);
 }

 return Promise.resolve({ data: mockData[foundUrl] });
};

export const mockAxiosGetRequests = <T extends any>(mockData: {

}): MockedFunction<AxiosInstance> => {
 // @ts-ignore
 return axios.get.mockImplementation((originalUrl) =>
   getMockedData(originalUrl, mockData, 'GET')
 );
};
```

Проверяем состояние загрузки и ждем размонтирования компонента:

```tsx
expect(queryByTestId('appointment-skeleton')).toBeInTheDocument();

 await waitFor(() => {
   expect(queryByTestId('appointment-skeleton')).not.toBeInTheDocument();
 });
```

Проверяем выполнение запроса на получения данных о страховке:

```tsx
expect(
   mocked.mock.calls.some((item) => item[0] === '/api/getInsurance/1')
 ).toBeTruthy();
```

Здесь проверяется, что индикаторы загрузки, получение данных и обращение к конечным точкам выполняется правильно.

Далее проверяем, что запрос на получение данных о страховке не выполняется в случае, когда у нас нет такой необходимости:

```tsx
test('should not call and render Insurance flag', async () => {
 const mocked = mockAxiosGetRequests({
   '/api/appointment/1': {
     id: 1,
     name: 'Hector Mckeown',
     appointment_date: '2021-08-25T17:52:48.132Z',
     services: [1, 2],
     address: 'London',
     vehicle: 'FR14ERF',
     comment: 'Car does not work correctly',
     history: [],
     hasInsurance: false,
   },
   '/api/getServices': [],
   '/api/job': [],
 });
 const history = createMemoryHistory();
 const { queryByTestId } = renderComponent(<Appointment />, history);

 await waitFor(() => {
   expect(queryByTestId('appointment-skeleton')).not.toBeInTheDocument();
 });

 expect(queryByTestId('DoneAllIcon')).not.toBeInTheDocument();

 expect(
   mocked.mock.calls.some((item) => item[0] === '/api/getInsurance/1')
 ).toBeFalsy();
});
```

Здесь проверяется, что при получении `hasInsurance: false` в ответе, запрос к соответствующей конечной точке не отправляется и соответствующая иконка не рендерится.

Наконец, тестируем мутации в компоненте `Jobs`. Полный код этого теста:

```tsx
test('should be able to add and remove elements', async () => {
 const mockedPost = mockAxiosPostRequests({
   '/api/job': {
     name: 'First item',
     appointmentId: 1,
   },
 });

 const mockedDelete = mockAxiosDeleteRequests({
   '/api/job/1': {},
 });

 const history = createMemoryHistory();
 const { queryByTestId, queryByText } = renderComponent(
   <Jobs appointmentId={1} />,
   history
 );

 await waitFor(() => {
   expect(queryByTestId('loading-skeleton')).not.toBeInTheDocument();
 });

 await changeTextFieldByTestId('input', 'First item');

 await clickByTestId('add');

 mockAxiosGetRequests({
   '/api/job': [
     {
       id: 1,
       name: 'First item',
       appointmentId: 1,
     },
   ],
 });

 await waitFor(() => {
   expect(queryByText('First item')).toBeInTheDocument();
 });

 expect(
   mockedPost.mock.calls.some((item) => item[0] === '/api/job')
 ).toBeTruthy();

 await clickByTestId('delete-1');

 mockAxiosGetRequests({
   '/api/job': [],
 });

 await waitFor(() => {
   expect(queryByText('First item')).not.toBeInTheDocument();
 });

 expect(
   mockedDelete.mock.calls.some((item) => item[0] === '/api/job/1')
 ).toBeTruthy();
});
```

Здесь происходит следующее:

- мокируются запросы `POST` и `DELETE`;
- поле ввода заполняется некоторым текстом и нажимается кнопка;
- мокируется запрос `GET`: предполагается, что `POST-запрос` выполнен успешно и сервер ответил обновленными данными - в нашем случае списком из 1 элемента;
- ожидается обновление текста в компоненте;
- проверяется выполнение `POST-запроса` к `api/job`;
- нажимается кнопка `Delete`;
- мокируется запрос `GET`: на этот раз возвращается пустой список;
- проверяется, что удаленный элемент отсутствует в документе;
- проверяется выполнение запроса `DELETE` к `api/job/1`.

_Обратите внимание_: перед каждым тестов все моки должны очищаться во избежания их смешивания.

```tsx
afterEach(() => {
 jest.clearAllMocks();
});
```

Благодарю за внимание и happy coding!
