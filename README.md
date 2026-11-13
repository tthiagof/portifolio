# Portfólio - Thiago Ferreira

Portfólio local em português, com foco em sistemas web, automações, serviços de TI, GitHub e CI/CD. A robótica móvel autônoma aparece como diferencial. Visual escuro em preto e amarelo com iluminação suave em branco, verde-água e azul, fontes locais Fira Sans e Fira Mono, sem fotos pessoais. Inclui projetos, filtros, detalhes em diálogo acessível e currículo em PDF para download.

## Desenvolvimento

Requer Node.js 20 ou superior, sem dependências npm externas.

```sh
npm run dev
npm run check
npm run build
npm test
npm run preview
```

Desenvolvimento: http://localhost:5173. Prévia: http://localhost:4173. Outra porta: `npm run dev -- --port 5174`.

Para produção local, `npm start` gera `dist/` e inicia o servidor em `0.0.0.0:4173`. O conteúdo de `dist/` também pode ser hospedado como site estático. Nenhuma publicação externa foi feita.

## Conteúdo

- `index.html`: página, projetos e contatos.
- `src/styles.css`: layout responsivo e fontes locais.
- `src/main.js`: filtros, diálogo de projetos, menu móvel, navegação ativa, progresso de rolagem e efeitos de ponteiro.
- `fonts/`: Fira Sans e Fira Mono, incluídas no build.
- `documents/thiago-ferreira-curriculo.pdf`: currículo público usado pelo botão de download.
- `output/pdf/thiago-ferreira-curriculo.pdf`: cópia de entrega do currículo.
- `scripts/generate-cv.py`: fonte do PDF (Python 3 e ReportLab); executar a partir da raiz do projeto. Para regenerar em um ambiente isolado: `python3 -m venv /tmp/cv-venv && /tmp/cv-venv/bin/pip install reportlab && /tmp/cv-venv/bin/python scripts/generate-cv.py`.
- `Curriculo_Thiago_Ferreira_Final.pdf`: currículo original preservado, fora dos caminhos públicos do servidor.

O currículo foi revisado a partir do PDF fornecido pelo usuário. As experiências seguem a lógica STAR com contexto, atuação e entregas comprovadas, sem métricas inventadas. Inclui os serviços de TI prestados à Gruhn Elétrica e o curso de Assistente Administrativo do SENAI. A participação na seletiva WorldSkills é mencionada sem resultado de classificação. O projeto Carevella está identificado como em andamento. Formação e datas foram preservadas.

Contexto da modalidade 23 consultado nos [padrões oficiais da WorldSkills](https://worldskills.org/what/projects/wsos/2024/events/579/skills/1696/). As tarefas gerais da modalidade não são atribuídas individualmente a Thiago.

As imagens dos projetos foram preservadas; retratos, depoimentos, processo comercial e cenas longas de vídeo foram retirados da página. Os vídeos e o módulo antigo de rolagem continuam no repositório, sem carregamento pela página atual.

O servidor expõe apenas os caminhos de assets autorizados. O PDF é servido como `application/pdf`, e os links de contato abrem WhatsApp, e-mail ou o site da Crono; nenhuma mensagem é enviada automaticamente.

## Movimento e hierarquia

A página prioriza sistemas web e automações, com robótica como diferencial após a galeria. A barra permanece visível durante a rolagem, mostra o progresso e destaca a seção atual. Há animações de entrada em sequência no hero, uma linha com efeito de digitação, brilhos de fundo, iluminação suave, inclinação dos cards com o ponteiro e interações nos projetos. O painel do hero simula um robô móvel autônomo holonômico do tipo kiwi drive, com três rodas omnidirecionais a 120°, lidar giratório, trajetória em oito, waypoints e telemetria de pose, velocidade e RPM das rodas. A simulação usa cinemática inversa em `src/amr-panel.js`; o conteúdo de robótica destaca algoritmos de controle e navegação, mecânica e estrutura e programação de sistemas embarcados. Inspirado nos recursos oficiais da Studica: https://www.studica.com/studica-robotics-resources . Não representa uma reprodução do robô específico usado pelo autor.

Um segundo robô, em `src/scroll-robot.js`, acompanha a rolagem alternando entre as bordas e reage a cada área da página: calibra skills, compila projetos, navega pela seção de robótica, escaneia o perfil, carrega o CV e abre o canal de contato. Ele muda de cor, posição e holograma conforme a seção. O movimento acompanha apenas a rolagem: o robô não pode ser arrastado e não segue o ponteiro.

O botão na barra pausa as animações, inclusive o efeito de digitação e a simulação do painel. A preferência de movimento reduzido do sistema é respeitada; a simulação congela em um quadro estático, pausa fora da tela e quando a aba fica oculta. O robô companheiro fica oculto em telas estreitas e com movimento reduzido.

## Assistente AMR-01

Clique no robô para abrir o guia do portfólio. O chat oferece seis assuntos com perguntas e respostas alternadas, indicador de digitação e atalhos para as seções. A abertura e o fechamento têm transições suaves; o robô se desloca até o chat, o avatar pisca e uma bolha com anéis, pontos e uma linha de sinal acompanha o processamento. A resposta aparece palavra por palavra, com espaço reservado para evitar saltos no layout. Usa respostas locais preparadas, sem API externa. Funciona no celular e com teclado (Enter ou espaço para abrir, Escape para fechar), respeitando movimento reduzido. O robô continua sem arraste.
