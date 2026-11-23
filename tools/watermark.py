"""Невидимая подпись для файлов дизайна.

Пишет метаданные (и скрытый маркер) в PNG, JPEG, PDF, SVG и HTML.
Внешний вид файла не меняется: подпись видна только в свойствах.

    python tools/watermark.py путь/к/файлу.png другой.pdf ...
    python tools/watermark.py --check файл.png      # показать текущую подпись

Подпись: автор, сайт, дата. Маркер содержит символы нулевой ширины — их
не скопировать случайно, но их видно в метаданных.
"""

from __future__ import annotations

import datetime
import sys
from pathlib import Path

AUTHOR = "Денис Воронков"
SITE = "https://voronkov-design.ru"
STUDIO = "VORONKOV.DESIGN"
ZERO_WIDTH = "\u200b\u200c\u200b\u200d"  # скрытый маркер


def marker() -> str:
    day = datetime.date.today().isoformat()
    return f"{STUDIO} · {AUTHOR} · {SITE} · {day}{ZERO_WIDTH}"


def sign_png(path: Path) -> str:
    from PIL import Image
    from PIL.PngImagePlugin import PngInfo

    with Image.open(path) as im:
        info = PngInfo()
        for key, value in (im.info or {}).items():
            if isinstance(value, str) and key not in {"Signature"}:
                info.add_text(key, value)
        info.add_text("Signature", marker())
        info.add_text("Author", AUTHOR)
        info.add_text("Source", SITE)
        im.save(path, pnginfo=info)
    return "PNG-метаданные"


def marker_ascii() -> str:
    day = datetime.date.today().isoformat()
    return f"{STUDIO} / Denis Voronkov / {SITE} / {day}{ZERO_WIDTH}"


def sign_jpeg(path: Path) -> str:
    from PIL import Image

    with Image.open(path) as im:
        exif = im.getexif()
        exif[270] = marker_ascii()          # ImageDescription (EXIF хранит только ASCII)
        exif[315] = "Denis Voronkov"        # Artist
        exif[305] = f"{STUDIO} {SITE}"      # Software
        im.save(path, exif=exif, quality=95, subsampling=0)
    return "EXIF"


def sign_pdf(path: Path) -> str:
    import fitz

    doc = fitz.open(path)
    meta = doc.metadata or {}
    meta.update({
        "author": AUTHOR,
        "creator": STUDIO,
        "producer": f"{STUDIO} · {SITE}",
        "subject": marker(),
    })
    doc.set_metadata(meta)
    doc.saveIncr()
    doc.close()
    return "PDF-метаданные"


def sign_svg(path: Path) -> str:
    text = path.read_text(encoding="utf-8")
    if "voronkov-design.ru" in text and "digital signature" in text:
        return "уже подписан"
    block = (
        f'<metadata id="vd-signature">'
        f'<vd:signature xmlns:vd="{SITE}" author="{AUTHOR}" signed="{datetime.date.today().isoformat()}">{ZERO_WIDTH}</vd:signature>'
        f"</metadata>\n"
    )
    idx = text.rfind("</svg>")
    text = text[:idx] + block + text[idx:]
    path.write_text(text, encoding="utf-8")
    return "SVG-metadata"


def sign_html(path: Path) -> str:
    text = path.read_text(encoding="utf-8", errors="ignore")
    if "vd-signature" in text:
        return "уже подписан"
    comment = f"<!-- vd-signature: {marker()} -->\n"
    idx = text.lower().rfind("</body>")
    text = text[:idx] + comment + text[idx:] if idx != -1 else text + comment
    path.write_text(text, encoding="utf-8")
    return "HTML-комментарий"


HANDLERS = {
    ".png": sign_png,
    ".jpg": sign_jpeg,
    ".jpeg": sign_jpeg,
    ".pdf": sign_pdf,
    ".svg": sign_svg,
    ".html": sign_html,
    ".htm": sign_html,
}


def check(path: Path) -> str:
    suffix = path.suffix.lower()
    def clean(value: str) -> str:
        return value.replace(ZERO_WIDTH, "").strip(" ·")
    if suffix in {".png", ".jpg", ".jpeg"}:
        from PIL import Image
        with Image.open(path) as im:
            exif = im.getexif()
            return clean(str(exif.get(270) or (im.info or {}).get("Signature") or "подписи нет"))
    if suffix == ".pdf":
        import fitz
        with fitz.open(path) as doc:
            return clean(str((doc.metadata or {}).get("subject") or "подписи нет"))
    return "проверка для этого формата не поддерживается"


def main(argv: list[str]) -> int:
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:  # noqa: BLE001
        pass

    if not argv:
        print(__doc__)
        return 1

    if argv[0] == "--check":
        for raw in argv[1:]:
            path = Path(raw)
            print(f"{path}: {check(path)}")
        return 0

    for raw in argv:
        path = Path(raw)
        handler = HANDLERS.get(path.suffix.lower())
        if not handler:
            print(f"пропуск {path.name}: формат не поддерживается")
            continue
        if not path.exists():
            print(f"пропуск {path}: файла нет")
            continue
        try:
            print(f"{path.name}: {handler(path)}")
        except Exception as error:  # noqa: BLE001
            print(f"{path.name}: ошибка — {error}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
