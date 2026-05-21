# Sons do Table Game

Coloque aqui os arquivos MP3 que o jogo toca. O hook `useSound` carrega cada arquivo sob demanda e falha silenciosamente se ele não existir — então você pode adicionar os sons aos poucos.

## Arquivos esperados

| Arquivo            | Quando toca                                  | Sugestão de duração |
| ------------------ | -------------------------------------------- | ------------------- |
| `dice-roll.mp3`    | Ao rolar o dado                              | 0.5–1.2 s           |
| `correct.mp3`      | Resposta correta no quiz                     | 0.4–0.9 s           |
| `incorrect.mp3`    | Resposta incorreta no quiz                   | 0.4–0.9 s           |
| `step.mp3`         | Cada passo do peão no tabuleiro (curtinho!)  | < 0.15 s            |
| `bonus.mp3`        | Casa de bônus disparada (+2 extra)           | 0.4–1.0 s           |
| `portal.mp3`       | Casa de portal disparada (teleporte)         | 0.6–1.2 s           |
| `victory.mp3`      | Vitória                                      | 1.0–2.5 s           |

## Onde encontrar (CC0 / livres para uso)

- [Pixabay Sounds](https://pixabay.com/sound-effects/) — busca por "dice", "ding", "wrong buzzer", "powerup", "warp", "victory fanfare".
- [Freesound](https://freesound.org/) — filtre por licença "Creative Commons 0".
- [OpenGameArt.org](https://opengameart.org/) — seção *Sound Effects*.
- [Mixkit](https://mixkit.co/free-sound-effects/) — efeitos gratuitos para projetos pessoais.

## Volumes

Os volumes padrão estão em `src/app/hooks/useSound.ts` (constante `SOUND_VOLUMES`). Ajuste por arquivo se quiser equalizar.

## Mute

O botão 🔊 / 🔇 na lateral persiste a preferência em `localStorage` sob a chave `tablegame:muted`.
