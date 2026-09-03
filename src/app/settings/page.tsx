"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogOut, Trash2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { authApi } from "@/lib/api-client";
import { ProtectedRoute } from "@/components/protected-route";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [language, setLanguage] = useState(user?.preferred_language ?? "en");
  const [saving, setSaving] = useState(false);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  async function saveProfile() {
    setSaving(true);
    try {
      await updateProfile({ name, phone: phone || undefined, preferred_language: language });
      toast.success("Profile updated.");
    } catch {
      toast.error("Unable to save profile.");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    if (newPw.length < 8) return toast.error("Password must be at least 8 characters.");
    if (!/[A-Z]/.test(newPw)) return toast.error("Password must include an uppercase letter.");
    if (!/\d/.test(newPw)) return toast.error("Password must include a number.");
    if (newPw !== confirmPw) return toast.error("Passwords do not match.");
    setChangingPw(true);
    try {
      await authApi.changePassword({ current_password: currentPw, new_password: newPw });
      toast.success("Password changed successfully.");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to change password.";
      toast.error(msg);
    } finally {
      setChangingPw(false);
    }
  }

  async function deleteAccount() {
    if (!confirm("This will permanently delete your account and all assessments. Are you sure?")) return;
    try {
      await authApi.deleteAccount();
      logout();
      router.push("/");
      toast.success("Account deleted.");
    } catch {
      toast.error("Unable to delete account. Please try again.");
    }
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="max-w-2xl space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-sm text-[#66715f] mt-1">Manage your account and preferences.</p>
          </div>

          {/* Profile */}
          <Card className="border-[#d8d1bd]">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your name, contact and language preference.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Full name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Email</label>
                <Input value={user?.email ?? ""} disabled className="bg-[#f9fafb] text-[#9ca3af]" />
                <p className="text-xs text-[#9ca3af]">Email cannot be changed after registration.</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Phone</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Preferred language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
                >
                  <option value="en">English</option>
                  <option value="hi">हिंदी (Hindi)</option>
                  <option value="kn">ಕನ್ನಡ (Kannada)</option>
                </select>
              </div>
              <Button onClick={saveProfile} disabled={saving} className="bg-[#166534] hover:bg-[#14532d]">
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </CardContent>
          </Card>

          {/* Change password */}
          <Card className="border-[#d8d1bd]">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Current password</label>
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"}
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    className="pr-10"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]">
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">New password</label>
                <Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Min 8 chars, 1 uppercase, 1 number" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Confirm new password</label>
                <Input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
              </div>
              <Button onClick={changePassword} disabled={changingPw} variant="outline">
                {changingPw ? "Updating…" : "Update password"}
              </Button>
            </CardContent>
          </Card>

          {/* Danger zone */}
          <Card className="border-[#fca5a5]">
            <CardHeader>
              <CardTitle className="text-[#dc2626]">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full border-[#d1d5db]"
                onClick={() => { logout(); router.push("/"); }}
              >
                <LogOut className="size-4 mr-2" /> Sign out of all sessions
              </Button>
              <Button
                variant="outline"
                className="w-full border-[#fca5a5] text-[#dc2626] hover:bg-[#fee2e2]"
                onClick={deleteAccount}
              >
                <Trash2 className="size-4 mr-2" /> Delete account and all data
              </Button>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card className="border-[#d8d1bd]">
            <CardHeader>
              <CardTitle>Privacy & Data</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[#6b7280] space-y-2">
              <p>Your assessment data is stored securely and associated with your account only.</p>
              <p>Assessment data is used to provide AI advisory responses — only the relevant context is sent, not your personal details.</p>
              <p>Financial calculations are performed deterministically on the server. No calculation data is shared externally.</p>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
