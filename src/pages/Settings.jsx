import { useState } from "react";
import {
  Edit3, Lock, Bell, Moon, Sun, Globe, Shield,
  CreditCard, ChevronRight, HeadphonesIcon, Trash2, UserX,
} from "lucide-react";
import "./Settings.css";

const TIMEZONES = [
  { label: "London (GMT+0)",       value: "Europe/London"        },
  { label: "Paris (GMT+1)",        value: "Europe/Paris"         },
  { label: "Dubai (GMT+4)",        value: "Asia/Dubai"           },
  { label: "Karachi (GMT+5)",      value: "Asia/Karachi"         },
  { label: "Dhaka (GMT+6)",        value: "Asia/Dhaka"           },
  { label: "Bangkok (GMT+7)",      value: "Asia/Bangkok"         },
  { label: "Singapore (GMT+8)",    value: "Asia/Singapore"       },
  { label: "Tokyo (GMT+9)",        value: "Asia/Tokyo"           },
  { label: "Sydney (GMT+10)",      value: "Australia/Sydney"     },
  { label: "New York (GMT-5)",     value: "America/New_York"     },
  { label: "Chicago (GMT-6)",      value: "America/Chicago"      },
  { label: "Los Angeles (GMT-8)",  value: "America/Los_Angeles"  },
  { label: "Toronto (GMT-5)",      value: "America/Toronto"      },
  { label: "São Paulo (GMT-3)",    value: "America/Sao_Paulo"    },
  { label: "Johannesburg (GMT+2)", value: "Africa/Johannesburg"  },
  { label: "Nairobi (GMT+3)",      value: "Africa/Nairobi"       },
];

// Shared toggle row used across settings cards
function ToggleRow({ icon, title, desc, value, onChange }) {
  return (
    <div className="settings-row">
      <div className="settings-row-left">
        <div className="settings-icon">{icon}</div>
        <div>
          <p className="settings-title">{title}</p>
          <p className="settings-desc">{desc}</p>
        </div>
      </div>
      <button
        className={`toggle-switch ${value ? "toggle-on" : ""}`}
        onClick={() => onChange(!value)}
        aria-label={`Toggle ${title}`}
      />
    </div>
  );
}

// Clickable action row with a chevron arrow
function ActionRow({ icon, title, desc, badge }) {
  return (
    <button className="settings-row action-row">
      <div className="settings-row-left">
        <div className="settings-icon">{icon}</div>
        <div>
          <p className="settings-title">{title}</p>
          {desc && <p className="settings-desc">{desc}</p>}
        </div>
      </div>
      {badge
        ? <span className="settings-badge">{badge}</span>
        : <ChevronRight size={16} className="settings-chevron" />
      }
    </button>
  );
}

function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode,      setDarkMode]      = useState(true);

  const detectedZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [timezone, setTimezone] = useState(detectedZone || "Europe/London");

  return (
    <section className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage how the app looks and behaves for you.</p>
      </div>

      <div className="settings-grid">

        {/* ── Profile ──────────────────────────────── */}
        <div className="settings-card">
          <p className="card-label">Profile</p>
          <ActionRow
            icon={<Edit3 size={16} />}
            title="Edit Profile"
            desc="Update your name, username and email"
          />
        </div>

        {/* ── Preferences ──────────────────────────── */}
        <div className="settings-card">
          <p className="card-label">Preferences</p>

          <ToggleRow
            icon={<Bell size={16} />}
            title="Notifications"
            desc="Price alerts, news updates and announcements"
            value={notifications}
            onChange={setNotifications}
          />

          <ToggleRow
            icon={darkMode ? <Moon size={16} /> : <Sun size={16} />}
            title="Dark Mode"
            desc={`Currently ${darkMode ? "enabled" : "disabled"}`}
            value={darkMode}
            onChange={setDarkMode}
          />

          {/* Timezone */}
          <div className="settings-row">
            <div className="settings-row-left">
              <div className="settings-icon"><Globe size={16} /></div>
              <div>
                <p className="settings-title">Timezone &amp; Location</p>
                <p className="settings-desc">{timezone}</p>
              </div>
            </div>
            <select
              className="timezone-select"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            >
              {!TIMEZONES.find((t) => t.value === detectedZone) && (
                <option value={detectedZone}>{detectedZone} (detected)</option>
              )}
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Security ─────────────────────────────── */}
        <div className="settings-card">
          <p className="card-label">Security</p>

          <ActionRow
            icon={<Lock size={16} />}
            title="Change Password"
            desc="Update your account password"
          />

          <ActionRow
            icon={<Shield size={16} />}
            title="Two-Factor Authentication"
            desc="Add an extra layer of account security"
            badge="Off"
          />
        </div>

        {/* ── Subscription ─────────────────────────── */}
        <div className="settings-card">
          <p className="card-label">Subscription</p>

          <div className="settings-row plan-display-row">
            <div className="settings-row-left">
              <div className="settings-icon"><CreditCard size={16} /></div>
              <div>
                <p className="settings-title">Current Plan</p>
                <p className="settings-desc">You are on the Pro plan</p>
              </div>
            </div>
            <span className="plan-badge-green">Pro · $9.99/mo</span>
          </div>

          <ActionRow
            icon={<CreditCard size={16} />}
            title="Manage Subscription"
            desc="Upgrade, downgrade or cancel your plan"
          />
        </div>

        {/* ── Support ──────────────────────────────── */}
        <div className="settings-card">
          <p className="card-label">Support</p>
          <ActionRow
            icon={<HeadphonesIcon size={16} />}
            title="Contact Support"
            desc="Get help from our support team"
          />
        </div>

        {/* ── Danger Zone ──────────────────────────── */}
        <div className="settings-card danger-card">
          <p className="card-label danger-label">Danger Zone</p>
          <p className="danger-desc">
            These actions are permanent and cannot be undone.
          </p>
          <div className="danger-buttons">
            <button className="danger-outline-btn">
              <UserX size={15} />
              Deactivate Account
            </button>
            <button className="danger-solid-btn">
              <Trash2 size={15} />
              Delete Account
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}

export default Settings;
