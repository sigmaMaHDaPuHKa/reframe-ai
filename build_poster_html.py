"""Build poster_print.html with embedded QR codes"""
import qrcode, base64, io

def qr_b64(data):
    qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=20, border=2)
    qr.add_data(data); qr.make(fit=True)
    img = qr.make_image(fill_color='black', back_color='white')
    buf = io.BytesIO(); img.save(buf, format='PNG')
    return base64.b64encode(buf.getvalue()).decode()

qr1 = qr_b64('http://localhost:8080')
qr2 = qr_b64('https://github.com')

footer = f'''<div class="footer">
<div>
<strong style="font-family:'JetBrains Mono',monospace;font-size:22pt;">reframe.ai</strong><br>
<span style="font-size:14pt;opacity:0.85;">Blind test &middot; Drag-сравнение &middot; Live ESRGAN &middot; Бенчмарки</span>
</div>
<div class="qr-block">
<div class="qr-item"><img src="data:image/png;base64,{qr1}" alt="QR"><p>Демо-сайт</p></div>
<div class="qr-item"><img src="data:image/png;base64,{qr2}" alt="QR"><p>GitHub</p></div>
</div>
<div style="text-align:right;">
<strong style="font-size:16pt;">Университетский лицей &numero; 1511</strong><br>
<span style="font-size:14pt;opacity:0.8;">НИЯУ МИФИ &middot; 2025</span>
</div>
</div>'''

