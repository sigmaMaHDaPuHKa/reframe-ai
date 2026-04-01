# reframe.ai

Нейросеть ESRGAN для восстановления качества видео после агрессивного сжатия HEVC (H.265).

**Сайт:** https://sigmamahdapuhka.github.io/reframe-ai/

## Что это

Видео сжимается кодеком HEVC в 6 раз (12.4 MB -> 2.1 MB). При таком сжатии появляются артефакты: блочность, потеря текстур, banding. Нейросеть ESRGAN (RRDB-Net, 868 KB) восстанавливает качество прямо в браузере через TensorFlow.js + WebGL. Сервер не нужен.

**VMAF:** 45 (без AI) -> 94 (с ESRGAN) при том же размере файла.

## Демо

- **Blind Test** — 5 раундов, угадай где нейросеть
- **Drag-сравнение** — ползунок между 200 kbps и AI-версией
- **Восстановление** — crossfade от 150 kbps к AI
- **Битрейт vs VMAF** — слайдер с метриками
- **ESRGAN Lab** — live inference в браузере

## Стек

- Frontend: HTML, JavaScript, Tailwind CSS, Canvas API
- AI: TensorFlow.js, WebGL 2.0, ESRGAN RRDB-Net
- Видео: FFmpeg, libx264 (H.264)
- Обучение: Python, PyTorch

## Запуск локально

```bash
python -m http.server 8080
# Открыть http://localhost:8080
```

## Авторы

- Коковкин Лев (11Л)
- Лаврентьев Владислав (11Л)
- Ткаченко Арэс (11З)

Руководитель: Хасанова А.М., НИЯУ МИФИ
Университетский лицей №1511 Предуниверситария НИЯУ МИФИ, 2025
