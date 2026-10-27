# Portfólio — Thiago Ferreira

Portfólio pessoal em português, com projetos e serviços da Crono Sistemas, animações, filtros e detalhes dos projetos. HTML, CSS e JavaScript; os comandos de desenvolvimento usam somente os módulos nativos do Node.js.

## Rodar localmente

Requisito: Node.js 20 ou superior e npm. Não há dependências externas para instalar.

```sh
npm run dev
```

Abra **http://localhost:5173**. O navegador atualiza ao salvar alterações em HTML, CSS, JavaScript ou imagens.

```sh
npm run check    # Validação de sintaxe
npm run build    # Gera o site estático em dist/
npm test         # Verifica o servidor e as referências do site (após o build)
npm run preview  # http://localhost:4173
```

Para usar outra porta: `npm run dev -- --port 5174`.

## Rodar em produção

```sh
npm start
```

O comando gera o build em `dist/` e inicia o servidor estático em **http://localhost:4173**, escutando em `0.0.0.0` para aceitar conexões externas. Para publicar em outra porta ou atrás de um proxy, use `PORT` e `HOST`:

```sh
PORT=8080 HOST=0.0.0.0 npm start
```

Também é possível publicar como site estático. A raiz do projeto e `dist/` têm a mesma estrutura (`index.html`, `src/`, `images/`, `video/` e `favicon.svg`), então no nginx basta apontar `root` para a raiz do projeto **ou** para `dist/`. Não aponte para `public/` (essa pasta não existe mais) nem copie apenas o `index.html`.

## Conteúdo e arquivos

- `index.html`: textos, seções, contatos e metadados.
- `src/styles.css`: visual, layout responsivo e animações.
- `src/main.js`: detalhes e filtros dos projetos, navegação, animações e preferência de movimento.
- `src/scroll-cinema.js`: cenas fixas com vídeos controlados pela posição da rolagem.
- `images/`: fotografias e imagens reais dos projetos da Crono.
- `video/`: os dois vídeos locais preparados para navegação por trechos.
- `originals/`: foto recebida e versão editada em resolução original. Não entram no build nem são servidas pelo servidor local.

Os links comerciais usam o WhatsApp **+55 (51) 99625-7816**, informado por Thiago. Projetos, serviços e depoimentos vêm do site público da Crono Sistemas; as imagens foram copiadas dos arquivos locais desse mesmo site. Thiago confirmou a liderança no desenvolvimento dos quatro projetos. Crono Propostas é identificado como **pré-lançamento**.

A foto foi editada com IA para trocar a camisa e aplicar o logo da Crono. Os originais foram preservados. A versão WebP serve para o site.

O botão no rodapé permite reduzir as animações e guarda a escolha neste navegador. A preferência de movimento reduzido do sistema é sempre respeitada. Efeitos de cursor são exclusivos de dispositivos com mouse, e partículas pausam quando a abertura sai da tela ou a aba fica oculta.

## Vídeos controlados pela rolagem

Há duas cenas: uma interface digital se construindo a partir de partículas e módulos em 3D logo antes dos projetos e uma sequência dos quatro projetos entre a seção sobre Thiago e o processo de trabalho. Role para baixo para avançar ou para cima para voltar; o vídeo permanece parado quando a rolagem para. Títulos, iluminação, perspectiva e indicadores acompanham a posição da cena.

As cenas usam `position: sticky` e rolagem nativa, com atalhos para continuar. Os vídeos são silenciosos, carregados perto de entrar na tela e deixam de receber atualizações quando estão fora dela. Com movimento reduzido, ficam imagens estáticas, sem o trecho longo de rolagem. Os cartões de projetos também receberam reflexos e deslocamento em profundidade.

O servidor implementa respostas HTTP `206` e `Content-Range` para o navegador poder buscar os quadros em qualquer direção. Os testes verificam esses trechos, o retorno da rolagem, atualizações rápidas, carregamento tardio e suspensão das animações.

A primeira cena é uma animação original: uma estrutura surge, os módulos se encaixam e gráficos são desenhados até formar uma interface. É um visual conceitual, identificado como tal na página. O gerador vetorial está em `scripts/generate-creation.mjs` e usa Sharp e FFmpeg apenas para regenerar o MP4 e o poster; esses arquivos já estão incluídos no projeto. A sequência dos projetos foi montada com as capturas reais já presentes no portfólio. Para regenerar somente essa sequência, com FFmpeg instalado: `node scripts/generate-reel.mjs`. Não é necessário FFmpeg para rodar o site.

## Entrega

O projeto é local, sem publicação, backend, formulário de envio ou serviços de rastreamento. Os botões abrem WhatsApp, e-mail ou páginas externas; nenhuma mensagem é enviada automaticamente. `dist/` pode ser hospedado como site estático futuramente.
