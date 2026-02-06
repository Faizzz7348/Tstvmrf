"use client"

import { PageLayout } from "@/components/page-layout"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <PageLayout>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex h-16 items-center gap-4 px-6">
          <SidebarTrigger className="h-9 w-9" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold">{t('settingsTitle')}</h1>
            <p className="text-sm text-muted-foreground">Application preferences</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
        <div className="rounded-xl bg-muted/50 p-8">
            <h1 className="text-3xl font-bold mb-4">
              ⚙️ {t('settingsTitle')}
            </h1>
            <p className="text-muted-foreground mb-6">
              Manage application preferences and configurations.
            </p>

            <div className="space-y-6 max-w-3xl">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="font-semibold mb-4">{t('language')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t('selectLanguage')}</label>
                    <div className="flex gap-2">
                      <Button
                        variant={language === 'en' ? 'default' : 'outline'}
                        onClick={() => setLanguage('en')}
                        className="flex-1"
                      >
                        {t('english')}
                      </Button>
                      <Button
                        variant={language === 'ms' ? 'default' : 'outline'}
                        onClick={() => setLanguage('ms')}
                        className="flex-1"
                      >
                        {t('malay')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="font-semibold mb-4">Profile</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Name</label>
                    <div className="text-sm text-muted-foreground">Username</div>
                  </div>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <div className="text-sm text-muted-foreground">user@example.com</div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="font-semibold mb-4">Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{t('theme')}</div>
                      <div className="text-sm text-muted-foreground">Toggle between light and dark mode</div>
                    </div>
                    <ThemeToggle />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Notifications</div>
                      <div className="text-sm text-muted-foreground">Receive push notifications</div>
                    </div>
                    <div className="w-12 h-6 bg-primary rounded-full flex items-center justify-end px-1">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="font-semibold mb-4">Security</h3>
                <div className="space-y-4">
                  <div>
                    <div className="font-medium mb-1">Password</div>
                    <div className="text-sm text-muted-foreground mb-2">Last changed 30 days ago</div>
                    <button className="text-sm text-primary hover:underline">Change Password</button>
                  </div>
                  <Separator />
                  <div>
                    <div className="font-medium mb-1">Two-Factor Authentication</div>
                    <div className="text-sm text-muted-foreground mb-2">Add an extra layer of security</div>
                    <button className="text-sm text-primary hover:underline">Enable 2FA</button>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
    </PageLayout>
  )
}
