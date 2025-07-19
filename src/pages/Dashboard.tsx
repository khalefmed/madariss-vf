import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedStatsCard } from '@/components/dashboard/EnhancedStatsCard';
import { AttendanceChart } from '@/components/dashboard/AttendanceChart';
import { StudentsGradeChart } from '@/components/dashboard/StudentsGradeChart';
import { PaymentsChart } from '@/components/dashboard/PaymentsChart';
import { MarksDistributionChart } from '@/components/dashboard/MarksDistributionChart';
import { StudentRecentMarks } from '@/components/dashboard/StudentRecentMarks';
import { StudentPaymentHistory } from '@/components/dashboard/StudentPaymentHistory';
import { StudentAttendanceOverview } from '@/components/dashboard/StudentAttendanceOverview';
import { useSchools } from '@/hooks/useSchools';
import { useUserRole } from '@/hooks/useUserRole';
import { useSchoolStats } from '@/hooks/useSchoolStats';
import { useStudentDashboardStats } from '@/hooks/useStudentDashboardStats';
import { useSystemStats } from '@/hooks/useSystemStats';
import { useLanguage } from '@/contexts/LanguageContext';
import { Building2, Users, BookOpen, Calendar, GraduationCap, UserCheck, Calculator, CreditCard, TrendingUp, TrendingDown, Settings, DollarSign, BarChart3, Activity, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { data: schools, isLoading } = useSchools();
  const { data: userRole } = useUserRole();
  const { data: statsData, isLoading: statsLoading } = useSchoolStats();
  const { data: studentStats, isLoading: studentStatsLoading } = useStudentDashboardStats();
  const { data: systemStats, isLoading: systemStatsLoading } = useSystemStats();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Different dashboard content based on user role
  const isSystemManager = userRole?.role === 'super_admin';
  const isSchoolAdmin = userRole?.role === 'admin';
  const isAcademicDirector = userRole?.role === 'academic_director';
  const isTeacher = userRole?.role === 'teacher';
  const isAccountant = userRole?.role === 'accountant';
  const isSupervisor = userRole?.role === 'supervisor';
  const isStudent = userRole?.role === 'student';

  // System Manager Dashboard (Super Admin)
  if (isSystemManager) {
    const enhancedSystemStats = [
      {
        title: t('dashboard.totalSchools'),
        value: systemStatsLoading ? '...' : (systemStats?.totalSchools || 0),
        icon: Building2,
        description: t('dashboard.schoolsOverviewDescription'),
        color: 'blue' as const,
        trend: { value: systemStats?.schoolsGrowth || 0, isPositive: true }
      },
      {
        title: t('dashboard.activeSchools'),
        value: systemStatsLoading ? '...' : (systemStats?.activeSchools || 0),
        icon: Zap,
        description: t('dashboard.activeSchools'),
        color: 'green' as const,
        trend: { value: 8.5, isPositive: true }
      },
      {
        title: t('dashboard.totalUsers'),
        value: systemStatsLoading ? '...' : (systemStats?.totalUsers || 0),
        icon: Users,
        description: t('dashboard.totalUsers'),
        color: 'purple' as const,
        trend: { value: systemStats?.usersGrowth || 0, isPositive: true }
      },
      {
        title: t('dashboard.monthlyRevenue'),
        value: systemStatsLoading ? '...' : `${new Intl.NumberFormat('fr-FR').format(systemStats?.totalRevenue || 0)} MRU`,
        icon: DollarSign,
        description: t('dashboard.monthlyRevenue'),
        color: 'green' as const,
        trend: { value: systemStats?.revenueGrowth || 0, isPositive: true }
      },
      {
        title: t('dashboard.totalStudents'),
        value: systemStatsLoading ? '...' : (systemStats?.totalStudents || 0),
        // icon Ascending
        icon: GraduationCap,
        description: t('dashboard.totalStudents'),
        color: 'blue' as const,
        trend: { value: 6.2, isPositive: true }
      },
      {
        title: t('dashboard.totalTeachers'),
        value: systemStatsLoading ? '...' : (systemStats?.totalTeachers || 0),
        icon: UserCheck,
        description: t('dashboard.totalTeachers'),
        color: 'purple' as const,
        trend: { value: 4.1, isPositive: true }
      },
      {
        title: t('dashboard.premiumSchools'),
        value: systemStatsLoading ? '...' : (systemStats?.premiumTierSchools || 0),
        icon: Building2,
        description: t('dashboard.premiumSchools'),
        color: 'purple' as const,
        trend: { value: 15.3, isPositive: true }
      },
      {
        title: t('dashboard.systemAbsenceRate'),
        value: systemStatsLoading ? '...' : `${systemStats?.systemAbsenceRate || 0}%`,
        icon: Activity,
        description: t('dashboard.systemAbsenceRate'),
        color: systemStats?.systemAbsenceRate && systemStats.systemAbsenceRate <= 5 ? 'green' as const : 'red' as const,
        trend: { value: -2.1, isPositive: false }
      },
    ];

    return (
      <DashboardLayout>
        <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('dashboard.systemManagementDashboard')}</h2>
            <p className="text-muted-foreground mt-2">{t('dashboard.systemManagementDescription')}</p>
          </div>

          {/* Enhanced System Stats Cards */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {enhancedSystemStats.map((stat, index) => (
              <EnhancedStatsCard
                key={index}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                description={stat.description}
                trend={stat.trend}
                color={stat.color}
              />
            ))}
          </div>

          {/* System Analytics Charts */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
            <Card className="p-4 sm:p-6">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  <span className="hidden sm:inline">{t('dashboard.schoolsBySubscriptionStatus')}</span>
                  <span className="sm:hidden">{t('dashboard.schoolsBySubscriptionStatus')}</span>
                </CardTitle>
                <CardDescription className="hidden sm:block">{t('dashboard.schoolsBySubscriptionStatusDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {systemStatsLoading ? (
                  <div className="space-y-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {systemStats?.schoolsByStatus && Object.entries(systemStats.schoolsByStatus).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{t(`dashboard.subscriptionStatus.${status}`)}</span>
                        <span className="text-sm font-bold">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="p-4 sm:p-6">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  <span className="hidden sm:inline">{t('dashboard.revenueByTier')}</span>
                  <span className="sm:hidden">{t('dashboard.revenueByTier')}</span>
                </CardTitle>
                <CardDescription className="hidden sm:block">{t('dashboard.revenueByTierDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {systemStatsLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {systemStats?.revenueByTier && Object.entries(systemStats.revenueByTier).map(([tier, revenue]) => (
                      <div key={tier} className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{t(`dashboard.subscriptionTier.${tier}`)}</span>
                        <span className="text-sm font-bold">{new Intl.NumberFormat('fr-FR').format(revenue as number)} MRU</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Schools Management */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1">
            <Card className="p-4 sm:p-6">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  <span className="hidden sm:inline">{t('dashboard.schoolsOverview')}</span>
                  <span className="sm:hidden">{t('dashboard.schoolsOverview')}</span>
                </CardTitle>
                <CardDescription className="hidden sm:block">{t('dashboard.schoolsOverviewDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
                    ))}
                  </div>
                ) : schools && schools.length > 0 ? (
                  <div className="space-y-4">
                    {schools.map((school) => (
                      <div key={school.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 sm:p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{school.name}</p>
                          <p className="text-sm text-muted-foreground truncate">{school.email}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
                            school.subscription_status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {t(`dashboard.subscriptionStatus.${school.subscription_status}`)}
                          </span>
                          <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 whitespace-nowrap">
                            {t(`dashboard.subscriptionTier.${school.subscription_tier}`)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">{t('dashboard.noSchoolsFound')}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Enhanced school statistics with trends
  const enhancedStatsArray = [
    {
      title: t('dashboard.students'),
      value: statsLoading ? '...' : (statsData?.studentsCount || 332),
      icon: Users,
      description: t('dashboard.enrolledStudents'),
      roles: ['admin', 'academic_director', 'supervisor'],
      color: 'blue' as const,
      trend: { value: 8.2, isPositive: true }
    },
    {
      title: t('dashboard.teachers'),
      value: statsLoading ? '...' : (statsData?.teachersCount || 24),
      icon: UserCheck,
      description: t('dashboard.activeTeachers'),
      roles: ['admin', 'academic_director'],
      color: 'green' as const,
      trend: { value: 2.1, isPositive: true }
    },
    {
      title: t('dashboard.classes'),
      value: statsLoading ? '...' : (statsData?.classesCount || 18),
      icon: BookOpen,
      description: t('dashboard.activeClasses'),
      roles: ['admin', 'academic_director', 'teacher'],
      color: 'purple' as const,
      trend: { value: 0, isPositive: true }
    },
    // {
    //   title: t('dashboard.absenceRate'),
    //   value: statsLoading ? '...' : `${statsData?.absenceRate || 0}%`,
    //   icon: Calendar,
    //   description: t('dashboard.absenceRate'),
    //   roles: ['admin', 'academic_director', 'supervisor', 'teacher'],
    //   color: 'red' as const,
    //   trend: { value: -1.5, isPositive: false }
    // },
    {
      title: t('dashboard.grades'),
      value: statsLoading ? '...' : (statsData?.gradesCount || 8),
      icon: GraduationCap,
      description: t('dashboard.gradeLevels'),
      roles: ['admin', 'academic_director'],
      color: 'blue' as const,
      trend: { value: 0, isPositive: true }
    },
    {
      title: t('dashboard.monthlyPayments'),
      value: statsLoading ? '...' : `${new Intl.NumberFormat('fr-FR').format(statsData?.monthlyRevenue || 0)} MRU`,
      icon: CreditCard,
      description: t('dashboard.monthlyPayments'),
      roles: ['admin', 'accountant'],
      color: 'green' as const,
      trend: { value: 12.3, isPositive: true }
    },
    // {
    //   title: t('dashboard.averageMarks'),
    //   value: statsLoading ? '...' : `${statsData?.averageMark || 0}/20`,
    //   icon: Calculator,
    //   description: t('dashboard.averageMarks'),
    //   roles: ['admin', 'academic_director', 'teacher'],
    //   color: 'purple' as const,
    //   trend: { value: 3.2, isPositive: true }
    // },
    {
      title: t('dashboard.myAverage'),
      value: studentStatsLoading ? '...' : `${studentStats?.currentAverage || 0}/20`,
      icon: Calculator,
      description: t('dashboard.myAverage'),
      roles: ['student'],
      color: 'blue' as const,
      trend: { value: 2.1, isPositive: true }
    },
    // {
    //   title: t('dashboard.myAbsences'),
    //   value: studentStatsLoading ? '...' : `${studentStats?.absenceRate || 0}%`,
    //   icon: Calendar,
    //   description: t('dashboard.myAbsences'),
    //   roles: ['student'],
    //   color: studentStats?.absenceRate && studentStats.absenceRate <= 5 ? 'green' as const : 'red' as const,
    //   trend: { value: -1.5, isPositive: false }
    // },
    {
      title: t('dashboard.myBalance'),
      value: studentStatsLoading ? '...' : `${studentStats?.balance || 0} MRU`,
      icon: CreditCard,
      description: t('dashboard.myBalance'),
      roles: ['student'],
      color: studentStats?.balance && studentStats.balance >= 0 ? 'green' as const : 'red' as const,
      trend: { value: 0, isPositive: true }
    },
  ];

  // Filter stats based on user role
  const filteredStats = enhancedStatsArray.filter(stat => 
    stat.roles.includes(userRole?.role || '')
  );

  // Get charts to display based on role
  const getChartsForRole = () => {
    const charts = [];
    
    if (isSchoolAdmin || isAcademicDirector || isSupervisor) {
      charts.push(
        { component: <AttendanceChart key="attendance" />, span: 'lg:col-span-4' },
        { component: <StudentsGradeChart key="grades" />, span: 'lg:col-span-3' }
      );
    }
    
    if (isSchoolAdmin || isAccountant) {
      charts.push(
        { component: <PaymentsChart key="payments" />, span: 'lg:col-span-4' }
      );
    }
    
    if (isSchoolAdmin || isAcademicDirector || isTeacher) {
      charts.push(
        { component: <MarksDistributionChart key="marks" />, span: 'lg:col-span-3' }
      );
    }
    
    // Student-specific charts
    if (isStudent) {
      charts.push(
        { component: <StudentAttendanceOverview key="student-attendance" />, span: 'lg:col-span-2' },
        { component: <StudentRecentMarks key="student-marks" />, span: 'lg:col-span-3' },
        { component: <StudentPaymentHistory key="student-payments" />, span: 'lg:col-span-2' }
      );
    }
    
    return charts;
  };

  const charts = getChartsForRole();

  // Role-specific quick actions
  const getQuickActions = () => {
    const actions = [];
    
    if (isSchoolAdmin) {
      actions.push(
        { label: t('dashboard.manageStudents'), action: '/dashboard/students' },
        { label: t('dashboard.manageTeachers'), action: '/dashboard/teachers' },
        { label: t('dashboard.viewReports'), action: '/marks' },
        { label: t('dashboard.systemSettings'), action: '/dashboard/settings' }
      );
    } else if (isAcademicDirector) {
      actions.push(
        { label: t('dashboard.manageStudents'), action: '/dashboard/students' },
        { label: t('dashboard.manageClasses'), action: '/dashboard/classes' },
        { label: t('dashboard.viewSchedules'), action: '/dashboard/schedules' },
        { label: t('dashboard.checkAttendance'), action: '/dashboard/absences' }
      );
    } else if (isTeacher) {
      actions.push(
        { label: t('dashboard.viewSchedules'), action: '/dashboard/schedules' },
        { label: t('dashboard.markAttendance'), action: '/dashboard/absences' },
        { label: t('dashboard.enterMarks'), action: '/marks' },
        { label: t('dashboard.viewClasses'), action: '/dashboard/classes' }
      );
    } else if (isAccountant) {
      actions.push(
        { label: t('dashboard.managePayments'), action: '/payments' },
        { label: t('dashboard.viewStudents'), action: '/dashboard/students' },
        { label: t('dashboard.generateReports'), action: '/marks' }
      );
    } else if (isSupervisor) {
      actions.push(
        { label: t('dashboard.checkAttendance'), action: '/dashboard/absences' },
        { label: t('dashboard.viewStudents'), action: '/dashboard/students' },
        { label: t('dashboard.viewSchedules'), action: '/dashboard/schedules' }
      );
    } else if (isStudent) {
      actions.push(
        { label: t('dashboard.viewSchedules'), action: '/dashboard/schedules' },
        { label: t('dashboard.viewMarks'), action: '/marks' },
        { label: t('dashboard.viewPayments'), action: '/payments' },
        { label: t('dashboard.checkAttendance'), action: '/dashboard/absences' }
      );
    }
    
    return actions;
  };

  const quickActions = getQuickActions();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {isStudent ? t('dashboard.studentDashboard') : t('dashboard.title')}
          </h2>
          <p className="text-muted-foreground mt-2">
            {isStudent 
              ? t('dashboard.studentWelcome')
              : isTeacher 
                ? t('dashboard.teacherWelcome')
                : isAcademicDirector
                  ? t('dashboard.academicDirectorWelcome')
                  : isAccountant
                    ? t('dashboard.accountantWelcome')
                    : isSupervisor
                      ? t('dashboard.supervisorWelcome')
                      : t('dashboard.welcome')
            }
          </p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {filteredStats.map((stat, index) => (
            <EnhancedStatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              description={stat.description}
              trend={stat.trend}
              color={stat.color}
            />
          ))}
        </div>

        {/* Charts Section */}
        {charts.length > 0 && (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-7">
            {charts.map((chart, index) => (
              <div key={index} className={chart.span}>
                {chart.component}
              </div>
            ))}
          </div>
        )}

        {/* Main Content Area - Different for Students */}
        {isStudent ? (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
            <StudentRecentMarks />
            <StudentPaymentHistory />
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-7">
            <Card className="lg:col-span-4 p-4 sm:p-6 animate-fade-in">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {t('dashboard.recentActivity')}
                </CardTitle>
                <CardDescription>{t('dashboard.recentActivity')}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{t('dashboard.noRecentActivity')}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3 p-4 sm:p-6 animate-fade-in">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {t('dashboard.quickActions')}
                </CardTitle>
                <CardDescription>{t('dashboard.quickActions')}</CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-2">
                {quickActions.map((action, index) => (
                  <button 
                    key={index}
                    className="w-full text-left p-3 rounded hover:bg-accent hover:text-accent-foreground text-sm transition-all duration-200 hover-scale"
                    onClick={() => navigate(action.action)}
                  >
                    {action.label}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Student Quick Actions */}
        {isStudent && (
          <Card className="p-4 sm:p-6 animate-fade-in">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t('dashboard.quickActionsStudent')}
              </CardTitle>
              <CardDescription>{t('dashboard.quickActionsStudent')}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {quickActions.map((action, index) => (
                  <button 
                    key={index}
                    className="p-3 rounded hover:bg-accent hover:text-accent-foreground text-sm transition-all duration-200 hover-scale text-center"
                    onClick={() => navigate(action.action)}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}