import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { fr, ar } from 'date-fns/locale';
import {
  Plus,
  ClipboardCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Zap,
  Trash2,
  Edit,
  Calendar,
  User,
  Eye,
  EyeOff,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';
import {
  useInternalTasks,
  useInternalTaskStats,
  useCreateInternalTask,
  useUpdateInternalTask,
  useDeleteInternalTask,
} from '@/hooks/useInternalTasks';
import { InternalTasksSkeleton } from '@/components/skeletons/InternalTasksSkeleton';
import { InternalTask, TaskPriority, TaskStatus, TaskVisibility } from '@/types';
import { CreateInternalTaskDto, UpdateInternalTaskDto } from '@/lib/api';
import { cn } from '@/lib/utils';

const priorityConfig: Record<TaskPriority, { color: string; borderColor: string; bgColor: string; icon: typeof AlertCircle }> = {
  urgent: {
    color: 'text-orange-600',
    borderColor: 'border-l-orange-500',
    bgColor: 'bg-orange-500/10',
    icon: Zap,
  },
  normal: {
    color: 'text-green-600',
    borderColor: 'border-l-green-500',
    bgColor: 'bg-green-500/10',
    icon: CheckCircle2,
  },
  critical: {
    color: 'text-red-600',
    borderColor: 'border-l-red-500',
    bgColor: 'bg-red-500/10',
    icon: AlertTriangle,
  },
};

export default function InternalTasksPage() {
  const { t, i18n } = useTranslation(['internalTasks', 'common']);
  const { isAdmin, user } = useAuth();
  const dateLocale = i18n.language === 'ar' ? ar : fr;

  const { data: tasks, isLoading: tasksLoading } = useInternalTasks();
  const { data: stats, isLoading: statsLoading } = useInternalTaskStats();
  const { data: users } = useUsers();
  const createTask = useCreateInternalTask();
  const updateTask = useUpdateInternalTask();
  const deleteTask = useDeleteInternalTask();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<InternalTask | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'completed'>('all');

  // Form state
  const [formData, setFormData] = useState<CreateInternalTaskDto>({
    title: '',
    description: '',
    priority: 'normal',
    visibility: 'clear',
    assignedTo: '',
    dueDate: '',
  });

  const employees = users?.filter(u => u.isActive) || [];

  const filteredTasks = tasks?.filter(task => {
    if (statusFilter === 'all') return true;
    return task.status === statusFilter;
  }) || [];

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'normal',
      visibility: 'clear',
      assignedTo: '',
      dueDate: '',
    });
  };

  const handleCreate = () => {
    createTask.mutate(formData, {
      onSuccess: () => {
        setIsCreateOpen(false);
        resetForm();
      },
    });
  };

  const handleEdit = (task: InternalTask) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      visibility: task.visibility,
      assignedTo: task.assignedTo,
      dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
    });
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedTask) return;
    const updateData: UpdateInternalTaskDto = isAdmin
      ? {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          visibility: formData.visibility,
          assignedTo: formData.assignedTo,
          dueDate: formData.dueDate,
        }
      : { status: selectedTask.status === 'in_progress' ? 'completed' : 'in_progress' };
    
    updateTask.mutate(
      { id: selectedTask.id, data: updateData },
      {
        onSuccess: () => {
          setIsEditOpen(false);
          setSelectedTask(null);
          resetForm();
        },
      }
    );
  };

  const handleStatusToggle = (task: InternalTask) => {
    const newStatus: TaskStatus = task.status === 'in_progress' ? 'completed' : 'in_progress';
    updateTask.mutate({ id: task.id, data: { status: newStatus } });
  };

  const handleDelete = () => {
    if (!selectedTask) return;
    deleteTask.mutate(selectedTask.id, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        setSelectedTask(null);
      },
    });
  };

  const openDeleteDialog = (task: InternalTask) => {
    setSelectedTask(task);
    setIsDeleteOpen(true);
  };

  if (tasksLoading || (isAdmin && statsLoading)) {
    return (
      <DashboardLayout title={t('title')} subtitle={t('subtitle')}>
        <InternalTasksSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={isAdmin ? t('title') : t('myTasks')} subtitle={t('subtitle')}>
      <div className="space-y-6">
        {/* Header with action button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
          {isAdmin && (
            <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              {t('actions.newTask')}
            </Button>
          )}
        </div>

        {/* Stats Cards - Admin Only */}
        {isAdmin && stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('stats.total')}
                </CardTitle>
                <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('stats.inProgress')}
                </CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('stats.completed')}
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Employee Stats - Admin Only */}
        {isAdmin && stats && stats.byEmployee.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('employeeStats')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.byEmployee.map((emp) => (
                  <div
                    key={emp.employeeId}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                        {emp.firstName[0]}
                        {emp.lastName[0]}
                      </div>
                      <span className="font-medium">
                        {emp.firstName} {emp.lastName}
                      </span>
                    </div>
                    <div className="flex gap-3 text-sm">
                      <span className="text-orange-600">{emp.inProgress} {t('filters.inProgress')}</span>
                      <span className="text-green-600">{emp.completed} {t('filters.completed')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filter Tabs */}
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <TabsList>
            <TabsTrigger value="all">{t('filters.all')}</TabsTrigger>
            <TabsTrigger value="in_progress">{t('filters.inProgress')}</TabsTrigger>
            <TabsTrigger value="completed">{t('filters.completed')}</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Tasks List */}
        <Card>
          <CardHeader>
            <CardTitle>{isAdmin ? t('allTasks') : t('myTasks')}</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">{t('empty.noTasks')}</p>
                <p className="text-sm text-muted-foreground/70">
                  {isAdmin ? t('empty.noTasksAdmin') : t('empty.noTasksDesc')}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => {
                  const priority = priorityConfig[task.priority];
                  const PriorityIcon = priority.icon;
                  return (
                    <div
                      key={task.id}
                      className={cn(
                        'flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border-l-4 bg-card border transition-colors',
                        priority.borderColor,
                        task.status === 'completed' && 'opacity-60'
                      )}
                    >
                      {/* Priority Indicator */}
                      <div className={cn('flex items-center gap-2', priority.color)}>
                        <PriorityIcon className="h-5 w-5" />
                        <Badge variant="outline" className={cn('text-xs', priority.color, priority.bgColor)}>
                          {t(`priority.${task.priority}`)}
                        </Badge>
                      </div>

                      {/* Task Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className={cn(
                          'font-medium text-foreground',
                          task.status === 'completed' && 'line-through'
                        )}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {task.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                          {isAdmin && task.assignee && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {task.assignee.firstName} {task.assignee.lastName}
                            </span>
                          )}
                          {task.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(task.dueDate), 'dd MMM yyyy', { locale: dateLocale })}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            {task.visibility === 'clear' ? (
                              <Eye className="h-3 w-3" />
                            ) : (
                              <EyeOff className="h-3 w-3" />
                            )}
                            {t(`visibility.${task.visibility}`)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant={task.status === 'completed' ? 'outline' : 'default'}
                          size="sm"
                          onClick={() => handleStatusToggle(task)}
                          className="gap-1"
                        >
                          {task.status === 'completed' ? (
                            <>
                              <Clock className="h-3 w-3" />
                              {t('actions.markInProgress')}
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              {t('actions.markComplete')}
                            </>
                          )}
                        </Button>
                        {isAdmin && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(task)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(task)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('dialog.createTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('form.title')}</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={t('form.titlePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('form.description')}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('form.descriptionPlaceholder')}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('form.priority')}</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(v: TaskPriority) => setFormData({ ...formData, priority: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">{t('priority.normal')}</SelectItem>
                    <SelectItem value="urgent">{t('priority.urgent')}</SelectItem>
                    <SelectItem value="critical">{t('priority.critical')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('form.visibility')}</Label>
                <Select
                  value={formData.visibility}
                  onValueChange={(v: TaskVisibility) => setFormData({ ...formData, visibility: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clear">{t('visibility.clear')}</SelectItem>
                    <SelectItem value="unreadable">{t('visibility.unreadable')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('form.assignTo')}</Label>
              <Select
                value={formData.assignedTo}
                onValueChange={(v) => setFormData({ ...formData, assignedTo: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('form.selectEmployee')} />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('form.dueDate')}</Label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              {t('common:actions.cancel')}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!formData.title || !formData.assignedTo || createTask.isPending}
            >
              {createTask.isPending ? t('common:actions.saving') : t('common:actions.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('dialog.editTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {isAdmin ? (
              <>
                <div className="space-y-2">
                  <Label>{t('form.title')}</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('form.description')}</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('form.priority')}</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(v: TaskPriority) => setFormData({ ...formData, priority: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">{t('priority.normal')}</SelectItem>
                        <SelectItem value="urgent">{t('priority.urgent')}</SelectItem>
                        <SelectItem value="critical">{t('priority.critical')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('form.visibility')}</Label>
                    <Select
                      value={formData.visibility}
                      onValueChange={(v: TaskVisibility) => setFormData({ ...formData, visibility: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="clear">{t('visibility.clear')}</SelectItem>
                        <SelectItem value="unreadable">{t('visibility.unreadable')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('form.assignTo')}</Label>
                  <Select
                    value={formData.assignedTo}
                    onValueChange={(v) => setFormData({ ...formData, assignedTo: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.firstName} {emp.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('form.dueDate')}</Label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">
                {t('status.label')}: {selectedTask ? t(`status.${selectedTask.status}`) : ''}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              {t('common:actions.cancel')}
            </Button>
            <Button onClick={handleUpdate} disabled={updateTask.isPending}>
              {updateTask.isPending ? t('common:actions.saving') : t('common:actions.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('dialog.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('dialog.deleteConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common:actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common:actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
