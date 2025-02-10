'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import { Moon, Sun, Laptop } from 'lucide-react'
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getFeatureLimits } from '../utils/userUtils'
import { toast } from 'react-toastify'

interface SettingsProps {
  userType: 'guest' | 'registered' | 'unauthenticated'
}

export function Settings({ userType }: SettingsProps) {
  const { theme, setTheme } = useTheme()
  const [isDiscoverable, setIsDiscoverable] = useState(true)
  const [isPublic, setIsPublic] = useState(true)
  const [dailyReminder, setDailyReminder] = useState(false)

  const limits = getFeatureLimits(userType)

  const handleExportData = () => {
    if (!limits.canExport) {
      toast.error('Export feature is only available for registered users.')
      return
    }
    // This is a placeholder function. In a real app, you'd fetch the user's data and create a download link.
    console.log("Exporting data...")
    toast.success('Data exported successfully!')
  }

  const handleChangePassword = () => {
    if (userType !== 'registered') {
      toast.error('Password change is only available for registered users.')
      return
    }
    // This is a placeholder function. In a real app, you'd open a modal or navigate to a password change page.
    console.log("Changing password...")
    toast.success('Password changed successfully!')
  }

  return (
    <motion.div 
      className="max-w-2xl mx-auto p-6 space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-semibold mb-6">Settings</h2>

      <div className="space-y-6">
        {userType === 'registered' && (
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Privacy</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="discoverable" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Allow others to find me</Label>
              <Switch
                id="discoverable"
                checked={isDiscoverable}
                onCheckedChange={setIsDiscoverable}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="public" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Make my appreciation list public</Label>
              <Switch
                id="public"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Appearance</h3>
          <div className="flex items-center justify-between">
            <Label htmlFor="theme" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Theme</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center">
                    <Sun className="mr-2 h-4 w-4" />
                    Light
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center">
                    <Moon className="mr-2 h-4 w-4" />
                    Dark
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center">
                    <Laptop className="mr-2 h-4 w-4" />
                    System
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {userType === 'registered' && (
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Notifications</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="reminder" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Daily appreciation reminder</Label>
              <Switch
                id="reminder"
                checked={dailyReminder}
                onCheckedChange={setDailyReminder}
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Account</h3>
          <div className="space-y-2">
            {userType === 'registered' && (
              <Button onClick={handleChangePassword} variant="outline" className="w-full">
                Change Password
              </Button>
            )}
            <Button onClick={handleExportData} variant="outline" className="w-full">
              Export Data
            </Button>
          </div>
        </div>

        {userType === 'guest' && (
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Upgrade Account</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Upgrade to a registered account to unlock all features, including unlimited appreciations, data sync across devices, and more!
            </p>
            <Button className="w-full">
              Upgrade to Full Account
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

