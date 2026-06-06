import { useState, useRef } from "react";
import { User, Mail, Calendar, Crown, Camera } from "lucide-react";
import "./Profile.css";

// Hardcoded placeholder — replace with real user data from backend when ready
const PLACEHOLDER_USER = {
  name:        "Alif Rony",
  username:    "@alifrony",
  email:       "alif@gmail.com",
  memberSince: "January 2025",
  plan:        "Pro", // "Free" | "Basic" | "Pro"
};

const PLANS = {
  Free:  { price: "$0/month",    color: "#95a3b5" },
  Basic: { price: "$2.99/month", color: "#63b3ed" },
  Pro:   { price: "$9.99/month", color: "#22e6a8" },
};

function Profile() {
  // Local avatar preview — not uploaded or saved anywhere
  // Future: replace with a cloud upload call in handleAvatarChange
  const [avatarUrl, setAvatarUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarUrl(ev.target.result);
    reader.readAsDataURL(file);
  };

  const plan = PLANS[PLACEHOLDER_USER.plan];

  return (
    <section className="profile-page">
      <div className="profile-card identity-card">

        {/* ── Avatar ───────────────────────────────────────────── */}
        <div className="avatar-area">
          <div className="avatar-ring">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className="avatar-img" />
            ) : (
              <div className="avatar-placeholder">
                <User size={52} strokeWidth={1.2} />
              </div>
            )}
          </div>

          {/* Hidden file input triggered by the button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="avatar-file-input"
            onChange={handleAvatarChange}
          />

          <button
            className="change-avatar-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera size={14} />
            Change Avatar
          </button>
        </div>

        {/* ── Identity Info ────────────────────────────────────── */}
        <div className="identity-info">
          <h2 className="profile-name">{PLACEHOLDER_USER.name}</h2>
          <p className="profile-username">{PLACEHOLDER_USER.username}</p>

          <div className="identity-fields">
            <div className="identity-row">
              <Mail size={14} />
              <div>
                <p className="field-label">Email</p>
                <p className="field-value">{PLACEHOLDER_USER.email}</p>
              </div>
            </div>

            <div className="identity-row">
              <Calendar size={14} />
              <div>
                <p className="field-label">Member Since</p>
                <p className="field-value">{PLACEHOLDER_USER.memberSince}</p>
              </div>
            </div>

            <div className="identity-row">
              <Crown size={14} />
              <div>
                <p className="field-label">Subscription Plan</p>
                <div className="plan-row">
                  <p className="field-value">{PLACEHOLDER_USER.plan}</p>
                  <span
                    className="plan-badge"
                    style={{
                      color:       plan.color,
                      borderColor: `${plan.color}44`,
                      background:  `${plan.color}12`,
                    }}
                  >
                    {plan.price}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

export default Profile;
