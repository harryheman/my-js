---
sidebar_position: 3
title: Шпаргалка по работе с медиа в браузере
description: Шпаргалка по работе с медиа в браузере
keywords: [javascript, js, media devices, media capture, screen capture, image capture, web speech api, web speech, cheatsheet, медиа устройства, захват медиа, захват экрана, захват изображения, шпаргалка]
tags: [javascript, js, media devices, media capture, screen capture, image capture, web speech api, web speech, cheatsheet, медиа устройства, захват медиа, захват экрана, захват изображения, шпаргалка]
---

# Шпаргалка по работе с медиа в браузере

В данной шпаргалке представлены все основные интерфейсы и методы по работе с медиа в браузере, описываемые в следующих спецификациях:

- [Media Capture and Streams](https://w3c.github.io/mediacapture-main/)
- [Screen Capture](https://w3c.github.io/mediacapture-screen-share/)
- [Media Capture from DOM Elements](https://www.w3.org/TR/mediacapture-fromelement/)
- [MediaStream Image Capture](https://www.w3.org/TR/image-capture/)
- [MediaStream Recording](https://www.w3.org/TR/mediastream-recording/)
- [Web Speech API](https://wicg.github.io/speech-api/)

Шпаргалка представлена в форме вопрос-ответ.

- [Репозиторий с кодом всех сниппетов](https://github.com/harryheman/Blog-Posts/tree/master/web-media)
- [Песочница](https://stackblitz.com/edit/js-pfyter?file=index.html)

Туториалы по теме:

- [JavaScript: разрабатываем приложение для записи звука](https://habr.com/ru/company/timeweb/blog/581086/)
- [JavaScript: разрабатываем приложение для записи экрана](https://habr.com/ru/company/timeweb/blog/591417/)
- [JavaScript: захват медиапотока из DOM элементов](https://habr.com/ru/company/timeweb/blog/646831/)
- [JavaScript: делаем селфи с помощью браузера](https://habr.com/ru/company/timeweb/blog/650233/)
- [JavaScript: разрабатываем чат с помощью Socket.io, Express и React с акцентом на работе с медиа](https://habr.com/ru/company/timeweb/blog/655143/)

## 1. Как получить список медиаустройств пользователя?

Для получения списка медиаустройств пользователя предназначен метод _enumerateDevices_ интерфейса _MediaDevices_ объекта _Navigator_:

```javascript
const devices = await navigator.mediaDevices.enumerateDevices()
```

- [Спецификация](https://w3c.github.io/mediacapture-main/#dom-mediadevices-enumeratedevices)
- [MDN](https://developer.mozilla.org/ru/docs/Web/API/MediaDevices/enumerateDevices)

Список моих устройств:

<img src="https://habrastorage.org/webt/sa/y6/yk/say6yk_xediierhmflqtjj6f7rk.png" />
<br />

Свойство _kind_ может использоваться для формирования требований (constraints) к медиапотоку (MediaStream) (далее - поток) (см. ниже), поэтому имеет смысл временно сохранять в браузере информацию о доступных устройствах пользователя:

```javascript
const STORAGE_KEY = 'user_media_devices'

export async function enumerateDevices() {
  try {
    const devices = sessionStorage.getItem(STORAGE_KEY)
      ? JSON.parse(sessionStorage.getItem(STORAGE_KEY))
      : await navigator.mediaDevices.enumerateDevices()

    if (!sessionStorage.getItem(STORAGE_KEY)) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(devices))
    }

    return { devices }
  } catch (error) {
    return { error }
  }
}
```

_Обработчик_:

```javascript
const stringify = (data) => JSON.stringify(data, null, 2)

const handleError = (e) => {
  console.error(e)
}

// <button id="enumerateDevicesBtn">Enumerate devices</button>
enumerateDevicesBtn.onclick = async () => {
  const { devices, error } = await enumerateDevices()
  if (error) return handleError(error)

  // <pre id="logBox"></pre>
  logBox.textContent = stringify(devices)
}
```

## 2. Как получить список требований к потоку, поддерживаемых браузером?

Для получения списка требований к потоку, поддерживаемых браузером, предназначен метод _getSupportedConstraints_:

```javascript
const constraints = await navigator.mediaDevices.getSupportedConstraints()
```

- [Спецификация](https://w3c.github.io/mediacapture-main/#dom-mediadevices-getsupportedconstraints)
- [MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getSupportedConstraints)

Список требований, поддерживаемых моим браузером (последняя версия Chrome):

<img src="https://habrastorage.org/webt/u6/j9/oc/u6j9oc4bqjpwkajeinhkb6qpobc.png" />
<br />

_Обратите внимание_: в данном списке представлены не все требования, которые можно применять к потоку. Некоторые требования из списка относятся к категории "продвинутых" (advanced) и применяются несколько иначе, чем обычные. Многие требования являются экспериментальными и на сегодняшний день поддерживаются не в полной мере.

```javascript
export async function getSupportedConstraints() {
  try {
    const constraints = await navigator.mediaDevices.getSupportedConstraints()
    return { constraints }
  } catch (error) {
    return { error }
  }
}
```

_Обработчик_:

```javascript
// <button id="getSupportedConstraintsBtn">Get supported constraints</button>
getSupportedConstraintsBtn.onclick = async () => {
  const { constraints, error } = await getSupportedConstraints()
  if (error) return handleError(error)

  logBox.textContent = stringify(constraints)
}
```

## 3. Как захватить поток с устройств пользователя?

Для захвата потока с устройств пользователя используется метод _getUserMedia_:

```javascript
const stream = await navigator.mediaDevices.getUserMedia(constraints?)
```

- [Спецификация - алгоритм](https://w3c.github.io/mediacapture-main/#dom-mediadevices-getusermedia)
- [MDN](https://developer.mozilla.org/ru/docs/Web/API/MediaDevices/getUserMedia)

Данный метод принимает опциональные _требования к потоку_:

- [Спецификация - шаблон требований](https://w3c.github.io/mediacapture-main/#constrainable-interface)
- [Спецификация - словарь требований](https://w3c.github.io/mediacapture-main/#dom-mediatracksupportedconstraints)
- [MDN](https://developer.mozilla.org/ru/docs/Web/API/MediaDevices/getUserMedia#%D0%BF%D0%B0%D1%80%D0%B0%D0%BC%D0%B5%D1%82%D1%80%D1%8B)

_Дефолтные требования_:

```javascript
{ audio: true, video: true }
```

Пример _кастомных требований_:

```javascript
export const DEFAULT_AUDIO_CONSTRAINTS = {
  echoCancellation: true,
  autoGainControl: true,
  noiseSuppression: true
}

export const DEFAULT_VIDEO_CONSTRAINTS = {
  width: 1920,
  height: 1080,
  frameRate: 60
}
```

_getUserMedia_ возвращает поток с устройств пользователя:

- [Спецификация](https://w3c.github.io/mediacapture-main/#webidl-1647796506)
- [MDN](https://developer.mozilla.org/ru/docs/Web/API/MediaStream)

Поток представляет собой коллекцию медиатреков (MediaStreamTrack) (далее - трек):

- [Спецификация](https://w3c.github.io/mediacapture-main/#media-stream-track-interface-definition)
- [MDN](https://developer.mozilla.org/ru/docs/Web/API/MediaStreamTrack)

Поток предоставляет несколько _методов для работы с треками_:

- _getTracks_ - возвращает список медиатреков;
- _getAudioTracks_ - возвращает список аудиотреков;
- _getVideoTracks_ - возвращает список видеотреков;
- _addTrack_ - добавляет трек в поток;
- _removeTrack_ - удаляет трек из потока и др.

_Обратите внимание_: захваченный поток должен быть "одиночкой" (singleton). Это позволяет избежать повторного захвата и правильно останавливать захват.

```javascript
let mediaStream

export async function getUserMedia(
  constraints = {
    audio: DEFAULT_AUDIO_CONSTRAINTS,
    video: DEFAULT_VIDEO_CONSTRAINTS
  }
) {
  try {
    const stream = mediaStream
      ? mediaStream
      : (mediaStream = await navigator.mediaDevices.getUserMedia(constraints))

    const tracks = stream.getTracks()
    const audioTracks = stream.getAudioTracks()
    const videoTracks = stream.getVideoTracks()

    return { stream, tracks, audioTracks, videoTracks }
  } catch (error) {
    return { error }
  }
}
```

Для прямой передачи потока в приемник (например, DOM-элемент _video_) используется свойство _srcObject_. Приемник должен иметь атрибуты _autoplay_ и _muted_:

```javascript
// <video id="streamReceiver" controls autoplay muted></video>
streamReceiver.srcObject = stream
```

Трек предоставляет такие _методы_, как:

- _getCapabilities_ - возвращает список возможностей (настроек), поддерживаемых треком;
- _getConstraints_ - возвращает список требований, примененных к треку;
- _getSettings_ - возвращает список требований и настроек, примененных к треку;
- _applyConstraints_ - применяет требования к треку;
- _stop_ - останавливает получение данных из источника трека и др.

Функция для получения потока и треков с применением к потоку поддерживаемых требований, передачей потока в приемник, получением информации о первом треке и отображением этой информации на экране может выглядеть следующим образом:

```javascript
// <button id="getUserMediaBtn">Get user media</button>
getUserMediaBtn.onclick = async () => {
  const { devices, error: devicesError } = await enumerateDevices()
  if (devicesError) return handleError(devicesError)

  let constraints
  if (devices.some((device) => device.kind === 'audioinput')) {
    constraints = { audio: DEFAULT_AUDIO_CONSTRAINTS }
  }
  if (devices.some((device) => device.kind === 'videoinput')) {
    constraints = { ...constraints, video: DEFAULT_VIDEO_CONSTRAINTS }
  }
  if (!constraints) {
    return handleError('User has no devices to capture.')
  }

  const { stream, tracks, error: mediaError } = await getUserMedia(constraints)
  if (mediaError) return handleError(mediaError)
  console.log('@stream', stream)

  streamReceiver.srcObject = stream

  const [firstTrack] = tracks
  console.log('@first track', firstTrack)

  const trackCapabilities = firstTrack.getCapabilities()
  const trackConstraints = firstTrack.getConstraints()
  const trackSettings = firstTrack.getSettings()

  logBox.textContent = stringify({
    trackCapabilities,
    trackConstraints,
    trackSettings
  })
}
```

Пример _захваченного потока и первого трека_:

<img src="https://habrastorage.org/webt/kp/l7/dw/kpl7dwiw4hpw5bosgg-y0c1mfye.png" />
<br />

Пример _информации о треке_:

<img src="https://habrastorage.org/webt/nz/fb/ot/nzfbotkrlsf01w7d_b2y4psldng.png" />
<br />

## 4. Как захватить поток с экрана пользователя?

Для захвата потока с экрана пользователя предназначен метод _getDisplayMedia_:

```javascript
const stream = await navigator.mediaDevices.getDisplayMedia(constraints?)
```

- [Спецификация - алгоритм](https://w3c.github.io/mediacapture-screen-share/#dom-mediadevices-getdisplaymedia)
- [MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia)

В целом, данный метод аналогичен методу _getUserMedia_, но поддерживает несколько дополнительных требований к потоку:

- [Спецификация](https://w3c.github.io/mediacapture-screen-share/#webidl-210984315)
- [MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia#parameters)

Пример _дополнительных требований_:

```javascript
export const ADDITIONAL_VIDEO_CONSTRAINTS = {
  displaySurface: 'window',
  cursor: 'motion'
}
```

_Обратите внимание_: на сегодняшний день аудио при захвате экрана не поддерживается.

_Функция для захвата экрана_:

```javascript
// поток должен быть одиночкой
let displayStream

export async function getDisplayMedia(
  constraints = {
    video: { ...DEFAULT_VIDEO_CONSTRAINTS, ...ADDITIONAL_VIDEO_CONSTRAINTS }
  }
) {
  try {
    const stream = displayStream
      ? displayStream
      : (displayStream = await navigator.mediaDevices.getDisplayMedia(constraints))

    const [tracks, audioTracks, videoTracks] = [
      stream.getTracks(),
      stream.getAudioTracks(),
      stream.getVideoTracks()
    ]

    return { stream, tracks, audioTracks, videoTracks }
  } catch (error) {
    return { error }
  }
}
```

Соответствующий _обработчик_:

```javascript
// <button id="getDisplayMediaBtn">Get display media</button>
getDisplayMediaBtn.onclick = async () => {
  const { stream, tracks, error } = await getDisplayMedia()
  if (error) return handleError(error)
  console.log('@display stream', stream)

  streamReceiver.srcObject = stream

  const [firstTrack] = tracks
  console.log('@display first track', firstTrack)

  const [trackCapabilities, trackConstraints, trackSettings] = [
    firstTrack.getCapabilities(),
    firstTrack.getConstraints(),
    firstTrack.getSettings()
  ]

  logBox.textContent = stringify({
    trackCapabilities,
    trackConstraints,
    trackSettings
  })
}
```

Пример _захваченного потока и первого трека_:

<img src="https://habrastorage.org/webt/6u/ub/cv/6uubcvtdnlzy0xo9ke5qhju5o8s.png" />
<br />

Пример _информации о треке_:

<img src="https://habrastorage.org/webt/hv/aw/1n/hvaw1nrxikc-ndyrhyz0495ho6e.png" />
<br />

## 5. Как захватить поток из DOM-элемента?

Для захвата потока из таких DOM-элементов, как _audio_, _video_ и _canvas_ используется метод _captureStream_ интерфейса _HTMLMediaElement_ или, соответственно, _HTMLCanvasElement_:

```javascript
const stream = await mediaElement.captureStream()
```

- [Спецификация](https://www.w3.org/TR/mediacapture-fromelement/#dom-htmlmediaelement-capturestream)
- [MDN - HTMLMediaElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/captureStream)
- [MDN - HTMLCanvasElement](https://developer.mozilla.org/ru/docs/Web/API/HTMLCanvasElement/captureStream)

При захвате потока из медиаэлемента имеет смысл проверять, во-первых, что переданный аргумент является медиаэлементом, во-вторых, готовность медиа к воспроизведению до конца без прерываний с помощью свойства [readyState](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState):

```javascript
if (!(mediaElement instanceof HTMLMediaElement)) {
  throw new Error('Argument must be an instance of HTMLMediaElement.')
}
if (mediaElement.readyState !== 4) {
  throw new Error(
    'Media element has not enough data to be played through the end without interruption.'
  )
}
```

В случае с DOM-элементами может одновременно захватываться несколько потоков.

_Функция для захвата потока из медиаэлемента_:

```javascript
let mediaElementStreams = []

export async function captureStreamFromMediaElement(mediaElement) {
  if (!(mediaElement instanceof HTMLMediaElement)) {
    throw new Error('Argument must be an instance of HTMLMediaElement.')
  }
  if (mediaElement.readyState !== 4) {
    throw new Error(
      'Media element has not enough data to be played through the end without interruption.'
    )
  }
  try {
    const stream = await mediaElement.captureStream()
    mediaElementStreams.push(stream)

    const [tracks, audioTracks, videoTracks] = [
      stream.getTracks(),
      stream.getAudioTracks(),
      stream.getVideoTracks()
    ]

    return { stream, tracks, audioTracks, videoTracks }
  } catch (error) {
    return { error }
  }
}
```

Соответствующий _обработчик_:

```javascript
// <button id="getStreamFromMediaElementBtn">Get stream from media element</button>
getStreamFromMediaElementBtn.onclick = async () => {
  // <video id="videoEl" src="./assets/forest.mp4" controls></video>
  const { stream, tracks, error } = await captureStreamFromMediaElement(videoEl)
  if (error) return handleError(error)
  console.log('@media element stream', stream)

  streamReceiver.srcObject = stream

  const [firstTrack] = tracks
  console.log('@media element first track', firstTrack)

  const [trackCapabilities, trackConstraints, trackSettings] = [
    firstTrack.getCapabilities(),
    firstTrack.getConstraints(),
    firstTrack.getSettings()
  ]

  logBox.textContent = stringify({
    trackCapabilities,
    trackConstraints,
    trackSettings
  })
}
```

Пример _захваченного потока и первого трека_:

<img src="https://habrastorage.org/webt/zk/7f/w9/zk7fw9cczceej78p4tbrq_tnjaa.png" />
<br />

Пример _информации о треке_:

<img src="https://habrastorage.org/webt/xe/tt/wl/xettwlikawowe5jbsp36ajlg85e.png" />
<br />

## 6. Как остановить захват потока?

Для остановки захвата потока необходимо прекратить получение данных из каждого его источника, т.е. трека. Для этого следует вызвать метод _stop_ каждого трека:

```javascript
export function stopTracks() {
  mediaStream?.getTracks().forEach((track) => {
    track.stop()
  })
  displayStream?.getTracks().forEach((track) => {
    track.stop()
  })
  for (const stream of mediaElementStreams) {
    stream?.getTracks().forEach((track) => {
      track.stop()
    })
  }
  mediaStream = null
  displayStream = null
  mediaElementStreams = []
}
```

## 7. Как захватить изображение из видеотрека?

Для захвата изображения из видеотрека (или кадра из холста) предназначен метод _takePhoto_ интерфейса _ImageCapture_:

```javascript
const imageCapture = new ImageCapture(videoTrack)
const blob = await imageCapture.takePhoto(photoSettings?)
```

- [Спецификация - интерфейс ImageCapture](https://www.w3.org/TR/image-capture/#imagecaptureapi)
- [Спецификация - метод takePhoto](https://www.w3.org/TR/image-capture/#dom-imagecapture-takephoto)
- [MDN](https://developer.mozilla.org/en-US/docs/Web/API/ImageCapture)

Данный метод принимает опциональные _настройки для фото_:

- [Спецификация](https://www.w3.org/TR/image-capture/#dictdef-photosettings)
- [MDN](https://developer.mozilla.org/en-US/docs/Web/API/ImageCapture/takePhoto#parameters)

Пример _настроек для фото_:

```javascript
export const DEFAULT_PHOTO_SETTINGS = {
  imageHeight: 480,
  imageWidth: 640
}
```

К видеотреку можно применять дополнительные требования, связанные с захватом изображения:

- [Спецификация](https://www.w3.org/TR/image-capture/#mediatracksupportedconstraints-section)

Эти требования являются продвинутыми и применяются с помощью метода _applyConstraints_:

```javascript
const advancedConstraints = {
  name: value
}
await videoTrack.applyConstraints({
  advanced: [advancedConstraints]
})
```

Для того, чтобы иметь возможность применять к видеотреку некоторые продвинутые требования при захвате потока с устройств пользователя к потоку должны применяться следующие требования:

```javascript
// эти требования относятся к видео
export const DEFAULT_PHOTO_CONSTRAINTS = {
  pan: true,
  tilt: true,
  zoom: true
}
```

Метод _takePhoto_ возвращает объект _Blob_:

- [Спецификация](https://w3c.github.io/FileAPI/#dfn-Blob)
- [MDN](https://developer.mozilla.org/ru/docs/Web/API/Blob)

Экземпляр _ImageCapture_ предоставляет следующие _методы для получения списка возможностей и настроек для фото_:

- _getPhotoCapabilities_ - возвращает список возможностей для фото;
- _getPhotoSettings_ - возвращает список настроек для фото.

_Функция для получения возможностей и настроек для фото_:

```javascript
export async function getPhotoCapabilitiesAndSettings(videoTrack) {
  const imageCapture = new ImageCapture(videoTrack)
  console.log('@image capture', imageCapture)

  try {
    const [photoCapabilities, photoSettings] = await Promise.all([
      imageCapture.getPhotoCapabilities(),
      imageCapture.getPhotoSettings()
    ])

    return { photoCapabilities, photoSettings }
  } catch (error) {
    return { error }
  }
}
```

Соответствующий _обработчик_:

```javascript
// <button id="getPhotoCapabilitiesAndSettingsBtn">Get photo capabilities and settings</button>
getPhotoCapabilitiesAndSettingsBtn.onclick = async () => {
  const { videoTracks, error: mediaError } = await getUserMedia()
  if (mediaError) return handleError(mediaError)

  const [firstVideoTrack] = videoTracks

  const {
    photoCapabilities,
    photoSettings,
    error: photoError
  } = await getPhotoCapabilitiesAndSettings(firstVideoTrack)
  if (photoError) return handleError(photoError)

  logBox.textContent = stringify({
    photoCapabilities,
    photoSettings
  })
}
```

Пример _возможностей и настроек для фото_:

<img src="https://habrastorage.org/webt/g3/ot/b5/g3otb5flov6foc18vsfkb3nyaow.png" />
<br />

_Функция для захвата изображения из видеотрека_:

```javascript
export async function takePhoto({
  videoTrack,
  photoSettings = DEFAULT_PHOTO_SETTINGS
}) {
  const imageCapture = new ImageCapture(videoTrack)

  try {
    const blob = await imageCapture.takePhoto(photoSettings)
    return { blob }
  } catch (error) {
    return { error }
  }
}
```

Соответствующий _обработчик_:

```javascript
// <button id="takePhotoBtn">Take photo</button>
takePhotoBtn.onclick = async () => {
  const { videoTracks, error: mediaError } = await getUserMedia({
    video: { ...DEFAULT_VIDEO_CONSTRAINTS, ...DEFAULT_PHOTO_CONSTRAINTS }
  })
  if (mediaError) return handleError(mediaError)

  const [videoTrack] = videoTracks

  // здесь мы можем применять к треку дополнительные требования
  // await videoTrack.applyConstraints({
  //   advanced: [advancedConstraints]
  // })

  const { blob, error: photoError } = await takePhoto({ videoTrack })
  if (photoError) return handleError(photoError)

  // <img id="imgBox" alt="" />
  const imgSrc = URL.createObjectURL(blob)
  imgBox.src = imgSrc
  // imgBox.addEventListener(
  //   'load',
  //   () => {
  //     URL.revokeObjectURL(imgSrc)
  //   },
  //   { once: true }
  // )
}
```

Ссылка на источник изображения формируется с помощью метода _URL.createObjectURL_. Метод _URL.revokeObjectURL_ должен вызываться во избежание утечек памяти, но при его вызове после загрузки изображения, как в приведенном примере, изображение невозможно будет скачать.

- [Спецификация](https://w3c.github.io/FileAPI/#creating-revoking)
- [MDN - метод createObjectURL](https://developer.mozilla.org/ru/docs/Web/API/URL/createObjectURL)
- [MDN - метод revokeObjectURL](https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL)

## 8. Как записать поток?

Для записи потока предназначен интерфейс _MediaRecorder_:

- [Спецификация](https://www.w3.org/TR/mediastream-recording/#mediarecorder-api)
- [MDN](https://developer.mozilla.org/ru/docs/Web/API/MediaRecorder)

```javascript
const mediaRecorder = new MediaRecorder(mediaStream, options?)
```

Конструктор _MediaRecorder_ принимает поток и опциональный объект с настройками, наиболее важной из которых является настройка _mimeType_ - тип создаваемой записи.

Экземпляр _MediaRecorder_ предоставляет следующие _методы для управления записью_:

- _start(timeslice?)_ - запускает запись. Данный метод принимает опциональный параметр _timeslice_ - время вызова события _dataavailable_ (см. ниже);
- _pause_ - приостанавливает запись;
- _resume_ - продолжает запись;
- _stop_ - останавливает запись.

В процессе записи возникает ряд событий, наиболее важным из которых является _dataavailable_. Обработчик этого события принимает объект, содержащий свойство _data_, в котором находятся части (chunks) записанных данных в виде _Blob_:

```javascript
let mediaDataChunks = []

mediaRecorder.ondatavailable = ({ data }) => {
  mediaDataChunks.push(data)
}
```

Интерфейс _MediaRecorder_ позволяет проверять поддержку типа создаваемой записи с помощью метода _isTypeSupported_.

Предположим, что мы хотим записать экран пользователя со звуком. Поток экрана будет содержать только видео. Поэтому нам необходимо получить видеотреки экрана и аудиотреки микрофона и объединить их в один поток. Это можно сделать при помощи конструктора _MediaStream_:

```javascript
export const createNewStream = (tracks) => new MediaStream(tracks)
```

Данный конструктор принимает треки в виде массива.

_Функция для начала записи_:

```javascript
const DEFAULT_RECORD_MIME_TYPE = 'video/webm'
const DEFAULT_RECORD_TIMESLICE = 250

// лучше, чтобы `mediaRecorder` был одиночкой
let mediaRecorder
let mediaDataChunks = []

export async function startRecording({
  mediaStream,
  mimeType,
  timeslice = DEFAULT_RECORD_TIMESLICE,
  ...restOptions
}) {
  if (mediaRecorder) return

  mediaRecorder = new MediaRecorder(mediaStream, {
    mimeType: MediaRecorder.isTypeSupported(mimeType)
      ? mimeType
      : DEFAULT_RECORD_MIME_TYPE,
    ...restOptions
  })
  console.log('@media recorder', mediaRecorder)

  mediaRecorder.onerror = ({ error }) => {
    return error
  }

  mediaRecorder.ondataavailable = ({ data }) => {
    mediaDataChunks.push(data)
  }

  mediaRecorder.start(timeslice)
}
```

Соответствующий _обработчик_:

```javascript
// <button id="startRecordingBtn">Start recording</button>
startRecordingBtn.onclick = async () => {
  const { devices, error: devicesError } = await enumerateDevices()
  if (devicesError) return handleError(devicesError)

  // мы готовы записывать экран без звука
  let _audioTracks = []
  if (devices.some(({ kind }) => kind === 'audioinput')) {
    const { audioTracks, error: mediaError } = await getUserMedia()
    if (mediaError) return handleError(mediaError)

    _audioTracks = audioTracks
  }

  const { videoTracks, error: displayError } = await getDisplayMedia()
  if (displayError) return handleError(displayError)

  const mediaStream = createNewStream([..._audioTracks, ...videoTracks])
  streamReceiver.srcObject = mediaStream

  // ждем возможную ошибку
  const recordError = await startRecording({ mediaStream })
  if (recordError) return handleError(recordError)
}
```

Пример _"записывателя"_:

<img src="https://habrastorage.org/webt/2c/dm/2z/2cdm2zappjrisbjl-j-9wypkwnw.png" />
<br />

_Функция приостановки/продолжения записи_:

```javascript
// в таких случаях удобно использовать `IIFE` и замыкание
export const pauseOrResumeRecording = (function () {
  let paused = false

  return function () {
    if (!mediaRecorder) return

    paused ? mediaRecorder.resume() : mediaRecorder.pause()
    paused = !paused

    return paused
  }
})()
```

_Обработчик_:

```javascript
// <button id="pauseOrResumeRecordingBtn">Pause/Resume recording</button>
pauseOrResumeRecordingBtn.onclick = () => {
  const paused = pauseOrResumeRecording()
  console.log('@recording paused', paused)
}
```

_Функция остановки записи_:

```javascript
export function stopRecording() {
  if (!mediaRecorder) return

  mediaRecorder.stop()

  const _mediaDataChunks = mediaDataChunks
  console.log('@media data chunks', _mediaDataChunks)

  // очитка
  // Явное удаление обработчика события `dataavailable`
  // обеспечивает возможность повторной записи
  mediaRecorder.ondataavailable = null
  mediaRecorder = null
  mediaDataChunks = []

  return _mediaDataChunks
}
```

_Обработчик_:

```javascript
// <button id="stopRecordingBtn">Stop recording</button>
stopRecordingBtn.onclick = () => {
  const chunks = stopRecording()

  const blob = new Blob(chunks, {
    type: DEFAULT_RECORD_MIME_TYPE
  })

  // если необходимо создать файл, например, для передачи на сервер
  // https://w3c.github.io/FileAPI/#file-section
  // const file = new File(
  //   chunks,
  //   `new-record-${Date.now()}.${DEFAULT_RECORD_MIME_TYPE.split('/').at(-1)}`,
  //   {
  //     type: DEFAULT_RECORD_MIME_TYPE
  //   }
  // )

  // <video id="recordBox" controls></video>
  recordBox.src = URL.createObjectURL(blob)
  // в данном случае проблем со скачиванием файла не возникает
  URL.revokeObjectURL(blob)

  stopTracks()
}
```

Пример _частей данных_:

<img src="https://habrastorage.org/webt/3q/qb/nc/3qqbncxvaindynv4hlwmwz6gmrg.png" />
<br />

## 9. Как преобразовать текст в речь?

- [Туториал по Web Speech API](https://my-js.org/docs/cheatsheet/web-speech)

Для преобразования текста в речь предназначен интерфейс _SpeechSynthesis_:

- [Спецификация](https://wicg.github.io/speech-api/#tts-section)
- [MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)

Данный интерфейс является свойством глобального объекта _window_ (_window.speechSynthesis_).

Для озвучивания текста применяются голоса (voices), доступные в браузере. Для получения их списка используется метод _getVoices_:

```javascript
const voices = speechSynthesis.getVoices()
```

Этот метод на сегодняшний день работает не совсем обычно. При первом озвучивании его приходится вызывать дважды, повторно запрашивая список голосов в обработчике события _voicechanged_:

```javascript
let voices = speechSynthesis.getVoices()

speechSynthesis.onvoiceschanged = () => {
  voices = speechSynthesis.getVoices()
}
```

_speechSynthesis_ предоставляет следующие _методы для озвучивания текста_:

- _start(utterance)_ - запуск озвучивания;
- _pause_ - приостановка озвучивания;
- _resume_ - продолжение озвучивания;
- _cancel_ - отмена (остановка) озвучивания.

Метод _start_ принимает экземпляр _SpeechSynthesisUtterance_:

```javascript
const utterance = new SpeechSynthesisUtterance(text?)
```

- [Спецификация](https://wicg.github.io/speech-api/#speechsynthesisutterance)
- [MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance)

Данный конструктор принимает опциональный _текст для озвучивания_.

_utterance_ имеет несколько _сеттеров для настройки озвучивания_:

- _text_ - текст для озвучивания;
- _lang_ - язык озвучивания;
- _voice_ - голос для озвучивания и др.

Предположим, что у нас имеется такой текст:

```html
<textarea id="textToSpeech" rows="4">
Мы — источник веселья и скорби рудник.
Мы — вместилище скверны и чистый родник.
Человек, словно в зеркале мир, — многолик.
Он ничтожен — и он же безмерно велик!
</textarea>
```

_Функция для озвучивания этого текста голосом от Google_:

```javascript
// голос для озвучивания
let voiceFromGoogle
// индикатор начала озвучивания
let speakingStarted

export function startSpeechSynthesis() {
  if (voiceFromGoogle) return speak()

  speechSynthesis.getVoices()

  speechSynthesis.onvoiceschanged = () => {
    const voices = speechSynthesis.getVoices()
    console.log('@voices', voices)

    voiceFromGoogle = voices.find((voice) => voice.name === 'Google русский')

    speak()
  }
}

function speak() {
  const trimmedText = textToSpeech.value.trim()
  if (!trimmedText) return

  const utterance = new SpeechSynthesisUtterance(trimmedText)
  utterance.lang = 'ru-RU'
  utterance.voice = voiceFromGoogle
  console.log('@utterance', utterance)

  speechSynthesis.speak(utterance)
  speakingStarted = true

  utterance.onend = () => {
    speakingStarted = false
  }
}
```

Соответствующий _обработчик_:

```javascript
// <button id="startSpeechSynthesisBtn">Start speech synthesis</button>
startSpeechSynthesisBtn.onclick = () => {
  startSpeechSynthesis()
}
```

Пример _списка голосов_:

<img src="https://habrastorage.org/webt/h9/wq/q3/h9wqq3znyo2yulaunmmcq55vf-u.png" />
<br />

Пример _"высказывания"_:

<img src="https://habrastorage.org/webt/ra/lc/vh/ralcvh5hdoh5bcjtlh6n3alf2ym.png" />
<br />

_Функция для приостановки/продолжения озвучивания_:

```javascript
// индикатор озвучивания `speechSynthesis.speaking` в настоящее время работает некорректно
export const pauseOrResumeSpeaking = (function () {
  let paused = false

  return function () {
    if (!speakingStarted) return

    paused ? speechSynthesis.resume() : speechSynthesis.pause()
    paused = !paused

    return paused
  }
})()
```

_Обработчик_:

```javascript
// <button id="pauseOrResumeSpeakingBtn">Pause/resume speaking</button>
pauseOrResumeSpeakingBtn.onclick = () => {
  const paused = pauseOrResumeSpeaking()
  console.log('@speaking paused', paused)
}
```

_Функция для остановки озвучивания_:

```javascript
export function stopSpeaking() {
  speechSynthesis.cancel()
}
```

_Обработчик_:

```javascript
// <button id="stopSpeakingBtn">Stop speaking</button>
stopSpeakingBtn.onclick = () => {
  stopSpeaking()
}
```

## 10. Как преобразовать речь в текст?

Для преобразования речи в текст предназначен интерфейс _SpeechRecognition_:

```javascript
// рекомендованный подход
const speechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition
const recognition = new speechRecognition()
```

- [Спецификация](https://wicg.github.io/speech-api/#speechreco-section)
- [MDN](https://developer.mozilla.org/ru/docs/Web/API/SpeechRecognition)

_recognition_ имеет несколько _сеттеров для настройки распознавания речи_:

- _lang_ - язык для распознавания;
- _continuous_ - определяет, продолжается ли распознавание после получения первого "финального" результата;
- _interimResults_ - определяет, обрабатываются ли "промежуточные" результаты распознавания;
- _maxAlternatives_ - определяет максимальное количество вариантов распознанного слова, возвращаемых браузером. Варианты возвращаются в виде массива, первым элементом которого является наиболее подходящее с точки зрения браузера слово.

_Методы для управления распознаванием_, предоставляемые _recognition_:

- _start_ - запуск распознавания;
- _stop_ - остановка распознавания;
- _abort_ - прекращение распознавания.

При распознавании речи браузером происходит следующее:

- при вызове метода _start_ браузер начинает нас "слушать";
- каждое сказанное слово регистрируется как отдельная сущность - массив, содержащий несколько (в зависимости от настройки _maxAlternatives_) вариантов этого слова;
- регистрация слова приводит к возникновению события _result_;
- регистрируемые сущности являются промежуточными (interim) результатами распознавания;
- по истечении некоторого времени (определяемого браузером) после того, как мы замолчали, промежуточный результат переводится в статус финального (final);
- снова возникает событие _result_: значением свойства _isFinal_ результата является _true_;
- после регистрации финального результата возникает событие _end_;
- если настройка _continuous_ имеет значение _false_, распознавание завершится после регистрации первого слова;
- если настройка _interimResults_ имеет значение _false_, результаты будут сразу регистрироваться как финальные;
- событие _result_ имеет свойство _resultIndex_, значением которого является индекс последнего обработанного результата.

_Обратите внимание_: браузер не умеет работать с пунктуацией: он понимает слова, но не знаки препинания. Также _обратите внимание_, что выполняемое браузером редактирование результатов распознавания является минимальным и почти всегда оказывается недостаточным.

Предположим, что у нас имеется инпут для промежуточных результатов и текстовый блок для финальных результатов распознавания речи:

```html
<div class="speech-to-text-wrapper">
  <input type="text" id="interimTranscriptBox" />
  <textarea id="finalTranscriptBox" rows="4"></textarea>
</div>
```

Для решения проблемы, связанной с пунктуацией, нам потребуется такой словарь:

```javascript
const DICTIONARY = {
  точка: '.',
  запятая: ',',
  вопрос: '?',
  восклицание: '!',
  двоеточие: ':',
  тире: '-',
  абзац: '\n',
  отступ: '\t'
}
```

А для решения проблемы, связанной с редактированием, такие функции:

```javascript
// заменяем слова на знаки препинания
const editInterim = (s) => s
  .split(' ')
  .map((word) => {
    word = word.trim()
    return DICTIONARY[word.toLowerCase()]
      ? DICTIONARY[word.toLowerCase()]
      : word
  })
  .join(' ')

// удаляем лишние пробелы
const editFinal = (s) => s.replace(/\s{1,}([\.+,?!:-])/g, '$1')
```

_Функция для распознавания речи_:

```javascript
// экземпляр "распознавателя"
let recognition
// индикатор начала распознавания
let recognitionStarted
// финальный результат
let finalTranscript

// функция очистки
function resetRecognition() {
  recognition = null
  recognitionStarted = false
  finalTranscript = ''
  interimTranscriptBox.value = ''
  finalTranscriptBox.value = ''
}

export function startSpeechRecognition() {
  resetRecognition()

  recognition = new speechRecognition()
  // настройки распознавания
  recognition.continuous = true
  recognition.interimResults = true
  recognition.maxAlternatives = 3
  recognition.lang = 'ru-RU'
  console.log('@recognition', recognition)

  recognition.start()
  recognitionStarted = true

  recognition.onend = () => {
    // Повторно запускаем распознавание, если
    // соответствующий индикатор имеет значение `true`
    if (!recognitionStarted) return
    recognition.start()
  }

  recognition.onresult = (e) => {
    // Промежуточные результаты обновляются на каждом цикле распознавания
    let interimTranscript = ''
    // Перебираем результаты с того места, на котором остановились в прошлый раз
    for (let i = e.resultIndex; i < e.results.length; i++) {
      // Атрибут `isFinal` является индикатором того, что речь закончилась (мы перестали говорить)
      if (e.results[i].isFinal) {
        // Редактируем промежуточный результат
        const interimResult = editInterim(e.results[i][0].transcript)
        // и добавляем его к финальному
        finalTranscript += interimResult
      } else {
        // В противном случае, записываем распознанное слово в промежуточный результат
        interimTranscript += e.results[i][0].transcript
      }
    }
    // Записываем промежуточный результат в `input`
    interimTranscriptBox.value = interimTranscript
    // Редактируем финальный результат
    finalTranscript = editFinal(finalTranscript)
    // и записываем его в `textarea`
    finalTranscriptBox.value = finalTranscript
  }
}
```

Соответствующий _обработчик_:

```javascript
// <button id="startSpeechRecognitionBtn">Start speech synthesis</button>
startSpeechRecognitionBtn.onclick = () => {
  startSpeechRecognition()
}
```

Пример _"распознавателя"_:

<img src="https://habrastorage.org/webt/jb/9g/tj/jb9gtj-fiphwmnjgnunyih-orx4.png" />
<br />

_Функция остановки распознавания_:

```javascript
export function stopRecognition() {
  if (!recognition) return
  recognition.stop()
  recognitionStarted = false
}
```

_Обработчик_:

```javascript
// <button id="stopRecognitionBtn">Stop recognition</button>
stopRecognitionBtn.onclick = () => {
  stopRecognition()
}
```

_Функция прекращения распознавания_:

```javascript
export function abortRecognition() {
  if (!recognition) return
  recognition.abort()
  resetRecognition()
}
```

_Обработчик_:

```javascript
// <button id="abortRecognitionBtn">Abort recognition</button>
abortRecognitionBtn.onclick = () => {
  abortRecognition()
}
```

## 11. Как определить поддержку возможностей по работе с медиа браузером?

_Функция для определения возможностей браузера по работе с медиа_, рассмотренных в данной шпаргалке:

```javascript
export function verifySupport() {
  const unsupportedFeatures = []

  if (!('mediaDevices' in navigator)) {
    unsupportedFeatures.push('mediaDevices')
  }

  if (
    !('captureStream' in HTMLAudioElement.prototype) &&
    !('mozCaptureStream' in HTMLAudioElement.prototype)
  ) {
    unsupportedFeatures.push('captureStream')
  }

  ;['MediaStream', 'MediaRecorder', 'Blob', 'File', 'ImageCapture', 'speechSynthesis'].forEach(
    (f) => {
      if (!(f in window)) {
        unsupportedFeatures.push(f)
      }
    }
  )

  if (
    !('SpeechRecognition' in window) &&
    !('webkitSpeechRecognition' in window)
  ) {
    unsupportedFeatures.push('SpeechRecognition')
  }

  return unsupportedFeatures
}
```

Пример использования этой функции:

```javascript
const unsupportedFeatures = verifySupport()
if (unsupportedFeatures.length) {
  console.error(unsupportedFeatures)
}
```

Таким образом, мы рассмотрели все основные интерфейсы и методы по работе с медиа, описываемые в указанных в начале шпаргалки спецификациях.

Следует отметить, что существует еще два интерфейса, предоставляемых браузером для работы с медиа, которые мы оставили без внимания в силу их сложности и специфичности:

- [Web Audio API](https://www.w3.org/TR/webaudio/)
- [WebRTC 1.0: Real-Time Communication Between Browsers](https://w3c.github.io/webrtc-pc/)

Что касается последнего, вот парочка материалов, с которых можно начать изучение данного интерфейса:

- [WebRTC для всех и каждого](https://my-js.org/docs/guide/webrtc)
- [React: WebRTC Media Call](https://habr.com/ru/company/timeweb/blog/649369/)
