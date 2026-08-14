import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Activity, Archive, BookOpen, Check, ChevronRight, Gauge, Link, Plus, RefreshCw, Search, ShieldCheck, Users, X } from 'lucide-react';
import { api } from './api';

function Badge({ children, tone = 'violet' }: { children: ReactNode; tone?: string }) {
  return <span className={`status-badge ${tone}`}>{children}</span>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal" onMouseDown={(event) => event.stopPropagation()}><div className="modal-head"><h3>{title}</h3><button onClick={onClose}><X /></button></div>{children}</div></div>;
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('Все');
  const [selected, setSelected] = useState<any>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: '', subject: 'Математика', academicYear: '2026–2027' });
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  const load = async () => {
    try {
      const response = await api<{ classes: any[] }>('/classes');
      setClasses(response.classes);
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Не удалось загрузить классы');
    }
  };

  useEffect(() => { void load(); }, []);

  const subjects = useMemo(() => ['Все', ...Array.from(new Set(classes.map((item) => String(item.subject))))], [classes]);
  const visible = useMemo(() => classes.filter((item) =>
    (subjectFilter === 'Все' || item.subject === subjectFilter)
    && `${item.name} ${item.subject}`.toLowerCase().includes(query.toLowerCase())), [classes, query, subjectFilter]);

  const open = async (id: string) => {
    try {
      const response = await api<{ class: any }>(`/classes/${id}`);
      setSelected(response.class);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Не удалось открыть класс'); }
  };
  const create = async () => {
    try {
      const response = await api<{ class: any }>('/classes', { method: 'POST', body: JSON.stringify(form) });
      setCreateOpen(false);
      setForm((current) => ({ ...current, name: '' }));
      await load();
      await open(response.class.id);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Не удалось создать класс'); }
  };
  const edit = async () => {
    try {
      await api(`/classes/${selected.id}`, { method: 'PATCH', body: JSON.stringify({ name: selected.name, subject: selected.subject }) });
      await load();
      setSelected(null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Не удалось сохранить класс'); }
  };
  const regenerate = async (id: string) => {
    if (!window.confirm('Старый код перестанет работать. Продолжить?')) return;
    try {
      const response = await api<{ inviteCode: string }>(`/classes/${id}/regenerate-code`, { method: 'POST' });
      setSelected((current: any) => current ? { ...current, inviteCode: response.inviteCode } : current);
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Не удалось перевыпустить код'); }
  };
  const archive = async (id: string) => {
    try {
      await api(`/classes/${id}`, { method: 'PATCH', body: JSON.stringify({ archived: true }) });
      setSelected(null);
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Не удалось архивировать класс'); }
  };
  const remove = async (id: string) => {
    if (!window.confirm('Удалить класс? Ученики останутся зарегистрированными без класса.')) return;
    try {
      await api(`/classes/${id}`, { method: 'DELETE' });
      setSelected(null);
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Не удалось удалить класс'); }
  };
  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      window.setTimeout(() => setCopied(''), 1600);
    } catch { setError('Браузер не разрешил копирование. Выделите код вручную.'); }
  };

  return <>
    <div className="page-head"><div><span>УПРАВЛЕНИЕ</span><h1>Классы</h1><p>Коды регистрации, состав и когнитивная статистика каждого класса.</p></div><div className="page-actions"><button className="primary" onClick={() => setCreateOpen(true)}><Plus /> Создать класс</button></div></div>
    {error && <div className="api-error">{error}</div>}
    <div className="teacher-tip"><ShieldCheck /><span><b>Самостоятельная регистрация учеников</b><small>Отправьте ученикам код нужного класса. Они появятся в составе автоматически.</small></span></div>
    <div className="filters"><label><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти класс или предмет..." /></label><select value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)}>{subjects.map((subject) => <option key={subject}>{subject}</option>)}</select></div>
    <div className="class-grid">{visible.map((item, index) => <article className="class-card class-card-rich" key={item.id}>
      <button className="class-card-open" onClick={() => open(item.id)} aria-label={`Открыть ${item.name}`} />
      <div className={`class-cover ${['violet', 'blue', 'green'][index % 3]}`}><BookOpen /><Badge tone="neutral">{item.subject}</Badge></div>
      <div className="class-info"><div><h3>{item.name}</h3><span>{item.academicYear}</span></div><p><Users /> {item._count?.students || 0} учеников <span>•</span><Activity /> {item._count?.sessions || 0} сессий</p><div className="class-code"><span><small>КОД РЕГИСТРАЦИИ</small><b>{item.inviteCode}</b></span><button className="above-card-link" onClick={() => copy(item.inviteCode)}>{copied === item.inviteCode ? <Check /> : <Link />}</button></div><div className="class-footer"><Badge tone={item.archived ? 'neutral' : 'green'}>{item.archived ? 'Архив' : 'Активен'}</Badge><button className="above-card-link" onClick={() => open(item.id)}>Подробнее <ChevronRight /></button></div></div>
    </article>)}<button className="new-class" onClick={() => setCreateOpen(true)}><span><Plus /></span><b>Создать класс</b><small>Код появится автоматически</small></button></div>
    {!visible.length && <div className="empty-analytics"><BookOpen /><h2>Классы не найдены</h2><p>Измените фильтры или создайте новый класс.</p></div>}
    {createOpen && <Modal title="Новый класс" onClose={() => setCreateOpen(false)}><div className="form-grid"><label>Название<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Например, 7Б" /></label><label>Предмет<select value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })}><option>Математика</option><option>Русский язык</option><option>Казахский язык</option><option>Физика</option><option>Информатика</option><option>Биология</option><option>Другое</option></select></label><label>Учебный год<select value={form.academicYear} onChange={(event) => setForm({ ...form, academicYear: event.target.value })}><option>2025–2026</option><option>2026–2027</option></select></label></div><div className="modal-actions"><button className="soft-button" onClick={() => setCreateOpen(false)}>Отмена</button><button className="primary" disabled={!form.name.trim()} onClick={create}>Создать класс</button></div></Modal>}
    {selected && <Modal title="Управление классом" onClose={() => setSelected(null)}><div className="class-detail-head"><div><input value={selected.name} onChange={(event) => setSelected({ ...selected, name: event.target.value })} /><select value={selected.subject} onChange={(event) => setSelected({ ...selected, subject: event.target.value })}><option>Математика</option><option>Русский язык</option><option>Казахский язык</option><option>Физика</option><option>Информатика</option><option>Биология</option><option>Другое</option></select></div><Badge tone={selected.archived ? 'neutral' : 'green'}>{selected.archived ? 'Архив' : 'Активен'}</Badge></div><div className="profile-stats"><div><Users /><span><b>{selected.students?.length || 0}</b><small>Учеников</small></span></div><div><Activity /><span><b>{selected.metrics?.engagement || 0}%</b><small>Вовлечённость</small></span></div><div><Gauge /><span><b>{selected.metrics?.focus || 0}%</b><small>Фокус</small></span></div></div><div className="detail-code"><span><small>КОД КЛАССА</small><strong>{selected.inviteCode}</strong></span><button className="soft-button" onClick={() => copy(selected.inviteCode)}><Link /> Копировать</button><button onClick={() => regenerate(selected.id)}><RefreshCw /> Перевыпустить</button></div><h4 className="modal-section-title">Состав класса</h4><div className="compact-roster">{selected.students?.length ? selected.students.map((student: any) => <div key={student.id}><div className="avatar">{student.firstName[0]}{student.lastName[0]}</div><span><b>{student.firstName} {student.lastName}</b><small>{student.publicId}</small></span><Badge tone={student.sessions?.length ? 'green' : 'neutral'}>{student.sessions?.length ? 'EEG записан' : 'Нет сессий'}</Badge></div>) : <p>Ученики пока не зарегистрировались.</p>}</div><div className="class-danger"><button onClick={() => archive(selected.id)}><Archive /> Архивировать</button><button onClick={() => remove(selected.id)}><X /> Удалить класс</button><button className="primary" onClick={edit}>Сохранить изменения</button></div></Modal>}
  </>;
}
