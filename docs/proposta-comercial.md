# Proposta Comercial

## Jogo de Tabuleiro Educacional com IA

**Complemento gamificado para plataformas EdTech**

---

## Sumário Executivo

Esta proposta apresenta a integração do **Jogo de Tabuleiro Educacional com IA** à sua plataforma educacional. A solução transforma o conteúdo que sua plataforma já oferece — apostilas, simulados, trilhas de estudo — em rodadas curtas de quiz no formato de jogo de tabuleiro. O aluno revisa matéria com baixo atrito, a plataforma ganha tempo de sessão e um diferencial competitivo claro, e o conteúdo já produzido por sua equipe pedagógica passa a ter uma nova vida em um formato com forte apelo lúdico.

A integração pode começar em **semanas, não meses**, e oferece desde um modo de uso imediato (sem qualquer desenvolvimento do lado da plataforma) até cenários avançados com autenticação e personalização por aluno.

---

## 1. O Produto

O Jogo de Tabuleiro Educacional é uma aplicação web que combina o formato clássico de tabuleiro com quiz de múltipla escolha e inteligência artificial para extração automática de perguntas.

**Mecânica do jogo**

- Tabuleiro 10×10 com **36 casas perimetrais** numeradas; o centro é reservado para o dado e controles.
- Jogador rola um dado de 6 faces. A cada rodada, o jogo sorteia uma pergunta do banco ativo.
- Acerto avança o número de casas do dado; erro retrocede o mesmo número (com piso em zero).
- **Feedback visual instantâneo** de acerto ou erro (1,5 segundo).
- **Tela de vitória com confete** ao alcançar o objetivo, com botão de reinício imediato.

**Stack e formatos de entrega**

- Next.js 16 com **export estático**: o aplicativo gera um pacote de arquivos prontos que rodam em qualquer hospedagem (S3, CloudFront, Vercel, GitHub Pages ou servidor próprio da plataforma). **Não há servidor obrigatório** no estado atual.
- **App nativo iOS e Android** via Capacitor — mesma base de código, mesma build. Não há custo adicional de desenvolvimento mobile.
- Construído em React 19 com Tailwind v4, código moderno e de fácil manutenção.

---

## 2. Inteligência Artificial integrada

O grande diferencial do produto é a capacidade de transformar material didático já existente em perguntas de jogo, automaticamente.

- **Extração de PDF**: o usuário carrega uma apostila ou simulado em PDF. O sistema processa o documento **página a página, em blocos de 5 páginas**, exibindo o progresso em tempo real ("Página X de Y…"). Para cada bloco, a IA gera um conjunto de perguntas estruturadas.
- **Extração de imagens**: aceita PNG, JPG e JPEG. Útil para fotos de quadro, slides ou material digitalizado. A IA reconhece o conteúdo via processamento multimodal.
- **Geração automática de tema/título**: a IA cria um título conciso para a sessão, descrevendo o assunto do material carregado.
- **Validação automática**: perguntas malformadas (sem alternativas suficientes, sem resposta correta entre as opções, com campos vazios) são descartadas. Se o lote inteiro vier vazio, a operação é cancelada e o aluno é informado.
- **Passo de confirmação**: antes de aplicar o lote extraído ao jogo, o usuário visualiza o conteúdo gerado e confirma. Sem surpresas.

**Modelo de IA utilizado:** Gemini 2.5 Flash, da Google.

---

## 3. Banco de perguntas pronto

Para fins de demonstração, piloto e fallback, a aplicação já vem com um banco curado de **160 perguntas em Português brasileiro**, distribuídas em 8 temas:

| Tema | Quantidade |
|---|---|
| Geografia | 25 |
| História | 20 |
| Ciências | 20 |
| Cultura & Artes | 20 |
| Matemática | 20 |
| Esportes | 20 |
| Português | 20 |
| Cinema & TV | 20 |

Esse banco é útil para mostrar o produto funcionando antes mesmo da integração de conteúdo da sua plataforma estar pronta.

---

## 4. Proposta de Valor para a Plataforma

- **Mais tempo de sessão e engajamento.** Gamificação aumenta a frequência e a duração de uso, especialmente entre alunos do ensino fundamental e médio.
- **Conteúdo existente, novo formato.** A equipe pedagógica da plataforma não precisa produzir nada novo — o jogo consome o material já disponível.
- **Diferenciação competitiva.** Poucas plataformas EdTech brasileiras oferecem um jogo nativo, com a profundidade de tabuleiro + IA.
- **Mobile sem custo extra.** O aplicativo já roda como app iOS e Android via Capacitor; basta publicar nas lojas.
- **Pedagogicamente válido.** Revisão ativa com feedback imediato é uma técnica de estudo comprovadamente eficaz para retenção a longo prazo.

---

## 5. Opções de Integração de Conteúdo

Esta é a decisão técnica mais importante da parceria. Apresentamos seis modos, do mais simples ao mais sofisticado:

