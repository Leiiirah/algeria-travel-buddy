import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, EyeOff, CalendarClock, ArrowRight } from 'lucide-react';
import { InternalTask, TaskPriority } from '@/types';

interface EmployeeTasksSectionProps {
  tasks: InternalTask[];
}

const getPriorityVariant = (priority: TaskPriority) => {
  switch (priority) {
    case 'critical':
      return 'destructive';
    case 'urgent':
      return 'secondary';
    case 'normal':
    default:
      return 'outline';
  }
};

const TaskItem = ({ task, t, locale }: { task: InternalTask; t: (key: string) => string; locale: string }) => (
  <div className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3">
    <div className="min-w-0 flex-1">
      <p className="font-medium truncate">{task.title}</p>
      {task.dueDate && (
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
          <CalendarClock className="h-3 w-3" />
          {t('tasks.dueDate')}: {new Date(task.dueDate).toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'fr-FR')}
        </p>
      )}
    </div>
    <Badge variant={getPriorityVariant(task.priority)}>
      {t(`tasks.priority.${task.priority}`)}
    </Badge>
  </div>
);

export const EmployeeTasksSection = ({ tasks }: EmployeeTasksSectionProps) => {
  const { t, i18n } = useTranslation('dashboard');

  const ongoingTasks = tasks.filter(
    (task) => task.status === 'in_progress' && task.visibility === 'clear'
  );
  const unreadTasks = tasks.filter((task) => task.visibility === 'unreadable');

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{t('tasks.title')}</h2>
        <Link
          to="/missions-internes"
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          {t('tasks.viewAll')}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Ongoing tasks */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary" />
              {t('tasks.ongoingTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ongoingTasks.length === 0 ? (
                <p className="text-center text-muted-foreground py-6 text-sm">
                  {t('tasks.emptyOngoing')}
                </p>
              ) : (
                ongoingTasks.map((task) => (
                  <TaskItem key={task.id} task={task} t={t} locale={i18n.language} />
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Unread tasks */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <EyeOff className="h-4 w-4 text-destructive" />
              {t('tasks.unreadTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unreadTasks.length === 0 ? (
                <p className="text-center text-muted-foreground py-6 text-sm">
                  {t('tasks.emptyUnread')}
                </p>
              ) : (
                unreadTasks.map((task) => (
                  <TaskItem key={task.id} task={task} t={t} locale={i18n.language} />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
