import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, UtensilsCrossed, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { getNavItemsForRole } from '@/config/navigation'
import { useAuthStore, useUIStore } from '@/store'
import { cn } from '@/utils'

interface SidebarNavProps {
  collapsed?: boolean
  onNavigate?: () => void
}

function SidebarNav({ collapsed = false, onNavigate }: SidebarNavProps) {
  const user = useAuthStore((s) => s.user)
  const navItems = user ? getNavItemsForRole(user.role) : []

  if (navItems.length === 0) return null

  return (
    <nav className="flex flex-col gap-1 px-2">
      {navItems.map(({ to, label, icon: Icon, external }) => {
        const className = cn(
          'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
          collapsed && 'justify-center px-2',
          external
            ? 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            : undefined
        )

        const link = external ? (
          <a
            key={to}
            href={to}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onNavigate}
            className={className}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </a>
        ) : (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                className,
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        )

        if (collapsed) {
          return (
            <Tooltip key={to}>
              <TooltipTrigger asChild>{link}</TooltipTrigger>
              <TooltipContent side="right">{label}</TooltipContent>
            </Tooltip>
          )
        }

        return link
      })}
    </nav>
  )
}

function SidebarBrand({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={cn('flex h-16 items-center gap-3 px-4', collapsed && 'justify-center px-2')}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <UtensilsCrossed className="h-5 w-5" />
      </div>
      {!collapsed && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-foreground">RestMana</span>
          <span className="text-[10px] text-muted-foreground">Admin Panel</span>
        </motion.div>
      )}
    </div>
  )
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const user = useAuthStore((s) => s.user)

  if (!user || user.role !== 'admin') return null

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 72 : 260 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="relative hidden h-full shrink-0 flex-col border-r border-border bg-card shadow-sm lg:flex"
      >
        <div className="brand-stripe" />
        <SidebarBrand collapsed={sidebarCollapsed} />
        <Separator />
        <ScrollArea className="flex-1 py-3">
          <SidebarNav collapsed={sidebarCollapsed} />
        </ScrollArea>
        <div className="border-t border-border p-2">
          <Button
            variant="ghost"
            size={sidebarCollapsed ? 'icon' : 'default'}
            onClick={toggleSidebar}
            className={cn('w-full text-muted-foreground', !sidebarCollapsed && 'justify-start')}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!sidebarCollapsed && <span>Collapse</span>}
          </Button>
        </div>
      </motion.aside>
    </TooltipProvider>
  )
}

export function MobileSidebar() {
  const { mobileSidebarOpen, setMobileSidebarOpen } = useUIStore()
  const user = useAuthStore((s) => s.user)

  if (!user || user.role !== 'admin') return null

  return (
    <AnimatePresence>
      {mobileSidebarOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-border bg-card shadow-2xl lg:hidden"
          >
            <div className="brand-stripe" />
            <div className="flex items-center justify-between pr-2">
              <SidebarBrand collapsed={false} />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileSidebarOpen(false)}
                className="text-muted-foreground"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <Separator />
            <ScrollArea className="flex-1 py-3">
              <SidebarNav onNavigate={() => setMobileSidebarOpen(false)} />
            </ScrollArea>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