| # | Modo | Como funciona | Esforço da Plataforma | Esforço Nosso | Ideal para |
|---|---|---|---|---|---|
| 1 | **Upload manual** *(já implementado)* | Aluno ou professor carrega PDF/imagem da apostila; a IA extrai as perguntas. | Nenhum | Nenhum | Piloto, prova rápida, escolas com material em PDF |
| 2 | **Banco estático exportado** | A plataforma exporta um arquivo JSON de questões; o jogo carrega o arquivo. | Baixo (1 script exportador) | Baixo (loader de JSON) | Cursos com conteúdo fechado/estável |
| 3 | **API REST de ingestão (push)** | A plataforma envia lotes de questões para um endpoint do jogo. | Médio (autenticação e formatação) | Médio (subir backend leve) | Plataformas que atualizam conteúdo com frequência |
| 4 | **API da plataforma (pull) + SSO** | O jogo identifica o aluno e busca a trilha de estudo dele. | Alto (expor API + SSO) | Alto (cliente HTTP, cache, identidade) | Plataformas grandes, personalização por aluno |
| 5 | **Embed/iframe com white-label** | O jogo roda dentro da plataforma; branding customizado via querystring ou postMessage. | Baixo (embedar URL) | Médio (parametrizar tema) | UX integrada — combinável com 1, 2, 3 ou 4 |
| 6 | **LTI 1.3** *(roadmap)* | Padrão de LMS (Moodle, Canvas, Blackboard). | Baixo (já suportam o padrão) | Alto (servidor LTI) | Clientes institucionais e universidades |

**Transparência técnica:** o jogo hoje é uma aplicação estática, sem servidor próprio. As opções 3, 4 e 6 exigem que adicionemos um pequeno backend, orçado como parte do projeto de integração ou incluído no piloto, conforme acordo.

---

## 6. Recomendação para a Primeira Integração

Para a maioria dos cenários, recomendamos **combinar a Opção 5 (embed white-label) com a Opção 2 (banco JSON exportado)**.

**Por quê:**

- Ataca o ponto de venda principal — conteúdo da plataforma rodando no jogo, dentro da própria plataforma — com o menor esforço de cada lado.
- **Não exige backend novo** de nenhuma das partes.
- Permite ir ao ar em **semanas**, em vez de meses.
- Funciona como base sólida para evoluir, no futuro, para as opções 3 ou 4 sem desperdiçar trabalho.

As opções 3 e 4 entram como roadmap pago de evolução, conforme a parceria avança.

---

## 7. Roadmap conjunto de evolução

Apresentamos com transparência o que **não existe hoje** e onde vemos espaço para evolução conjunta — cada item abaixo é uma oportunidade real de upsell e diferenciação:

- **Multiplayer com turnos.** A estrutura de dados do jogo já suporta múltiplos jogadores, mas a rotação de turnos no UI ainda não está implementada. Estimativa: pequeno projeto, alto impacto em engajamento.
- **Persistência de progresso por aluno.** Hoje o estado do jogo se perde no reload. Implementar persistência abre caminho para retomada de partidas, ranking e histórico.
- **Métricas e telemetria pedagógica.** Painel para professores com acerto por tema, por aluno e por turma. Hoje não existe — é uma das oportunidades mais claras de pacote pago.
- **Login/SSO com a plataforma.** Identificação do aluno para personalização e métricas.
- **Acessibilidade WCAG completa.** Hoje há cobertura básica (`aria-label` em controles principais, marcação de elementos decorativos como `aria-hidden`). Cobertura completa, incluindo navegação por teclado dedicada, é uma evolução natural.

---

## 8. Modelo Comercial

Apresentamos três modelos para discussão na primeira reunião — a escolha depende do porte da plataforma e do estágio da parceria:

| Modelo | Descrição | Indicado para |
|---|---|---|
| **(a) Licença anual flat** | Valor fixo anual por plataforma, uso ilimitado. | Piloto e primeiro ano de parceria |
| **(b) SaaS por aluno ativo/mês** | Cobrança proporcional ao uso real. | Escala — plataformas com base ampla de alunos |
| **(c) Revenue share** | Participação sobre upsell de conteúdo gamificado. | Parcerias estratégicas de longo prazo |

**Recomendamos o modelo (a) para o piloto**, com migração para (b) na renovação, conforme o uso se estabiliza.

O **setup inicial** (white-label, escolha do modo de integração da seção 5, customização de banco de perguntas) é orçado à parte como projeto de implantação.

---

## 9. Próximos Passos

1. **Demo ao vivo (30 minutos).** Levamos uma apostila ou material da sua própria plataforma e mostramos o jogo carregando perguntas extraídas dela em tempo real.
2. **Piloto de 60 dias.** Uma turma ou curso da plataforma, sem custo de licença — apenas o setup. Mede engajamento e retenção contra o grupo de controle.
3. **Reunião técnica.** Definimos juntos qual modo de integração da seção 5 faz mais sentido para o caso de uso da plataforma.

---

**Contato:** Tiago — tiago@grupoeureka.com.br
