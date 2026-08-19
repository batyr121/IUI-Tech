export type SkillProfile={
  id:string;
  title:string;
  subject:'math'|'logic'|'language';
  purpose:string;
  parentMessage:string;
  childGoal:string;
  successCriteria:string;
  recommendedMinutes:number;
};

const profiles:SkillProfile[]=[
  {id:'math-calculation',title:'Вычисления',subject:'math',purpose:'Уверенно выполнять вычисления и проверять результат обратным действием.',parentMessage:'Ребёнку нужна короткая регулярная практика вычислений без перегрузки.',childGoal:'Считать точно и замечать ошибку до проверки взрослым.',successCriteria:'Не менее 4 из 5 новых примеров без подсказки.',recommendedMinutes:8},
  {id:'math-multiplication',title:'Умножение',subject:'math',purpose:'Понимать умножение как равные группы и применять таблицу в задачах.',parentMessage:'Закрепляем не механическое запоминание, а смысл одинаковых групп.',childGoal:'Быстро узнавать равные группы и выбирать умножение.',successCriteria:'80% точности в примерах и текстовых задачах.',recommendedMinutes:8},
  {id:'math-division',title:'Деление',subject:'math',purpose:'Разделять количество на равные части и связывать деление с умножением.',parentMessage:'Ребёнок тренирует связь между делением и уже знакомой таблицей умножения.',childGoal:'Делить на равные части и проверять ответ умножением.',successCriteria:'4 из 5 новых заданий с объяснением проверки.',recommendedMinutes:8},
  {id:'math-word-problem',title:'Задачи',subject:'math',purpose:'Выделять вопрос, данные и составлять короткий план решения.',parentMessage:'Основной фокус — понимание условия, а не увеличение количества примеров.',childGoal:'Находить главное в условии и решать по шагам.',successCriteria:'Самостоятельно составить план для 3 новых задач.',recommendedMinutes:10},
  {id:'math-geometry',title:'Геометрия',subject:'math',purpose:'Применять свойства фигур, периметр и измерение в практическом контексте.',parentMessage:'Геометрию закрепляем через измерение и визуальные модели.',childGoal:'Видеть фигуру, выбирать формулу и проверять единицы.',successCriteria:'80% точности на новых фигурах.',recommendedMinutes:9},
  {id:'logic-sequence',title:'Последовательности',subject:'logic',purpose:'Находить повторяющееся правило и переносить его на следующий элемент.',parentMessage:'Развиваем поиск закономерности и объяснение своего правила.',childGoal:'Замечать правило и объяснять его одним предложением.',successCriteria:'4 из 5 новых рядов с объяснением.',recommendedMinutes:7},
  {id:'logic-classification',title:'Классификация',subject:'logic',purpose:'Сравнивать признаки, группировать объекты и находить исключение.',parentMessage:'Ребёнок учится обосновывать, почему объект относится к группе.',childGoal:'Находить общий признак и лишний объект.',successCriteria:'Не менее 4 верных классификаций с объяснением.',recommendedMinutes:7},
  {id:'logic-analogy',title:'Аналогии',subject:'logic',purpose:'Устанавливать отношения между понятиями и переносить их на новую пару.',parentMessage:'Тренируем смысловые связи и словесное объяснение решения.',childGoal:'Находить связь между двумя парами.',successCriteria:'80% точности на новых аналогиях.',recommendedMinutes:7},
  {id:'neuro-focus',title:'Устойчивый фокус',subject:'logic',purpose:'Удерживать одну учебную цель и не переключаться на лишние стимулы.',parentMessage:'Live EEG показал, что ребёнку полезны короткие упражнения на стабильность внимания.',childGoal:'Держать цель задания до конца и проверять детали.',successCriteria:'3 короткие серии без поспешных ошибок.',recommendedMinutes:6},
  {id:'neuro-recovery',title:'Когнитивное восстановление',subject:'logic',purpose:'Снижать перегрузку и возвращаться к задаче после короткой паузы.',parentMessage:'Если утомление растёт, важны маленькие циклы нагрузки и восстановления.',childGoal:'Делать небольшой шаг, отдыхать и снова возвращаться к задаче.',successCriteria:'Завершить блок без падения темпа в конце.',recommendedMinutes:5},
  {id:'neuro-selective-attention',title:'Избирательное внимание',subject:'logic',purpose:'Выделять важный сигнал среди помех и не реагировать на лишнее.',parentMessage:'Тренируем умение выбирать главное в задании до ответа.',childGoal:'Сначала найти цель, потом отвечать.',successCriteria:'80% точности в заданиях с отвлекающими элементами.',recommendedMinutes:6},
  {id:'neuro-signal-quality',title:'Качество EEG-сигнала',subject:'logic',purpose:'Формировать спокойную посадку и аккуратную работу с устройством.',parentMessage:'Чистый сигнал помогает точнее сравнивать прогресс ребёнка.',childGoal:'Сидеть спокойно и не трогать устройство во время записи.',successCriteria:'Стабильный сигнал выше 70% в следующей сессии.',recommendedMinutes:4},
  {id:'language-comprehension',title:'Понимание текста',subject:'language',purpose:'Находить явную информацию, главную мысль и последовательность событий.',parentMessage:'Работаем с пониманием инструкции и текста, а не со скоростью чтения.',childGoal:'Находить ответ в тексте и показывать, где он спрятан.',successCriteria:'4 из 5 новых вопросов по короткому тексту.',recommendedMinutes:9},
  {id:'language-spelling',title:'Орфография',subject:'language',purpose:'Замечать орфограмму и применять правило при выборе написания.',parentMessage:'Закрепляем одно правило короткими сериями, без переписывания больших текстов.',childGoal:'Находить опасное место в слове и выбирать правило.',successCriteria:'80% точности без подсказки.',recommendedMinutes:8},
  {id:'language-vocabulary',title:'Лексика',subject:'language',purpose:'Расширять словарь и понимать значение слова в контексте.',parentMessage:'Новые слова закрепляются через контекст, синонимы и собственные примеры.',childGoal:'Объяснять слово и использовать его в своём предложении.',successCriteria:'Верно применить 4 из 5 слов в новом контексте.',recommendedMinutes:8},
  {id:'language-sentence',title:'Сөйлем',subject:'language',purpose:'Түсінікті сөйлем құрау және сөйлем мүшелерін ажырату.',parentMessage:'Бала сөйлемнің құрылымын қысқа мысалдар арқылы бекітеді.',childGoal:'Сөйлемдегі негізгі ойды және әрекетті табу.',successCriteria:'5 тапсырманың кемінде 4-еуін өздігінен орындау.',recommendedMinutes:8},
  {id:'language-word-meaning',title:'Сөз мағынасы',subject:'language',purpose:'Сөздің мағынасын контекст арқылы анықтау және мағыналас сөзді табу.',parentMessage:'Сөздік қор контекст және өз сөйлемін құрау арқылы дамиды.',childGoal:'Сөздің мағынасын түсіндіріп, дұрыс қолдану.',successCriteria:'5 жаңа сөздің кемінде 4-еуін дұрыс қолдану.',recommendedMinutes:8}
];

