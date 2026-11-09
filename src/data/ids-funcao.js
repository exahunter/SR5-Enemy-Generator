/* ===== ids estáveis das funções de grupo =====
 * O rótulo em português (c.npc.role) é só exibição e hoje também é a chave gravada nas fichas. Nenhuma regra deve testar o texto dele:
 * regras perguntam pelo id (rolId(c)). Quando o idioma da tela mudar o rótulo, os ids continuam os mesmos. */
const ROLE_ID={'Líder':'leader','Chefe':'boss','Sargento':'sergeant','Supervisor':'supervisor','Segundo em comando':'second','Especialista':'specialist','Atirador':'shooter','Capanga':'thug','Batedor':'scout','Motorista':'driver','Médico de campo':'medic','Armeiro':'armorer','Novato':'rookie','Fiel':'faithful','Assistente':'assistant','VIP':'vip','Guarda-costas':'bodyguard','Decker':'decker','Tecnomante':'technomancer','Mago':'mage','Mago de segurança':'secmage','Adepto':'adept','Adepto místico':'mystadept','Místico':'mystic','Sacerdote':'priest'};
const rolId=c=>ROLE_ID[(c&&c.npc||c||{}).role]||'';
const ROLE_LEAD=['leader','boss','sergeant','supervisor'];   // quem comanda o grupo

/* ids estáveis dos tipos de NPC (as chaves de TYPES são o rótulo em português). Licenças e afins perguntam pelo id, nunca pelo texto. */
const TYPE_ID={'Civil (cidadão comum)':'civilian','Wage slave (funcionário corporativo)':'wageslave','Executivo / Mr. Johnson':'executive','Político / burocrata':'politician','Cientista':'scientist','Técnico / engenheiro':'technician','Médico / street doc':'medic','Arruaceiro / manifestante':'rioter','Ganger de rua (gangue)':'ganger','Sindicato (máfia, yakuza, vory)':'syndicate','Cultista / fanático':'cultist','Contrabandista':'smuggler','Segurança corporativa (rent-a-cop)':'corpsec','Polícia (Lone Star / força local)':'police','Guarda-costas':'bodyguard','Detetive / investigador':'detective','Resposta de alta ameaça (HTR)':'htr','Operações especiais (spec ops)':'specops','Mercenário (merc)':'merc','Caçador de recompensas (bounty hunter)':'bounty','Motorista / piloto':'driver','Informante / fixer':'fixer'};
const tipId=t=>TYPE_ID[t]||'';