body = '''<div class="header"><div>
<h1>Использование нейросетей для уменьшения<br>битрейта при кодировании HEVC</h1>
<div class="meta">Коковкин Лев (11Л), Лаврентьев Владислав (11Л), Ткаченко Арэс (11З) | Руководитель: Хасанова А.М., НИЯУ МИФИ</div>
</div><div class="right"><div class="org">Университетский лицей &#8470; 1511<br>Предуниверситария НИЯУ МИФИ</div><div class="sub">Москва &middot; 2025</div></div></div>

<div class="pipe">
<div class="pn"><div class="t">input.mp4</div><div class="d">H.264 / raw<br>5000 kbps, 12.4 MB<br>VMAF: 100</div></div><div class="pa">&rarr;</div>
<div class="pn enc"><div class="t">HEVC encoder</div><div class="d">H.265, CRF 35<br>CTU 64&times;64<br>Сжатие ~6x</div></div><div class="pa">&rarr;</div>
<div class="pn comp"><div class="t">compressed</div><div class="d">300 kbps, 2.1 MB<br>Блочность, banding<br>VMAF: 45</div></div><div class="pa">&rarr;</div>
<div class="pn ai"><div class="t">ESRGAN</div><div class="d">RRDB-Net, 23 blocks<br>TensorFlow.js<br>WebGL / GPU</div></div><div class="pa">&rarr;</div>
<div class="pn out"><div class="t">output.mp4</div><div class="d">300 kbps, 2.1 MB<br>Детали восстановлены<br>VMAF: 94</div></div>
</div>

<div class="card"><div class="ch ch-red">Актуальность</div><div class="cb">Видеоконтент &mdash; более <strong>80% мирового трафика</strong> (Cisco, 2024). HEVC снижает битрейт на 50% vs H.264, но при агрессивном квантовании: <strong>макроблочность</strong> (CTU 64&times;64), <strong>потеря текстур</strong>, <strong>color banding</strong>, <strong>ringing</strong>. In-loop фильтры (Deblocking, SAO) частично компенсируют. Нейросетевые пост-фильтры на базе GAN восстанавливают до 90% потерянной информации. Классические алгоритмы HEVC близки к пределу &mdash; нейросети открывают новый потенциал.</div></div>

<div class="card"><div class="ch ch-blue">Цель и задачи</div><div class="cb"><strong>Цель:</strong> прототип системы HEVC + нейросеть, VMAF &gt; 90 при 6x сжатии.<br><br><strong>Задачи:</strong> изучить HEVC (CTU/CU/PU, DCT, квантование); проанализировать CNN in-loop, EDCNN, GAN; адаптировать ESRGAN; подготовить датасет (QP 25-45); реализовать inference в браузере (TF.js + WebGL); оценить PSNR/SSIM/VMAF; создать веб-интерфейс.<br><br><strong>Гипотеза:</strong> ESRGAN повысит VMAF на 30-50 пунктов при неизменном битрейте.</div></div>

<div class="card"><div class="ch ch-amber">Основы HEVC</div><div class="cb"><strong>HEVC</strong> (H.265, 2013): CTU 64&times;64 &rarr; CU &rarr; PU (quad-tree); intra (35 направлений); inter (1/4 px); DCT + квантование (QP); CABAC; Deblocking + SAO.<br><br><span class="flow-box">Вход</span><span class="flow-arrow">&rarr;</span><span class="flow-box">CTU</span><span class="flow-arrow">&rarr;</span><span class="flow-box">Предсказание</span><span class="flow-arrow">&rarr;</span><span class="flow-box">DCT</span><span class="flow-arrow">&rarr;</span><span class="flow-box" style="border-color:#CF222E;color:#CF222E;">Квант.</span><span class="flow-arrow">&rarr;</span><span class="flow-box">CABAC</span><span class="flow-arrow">&rarr;</span><span class="flow-box">SAO</span><span class="flow-arrow">&rarr;</span><span class="flow-box hl">ESRGAN</span><span class="flow-arrow">&rarr;</span><span class="flow-box" style="border-color:#1A7F37;color:#1A7F37;">Выход</span><br><br>Наш модуль &mdash; post-filter после SAO.</div></div>

<div class="card span2"><div class="ch ch-blue">Архитектура ESRGAN</div><div class="cb">
<strong style="color:#0969DA;">Generator:</strong> <span class="mono" style="font-size:13pt;">Input &rarr; Conv3x3(64ch) &rarr; [RRDB &times;23] &rarr; Conv3x3 &rarr; Upscale(&times;2) &rarr; Output</span><br>
<strong style="color:#9A6700;">Discriminator:</strong> <span class="mono" style="font-size:13pt;">Image &rarr; 8&times;Conv(stride 1,2) &rarr; Dense(100) &rarr; Sigmoid</span><br><br>
<div style="background:#F0E8FD;border:2px solid #8250DF;border-radius:6px;padding:8px 12px;margin:6px 0;font-family:\'JetBrains Mono\',monospace;font-size:13pt;text-align:center;">Input &rarr; DenseBlock&#8321; &rarr; DenseBlock&#8322; &rarr; DenseBlock&#8323; &rarr; <strong style="color:#8250DF;">&beta;&middot;Residual + Input</strong></div>
<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin:8px 0;">
<div style="background:#DEEFFF;border:2px solid #0969DA;border-radius:6px;padding:8px;text-align:center;"><div style="font-size:11pt;">perceptual</div><div style="font-family:\'JetBrains Mono\',monospace;font-size:14pt;font-weight:700;color:#0969DA;">L<sub>percept</sub></div><div style="font-size:10pt;">VGG-19</div></div>
<div style="background:#FEF3D7;border:2px solid #9A6700;border-radius:6px;padding:8px;text-align:center;"><div style="font-size:11pt;">adversarial</div><div style="font-family:\'JetBrains Mono\',monospace;font-size:14pt;font-weight:700;color:#9A6700;">0.005&middot;L<sub>adv</sub></div><div style="font-size:10pt;">rel. GAN</div></div>
<div style="background:#DCF5E4;border:2px solid #1A7F37;border-radius:6px;padding:8px;text-align:center;"><div style="font-size:11pt;">pixel</div><div style="font-family:\'JetBrains Mono\',monospace;font-size:14pt;font-weight:700;color:#1A7F37;">0.01&middot;L<sub>pixel</sub></div><div style="font-size:10pt;">L1 loss</div></div>
</div>
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin:8px 0;">
<div style="background:#F6F8FA;border:1.5px solid #D0D7DE;border-radius:5px;padding:6px;text-align:center;"><div style="font-family:\'JetBrains Mono\',monospace;font-size:18pt;font-weight:700;color:#0969DA;">23</div><div style="font-size:11pt;">RRDB blocks</div></div>
<div style="background:#F6F8FA;border:1.5px solid #D0D7DE;border-radius:5px;padding:6px;text-align:center;"><div style="font-family:\'JetBrains Mono\',monospace;font-size:18pt;font-weight:700;color:#0969DA;">868 KB</div><div style="font-size:11pt;">FP16 weights</div></div>
<div style="background:#F6F8FA;border:1.5px solid #D0D7DE;border-radius:5px;padding:6px;text-align:center;"><div style="font-family:\'JetBrains Mono\',monospace;font-size:18pt;font-weight:700;color:#0969DA;">&times;2</div><div style="font-size:11pt;">scale</div></div>
<div style="background:#F6F8FA;border:1.5px solid #D0D7DE;border-radius:5px;padding:6px;text-align:center;"><div style="font-family:\'JetBrains Mono\',monospace;font-size:18pt;font-weight:700;color:#0969DA;">5-15s</div><div style="font-size:11pt;">per frame</div></div>
</div></div></div>

<div class="card"><div class="ch ch-purple">Метрики и бенчмарки</div><div class="cb">
<strong>VMAF</strong> (Netflix): VIF+DLM+motion, SVM.
<div class="vmaf-scale">
<div class="vmaf-seg" style="background:#FFEBE9;color:#CF222E;">0-40 непригодно</div>
<div class="vmaf-seg" style="background:#FEF3D7;color:#9A6700;">40-70 низкое</div>
<div class="vmaf-seg" style="background:#DCF5E4;color:#1A7F37;">70-90 хорошее</div>
<div class="vmaf-seg" style="background:#DEEFFF;color:#0969DA;">90-100 отличное</div>
</div>
<strong>PSNR</strong> &mdash; dB. <strong>SSIM</strong> &mdash; 0-1. <strong>No-ref:</strong> Laplacian, &sigma;, HF energy.<br>
<div style="margin:4mm 0;">
<div class="bar-row"><div class="bar-lbl">150 kbps</div><div class="bar-trk"><div class="bar-fill" style="width:32%;background:#CF222E;"></div></div><div class="bar-val" style="color:#CF222E;">32</div></div>
<div class="bar-row"><div class="bar-lbl">300 kbps</div><div class="bar-trk"><div class="bar-fill" style="width:48%;background:#9A6700;"></div></div><div class="bar-val" style="color:#9A6700;">48</div></div>
<div class="bar-row"><div class="bar-lbl">1000 kbps</div><div class="bar-trk"><div class="bar-fill" style="width:75%;background:#555;"></div></div><div class="bar-val" style="color:#555;">75</div></div>
<div class="bar-row"><div class="bar-lbl">300+AI</div><div class="bar-trk"><div class="bar-fill" style="width:85%;background:#0969DA;"></div></div><div class="bar-val" style="color:#0969DA;">85</div></div>
<div class="bar-row"><div class="bar-lbl">1000+AI</div><div class="bar-trk"><div class="bar-fill" style="width:93%;background:#1A7F37;"></div></div><div class="bar-val" style="color:#1A7F37;">93</div></div>
<div class="bar-row"><div class="bar-lbl">2000+AI</div><div class="bar-trk"><div class="bar-fill" style="width:96%;background:#1A7F37;"></div></div><div class="bar-val" style="color:#1A7F37;">96</div></div>
</div><strong>Среднее: VMAF +21.6, PSNR +2.4 dB.</strong></div></div>

<div class="card"><div class="ch ch-green">Результаты</div><div class="cb">
<div class="rg">
<div class="ri" style="border-color:#CF222E;background:#FFEBE9;"><div class="v" style="color:#CF222E;">12.4 MB</div><div class="l">Исходный (H.264)</div></div>
<div class="ri" style="border-color:#1A7F37;background:#DCF5E4;"><div class="v" style="color:#1A7F37;">2.1 MB</div><div class="l">HEVC+ESRGAN (6x)</div></div>
<div class="ri" style="border-color:#CF222E;background:#FFEBE9;"><div class="v" style="color:#CF222E;">VMAF 45</div><div class="l">Без нейросети</div></div>
<div class="ri" style="border-color:#0969DA;background:#DEEFFF;"><div class="v" style="color:#0969DA;">VMAF 94</div><div class="l">С ESRGAN</div></div>
</div>
<div class="cmp">
<div class="cmp-b" style="background:#FFEBE9;border-color:#CF222E;"><div class="big" style="color:#CF222E;">Без AI</div><div style="font-size:12pt;">300 kbps &rarr; VMAF 45</div></div>
<div class="cmp-b" style="background:#DCF5E4;border-color:#1A7F37;"><div class="big" style="color:#1A7F37;">С AI</div><div style="font-size:12pt;">300 kbps &rarr; VMAF 94</div></div>
</div></div></div>

<div class="card"><div class="ch ch-blue">Реализация</div><div class="cb">
<strong>reframe.ai</strong> &mdash; веб-сайт, всё на клиенте.<br>Blind Test (5 раундов) &middot; Drag-сравнение &middot; Восстановление с live-метриками &middot; Битрейт-анализ + VMAF &middot; ESRGAN Lab &middot; CDN-калькулятор<br><br>
<strong>Стек:</strong> Python, PyTorch, TF.js, FFmpeg, libx265, WebGL 2.0, JS, Canvas API<br>
<span class="flow-box">PyTorch</span><span class="flow-arrow">&rarr;</span><span class="flow-box">ONNX</span><span class="flow-arrow">&rarr;</span><span class="flow-box">TF SavedModel</span><span class="flow-arrow">&rarr;</span><span class="flow-box hl">TF.js (868 KB)</span>
</div></div>

<div class="card"><div class="ch ch-amber">Конкуренты и перспективы</div><div class="cb">
<strong>NVIDIA RTX VSR:</strong> только RTX, закрытая. <strong>Topaz:</strong> медленно, $299. <strong>Google Neural:</strong> несовместимо с HEVC.<br>
<strong style="color:#0969DA;">Наше:</strong> HEVC + post-filter, 868 KB, в браузере, без сервера.<br><br>
<strong style="color:#1A7F37;">Перспективы:</strong> U-Net/SwinIR; in-loop (замена SAO); 4K/8K HDR; AV1/VVC; TFLite/WebGPU; MOS тестирование.
</div></div>'''

