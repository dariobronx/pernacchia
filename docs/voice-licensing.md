# Voice licensing review

> [!summary]
> **What:** a practical review of the synthetic Italian voices used by the game.
> **Impact:** Kokoro's model and weights are published under Apache 2.0, but that alone does not establish every right in the generated recordings or the training voices.
> **Open points:** the public materials do not identify the Italian voice contributors or give a separate, explicit grant for the generated MP3 files.
> **Next step:** for stronger certainty before commercial use, get written clarification from the model authors or replace these recordings with voices licensed for redistribution.

## What is actually in this game

- The game distributes 1,005 MP3 recordings of original Italian story lines. The game itself does not include Kokoro's model, voice-weight files or text-to-speech software.
- The local generation script maps characters to Kokoro's Italian profiles `if_sara` and `im_nicola`, changes playback speed and pitch, and saves the resulting audio. These profile labels are not evidence that the recordings imitate named people.
- The game code, story text, illustrations and generated music are project files. There is no third-party image or font library in the published file set.

## Findings

| Topic | What the public sources say | Practical reading |
|---|---|---|
| Kokoro model and weights | The model page labels Kokoro Apache-2.0; the project README says the weights may be used in personal and production projects. | Positive evidence that use of the model itself is permitted, including commercial use, subject to the Apache license when redistributing the model or its derivatives. This game does not redistribute the model. |
| Italian voice profiles | `VOICES.md` lists `if_sara` and `im_nicola` as Italian profiles, with limited Italian training hours. It does not name their speakers or give those two rows a separate attribution or license. | The published materials do not let us independently confirm the source, consent terms or identity rights behind each Italian profile. |
| Training data | The model card says training used permissive/non-copyrighted audio and identifies some Creative Commons training sources. It does not map those sources to the Italian profiles. | This is the model author's statement, not an item-by-item clearance record for the Italian voices. |
| Generated MP3s | The model materials do not give a clear, separate statement granting rights in every generated recording or guaranteeing that no voice sounds like an identifiable person. | No explicit prohibition on these recordings was found, but “Apache model” is not a complete legal clearance of each MP3. |
| Game ownership | Italian copyright law protects creative human works and expressly includes AI-assisted works when they result from the author's intellectual work. | Original writing, art direction, code and selection/editing are relevant human contributions. A “all rights reserved” notice states the claim; it does not create rights in material owned by someone else. |

## Risk and recommended action

For the current free game, the review found no identified third-party song, recording or deliberate imitation of a named voice. The remaining uncertainty is the undocumented provenance and permissions of the two voice profiles and how far those permissions extend to exported MP3s. This is not a legal guarantee.

Before adding paid access, advertising, donations tied to the recordings, or broad commercial distribution, the cautious choices are:

1. Ask the Kokoro authors in writing whether `if_sara` and `im_nicola` and recordings generated with them may be redistributed in a public game, including commercial use, and whether the profiles are based on identifiable consenting speakers.
2. Keep the model-card/voice-list versions, the generation settings, and the original scripts and story text as evidence of what was used and what human work went into the recordings.
3. If confirmation is unavailable, replace the MP3s with a voice provider or actor whose written terms explicitly allow redistribution in games and any planned commercial use.

## Sources checked

- Kokoro model card, license metadata, training-data statement and acknowledgements: https://huggingface.co/hexgrad/Kokoro-82M
- Kokoro voice list, including the Italian profiles: https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md
- Kokoro inference project and Apache-2.0 license: https://github.com/hexgrad/kokoro and https://github.com/hexgrad/kokoro/blob/main/LICENSE
- Italian Copyright Act, Law 633/1941, Article 1 (current text): https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:1941-04-22;633

## Q&A

### Does this mean the voice recordings are definitely illegal?

No. The review found no published rule that clearly forbids these recordings, and the model is advertised under a permissive license. It also could not confirm all rights in the Italian voice profiles and generated MP3s, so it cannot promise they are risk-free.

### Does “all rights reserved” solve the voice question?

No. It applies to material the game author owns. It cannot grant rights to a voice, recording or other material belonging to someone else.
