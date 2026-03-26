import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, Bell, Mail, Shield, Database } from "lucide-react";
import { toast } from "sonner";

const AdminSettings = () => {
  const [platformName, setPlatformName] = useState("Study Center");
  const [platformDesc, setPlatformDesc] = useState("A centralized academic platform for verified study materials and AI-powered learning.");
  const [timezone, setTimezone] = useState("IST (GMT+5:30)");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [uploadAlerts, setUploadAlerts] = useState(true);
  const [userRegistration, setUserRegistration] = useState(false);
  const [smtpServer, setSmtpServer] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [encryption, setEncryption] = useState("TLS");

  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your admin panel settings</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="col-span-2 space-y-6">
          {/* Platform Settings */}
          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <SettingsIcon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">Platform Settings</h3>
                  <p className="text-xs text-muted-foreground">General platform configuration</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-primary">Platform Name</Label>
                  <Input value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-primary">Platform Description</Label>
                  <Textarea value={platformDesc} onChange={(e) => setPlatformDesc(e.target.value)} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Time Zone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IST (GMT+5:30)">IST (GMT+5:30)</SelectItem>
                      <SelectItem value="UTC (GMT+0:00)">UTC (GMT+0:00)</SelectItem>
                      <SelectItem value="EST (GMT-5:00)">EST (GMT-5:00)</SelectItem>
                      <SelectItem value="PST (GMT-8:00)">PST (GMT-8:00)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10">
                  <Bell className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">Notifications</h3>
                  <p className="text-xs text-muted-foreground">Manage notification preferences</p>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Email Notifications", desc: "Receive email alerts for important events", value: emailNotifications, set: setEmailNotifications },
                  { label: "New Upload Alerts", desc: "Get notified when materials are uploaded", value: uploadAlerts, set: setUploadAlerts },
                  { label: "User Registration", desc: "Get notified about new user registrations", value: userRegistration, set: setUserRegistration },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-semibold text-primary">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch checked={item.value} onCheckedChange={item.set} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Email Configuration */}
          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-info/10">
                  <Mail className="h-4 w-4 text-info" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">Email Configuration</h3>
                  <p className="text-xs text-muted-foreground">Configure email server settings</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-primary">SMTP Server</Label>
                  <Input value={smtpServer} onChange={(e) => setSmtpServer(e.target.value)} placeholder="smtp.example.com" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Port</Label>
                    <Input value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Encryption</Label>
                    <Select value={encryption} onValueChange={setEncryption}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TLS">TLS</SelectItem>
                        <SelectItem value="SSL">SSL</SelectItem>
                        <SelectItem value="None">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSave} className="w-full">Save Changes</Button>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <Card className="shadow-card border-0">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-4 w-4 text-primary" />
                <h4 className="font-display text-sm font-bold text-foreground">Security</h4>
              </div>
              <div className="space-y-2">
                {["Change Password", "Two-Factor Auth", "Session Management"].map((item) => (
                  <button key={item} className="w-full rounded-lg bg-muted/50 px-3 py-2 text-left text-sm text-primary hover:bg-muted transition-colors">
                    {item}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-0">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Database className="h-4 w-4 text-primary" />
                <h4 className="font-display text-sm font-bold text-foreground">Data</h4>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Export Data", danger: false },
                  { label: "Backup Database", danger: false },
                  { label: "Clear Cache", danger: true },
                ].map((item) => (
                  <button key={item.label} className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${item.danger ? "bg-destructive/5 text-destructive hover:bg-destructive/10" : "bg-muted/50 text-primary hover:bg-muted"}`}>
                    {item.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;
