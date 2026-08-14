import AchievementsPage from './AchievementsPage';
import AnalyticsPage from './AnalyticsPage';
import ArchivePage from './ArchivePage';
import ClassesPage from './ClassesPage';
import ClassProgressPage from './ClassProgressPage';
import CareerGuidancePage from './CareerGuidancePage';
import DeviceConnectPage from './DeviceConnectPage';
import DiagnosticPage from './DiagnosticPage';
import FirmwarePage from './FirmwarePage';
import FamilyServicesPage from './FamilyServicesPage';
import HelpPage from './HelpPage';
import HomeworkPage from './HomeworkPage';
import LearningReportsPage from './LearningReportsPage';
import MotivationPage from './MotivationPage';
import NotificationsPage from './NotificationsPage';
import ReportsPage from './ReportsPage';
import SettingsPage from './SettingsPage';
import SchoolImpactPage from './SchoolImpactPage';
import StudentLiveEEG from './StudentLiveEEG';
import StudentsPage from './StudentsPage';

export default function PlatformPage({ page }: { page: string }) {
  const pages: Record<string, JSX.Element> = {
    'Классы': <ClassesPage />,
    'Ученики': <StudentsPage />,
    'Диагностика': <DiagnosticPage />,
    'Профориентация': <CareerGuidancePage />,
    'Услуги и запись': <FamilyServicesPage />,
    'Мой план': <HomeworkPage />,
    'Учебный отчёт': <LearningReportsPage />,
    'Архив': <ArchivePage />,
    'Прогресс': <ClassProgressPage />,
    'Прошивка': <FirmwarePage />,
    'Устройства': <DeviceConnectPage />,
    'Live EEG': <StudentLiveEEG />,
    'Аналитика': <AnalyticsPage />,
    'Отчёты': <ReportsPage />,
    'Достижения': <AchievementsPage />,
    'Мотивация': <MotivationPage />,
    'Уведомления': <NotificationsPage />,
    'Помощь': <HelpPage />,
    'Настройки': <SettingsPage />,
    'Эффект школы': <SchoolImpactPage />,
  };

  return <div key={page} className="page-transition">{pages[page] ?? null}</div>;
}
