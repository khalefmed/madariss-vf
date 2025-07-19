import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react"; // Changed Sidebar to Menu for a more common icon
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage, Language } from "@/contexts/LanguageContext"; // Import Language type
import { useUserRole } from '@/hooks/useUserRole';
import {
  BookOpen,
  Calendar,
  ClipboardCheck,
  CreditCard,
  FileText,
  GraduationCap,
  Settings,
  Trophy,
  UserCheck,
  Users,
  School2,
  Briefcase,
  ChevronDown,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";

interface MenuItem {
  icon: React.ComponentType<any>;
  label: string;
  href: string;
  roles: string[];
}

// Updated LanguageDropdown to use currentLanguage and setLanguage from your context
function LanguageDropdown() {
  const { currentLanguage, setLanguage, t } = useLanguage(); // Get t, currentLanguage, setLanguage

  const languages = [
    { code: 'en' as Language, name: 'English' },
    { code: 'fr' as Language, name: 'Françaissss' },
    { code: 'ar' as Language, name: 'العربية' },
  ];

  // Helper to get the display name for the current language
  const getCurrentLanguageName = () => {
    const lang = languages.find(l => l.code === currentLanguage);
    return lang ? lang.name : 'English'; // Default to English if not found
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between pr-3 pl-4 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <span>{getCurrentLanguageName()}</span> {/* Display the language name */}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[calc(100%-2rem)]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)} // Use setLanguage
            className={cn(
              "cursor-pointer",
              currentLanguage === lang.code && "bg-accent text-accent-foreground"
            )}
          >
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


export function EnhancedSidebar() {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const { data: userRole } = useUserRole();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const menuItems: MenuItem[] = [
    {
      icon: LayoutDashboard,
      label: t('nav.dashboard'),
      href: '/dashboard',
      roles: ['admin', 'super_admin', 'academic_director', 'teacher', 'supervisor', 'accountant']
    },
    {
      icon: GraduationCap,
      label: t('nav.students'),
      href: '/dashboard/students',
      roles: ['admin', 'super_admin']
    },
    {
      icon: Users,
      label: t('nav.teachers'),
      href: '/dashboard/teachers',
      roles: ['admin', 'super_admin']
    },
    {
      icon: BookOpen,
      label: t('nav.classes'),
      href: '/dashboard/classes',
      roles: ['admin', 'super_admin']
    },
    {
      icon: Trophy,
      label: t('nav.grades'),
      href: '/dashboard/grades',
      roles: ['admin', 'super_admin']
    },
    {
      icon: Calendar,
      label: t('nav.schedules'),
      href: '/dashboard/schedules',
      roles: ['admin', 'super_admin', 'academic_director', 'teacher']
    },
    {
      icon: ClipboardCheck,
      label: t('nav.absences'),
      href: '/dashboard/absences',
      roles: ['admin', 'super_admin', 'academic_director', 'teacher', 'supervisor']
    },
    {
      icon: FileText,
      label: t('nav.academicYears'),
      href: '/dashboard/academic-years',
      roles: ['admin', 'super_admin']
    },
    {
      icon: Calendar,
      label: t('nav.academicQuarters'),
      href: '/dashboard/academic-quarters',
      roles: ['admin', 'super_admin']
    },
    {
      icon: CreditCard,
      label: t('nav.payments'),
      href: '/payments',
      roles: ['admin', 'super_admin', 'accountant']
    },
    {
      icon: UserCheck,
      label: 'Comptes Étudiants',
      href: '/dashboard/student-accounts',
      roles: ['admin', 'super_admin']
    },
    {
      icon: Briefcase,
      label: 'Comptes Enseignants',
      href: '/dashboard/teacher-accounts',
      roles: ['admin', 'super_admin']
    },
    {
      icon: Users,
      label: t('nav.accounts'),
      href: '/dashboard/accounts',
      roles: ['admin', 'super_admin']
    },
    {
      icon: School2,
      label: t('nav.schools'),
      href: '/dashboard/schools',
      roles: ['super_admin']
    },
    {
      icon: Settings,
      label: t('nav.settings'),
      href: '/dashboard/settings',
      roles: ['admin', 'super_admin', 'academic_director', 'teacher', 'supervisor', 'accountant']
    }
  ];

  const filteredMenuItems = menuItems.filter(item =>
    item.roles.includes(userRole?.role || '')
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open sidebar"
          className="md:hidden"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:border-r md:border-gray-200 dark:md:border-gray-800 bg-white dark:bg-gray-950">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex-shrink-0 flex items-center px-4 mb-6">
            <img
              src="/logo.png"
              alt="Your Company Logo"
              className="h-10 w-auto object-contain"
            />
          </div>

          <div className="mb-4 px-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center w-full justify-start gap-3 p-2 font-semibold text-left rounded-lg transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={`https://avatar.vercel.sh/${user?.email}.png`} alt={user?.email || "Avatar"} />
                    <AvatarFallback className="bg-primary/20 text-primary-foreground">
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col text-sm overflow-hidden">
                    <span className="font-medium truncate text-gray-900 dark:text-gray-50">{user?.email}</span>
                    <span className="text-muted-foreground truncate text-xs">
                      {userRole?.role ? t(`roles.${userRole.role}`) : t('nav.noRole')}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[calc(100%-2rem)]" align="start">
                <DropdownMenuLabel className="font-semibold text-base">{t('nav.myAccount')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  
                  Mohamed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mb-6 px-4">
            <LanguageDropdown />
          </div>

          <nav className="flex-1 px-2 space-y-1">
            {filteredMenuItems.map(item => (
              <li key={item.href} className="list-none">
                <Link
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors duration-200",
                    "hover:bg-gray-100 dark:hover:bg-gray-800",
                    location.pathname === item.href
                      ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground"
                      : "text-gray-700 dark:text-gray-300"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </nav>
        </div>
      </div>

      <SheetContent
        side="left"
        className="w-80 p-0 flex flex-col bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800"
      >
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex-shrink-0 flex items-center px-6 mb-6">
            <img
              src="/logo.png"
              alt="Your Company Logo"
              className="h-10 w-auto object-contain"
            />
          </div>

          <div className="mb-4 px-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center w-full justify-start gap-3 p-2 font-semibold text-left rounded-lg transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={`https://avatar.vercel.sh/${user?.email}.png`} alt={user?.email || "Avatar"} />
                    <AvatarFallback className="bg-primary/20 text-primary-foreground">
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col text-sm overflow-hidden">
                    <span className="font-medium truncate text-gray-900 dark:text-gray-50">{user?.email}</span>
                    <span className="text-muted-foreground truncate text-xs">
                      {userRole?.role ? t(`roles.${userRole.role}`) : t('nav.noRole')}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[calc(100%-3rem)]" align="start">
                <DropdownMenuLabel className="font-semibold text-base">{t('nav.myAccount')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('nav.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mb-6 px-6">
            <LanguageDropdown />
          </div>

          <nav className="flex-1 px-4 space-y-1">
            <ul className="space-y-1">
              {filteredMenuItems.map(item => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors duration-200",
                      "hover:bg-gray-100 dark:hover:bg-gray-800",
                      location.pathname === item.href
                        ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground"
                        : "text-gray-700 dark:text-gray-300"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}