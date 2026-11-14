// Interface de exemplo: liga o núcleo à página.
//
// Regras que o lint impõe aqui: nada de HTML em texto (innerHTML e afins) e
// nenhum console.log esquecido. A versão e o commit vêm do build (vite.config.ts).

import './estilo.css';
import { descreverPrazo, lerData, type DataIso } from './nucleo/prazo.ts';

function elemento<T extends HTMLElement>(id: string, tipo: new () => T): T {
  const alvo = document.getElementById(id);
  if (!(alvo instanceof tipo)) throw new Error(`Elemento #${id} ausente ou de outro tipo`);
  return alvo;
}

function hojeLocal(): DataIso {
  const agora = new Date();
  const texto = [
    agora.getFullYear(),
    String(agora.getMonth() + 1).padStart(2, '0'),
    String(agora.getDate()).padStart(2, '0'),
  ].join('-');
  const hoje = lerData(texto);
  if (!hoje) throw new Error(`Data local inválida: ${texto}`);
  return hoje;
}

const campo = elemento('prazo', HTMLInputElement);
const saida = elemento('resultado', HTMLOutputElement);
const versao = elemento('versao', HTMLElement);

function atualizar(): void {
  const prazo = lerData(campo.value);
  saida.textContent = prazo ? descreverPrazo(hojeLocal(), prazo) : 'Escolha uma data.';
}

campo.addEventListener('input', atualizar);
versao.textContent = `v${__VERSAO__} (${__COMMIT__})`;
atualizar();