const normalize=(value:string)=>value.toLocaleLowerCase('ru-RU').replace(/ё/g,'е');
const aliases:[RegExp,string][]=[
  [/вычис|сложен|вычит|сч[её]т/,'math-calculation'],[/умнож/,'math-multiplication'],[/делен/,'math-division'],[/задач|услов/,'math-word-problem'],[/геометр|периметр|площад/,'math-geometry'],
  [/последователь|закономер/,'logic-sequence'],[/классифика|лишн/,'logic-classification'],[/аналог/,'logic-analogy'],
  [/устойчив.*фокус|стабиль.*вним|поддержание устойчивого внимания/,'neuro-focus'],[/когнитив.*восстанов|утом|релакс|восстанов/,'neuro-recovery'],[/избиратель.*вним|вовлеч/,'neuro-selective-attention'],[/сигнал|посадк|gnd|электрод/,'neuro-signal-quality'],
  [/понимание текста|мәтінді түсіну|инструкц/,'language-comprehension'],[/орфограф|емле/,'language-spelling'],[/лексик/,'language-vocabulary'],[/сөйлем/,'language-sentence'],[/сөз мағынасы/,'language-word-meaning']
];

export function resolveSkillProfiles(gaps:string[],sectionScores:Record<string,number>,language:'ru'|'kk'){
  const resolved:SkillProfile[]=[];
  for(const gap of gaps){const match=aliases.find(([pattern])=>pattern.test(normalize(gap)));const profile=match&&profiles.find(item=>item.id===match[1]);if(profile&&!resolved.some(item=>item.id===profile.id))resolved.push(profile)}
  const weakest=Object.entries(sectionScores).sort((a,b)=>a[1]-b[1])[0]?.[0]||'math';
  const fallback=profiles.find(item=>item.id===(weakest==='logic'?'logic-sequence':weakest==='language'?(language==='kk'?'language-word-meaning':'language-comprehension'):'math-word-problem'))!;
  if(!resolved.length)resolved.push(fallback);
  if(resolved.length===1){const support=profiles.find(item=>item.subject===(weakest==='math'?'logic':weakest==='logic'?'math':'language')&&item.id!=='language-sentence')||profiles[0];resolved.push(support)}
  return resolved.slice(0,3);
}

export const weeklyThemes=['Точка старта','Разбираем по шагам','Закрепляем основу','Применяем в контексте','Шаг сложнее','Работаем над ошибкой','Новый контроль'];
