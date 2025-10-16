import { LucideIcon } from 'lucide-react'

export interface NavTab {
  id: string
  label: string
  icon: LucideIcon
  badge?: number
}

interface BottomNavbarProps {
  tabs: NavTab[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

export default function BottomNavbar({ tabs, activeTab, onTabChange }: BottomNavbarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-neutral-200/80 shadow-2xl z-50 pb-safe">
      <div className="max-w-7xl mx-auto px-2">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-all duration-300 ${
                  isActive
                    ? 'text-neutral-900'
                    : 'text-neutral-400 hover:text-neutral-600'
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-neutral-900 rounded-full" />
                )}

                {/* Icon container */}
                <div className={`relative transition-all duration-300 ${
                  isActive ? 'scale-110' : 'scale-100'
                }`}>
                  <Icon className={`w-6 h-6 transition-all duration-300 ${
                    isActive ? 'stroke-[2.5]' : 'stroke-2'
                  }`} />

                  {/* Badge */}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-md">
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </div>
                  )}
                </div>

                {/* Label */}
                <span className={`text-xs font-medium transition-all duration-300 ${
                  isActive ? 'font-semibold' : 'font-normal'
                }`}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
