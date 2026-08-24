import { useState } from 'react';
import { Check, Code2, MousePointer2, Puzzle, Route, Workflow } from 'lucide-react';

type Task = {
  skill: string;
  prompt: string;
  options: string[];
};

type Props = {
  task: Task;
  selected: number | null;
  setSelected: (index: number) => void;
  feedback: any;
};

const textOf = (task?: Partial<Task> | null) => `${task?.skill || ''} ${task?.prompt || ''}`;

export const isCreativeTask = (task?: Partial<Task> | null) =>
  /пазл|фрагмент|құрастыр|бөлік|сбор|соедин|сәйкест|пары|жұп|код|code|алгоритм|робот|микро-проект|профориентация|конструктор|истори|story|маршрут|лабиринт|матрица|сканирование|кеңістіктік|пространственная|пространственное|координац|баланс|хлоп|шапалақ|айқас|память|жады|есте сақ|запомни|карточ|n-back|реті|порядок|sequence|последователь|реттілік|stroop|go.?no-go|stop|импульс|тормож|ереже|правило|dual|двой|қос|дыбыс|звук|фокус|символ|symbol|реакц/i.test(textOf(task));

const modeOf = (task: Task) => {
  const text = textOf(task);
  if (/код|code|алгоритм|робот|истори|story/i.test(text)) return 'code';
  if (/stroop|go\s*\/\s*no-go|stop|импульс|тормож|ереже|правило|dual|двой|қос/i.test(text)) return 'project';
  if (/соедин|сәйкест|пары|жұп|классифика|сканирование|матрица/i.test(text)) return 'match';
  if (/память|жады|есте сақ|запомни|карточ|n-back|дыбыс|звук|sequence|последователь|реттілік|символ|symbol/i.test(text)) return 'match';
  if (/профориентация|микро-проект|предприниматель|инженер|дизайнер|аналитик|наставник|зерттеуші|кәсіпкер/i.test(text)) return 'project';
  return 'puzzle';
};

const stateClass = (index: number, selected: number | null, feedback: any) => {
  if (!feedback) return selected === index ? 'selected' : '';
  if (index === feedback.correctOption) return 'correct';
  if (selected === index) return 'wrong';
  return '';
};

export default function CreativeTaskInteraction({ task, selected, setSelected, feedback }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const mode = modeOf(task);
  const disabled = Boolean(feedback);
  const choose = (index: number) => {
    if (!disabled) setSelected(index);
  };

  const pieces = task.options.map((option, index) => (
    <button
      type="button"
      key={`${option}-${index}`}
      draggable={!disabled}
      disabled={disabled}
      onDragStart={(event) => event.dataTransfer.setData('text/plain', String(index))}
      onClick={() => choose(index)}
      className={`creative-piece ${stateClass(index, selected, feedback)}`}
    >
      <span>{mode === 'code' ? <Code2 /> : mode === 'match' ? <Route /> : <Puzzle />}</span>
      <b>{option}</b>
      {feedback && index === feedback.correctOption && <Check />}
    </button>
  ));

  if (mode === 'code') {
    return (
      <section className="creative-interaction code-interaction">
        <div className="creative-stage code-stage">
          <div className="code-window">
            <i />
            <i />
            <i />
            <pre>{`start()
  read_task()
  ${selected === null ? 'choose_best_step()' : task.options[selected]}
  explain_result()
end()`}</pre>
          </div>
          <small><Code2 /> Собери логичный фрагмент мини-кода</small>
        </div>
        <div className="creative-pieces">{pieces}</div>
      </section>
    );
  }

  if (mode === 'match') {
    return (
      <section className="creative-interaction match-interaction">
        <div className="creative-stage match-stage">
          <div className="match-column">
            <span>Объект</span>
            <b>{/музык|музыка/i.test(task.prompt) ? 'Музыка' : /фигура|символ|белгі|shape/i.test(task.prompt) ? 'Форма' : 'Задача'}</b>
          </div>
          <div className={`match-line ${selected !== null ? 'connected' : ''}`}><Workflow /></div>
          <div className="match-column answer">
            <span>Связь</span>
            <b>{selected === null ? 'выбери пару' : task.options[selected]}</b>
          </div>
          <small><MousePointer2 /> Нажми на карточку, чтобы соединить смысл</small>
        </div>
        <div className="creative-pieces">{pieces}</div>
      </section>
    );
  }

  if (mode === 'project') {
    return (
      <section className="creative-interaction project-interaction">
        <div className="creative-stage project-stage">
          <article>
            <span>1</span>
            <b>Понять задачу</b>
          </article>
          <article className={selected !== null ? 'active' : ''}>
            <span>2</span>
            <b>{selected === null ? 'Выбрать ход' : task.options[selected]}</b>
          </article>
          <article>
            <span>3</span>
            <b>Объяснить решение</b>
          </article>
          <small><Workflow /> Маленький проект: выбери самый сильный следующий шаг</small>
        </div>
        <div className="creative-pieces">{pieces}</div>
      </section>
    );
  }

  return (
    <section className="creative-interaction puzzle-interaction">
      <div
        className={`creative-stage puzzle-stage ${dragOver ? 'drag-over' : ''} ${selected !== null ? 'filled' : ''}`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          const index = Number(event.dataTransfer.getData('text/plain'));
          if (!Number.isNaN(index)) choose(index);
        }}
      >
        <div className="puzzle-board">
          <i />
          <i />
          <i />
          <i>{selected === null ? <Puzzle /> : task.options[selected]}</i>
        </div>
        <small><MousePointer2 /> Перетащи деталь в поле или просто нажми на неё</small>
      </div>
      <div className="creative-pieces">{pieces}</div>
    </section>
  );
}
