#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os
import sys
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape


def ensure_dir(directory):
    """Cria o diretório se não existir."""
    Path(directory).mkdir(parents=True, exist_ok=True)


def generate_pages(template_dir, pages_dir, output_dir, lang='pt'):
    """Gera as páginas HTML a partir dos JSONs."""
    # Configurar Jinja2
    env = Environment(
        loader=FileSystemLoader(template_dir),
        autoescape=select_autoescape(['html', 'xml']),
        trim_blocks=True,
        lstrip_blocks=True
    )

    template_name = f'base_{lang}.html'
    try:
        template = env.get_template(template_name)
    except Exception as e:
        print(f"❌ Erro ao carregar template {template_name}: {e}")
        sys.exit(1)

    ensure_dir(output_dir)

    json_files = [f for f in os.listdir(pages_dir) if f.endswith('.json')]
    if not json_files:
        print("⚠️ Nenhum arquivo JSON encontrado em pages/")
        return

    for filename in json_files:
        json_path = os.path.join(pages_dir, filename)
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except Exception as e:
            print(f"❌ Erro ao ler {json_path}: {e}")
            continue

        if 'metadata' not in data or 'id' not in data['metadata']:
            print(f"⚠️ Arquivo {filename} não possui metadata.id. Pulando.")
            continue

        page_id = data['metadata']['id']
        output_file = os.path.join(output_dir, f"{page_id}.html")

        # Contexto: dados completos + full_config para o PAGE_CONFIG
        context = {
            **data,
            'full_config': data,
            'script': data.get('script', '').replace('js/', '')  # remove 'js/' se houver
        }

        try:
            html = template.render(**context)
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(html)
            print(f"✅ Gerado: {output_file}")
        except Exception as e:
            print(f"❌ Erro ao gerar {page_id}: {e}")

    print("\n🎉 Geração concluída!")


def main():
    # Configurações
    TEMPLATE_DIR = 'templates'
    PAGES_DIR = 'pages'
    OUTPUT_DIR = 'dist'
    LANGUAGE = 'pt'

    # Verificar pastas obrigatórias
    if not os.path.isdir(TEMPLATE_DIR):
        print(f"❌ Pasta de templates '{TEMPLATE_DIR}' não encontrada.")
        sys.exit(1)
    if not os.path.isdir(PAGES_DIR):
        print(f"❌ Pasta de páginas '{PAGES_DIR}' não encontrada.")
        sys.exit(1)

    # Gerar as páginas (sem copiar assets/js)
    generate_pages(TEMPLATE_DIR, PAGES_DIR, OUTPUT_DIR, LANGUAGE)

    print("\n📦 Pasta de saída pronta em:", os.path.abspath(OUTPUT_DIR))
    print("⚠️  Lembre-se: os arquivos estáticos (CSS, JS, componentes) devem estar publicados no GitHub Pages nos caminhos:")
    print("   - https://auditeduca.github.io/Calculadoras-de-Enfermagem/assets/css/...")
    print("   - https://auditeduca.github.io/Calculadoras-de-Enfermagem/assets/js/...")
    print("   - https://auditeduca.github.io/Calculadoras-de-Enfermagem/js/... (scripts específicos)")


if __name__ == '__main__':
    main()