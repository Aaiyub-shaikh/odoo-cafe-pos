import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, LogOut, Menu, Moon, Sun, User } from 'lucide-react'
import { SearchInput } from '@/components/shared/SearchInput'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore, useSessionStore, useUIStore } from '@/store'
import { isAdmin } from '@/utils/permissions'
import { mockNotifications } from '@/mock/misc'
import { cn, formatDateTime } from '@/utils'

export function Topbar() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const { user, logout } = useAuthStore()
  const { session } = useSessionStore()
  const { theme, toggleTheme, toggleMobileSidebar } = useUIStore()

  const showMobileMenu = user && isAdmin(user.role)

  const unreadCount = mockNotifications.filter((n) => !n.read).length

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card px-3 shadow-sm sm:h-16 sm:gap-4 sm:px-4 lg:px-6">
      {showMobileMenu && (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMobileSidebar}
        className="shrink-0 text-muted-foreground lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>
      )}

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search..."
        className="hidden min-w-0 flex-1 sm:flex sm:max-w-xs md:max-w-md"
      />

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        {session && (
          <Badge
            variant={session.status === 'open' ? 'success' : 'secondary'}
            className="hidden gap-1.5 sm:inline-flex"
          >
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                session.status === 'open' ? 'bg-emerald-400' : 'bg-muted-foreground'
              )}
            />
            <span className="hidden sm:inline">Session </span>
            {session.status}
          </Badge>
        )}

        <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground">
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] max-w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {mockNotifications.map((notification) => (
              <DropdownMenuItem key={notification.id} className="flex flex-col items-start gap-1 py-2">
                <div className="flex w-full items-center justify-between">
                  <span className="text-sm font-medium">{notification.title}</span>
                  {!notification.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <span className="text-xs text-muted-foreground">{notification.message}</span>
                <span className="text-[10px] text-muted-foreground">{formatDateTime(notification.createdAt)}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-1.5 sm:px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/15 text-xs text-primary">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <span className="text-xs capitalize text-muted-foreground">{user?.role === 'admin' ? 'Admin' : 'Employee'}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
