# Подготовка видео для ReframeAI

Сейчас проект работает в **demo-режиме** (canvas-анимации).
Чтобы заменить на реальные видео — следуй инструкции.

---

## Шаг 1: Найди исходное видео

Требования:
- 5-10 секунд
- Красивое (природа, город, люди)
- Разрешение 720p или 1080p
- Формат: MP4

Бесплатные источники:
- https://www.pexels.com/videos/
- https://pixabay.com/videos/

---

## Шаг 2: Создай версии через FFmpeg

```bash
# Установи FFmpeg: https://ffmpeg.org/download.html

# Исходник назови original.mp4

# "Плохое" видео (150 kbps — каша)
ffmpeg -i original.mp4 -c:v libx265 -b:v 150k -preset slow -an -t 8 assets/videos/bad.mp4

# "Нормальное" сжатие (1500 kbps)
ffmpeg -i original.mp4 -c:v libx265 -b:v 1500k -preset slow -an -t 8 assets/videos/normal.mp4

# "Хорошее" видео (высокий битрейт — как AI-результат)
ffmpeg -i original.mp4 -c:v libx265 -b:v 5000k -preset slow -an -t 8 assets/videos/good.mp4

# "AI" версия (то же что good — имитация)
cp assets/videos/good.mp4 assets/videos/ai.mp4
```

---

## Шаг 3 (опционально): Реальный AI-апскейл

Если хочешь настоящий AI-результат:

### Вариант А: Real-ESRGAN (локально)
```bash
# Скачай: https://github.com/xinntao/Real-ESRGAN/releases
# Файл: realesrgan-ncnn-vulkan-v0.2.5-windows.zip

realesrgan-ncnn-vulkan.exe -i bad.mp4 -o ai.mp4 -n realesrgan-x4plus
```

### Вариант Б: Replicate.com (онлайн, бесплатно)
1. Зайди на https://replicate.com/xinntao/realesrgan
2. Загрузи кадр из bad.mp4
3. Скачай результат

---

## Шаг 4: Переключи проект на реальные видео

В `js/app.js` замени canvas на video теги.
Или просто положи файлы в `assets/videos/` — canvas demo используется как fallback.

Нужные файлы:
```
assets/videos/
├── bad.mp4      (150 kbps — для "восстановления")
├── normal.mp4   (1500 kbps — обычное сжатие)
├── good.mp4     (5000 kbps — хорошее качество)
└── ai.mp4       (AI-enhanced или копия good)
```
