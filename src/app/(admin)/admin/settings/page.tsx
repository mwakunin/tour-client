"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Save, Bell, Globe, Mail, Lock, Users } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Card from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/toast";

export default function SettingsPage() {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState("general");

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "Footloose Adventures",
    siteDescription: "Discover unforgettable safari experiences",
    contactEmail: "info@footlooseadventures.co.ke",
    contactPhone: "+254 123 456 789",
    address: "Nairobi, Kenya",
  });

  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: "",
    smtpPort: "587",
    smtpUser: "",
    smtpPassword: "",
    fromEmail: "noreply@footlooseadventures.co.ke",
    fromName: "Footloose Adventures",
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailOnNewBooking: true,
    emailOnCancellation: true,
    emailOnPayment: true,
    smsNotifications: false,
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      // Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return data;
    },
    onSuccess: () => {
      success("Settings saved successfully");
    },
    onError: () => {
      error("Failed to save settings");
    },
  });

  const handleSaveGeneral = () => {
    saveMutation.mutate({ type: "general", data: generalSettings });
  };

  const handleSaveEmail = () => {
    saveMutation.mutate({ type: "email", data: emailSettings });
  };

  const handleSaveNotifications = () => {
    saveMutation.mutate({ type: "notifications", data: notificationSettings });
  };

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "email", label: "Email", icon: Mail },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-600">Manage your application settings</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                } `}
              >
                <Icon size={20} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* General Settings */}
      {activeTab === "general" && (
        <div className="space-y-6">
          <Card title="General Information">
            <div className="space-y-4">
              <Input
                label="Site Name"
                value={generalSettings.siteName}
                onChange={(e) =>
                  setGeneralSettings({
                    ...generalSettings,
                    siteName: e.target.value,
                  })
                }
              />
              <Textarea
                label="Site Description"
                value={generalSettings.siteDescription}
                onChange={(e) =>
                  setGeneralSettings({
                    ...generalSettings,
                    siteDescription: e.target.value,
                  })
                }
                rows={3}
              />
            </div>
          </Card>

          <Card title="Contact Information">
            <div className="space-y-4">
              <Input
                label="Contact Email"
                type="email"
                value={generalSettings.contactEmail}
                onChange={(e) =>
                  setGeneralSettings({
                    ...generalSettings,
                    contactEmail: e.target.value,
                  })
                }
              />
              <Input
                label="Contact Phone"
                type="tel"
                value={generalSettings.contactPhone}
                onChange={(e) =>
                  setGeneralSettings({
                    ...generalSettings,
                    contactPhone: e.target.value,
                  })
                }
              />
              <Textarea
                label="Address"
                value={generalSettings.address}
                onChange={(e) =>
                  setGeneralSettings({
                    ...generalSettings,
                    address: e.target.value,
                  })
                }
                rows={2}
              />
            </div>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveGeneral} isLoading={saveMutation.isPending}>
              <Save className="mr-2" size={20} />
              Save Changes
            </Button>
          </div>
        </div>
      )}

      {/* Email Settings */}
      {activeTab === "email" && (
        <div className="space-y-6">
          <Card title="SMTP Configuration">
            <div className="space-y-4">
              <Input
                label="SMTP Host"
                value={emailSettings.smtpHost}
                onChange={(e) =>
                  setEmailSettings({
                    ...emailSettings,
                    smtpHost: e.target.value,
                  })
                }
                placeholder="smtp.example.com"
              />
              <Input
                label="SMTP Port"
                type="number"
                value={emailSettings.smtpPort}
                onChange={(e) =>
                  setEmailSettings({
                    ...emailSettings,
                    smtpPort: e.target.value,
                  })
                }
              />
              <Input
                label="SMTP Username"
                value={emailSettings.smtpUser}
                onChange={(e) =>
                  setEmailSettings({
                    ...emailSettings,
                    smtpUser: e.target.value,
                  })
                }
              />
              <Input
                label="SMTP Password"
                type="password"
                value={emailSettings.smtpPassword}
                onChange={(e) =>
                  setEmailSettings({
                    ...emailSettings,
                    smtpPassword: e.target.value,
                  })
                }
              />
            </div>
          </Card>

          <Card title="Email Defaults">
            <div className="space-y-4">
              <Input
                label="From Email"
                type="email"
                value={emailSettings.fromEmail}
                onChange={(e) =>
                  setEmailSettings({
                    ...emailSettings,
                    fromEmail: e.target.value,
                  })
                }
              />
              <Input
                label="From Name"
                value={emailSettings.fromName}
                onChange={(e) =>
                  setEmailSettings({
                    ...emailSettings,
                    fromName: e.target.value,
                  })
                }
              />
            </div>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveEmail} isLoading={saveMutation.isPending}>
              <Save className="mr-2" size={20} />
              Save Changes
            </Button>
          </div>
        </div>
      )}

      {/* Notification Settings */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          <Card title="Email Notifications">
            <div className="space-y-3">
              <Checkbox
                label="Receive email on new booking"
                checked={notificationSettings.emailOnNewBooking}
                onChange={(e) =>
                  setNotificationSettings({
                    ...notificationSettings,
                    emailOnNewBooking: e.target.checked,
                  })
                }
              />
              <Checkbox
                label="Receive email on booking cancellation"
                checked={notificationSettings.emailOnCancellation}
                onChange={(e) =>
                  setNotificationSettings({
                    ...notificationSettings,
                    emailOnCancellation: e.target.checked,
                  })
                }
              />
              <Checkbox
                label="Receive email on payment received"
                checked={notificationSettings.emailOnPayment}
                onChange={(e) =>
                  setNotificationSettings({
                    ...notificationSettings,
                    emailOnPayment: e.target.checked,
                  })
                }
              />
            </div>
          </Card>

          <Card title="SMS Notifications">
            <div className="space-y-3">
              <Checkbox
                label="Enable SMS notifications"
                checked={notificationSettings.smsNotifications}
                onChange={(e) =>
                  setNotificationSettings({
                    ...notificationSettings,
                    smsNotifications: e.target.checked,
                  })
                }
              />
              <p className="text-sm text-gray-500">
                SMS notifications require additional setup and may incur charges
              </p>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveNotifications} isLoading={saveMutation.isPending}>
              <Save className="mr-2" size={20} />
              Save Changes
            </Button>
          </div>
        </div>
      )}

      {/* Security Settings */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <Card title="Password & Authentication">
            <div className="space-y-4">
              <div className="bg-primary border-primary rounded-lg border p-4">
                <p className="text-primary text-sm">
                  <Lock className="mr-2 inline" size={16} />
                  Password and security settings management is coming soon. For now, contact support
                  if you need to reset your password or update your login method.
                </p>
              </div>
            </div>
          </Card>

          <Card title="Session Management">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Active Sessions</p>
                  <p className="text-sm text-gray-600">Manage your active login sessions</p>
                </div>
                <Button variant="primary">View Sessions</Button>
              </div>
            </div>
          </Card>

          <Card title="API Access">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">API Keys</p>
                  <p className="text-sm text-gray-600">Manage API keys for external integrations</p>
                </div>
                <Button variant="primary">Manage Keys</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
