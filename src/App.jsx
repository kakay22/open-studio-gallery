
import { useEffect } from 'react';
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
        style={{
          display: 'none',
          position: 'fixed',
          top: '76px',
          right: '18px',
          width: 'min(340px, calc(100vw - 24px))',
          maxHeight: 'min(440px, calc(100vh - 100px))',
          overflowY: 'auto',
          zIndex: 100,
          padding: '16px',
          borderRadius: '16px',
          background: 'rgba(20, 22, 28, 0.96)',
          color: '#fff',
          border: '1px solid rgba(255,255,255,.12)',
          boxShadow: '0 16px 50px rgba(0,0,0,.35)',
          backdropFilter: 'blur(18px)',
        }}
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

      {/* CHARACTER ENTRY */}
      <div id="start">
        <div className="box entry-card">

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

          <div className="field-group">
            <label htmlFor="ttl">Painting title</label>
            <input id="ttl" placeholder="Give your artwork a title" maxLength={60} />
          </div>

          <div className="field-group">
            <label htmlFor="art">Artist name</label>
            <input id="art" placeholder="Who created this artwork?" maxLength={40} />
          </div>

          <div className="panel-actions">
            <button id="save" className="save-button">
              <Icon name="upload" size={17} />
              Hang painting
            </button>

            <button id="cancel" className="cancel-button">
              Cancel
            </button>
          </div>

          <div id="msg" />
        </div>
      </div>

    </main>
  );
}