css = """@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=JetBrains+Mono:wght@400;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
@page{size:841mm 1189mm;margin:0;}
body{width:841mm;height:1189mm;background:#fff;color:#111;font-family:'Inter',sans-serif;font-size:17pt;line-height:1.4;padding:18mm;display:grid;grid-template-columns:1fr 1fr 1fr;grid-template-rows:auto auto auto auto auto auto auto;gap:6mm;}
.full{grid-column:1/-1;}.span2{grid-column:span 2;}
.header{grid-column:1/-1;background:#0969DA;color:#fff;border-radius:8px;padding:10mm 14mm;display:flex;justify-content:space-between;align-items:flex-start;}
.header h1{font-size:40pt;font-weight:900;line-height:1.15;margin-bottom:5mm;}
.header .meta{font-size:16pt;opacity:0.9;}
.header .right{text-align:right;}
.header .org{font-size:20pt;font-weight:700;margin-bottom:2mm;}
.header .sub{font-size:15pt;opacity:0.8;}
.pipe{grid-column:1/-1;background:#F6F8FA;border:2px solid #D0D7DE;border-radius:8px;padding:5mm;display:flex;align-items:stretch;}
.pn{flex:1;border:2px solid #D0D7DE;border-radius:6px;padding:4mm;text-align:center;background:#fff;}
.pn .t{font-family:'JetBrains Mono',monospace;font-size:16pt;font-weight:700;margin-bottom:3mm;}
.pn .d{font-size:13pt;color:#222;line-height:1.35;}
.pn.enc{border-color:#CF222E;background:#FFEBE9;}.pn.enc .t{color:#CF222E;}
.pn.comp{border-color:#9A6700;background:#FEF3D7;}.pn.comp .t{color:#9A6700;}
.pn.ai{border-color:#0969DA;background:#DEEFFF;box-shadow:0 0 12px rgba(9,105,218,0.15);}.pn.ai .t{color:#0969DA;}
.pn.out{border-color:#1A7F37;background:#DCF5E4;}.pn.out .t{color:#1A7F37;}
.pa{display:flex;align-items:center;padding:0 2mm;color:#D0D7DE;font-size:22pt;}
.card{background:#fff;border:2px solid #D0D7DE;border-radius:8px;overflow:hidden;}
.card .ch{padding:3mm 6mm;font-size:19pt;font-weight:700;border-bottom:2px solid #D0D7DE;}
.card .cb{padding:5mm;font-size:15pt;color:#111;line-height:1.45;}
.card .cb strong{color:#000;}
.card .cb ul{padding-left:6mm;margin:2mm 0;}
.card .cb li{margin-bottom:1.5mm;}
.ch-red{background:#FFEBE9;}.ch-blue{background:#DEEFFF;}.ch-amber{background:#FEF3D7;}.ch-green{background:#DCF5E4;}.ch-purple{background:#F0E8FD;}
.rg{display:grid;grid-template-columns:1fr 1fr;gap:4mm;margin:4mm 0;}
.ri{border:2px solid #D0D7DE;border-radius:6px;padding:4mm;text-align:center;}
.ri .v{font-family:'JetBrains Mono',monospace;font-size:28pt;font-weight:700;}
.ri .l{font-size:11pt;color:#111;margin-top:1mm;}
.bar-row{display:flex;align-items:center;gap:2mm;margin-bottom:2.5mm;}
.bar-lbl{width:30mm;font-size:13pt;color:#111;text-align:right;flex-shrink:0;}
.bar-trk{flex:1;height:6mm;background:#F6F8FA;border-radius:3px;overflow:hidden;border:1px solid #D0D7DE;}
.bar-fill{height:100%;border-radius:3px;}
.bar-val{font-family:'JetBrains Mono',monospace;font-size:13pt;font-weight:700;width:14mm;}
.cmp{display:grid;grid-template-columns:1fr 1fr;gap:4mm;margin-top:4mm;}
.cmp-b{border-radius:6px;padding:4mm;text-align:center;border:2px solid;}
.cmp-b .big{font-family:'JetBrains Mono',monospace;font-size:22pt;font-weight:700;}
.mono{font-family:'JetBrains Mono',monospace;}
.vmaf-scale{display:flex;gap:0;border-radius:4px;overflow:hidden;margin:3mm 0;}
.vmaf-seg{flex:1;padding:3mm;text-align:center;font-size:12pt;font-weight:600;}
.flow-box{background:#F6F8FA;border:1.5px solid #D0D7DE;border-radius:4px;padding:2.5mm 5mm;font-size:13pt;display:inline-block;margin:1mm;}
.flow-box.hl{border-color:#0969DA;background:#DEEFFF;color:#0969DA;}
.flow-arrow{color:#D0D7DE;margin:0 1mm;font-size:15pt;}
.footer{grid-column:1/-1;background:#0969DA;color:#fff;border-radius:8px;padding:8mm 12mm;display:flex;justify-content:space-between;align-items:center;}
.qr-block{display:flex;gap:12mm;align-items:center;}
.qr-item{text-align:center;}
.qr-item img{width:55mm;height:55mm;border-radius:6px;border:3px solid #fff;}
.qr-item p{font-size:14pt;margin-top:3mm;opacity:0.9;font-weight:600;}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}"""

html = f'<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><title>Poster A0</title><style>{css}</style></head><body>{body}{footer}</body></html>'

with open(r'C:\Users\levko\unior\poster_print.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("poster_print.html OK:", len(html), "bytes")
