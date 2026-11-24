
import { useEffect } from 'react';
import './app.css';
import './studio-theme.css';
import startGallery from './engine.js';

function Icon({ name, size = 20 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  const paths = {
    smile: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <path d="M9 9h.01M15 9h.01" />
      </>
    ),
    plus: <><path d="M12 5v14M5 12h14" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" /></>,
    left: <><path d="m15 18-6-6 6-6" /></>,
    right: <><path d="m9 18 6-6-6-6" /></>,
    hand: <><path d="M8 11V5a2 2 0 0 1 4 0v5-7a2 2 0 0 1 4 0v8-5a2 2 0 0 1 4 0v8a7 7 0 0 1-7 7h-1a7 7 0 0 1-6-3l-3-4a2 2 0 0 1 3-3l2 2" /></>,
    dance: <><circle cx="12" cy="5" r="2" /><path d="m10 10 3-2 3 3 3 1M13 8l-1 5-4 3M12 13l4 3 1 4M8 16l-3 4" /></>,
    chair: <><path d="M7 10V5h10v5M5 10h14v6H5zM7 16v4M17 16v4M5 13H3M21 13h-2" /></>,
    palette: <><path d="M12 3a9 9 0 1 0 0 18h1.5a2.5 2.5 0 0 0 1.8-4.3 1.5 1.5 0 0 1 1.1-2.6H19a2 2 0 0 0 2-2A9 9 0 0 0 12 3Z" /><path d="M7.5 10h.01M10 7.5h.01M14 7.5h.01M16.5 10h.01" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></>,
    upload: <><path d="M12 16V4m-5 5 5-5 5 5M4 16v4h16v-4" /></>,
    message: <><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" /></>,
    mic: <><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8" /></>,
  };

  return <svg {...common}>{paths[name]}</svg>;
}

function IconButton({ id, label, children, className = '' }) {
  return (
    <button
      id={id}
      type="button"
      className={`icon-button ${className}`}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}

const fld = { padding: 11, borderRadius: 10, border: 0, background: '#2a2c35', color: '#fff', font: '14px system-ui,sans-serif' };
const pfBtn = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 50, borderRadius: 12, border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.06)', color: '#fff', font: '600 14px system-ui,sans-serif', cursor: 'pointer' };
const lnk = { background: 'none', border: 0, color: '#a99bff', cursor: 'pointer', fontSize: 12 };

