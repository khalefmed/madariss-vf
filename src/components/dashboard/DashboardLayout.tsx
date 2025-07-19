import { useNavigate } from "react-router-dom"
import {
  Menu,
  Home,
  Users,
  Settings,
  Book,
  Calendar,
  Calculator,
  LogOut,
  GraduationCap,
  Building2,
  UserCheck,
  BookOpen,
  CreditCard,
  Shield,
  User as UserIcon
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { useUserRole } from "@/hooks/useUserRole"
import { useLanguage } from "@/contexts/LanguageContext"
import LanguageSwitcher from "@/components/common/LanguageSwitcher"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { data: userRole } = useUserRole()
  const { t } = useLanguage()

  const adminNavItems = [
    { title: t('nav.home'), url: "/dashboard", icon: Home, allowedRoles: ['admin', 'teacher', 'academic_director', 'accountant', 'supervisor', 'student', 'super_admin'] },
    { title: t('nav.schools'), url: "/dashboard/schools", icon: Building2, allowedRoles: ['super_admin'] },
    { title: t('nav.accounts'), url: "/dashboard/accounts", icon: Shield, allowedRoles: ['admin'] },
    { title: t('nav.student_accounts'), url: "/dashboard/student-accounts", icon: UserCheck, allowedRoles: ['admin'] },
    { title: t('nav.students'), url: "/dashboard/students", icon: Users, allowedRoles: ['admin', 'academic_director'] },
    { title: t('nav.teachers'), url: "/dashboard/teachers", icon: Book, allowedRoles: ['admin', 'academic_director'] },
    { title: t('nav.teacher_accounts'), url: "/dashboard/teacher-accounts", icon: Users, allowedRoles: ['admin'] },
    { title: t('nav.classes'), url: "/dashboard/classes", icon: BookOpen, allowedRoles: ['admin', 'academic_director'] },
    { title: t('nav.grades'), url: "/dashboard/grades", icon: GraduationCap, allowedRoles: ['admin', 'academic_director'] },
    { title: t('nav.academic_years'), url: "/dashboard/academic-years", icon: Calendar, allowedRoles: ['admin'] },
    { title: t('nav.academic_quarters'), url: "/dashboard/academic-quarters", icon: Calendar, allowedRoles: ['admin'] },
    { title: t('nav.schedules'), url: "/dashboard/schedules", icon: Calendar, allowedRoles: ['admin', 'teacher', 'academic_director', 'student'] },
    { title: t('nav.absences'), url: "/dashboard/absences", icon: UserCheck, allowedRoles: ['admin', 'academic_director', 'supervisor', 'student'] },
    { title: t('nav.marks'), url: "/marks", icon: Calculator, allowedRoles: ['admin', 'teacher', 'academic_director', 'student'] },
    { title: t('nav.payments'), url: "/payments", icon: CreditCard, allowedRoles: ['admin', 'accountant', 'student'] },
    { title: t('nav.settings'), url: "/dashboard/settings", icon: Settings, allowedRoles: ['admin', 'teacher', 'academic_director', 'accountant', 'supervisor', 'student', 'super_admin'] },
  ]

  const filteredNavigationItems = adminNavItems.filter(item =>
    item.allowedRoles.includes(userRole?.role || '')
  )

  async function handleSignOut() {
    try {
      await signOut()
    } catch (error) {
      toast({
        title: "Sign out failed",
        description: "There was an error signing out. Please try again.",
        variant: "destructive"
      })
    }
  }

  const UserProfile = () => (
    <div className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-700 rounded-md mt-2">
      <div className="bg-primary text-white rounded-full p-2">
        <UserIcon className="h-5 w-5" />
      </div>
      <div className="truncate">
        <div className="text-sm font-medium truncate">{user?.email}</div>
        <div className="text-xs text-muted-foreground capitalize">
          {userRole?.role?.replace('_', ' ')}
        </div>
      </div>
    </div>
  )

  const SidebarContent = () => (
    <div className="flex flex-col gap-3 px-4">
      {/* Logo */}
      <div className="py-2 text-center">
        <img src="/logo.png" alt="Logo" className="h-10 mx-auto" />
      </div>

      <Separator />

      {/* Nav Items */}
      <div className="space-y-1">
        {filteredNavigationItems.map((item) => (
          <Button
            key={item.title}
            variant="ghost"
            className="w-full justify-start px-3 text-sm font-medium"
            onClick={() => navigate(item.url)}
          >
            <item.icon className="h-4 w-4 mr-2" />
            {item.title}
          </Button>
        ))}
      </div>

      <Separator />

      {/* User Info */}
      <UserProfile />

      {/* Language Switcher */}
      <div className="px-2 pt-1">
        <LanguageSwitcher />
      </div>

      {/* Logout */}
      <Button
        variant="ghost"
        className="w-full justify-start px-3 text-sm"
        onClick={handleSignOut}
      >
        <LogOut className="h-4 w-4 mr-2" />
        {t('nav.signOut')}
      </Button>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="md:hidden fixed top-4 left-4 z-50 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 bg-white dark:bg-gray-800 shadow-md"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <ScrollArea className="h-full py-6">
            <SidebarContent />
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <ScrollArea className="flex-1 py-6">
          <SidebarContent />
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-16 md:pt-0">
        <div className="h-full p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}