"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and workspace preferences</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <h2 className="text-sm font-semibold text-foreground">Account</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="display-name">Display name</Label>
            <Input id="display-name" defaultValue="Basma Web User" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="user@basmaweb.com" />
          </div>
        </div>
        <Button>Save Changes</Button>
      </div>

      <Separator />

      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <h2 className="text-sm font-semibold text-foreground">API Keys</h2>
        <div className="space-y-2">
          <Label htmlFor="api-key">Your API Key</Label>
          <div className="flex gap-2">
            <Input
              id="api-key"
              type="password"
              defaultValue="bsm_live_xxxxxxxxxxxxxxxxxxxx"
              readOnly
              className="flex-1 font-mono text-xs"
            />
            <Button variant="outline">Reveal</Button>
            <Button variant="outline">Regenerate</Button>
          </div>
        </div>
      </div>

      <Separator />

      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <h2 className="text-sm font-semibold text-foreground">Danger Zone</h2>
        <p className="text-sm text-muted-foreground">
          Deleting your workspace is permanent and cannot be undone.
        </p>
        <Button variant="destructive">Delete Workspace</Button>
      </div>
    </div>
  )
}