export default function App() {
  useEffect(() => {
    startGallery();

    const toggle = document.getElementById('emoji-toggle');
    const picker = document.getElementById('emo');

    if (!toggle || !picker) return;

    const closePicker = () => {
      picker.classList.remove('emoji-open');
      toggle.setAttribute('aria-expanded', 'false');
    };

    const togglePicker = () => {
      const isOpen = picker.classList.toggle('emoji-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    };

    toggle.addEventListener('click', togglePicker);

    const handleOutsideClick = (event) => {
      if (
        !picker.contains(event.target) &&
        !toggle.contains(event.target)
      ) {
        closePicker();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') closePicker();
    };

    document.addEventListener('pointerdown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      toggle.removeEventListener('click', togglePicker);
      document.removeEventListener('pointerdown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <main className="gallery-app">

      {/* TOP NAVIGATION */}
      <header id="top" className="hud gallery-toolbar">

        <div className="toolbar-brand">
          <div className="brand-icon">
            <Icon name="image" size={19} />
          </div>
          <span className="brand-name">Open Studio</span>
        </div>

        <button id="add" className="add-painting">
          <Icon name="plus" size={18} />
          <span>Add painting</span>
        </button>

        <div className="room-controls">
          <span id="rn">Room 1 / 1</span>
        </div>

        <div className="action-controls">
          <IconButton id="wv" label="Wave">
            <Icon name="hand" />
          </IconButton>

          <IconButton id="dn" label="Dance">
            <Icon name="dance" />
          </IconButton>

          <IconButton id="look" label="Customize avatar">
            <Icon name="palette" />
          </IconButton>

          <IconButton id="mic" label="Open mic (M)">
            <Icon name="mic" />
          </IconButton>

          <IconButton id="prof" label="My profile">
            <Icon name="user" />
          </IconButton>
        </div>

        <button
          id="visitors-toggle"
          type="button"
          className="visitor-count"
          aria-label="Show gallery visitors"
          aria-expanded="false"
        >
          <Icon name="users" size={16} />
          <span id="count">Just you</span>
        </button>
      </header>

      {/* ONLINE VISITORS */}
      <div
        id="visitor-panel"
        className="visitor-panel"
        style={{ display: 'none' }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px'
        }}>
          <strong>People in the gallery</strong>

          <button
            id="visitor-close"
            type="button"
            aria-label="Close visitors"
            style={{
              border: 0,
              background: 'transparent',
              color: '#fff',
              fontSize: '22px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>

        <div id="visitor-list">
          <div style={{ opacity: .65, fontSize: '13px' }}>
            Looking for visitors...
          </div>
        </div>
      </div>

      {/* DESKTOP HELP */}
      <div id="help" className="hud">
        <div><span>WASD</span> Move</div>
        <div><span>Mouse</span> Look</div>
        <div><span>F</span> Wave</div>
        <div><span>G</span> Dance</div>
        <div><span>Enter</span> Chat</div>
        <div><span>M</span> Mic</div>
        <div><span>L</span> Elevator</div>
        <div><span>Z</span> Punch</div>
        <div><span>Q</span> Bow</div>
        <div><span>Y</span> Photobooth</div>
      </div>

      <div id="cap" className="hud" />

      {/* PAINTING PREVIEW */}
      <div id="pv">
        <button id="pvx" aria-label="Close preview">
          <Icon name="close" size={18} />
          <span>Close</span>
        </button>

        <img id="pvi" alt="" />
        <div id="pvc" />
      </div>

      {/* CHAT */}
      <div id="chat" className="hud chat-panel">
        <div className="chat-heading">
          <Icon name="message" size={16} />
          <span>Gallery chat</span>
        </div>

        <div id="log" />

        <div className="chat-input-wrap">
          <input
            id="cin"
            placeholder="Say something..."
            maxLength={200}
            autoComplete="off"
          />
        </div>
      </div>

      {/* MOBILE EMOTES AND MOVEMENT */}
      {/* EMOJI PICKER */}
      <div className="emoji-container">
        <div id="emo" className="hud emoji-picker" />

        <button
          id="emoji-toggle"
          className="emoji-toggle"
          type="button"
          aria-label="Open emoji picker"
          aria-expanded="false"
          title="Emotes"
        >
          <Icon name="smile" size={23} />
        </button>
      </div>
      <div id="joy" />
      <div id="cross" />

      {/* LOGIN / REGISTER */}
      <div id="auth" style={{ display: 'none', position: 'fixed', inset: 0, zIndex: 200, alignItems: 'center', justifyContent: 'center', background: 'rgba(10,10,14,.94)', color: '#fff' }}>
        <div style={{ width: 'min(380px,92vw)', padding: 22, borderRadius: 18, background: '#1c1d24', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h2 id="au-title" style={{ margin: 0 }}>Log in</h2>
          <input id="au-user" style={fld} placeholder="Username or email" autoComplete="username" />
          <input id="au-email" style={fld} placeholder="Email" autoComplete="email" />
          <input id="au-disp" style={fld} placeholder="Display name (3-18 characters)" maxLength={18} />
          <input id="au-pass" style={fld} type="password" placeholder="Password" autoComplete="current-password" />
          <div id="au-msg" style={{ minHeight: 18, fontSize: 13, color: '#ffb4b4' }} />
          <button id="au-submit" type="button" style={{ ...fld, background: '#8b78e6', fontWeight: 700, cursor: 'pointer' }}>Log in</button>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button id="au-tab-login" type="button" style={lnk}>Log in</button>
            <button id="au-tab-reg" type="button" style={lnk}>Create account</button>
            <button id="au-tab-forgot" type="button" style={lnk}>Forgot password?</button>
          </div>
        </div>
      </div>

      {/* PROFILE */}
      <div id="profile" style={{ display: 'none', position: 'fixed', inset: 0, zIndex: 60, alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,.6)', padding: 'max(12px, env(safe-area-inset-top)) 12px max(12px, env(safe-area-inset-bottom))' }}>
        <div style={{ width: 'min(420px, 100%)', maxHeight: '100%', overflowY: 'auto', padding: 20, borderRadius: 22, background: 'linear-gradient(145deg,#222225,#151517)', border: '1px solid rgba(255,255,255,.1)', color: '#fff', display: 'flex', flexDirection: 'column', gap: 12, boxShadow: '0 25px 80px #0009' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0, borderRadius: '50%', overflow: 'hidden', background: '#3a3740', display: 'grid', placeItems: 'center', fontSize: 28, fontWeight: 700 }}>
              <span id="pf-ini" />
              <img id="pf-img" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'none' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong id="pf-name" style={{ display: 'block', fontSize: 18, overflow: 'hidden', textOverflow: 'ellipsis' }} />
              <span id="pf-user" style={{ fontSize: 12, color: '#b8b3a8' }} />
            </div>
            <button id="pf-close" type="button" aria-label="Close profile" style={{ ...lnk, fontSize: 26, color: '#fff', minHeight: 44, minWidth: 44 }}>×</button>
          </div>
          <label style={pfBtn}>
            📷 Change profile picture
            <input id="pf-file" type="file" accept="image/*" style={{ display: 'none' }} />
          </label>
          <button id="pf-looks" type="button" style={pfBtn}>🎨 Edit looks</button>
          <button id="pf-out" type="button" style={{ ...pfBtn, color: '#ffb4b4' }}>Log out</button>
          <div id="pf-msg" style={{ minHeight: 16, fontSize: 12, color: '#e8c27a', textAlign: 'center' }} />
        </div>
      </div>

      {/* CHARACTER ENTRY */}
      <div id="start">
        <div className="box entry-card" style={{ maxHeight: '92vh', overflowY: 'auto' }}>

          <div className="entry-logo">
            <Icon name="image" size={27} />
          </div>

          <div className="entry-heading">
            <h1>Open Studio Gallery</h1>
            <p>
              A shared space for art, creativity, and connection.
              Explore paintings and meet other visitors.
            </p>
          </div>

          <div id="regbox" style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '4px 0 12px' }}>
            <input id="rg-user" style={fld} placeholder="Username" autoComplete="username" />
            <input id="rg-email" style={fld} placeholder="Email" autoComplete="email" />
            <input id="rg-pass" style={fld} type="password" placeholder="Password" autoComplete="new-password" />
            <div id="rg-msg" style={{ minHeight: 16, fontSize: 13, color: '#ffb4b4' }} />
            <button id="rg-login" type="button" style={lnk}>Already have an account? Log in</button>
          </div>

          <div id="acct" style={{ display: 'none', alignItems: 'center', gap: 10, margin: '10px 0' }}>
            <img id="acct-img" alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', background: '#333' }} />
            <strong id="acct-name" style={{ flex: 1 }} />
            <label style={{ cursor: 'pointer', fontSize: 12, textDecoration: 'underline' }}>
              Change picture
              <input id="acct-file" type="file" accept="image/*" style={{ display: 'none' }} />
            </label>
            <button id="acct-out" type="button" style={lnk}>Log out</button>
          </div>

          <div className="field-group">
            <label htmlFor="nm">Your display name</label>
            <input
              id="nm"
              placeholder="Enter your name"
              maxLength={18}
              autoComplete="nickname"
            />
          </div>

          <div className="field-group">
            <label>Avatar style</label>
            <div id="gen">
              <button type="button" data-g="m">Masculine</button>
              <button type="button" data-g="f">Feminine</button>
              <button type="button" data-g="n">Neutral</button>
            </div>
          </div>

          <canvas id="lookprev" style={{ width: '100%', height: 220, borderRadius: 14, background: 'rgba(255,255,255,.06)', touchAction: 'none', cursor: 'grab', display: 'block', marginBottom: 12 }} />

          <div className="customization-group">
            <div className="lab">Skin tone</div>
            <div className="sw" id="skin" />
          </div>

          <div className="customization-group">
            <div className="lab">Hair color</div>
            <div className="sw" id="hair" />
          </div>

          <div className="customization-group">
            <div className="lab">Outfit color</div>
            <div className="sw" id="hue" />
          </div>

          <button id="go" className="enter-button">
            Enter gallery
            <Icon name="right" size={18} />
          </button>

          <div className="entry-footer">
            Your creative space awaits.
          </div>
        </div>
      </div>

      {/* ADD PAINTING */}
      <div id="panel">
        <div className="box painting-card">

          <div className="modal-heading">
            <div className="modal-icon">
              <Icon name="image" size={22} />
            </div>

            <div>
              <h1>Hang a painting</h1>
              <p>Share your artwork with the gallery.</p>
            </div>
          </div>

          <label className="upload-area" htmlFor="file">
            <Icon name="upload" size={27} />
            <strong>Choose an image</strong>
            <span>Select a painting from your device</span>
            <input type="file" id="file" accept="image/*" />
          </label>

          <div id="fprev" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '10px 0' }} />

          <div className="field-group">
            <label htmlFor="ttl">Painting title</label>
            <input id="ttl" placeholder="Give your artwork a title" maxLength={60} />
          </div>

          <div className="field-group">
            <label htmlFor="art">Artist name</label>
            <input id="art" placeholder="Who created this artwork?" maxLength={40} />
          </div>

          <div className="panel-actions">
            <button id="cancel" className="cancel-button">
              Cancel
            </button>

            <button id="save" className="save-button z-[99999]">
              <Icon name="upload" size={17} />
              Hang painting
            </button>
          </div>

          <div id="msg" />
        </div>
      </div>

    </main>
  );
}
