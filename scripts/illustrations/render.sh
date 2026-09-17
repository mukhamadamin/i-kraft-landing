#!/bin/sh
# Рендерит иллюстрации из scenes.html в public/photos/*.jpg.
#
# Каждая сцена — SVG, собранный в scenes.html из общих примитивов
# (пакет, фри, ролл, рулон, станок, полка) в палитре сайта, поэтому
# все картинки выглядят как одна серия. Правится сцена — перезапускается
# скрипт. Нужны headless Chrome (CHROME=...) и python3 с Pillow.
#
#   sh scripts/illustrations/render.sh            # все сцены
#   sh scripts/illustrations/render.sh bag-fries  # одна

set -eu
here=$(cd "$(dirname "$0")" && pwd)
root=$(cd "$here/../.." && pwd)
tmp=$(mktemp -d)
CHROME=${CHROME:-$(command -v chromium || command -v google-chrome || command -v chrome-headless-shell)}

scenes=${*:-$(grep -o '^  "[a-z-]*": ()' "$here/scenes.html" | tr -d ' ":()')}

for s in $scenes; do
  "$CHROME" --headless --no-sandbox --disable-gpu --hide-scrollbars --force-device-scale-factor=2 \
    --window-size=1400,875 --virtual-time-budget=2000 --screenshot="$tmp/$s.png" \
    "file://$here/scenes.html?scene=$s" 2>/dev/null
  python3 - "$tmp/$s.png" "$root/public/photos/$s.jpg" <<'PY'
import sys
from PIL import Image
src, dst = sys.argv[1:]
Image.open(src).convert("RGB").resize((1400, 875), Image.LANCZOS).save(dst, quality=86, optimize=True, progressive=True)
PY
  echo "→ public/photos/$s.jpg"
done
rm -rf "$tmp"
