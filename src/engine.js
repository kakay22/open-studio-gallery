import * as THREE from 'three';
export default function startGallery() {

  (async () => {
    const $ = id => document.getElementById(id);
    const W = 36, D = 22, H = 7, EYE = 1.7; let PER = 24;
    const LOW = ('ontouchstart' in window) || navigator.maxTouchPoints > 0 || innerWidth < 800;
    let myRoom = 0, rooms = 1, minRooms = 1, lastPeers = [], paintings = [], myId = (() => { try { let v = localStorage.getItem('gid'); if (!v) { v = 'u' + Math.random().toString(36).slice(2, 10); localStorage.setItem('gid', v) } return v } catch (e) { return 'u' + Math.random().toString(36).slice(2, 10) } })(), db = null, assets = null, room = null, local = false;
    let myName = ''; try { myName = localStorage.getItem('gname') || '' } catch (e) { } $('nm').value = myName; let myGen = 'n'; try { myGen = localStorage.getItem('ggen') || 'n' } catch (e) { }
    function paintGen() { document.querySelectorAll('#gen button').forEach(b => b.className = b.dataset.g === myGen ? '' : 'g') }
    document.querySelectorAll('#gen button').forEach(b => b.onclick = () => { myGen = b.dataset.g; paintGen() }); paintGen();
    let myWave = 0, emote = null, sitting = false; const EMO = ['👍', '❤️', '😂', '👏', '😮', '🔥', '🎨', '🤩']; const HUc = [0, 25, 50, 120, 175, 215, 265, 320]; let myLook = { sk: 0, hr: 6, hu: 50 }; try { Object.assign(myLook, JSON.parse(localStorage.getItem('glook') || '{}')) } catch (e) { }
    myLook = { hs: 0, ht: 0, gl: 0, bg: 0, ...myLook };
    let myStudio = '', mySeat = -1;
    const SKc = ['#f1c9a5', '#d9a37c', '#b67b55', '#8a5a3c', '#5e3b27'], HRc = ['#2a1d15', '#5a3a22', '#b98a4e', '#1a1a1a', '#8b3a2b', '#9aa0a6', '#d9701f'];
    function sw(id, arr, key, hue) { const el = $(id); arr.forEach((c, i) => { const b = document.createElement('i'), val = hue ? c : i; b.style.background = hue ? `hsl(${c},55%,48%)` : c; if (myLook[key] === val) b.className = 'on'; b.onclick = () => { myLook[key] = val;[...el.children].forEach(x => x.className = ''); b.className = 'on' }; el.append(b) }) }
    sw('skin', SKc, 'sk'); sw('hair', HRc, 'hr'); sw('hue', HUc, 'hu', true);
    var meA = null;
    function wave() { myWave++; if (meA) meA.wt = performance.now(); setPresence(true) } $('wv').onclick = wave;
    const floaters = [];
    function floatDom(e) { const d = document.createElement('div'); d.className = 'fl'; d.textContent = e; d.style.left = (40 + Math.random() * 20) + '%'; document.body.append(d); setTimeout(() => d.remove(), 2200) }
    function spawnFloat(grp, e) { const c = document.createElement('canvas'); c.width = c.height = 96; const x = c.getContext('2d'); x.font = '64px serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(e, 48, 52); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true })); sp.scale.set(.6, .6, 1); sp.position.y = 2.45; grp.add(sp); floaters.push({ sp, grp, t: performance.now() }) }
    function tickFloaters() { const n = performance.now(); for (let i = floaters.length - 1; i >= 0; i--) { const f = floaters[i], a = (n - f.t) / 2400; if (a >= 1) { f.grp.remove(f.sp); f.sp.material.map.dispose(); f.sp.material.dispose(); floaters.splice(i, 1); continue } f.sp.position.y = 2.45 + a * .9; f.sp.material.opacity = a < .7 ? 1 : (1 - a) / .3 } }
    function react(e) { stat('emo'); floatDom(e); if (room) room.emit('react', { e }).catch(() => { }) }
    EMO.forEach(e => { const b = document.createElement('button'); b.className = 'g e'; b.textContent = e; b.onclick = () => react(e); $('emo').append(b) });
    [['🙌', () => setEmote('clap')], ['😆', () => setEmote('laugh')], ['👉', () => setEmote('point')], ['🆗', () => setEmote('thumb')], ['🪑', () => setEmote('sit')], ['💃', () => setEmote('dance')], ['📷', () => togglePhoto()]].forEach(([i, f]) => { const b = document.createElement('button'); b.className = 'g e'; b.textContent = i; b.onclick = f; $('emo').append(b) });
    function standUp() { const s = mySeat; sitting = false; if (emote === 'sit') emote = null; if (s >= 0) { const e = SEATS[s]; px = e.ex; pz = e.ez; mySeat = -1; myStudio = ''; if (room) room.emit('act', { k: 'seat', i: -1 }).catch(() => { }); if (stOpen) closeStudio() } else pz = Math.min(pz + 1.4, D / 2 - 1); setPresence(true) }
    const ONESHOT = { clap: 2600, laugh: 2600, point: 3000, thumb: 2400, punch: 500, bow: 1100 }; let emoTimer = 0;
    function setEmote(n) {
      clearTimeout(emoTimer);
      if (n === 'sit' && !sitting && nearSeat() >= 0) { sitSeat(nearSeat()); return }
      if (emote === n) { if (n === 'sit') standUp(); else emote = null }
      else {
        if (sitting) standUp();
        emote = n; if (n === 'sit') sitting = true;
        if (ONESHOT[n]) emoTimer = setTimeout(() => { if (emote === n) { emote = null; $('dn').className = 'g'; setPresence(true) } }, ONESHOT[n]);
      }
      $('dn').className = emote === 'dance' ? '' : 'g'; setPresence(true);
    }
    function toggleDance() { setEmote('dance') }
    function trySit() { }
    $('dn').onclick = toggleDance;
    const mst = document.createElement('style'); mst.textContent = 'body.menu #top,body.menu #panel{display:none!important}'; document.head.append(mst); document.body.classList.add('menu');
    $('look').onclick = () => { document.exitPointerLock?.(); document.body.classList.add('menu'); $('start').style.display = 'flex'; $('go').textContent = 'Save look'; const p = document.querySelector('#start p'); if (p) p.style.display = 'none' };

    // ---- scene
    const renderer = new THREE.WebGLRenderer({ antialias: !LOW || devicePixelRatio < 2, powerPreference: 'high-performance' }); renderer.setPixelRatio(Math.min(devicePixelRatio, LOW ? 1.75 : 2)); renderer.outputEncoding = THREE.sRGBEncoding; renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.prepend(renderer.domElement);
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x2a2826); scene.fog = new THREE.Fog(0x2a2826, 22, 60);
    const cam = new THREE.PerspectiveCamera(70, 1, .1, LOW ? 45 : 80);
    function resize() { renderer.setSize(innerWidth, innerHeight); cam.aspect = innerWidth / innerHeight; cam.fov = cam.aspect < 1 ? Math.min(100, 70 + (1 - cam.aspect) * 45) : 70; cam.updateProjectionMatrix() }
    addEventListener('resize', resize); resize();
    addEventListener('orientationchange', () => setTimeout(resize, 200));
    scene.add(new THREE.HemisphereLight(0xfff1dc, 0x3a342d, LOW ? .6 : .38));
    const sun = new THREE.DirectionalLight(0xfff1dc, LOW ? .55 : .7);
    sun.position.set(4, 22, 6); sun.castShadow = true;
    sun.shadow.mapSize.set(LOW ? 1024 : 2048, LOW ? 1024 : 2048);
    Object.assign(sun.shadow.camera, { left: -20, right: 20, top: 13, bottom: -13, near: 1, far: 40 });
    sun.shadow.bias = -.0004; sun.shadow.normalBias = .04;
    scene.add(sun);
    // floor
    const fc = document.createElement('canvas'); fc.width = fc.height = 1024; const fx = fc.getContext('2d');
    for (let i = 0; i < 8; i++) { fx.fillStyle = `hsl(32,${28 + i % 3 * 4}%,${52 + i % 4 * 3}%)`; fx.fillRect(0, i * 128, 1024, 128); fx.fillStyle = '#0003'; fx.fillRect(0, i * 128, 1024, 3) }
    const ft = new THREE.CanvasTexture(fc); ft.wrapS = ft.wrapT = THREE.RepeatWrapping; ft.repeat.set(.25, .25); ft.encoding = THREE.sRGBEncoding; ft.anisotropy = LOW ? 4 : 8;
    const floorShape = new THREE.Shape(); floorShape.moveTo(-W / 2, -D / 2); floorShape.lineTo(W / 2, -D / 2); floorShape.lineTo(W / 2, D / 2); floorShape.lineTo(-W / 2, D / 2); floorShape.closePath();
    const pitHole = new THREE.Path(); pitHole.moveTo(-6.56, -10.4); pitHole.lineTo(-.9, -10.4); pitHole.lineTo(-.9, -8.4); pitHole.lineTo(-6.56, -8.4); pitHole.closePath(); floorShape.holes.push(pitHole);
    const floorGeo = new THREE.ShapeGeometry(floorShape); floorGeo.type = 'PlaneGeometry';   // keeps the floor from casting shadows
    const floor = new THREE.Mesh(floorGeo, new THREE.MeshStandardMaterial({ map: ft, roughness: .7 })); floor.rotation.x = -Math.PI / 2; scene.add(floor);
    const wallM = new THREE.MeshStandardMaterial({ color: 0xcfc8bb, roughness: 0.9 });
    const trimM = new THREE.MeshStandardMaterial({ color: 0x4a4038, roughness: 0.7 });
    // Tracks all solid wall segments for player collision.
    const solidWalls = [];

    function wall(w, x, z, ry, T = 0.5, outer = false) {
      const g = new THREE.Group();
      g.position.set(x, 0, z); g.rotation.y = ry;
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, H, T), wallM);
      m.position.set(0, H / 2, outer ? -T / 2 : 0); g.add(m);
      const bb = new THREE.Mesh(new THREE.BoxGeometry(w, 0.2, T + 0.08), trimM);
      bb.position.set(0, 0.1, outer ? -T / 2 : 0); g.add(bb);
      scene.add(g);
      const half = w / 2, ax = new THREE.Vector3(0, 1, 0);
      const s = new THREE.Vector3(-half, 0, 0).applyAxisAngle(ax, ry);
      const e = new THREE.Vector3(half, 0, 0).applyAxisAngle(ax, ry);
      solidWalls.push({ x1: x + s.x, z1: z + s.z, x2: x + e.x, z2: z + e.z, th: outer ? 0 : T / 2 });
      return g;
    }

    function collidesWithWall(x, z, radius = 0.48) {
      for (const w of solidWalls) {
        const dx = w.x2 - w.x1, dz = w.z2 - w.z1, l2 = dx * dx + dz * dz;
        let t = l2 > 0 ? ((x - w.x1) * dx + (z - w.z1) * dz) / l2 : 0;
        t = Math.max(0, Math.min(1, t));
        if (Math.hypot(x - (w.x1 + t * dx), z - (w.z1 + t * dz)) < radius + w.th) return true;
      }
      return false;
    }

    wall(W, 0, -D / 2, 0, .5, true); wall(W, 0, D / 2, Math.PI, .5, true);
    wall(D + 1, -W / 2, 0, Math.PI / 2, .5, true); wall(D + 1, W / 2, 0, -Math.PI / 2, .5, true);

    // ---- museum interior architecture

    // Interior partitions with openings for walkways.
    // The gaps are intentional so players can move between galleries.
    function partitionX(x, z1, z2, gapCenter = 0, gapWidth = 3.6) {
      const gapStart = gapCenter - gapWidth / 2;
      const gapEnd = gapCenter + gapWidth / 2;

      if (gapStart > z1) {
        wall(gapStart - z1, x, (z1 + gapStart) / 2, Math.PI / 2);
      }

      if (z2 > gapEnd) {
        wall(z2 - gapEnd, x, (gapEnd + z2) / 2, Math.PI / 2);
      }
    }

    function partitionZ(z, x1, x2, gapCenter = 0, gapWidth = 3.8) {
      const gapStart = gapCenter - gapWidth / 2;
      const gapEnd = gapCenter + gapWidth / 2;

      if (gapStart > x1) {
        wall(gapStart - x1, (x1 + gapStart) / 2, z, 0);
      }

      if (x2 > gapEnd) {
        wall(x2 - gapEnd, (gapEnd + x2) / 2, z, 0);
      }
    }

    // Left and right exhibition wings.
    partitionX(-7, -D / 2, D / 2, 0, 4.2);
    partitionX(7, -D / 2, D / 2, 0, 4.2);


    function flare(x1, z1, x2, z2) {
      const dx = x2 - x1, dz = z2 - z1;
      wall(Math.hypot(dx, dz), (x1 + x2) / 2, (z1 + z2) / 2, Math.atan2(-dz, dx), 0.4);
    }
    flare(-7, 2.1, -5.6, 3.5); flare(-7, -2.1, -5.6, -3.5);
    flare(7, 2.1, 5.6, 3.5); flare(7, -2.1, 5.6, -3.5);


    // ---- architectural columns
    const columnMat = new THREE.MeshStandardMaterial({
      color: 0xe2ded5,
      roughness: 0.85
    });

    function column(x, z, height = 6.8) {
      const c = new THREE.Group();

      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.28, height, 16),
        columnMat
      );
      shaft.position.y = height / 2;
      c.add(shaft);

      const base = new THREE.Mesh(
        new THREE.BoxGeometry(0.72, 0.16, 0.72),
        columnMat
      );
      base.position.y = 0.08;
      c.add(base);

      const cap = new THREE.Mesh(
        new THREE.BoxGeometry(0.72, 0.16, 0.72),
        columnMat
      );
      cap.position.y = height - 0.08;
      c.add(cap);

      c.position.set(x, 0, z);
      scene.add(c);
    }

    [
      [-7, -9], [-7, 9],
      [7, -9], [7, 9],
      [-14, 0], [14, 0]
    ].forEach(([x, z]) => column(x, z));

    // ---- decorative floor zones
    function floorZone(x, z, width, depth, color, opacity = 1) {
      const material = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.95,
        transparent: opacity < 1,
        opacity
      });

      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(width, depth),
        material
      );

      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(x, 0.012, z);
      scene.add(mesh);
    }

    // Warm-toned areas distinguish the different spaces.
    floorZone(0, 0, 12, 18, 0xb5a18a, 0.22);
    floorZone(-12, 0, 10, 18, 0x8e9b91, 0.18);
    floorZone(12, 0, 10, 18, 0xa28d82, 0.18);
    floorZone(2.55, 9, 6.9, 3, 0xc4ad8e, 0.3);

    // ---- archway details above interior openings
    // ---- rounded museum archways

    const archMat = new THREE.MeshStandardMaterial({
      color: 0xd4c8b5,
      roughness: 0.82,
      side: THREE.DoubleSide
    });


    function arch(x, z, width = 4.2, rotation = 0) {
      const g = new THREE.Group();
      const hh = H - 3.1;
      const header = new THREE.Mesh(new THREE.BoxGeometry(width, hh, 0.5), wallM);
      header.position.y = 3.1 + hh / 2; g.add(header);
      const trim = new THREE.Mesh(new THREE.BoxGeometry(width + 0.3, 0.14, 0.62), trimM);
      trim.position.y = 3.1; g.add(trim);
      g.position.set(x, 0, z); g.rotation.y = rotation; scene.add(g);
    }

    // Openings through the two main partitions.
    arch(-7, 0, 4.2, Math.PI / 2);
    arch(7, 0, 4.2, Math.PI / 2);

    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ color: 0x9a948a })); ceil.rotation.x = Math.PI / 2; ceil.position.y = H; scene.add(ceil);
    // ---- varied suspended ceiling sections

    const ceilingMaterials = [
      new THREE.MeshStandardMaterial({
        color: 0xe9e2d6,
        roughness: 0.9
      }),
      new THREE.MeshStandardMaterial({
        color: 0xd8cdbd,
        roughness: 0.9
      })
    ];

    function ceilingSection(x, z, width, depth, height, materialIndex = 0) {
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(width, 0.22, depth),
        ceilingMaterials[materialIndex]
      );

      panel.position.set(x, height, z);
      scene.add(panel);

      // Recessed-looking border trim
      const trimMat = new THREE.MeshStandardMaterial({
        color: 0xc1b29e,
        roughness: 0.75
      });

      const trim = new THREE.Mesh(
        new THREE.BoxGeometry(width + 0.18, 0.09, depth + 0.18),
        trimMat
      );

      trim.position.set(x, height - 0.14, z);
      scene.add(trim);
    }

    // ---- gallery lounge furniture

    const sofaMat = new THREE.MeshStandardMaterial({
      color: 0x777b72,
      roughness: 0.95
    });

    const cushionMat = new THREE.MeshStandardMaterial({
      color: 0xb5a18a,
      roughness: 0.95
    });

    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x57483a,
      roughness: 0.65
    });

    function lounge(x, z, rotation = 0) {
      const group = new THREE.Group();

      // Sofa base
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(3.1, 0.42, 1.05),
        sofaMat
      );
      base.position.y = 0.42;
      group.add(base);

      // Backrest
      const back = new THREE.Mesh(
        new THREE.BoxGeometry(3.1, 0.85, 0.24),
        sofaMat
      );
      back.position.set(0, 0.98, -0.4);
      group.add(back);

      // Seat cushion
      const seat = new THREE.Mesh(
        new THREE.BoxGeometry(2.85, 0.16, 0.78),
        cushionMat
      );
      seat.position.set(0, 0.72, 0.02);
      group.add(seat);

      // Coffee table
      const table = new THREE.Mesh(
        new THREE.BoxGeometry(1.45, 0.12, 0.75),
        tableMat
      );
      table.position.set(0, 0.38, 1.3);
      group.add(table);

      const legPositions = [
        [-0.58, -0.28],
        [0.58, -0.28],
        [-0.58, 0.28],
        [0.58, 0.28]
      ];

      legPositions.forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, 0.35, 0.08),
          tableMat
        );
        leg.position.set(lx, 0.17, 1.3 + lz);
        group.add(leg);
      });

      group.position.set(x, 0, z);
      group.rotation.y = rotation;
      scene.add(group);

      return group;
    }

    // ---- couple booth materials

    const boothWallMat = new THREE.MeshStandardMaterial({
      color: 0x8b7968,
      roughness: 0.9
    });

    const boothSeatMat = new THREE.MeshStandardMaterial({
      color: 0x9b8172,
      roughness: 0.95
    });

    const boothAccentMat = new THREE.MeshStandardMaterial({
      color: 0xd5b88d,
      roughness: 0.7
    });

    function coupleBooth(x, z, rotation = 0, boothName = "Couple Booth") {
      const group = new THREE.Group();

      // Rear privacy panel
      const rear = new THREE.Mesh(
        new THREE.BoxGeometry(3.2, 2.5, 0.18),
        boothWallMat
      );
      rear.position.set(0, 1.25, -1.25);
      group.add(rear);

      // Side privacy panels
      for (const side of [-1, 1]) {
        const divider = new THREE.Mesh(
          new THREE.BoxGeometry(0.18, 2.5, 1.5),
          boothWallMat
        );

        divider.position.set(side * 1.5, 1.25, -0.5);
        group.add(divider);
      }

      // Two-person seating
      const seat = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 0.38, 0.85),
        boothSeatMat
      );

      seat.position.set(0, 0.42, -0.25);
      group.add(seat);

      // Back cushion
      const back = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 0.85, 0.2),
        boothSeatMat
      );

      back.position.set(0, 1.0, -0.68);
      group.add(back);

      // Small center table
      const table = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.42, 0.12, 24),
        boothAccentMat
      );

      table.position.set(0, 0.62, 0.85);
      group.add(table);

      // Warm decorative light
      const lamp = new THREE.PointLight(0xffd6a0, 0.65, 5);
      lamp.position.set(0, 2.2, 0);
      group.add(lamp);

      group.position.set(x, 0, z);
      group.rotation.y = rotation;
      group.userData.boothName = boothName;

      scene.add(group);

      return group;
    }

    // Main central gallery: high ceiling
    ceilingSection(0, -1, 12, 13, 6.5, 0);

    // Left gallery: lower ceiling
    ceilingSection(-12, 0, 9, 17, 5.7, 1);

    // Right gallery: lower ceiling
    ceilingSection(12, 0, 9, 17, 5.7, 1);

    // Entrance lobby: raised ceiling feature
    ceilingSection(0, 9, 12, 3, 6.1, 0);


    // ---- decorations (shared geometry/materials keep it cheap on mobile)
    const spinners = [];

    // Plants: corners, beside the wing doorways, and in the lobby
    const potGeo = new THREE.CylinderGeometry(.28, .22, .5, 12);
    const leafGeo = new THREE.IcosahedronGeometry(.32, 1);
    const potMat = new THREE.MeshLambertMaterial({ color: 0x8a5a3c });
    const leafMats = [0x3f6b3a, 0x55823f, 0x2f5a34].map(c => new THREE.MeshLambertMaterial({ color: c }));
    const CLUMPS = [[0, .8, 0, 1.1, 0], [.22, .6, .12, .75, 1], [-.2, .62, -.12, .75, 2], [.02, 1.2, 0, .75, 1]];
    function plant(x, z, s = 1) {
      const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s);
      const pot = new THREE.Mesh(potGeo, potMat); pot.position.y = .25; g.add(pot);
      for (const [cx, cy, cz, cs, mi] of CLUMPS) {
        const l = new THREE.Mesh(leafGeo, leafMats[mi]); l.position.set(cx, cy, cz); l.scale.setScalar(cs); g.add(l);
      }
      scene.add(g);
      solidWalls.push({ x1: x, z1: z, x2: x, z2: z, th: .3 * s }); // players can't walk through plants
    }
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) plant(sx * 17.3, sz * 10.3, 1.3);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) plant(sx * 8.1, sz * 3.3, .9);


    // Rugs
    function rug(x, z, w, d, inner, border) {
      const a = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshLambertMaterial({ color: border }));
      a.rotation.x = -Math.PI / 2; a.position.set(x, .02, z);
      const b = new THREE.Mesh(new THREE.PlaneGeometry(w - .4, d - .4), new THREE.MeshLambertMaterial({ color: inner }));
      b.rotation.x = -Math.PI / 2; b.position.set(x, .03, z);
      scene.add(a, b);
    }
    rug(0, -1, 7, 4.5, 0x6b3a3a, 0xc9a45c);
    rug(-11, 0, 4.5, 3.2, 0x2f4a52, 0xc9b88a);
    rug(11, 0, 4.5, 3.2, 0x4a3a52, 0xc9b88a);
    rug(0, 9.3, 1.8, 1.6, 0x6b3a3a, 0xc9a45c);

    // Pedestals with slowly spinning sculptures
    const pedMat = new THREE.MeshLambertMaterial({ color: 0xe8e3da });
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xc9a45c });
    const pedGeo = new THREE.BoxGeometry(.8, 1.1, .8);
    function pedestal(x, z, kind) {
      const g = new THREE.Group(); g.position.set(x, 0, z);
      const p = new THREE.Mesh(pedGeo, pedMat); p.position.y = .55; g.add(p);
      let s;
      if (kind === 'ring') { s = new THREE.Mesh(new THREE.TorusGeometry(.38, .09, 10, 28), goldMat); s.position.y = 1.65; s.rotation.x = .4 }
      else if (kind === 'orb') { s = new THREE.Mesh(new THREE.SphereGeometry(.34, 16, 12), goldMat); s.position.y = 1.45 }
      else { s = new THREE.Mesh(new THREE.OctahedronGeometry(.4), goldMat); s.position.y = 1.55 }
      g.add(s); scene.add(g); spinners.push(s);
      solidWalls.push({ x1: x, z1: z, x2: x, z2: z, th: .4 });
    }
    pedestal(0, -1, 'ring'); pedestal(-11, 0, 'orb'); pedestal(11, 0, 'gem');

    // Glowing ceiling light strips (just bright meshes, not real lights)
    const stripMat = new THREE.MeshBasicMaterial({ color: 0xfff1d6 });
    function strip(x, z, w, d, y) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, .04, d), stripMat); m.position.set(x, y, z); scene.add(m) }
    strip(0, -4, 8, .35, 6.28); strip(0, 2, 8, .35, 6.28);
    strip(-12, 0, .35, 12, 5.48); strip(12, 0, .35, 12, 5.48);
    strip(0, 9, 6, .3, 5.88);

    // Crown molding along the top of the outer walls
    const crownX = new THREE.BoxGeometry(W, .25, .35), crownZ = new THREE.BoxGeometry(.35, .25, D);
    for (const s of [-1, 1]) {
      const a = new THREE.Mesh(crownX, trimM); a.position.set(0, H - .125, s * (D / 2 - .175));
      const b = new THREE.Mesh(crownZ, trimM); b.position.set(s * (W / 2 - .175), H - .125, 0);
      scene.add(a, b);
    }

    // Gallery sign above the lobby archway (visible from both sides)
    const sgc = document.createElement('canvas'); sgc.width = 1024; sgc.height = 256; const sgx = sgc.getContext('2d'); sgx.scale(2, 2);
    sgx.fillStyle = '#1d1a17'; sgx.fillRect(0, 0, 512, 128);
    sgx.strokeStyle = '#c9a45c'; sgx.lineWidth = 4; sgx.strokeRect(6, 6, 500, 116);
    sgx.fillStyle = '#c9a45c'; sgx.font = '600 56px Georgia, serif'; sgx.textAlign = 'center'; sgx.textBaseline = 'middle';
    sgx.font = '600 50px Georgia, serif'; sgx.fillText('THE GALLERY', 256, 48);
    sgx.font = 'italic 28px Georgia, serif'; sgx.fillText('By: Kyle Calites', 256, 98);
    const signTex = new THREE.CanvasTexture(sgc); signTex.encoding = THREE.sRGBEncoding;
    const signGeo = new THREE.PlaneGeometry(3.2, .8), signMat = new THREE.MeshBasicMaterial({ map: signTex });
    const sign1 = new THREE.Mesh(signGeo, signMat); sign1.position.set(0, 4.6, 7.78);
    const sign2 = new THREE.Mesh(signGeo, signMat); sign2.position.set(0, 4.6, 7.22); sign2.rotation.y = Math.PI;
    scene.add(sign1, sign2);

    // ---- signs helper
    function plate(text, w, h, fs) {
      const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
      x.fillStyle = '#1d1a17'; x.fillRect(0, 0, w, h); x.strokeStyle = '#c9a45c'; x.lineWidth = 3; x.strokeRect(4, 4, w - 8, h - 8);
      x.fillStyle = '#c9a45c'; x.font = '600 ' + fs + 'px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, w / 2, h / 2 + 2);
      const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.generateMipmaps = false; t.minFilter = THREE.LinearFilter;
      return new THREE.MeshBasicMaterial({ map: t });
    }

    // ---- reception desk (left side of the lobby, front faces the entrance)
    const deskMat = new THREE.MeshLambertMaterial({ color: 0x57483a });
    const deskTopMat = new THREE.MeshLambertMaterial({ color: 0xe8e3da });
    const darkMat = new THREE.MeshLambertMaterial({ color: 0x1d1a17 });
    const RX = -4.5, RZ = 5.8;
    const RFACE = Math.PI, MX = RX - Math.sin(RFACE) * .95, MZ = RZ - Math.cos(RFACE) * .95;
    let monTick = () => { };
    {
      const g = new THREE.Group(); g.position.set(RX, 0, RZ); g.rotation.y = RFACE;
      const body = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.05, .8), deskMat); body.position.y = .525;
      const top = new THREE.Mesh(new THREE.BoxGeometry(2.8, .07, .95), deskTopMat); top.position.y = 1.085;
      const trim = new THREE.Mesh(new THREE.BoxGeometry(2.6, .06, .02), goldMat); trim.position.set(0, .9, .41);
      const lbl = new THREE.Mesh(new THREE.PlaneGeometry(1.4, .35), plate('RECEPTION', 256, 64, 34)); lbl.position.set(0, .5, .41);
      const bell = new THREE.Mesh(new THREE.SphereGeometry(.07, 12, 8), goldMat); bell.position.set(.8, 1.19, .1);
      const mon = new THREE.Mesh(new THREE.BoxGeometry(.5, .32, .04), darkMat); mon.position.set(-.3, 1.38, -.05);
      const stand = new THREE.Mesh(new THREE.BoxGeometry(.06, .2, .06), darkMat); stand.position.set(-.3, 1.2, -.05);
      const mbase = new THREE.Mesh(new THREE.BoxGeometry(.24, .015, .16), darkMat); mbase.position.set(-.3, 1.125, -.05); g.add(mbase);
      // live screen
      const mc = document.createElement('canvas'); mc.width = 256; mc.height = 160; const mx = mc.getContext('2d');
      const mtex = new THREE.CanvasTexture(mc); mtex.encoding = THREE.sRGBEncoding;
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(.46, .28), new THREE.MeshBasicMaterial({ map: mtex })); screen.position.set(-.3, 1.38, -.073); screen.rotation.y = Math.PI; g.add(screen);
      let mT = 0, mN = 0;
      monTick = dt => {
        mT += dt; if (mT < .4) return; mT = 0; mN++;
        mx.fillStyle = '#0e2433'; mx.fillRect(0, 0, 256, 160);
        mx.fillStyle = '#1f6fb2'; mx.fillRect(0, 0, 256, 18);
        mx.fillStyle = '#fff'; mx.font = '11px system-ui,sans-serif'; mx.textAlign = 'left'; mx.fillText('Gallery Desk', 6, 13);
        mx.textAlign = 'right'; mx.fillText(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 250, 13);
        for (let i = 0; i < 8; i++) { const wv = 40 + ((i * 53 + Math.floor(mN / 6) * 37) % 150); mx.fillStyle = i % 3 ? '#4fa3e0' : '#7fd1a3'; mx.fillRect(10, 30 + i * 14, wv, 6) }
        if (mN % 2) { mx.fillStyle = '#fff'; mx.fillRect(10, 146, 6, 10) }
        mtex.needsUpdate = true;
      };
      // keyboard + mouse
      const kc = document.createElement('canvas'); kc.width = 128; kc.height = 40; const kx = kc.getContext('2d');
      kx.fillStyle = '#1b1b1d'; kx.fillRect(0, 0, 128, 40); kx.fillStyle = '#55555c';
      for (let r = 0; r < 4; r++) for (let c = 0; c < 14; c++) kx.fillRect(3 + c * 8.8, 3 + r * 8.8, 7, 7);
      const kb = new THREE.Mesh(new THREE.BoxGeometry(.46, .02, .15), [darkMat, darkMat, new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(kc) }), darkMat, darkMat, darkMat]); kb.position.set(-.3, 1.13, -.3); g.add(kb);
      const ms = new THREE.Mesh(new THREE.BoxGeometry(.06, .03, .1), darkMat); ms.position.set(.12, 1.135, -.3); g.add(ms);
      // office chair
      const chair = new THREE.Group(); chair.position.set(0, 0, -.95);
      const cm = (w, h, d, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), darkMat); o.position.set(x, y, z); chair.add(o); return o };
      cm(.52, .08, .5, 0, .44, 0); cm(.5, .55, .07, 0, .78, -.25); cm(.05, .34, .05, 0, .23, 0);
      for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5, l = cm(.34, .03, .05, Math.cos(a) * .17, .06, Math.sin(a) * .17); l.rotation.y = -a }
      g.add(chair);
      g.add(body, top, trim, lbl, bell, mon, stand); scene.add(g);
    }
    solidWalls.push({ x1: RX - Math.cos(RFACE), z1: RZ + Math.sin(RFACE), x2: RX + Math.cos(RFACE), z2: RZ - Math.sin(RFACE), th: .55 });

    // ---- glass display cases in the main hall
    const glassMat = new THREE.MeshLambertMaterial({ color: 0xcfe8ff, transparent: true, opacity: .16, depthWrite: false });
    const caseBaseGeo = new THREE.BoxGeometry(1.4, .9, .9), caseGlassGeo = new THREE.BoxGeometry(1.3, .8, .8);
    const caseEdgeGeo = new THREE.EdgesGeometry(caseGlassGeo), caseEdgeMat = new THREE.LineBasicMaterial({ color: 0xc9a45c });
    function glassCase(x, z, kind) {
      const g = new THREE.Group(); g.position.set(x, 0, z);
      const b = new THREE.Mesh(caseBaseGeo, deskMat); b.position.y = .45;
      const gl = new THREE.Mesh(caseGlassGeo, glassMat); gl.position.y = 1.3;
      const ed = new THREE.LineSegments(caseEdgeGeo, caseEdgeMat); ed.position.y = 1.3;
      const s = new THREE.Mesh(kind === 'knot' ? new THREE.TorusKnotGeometry(.18, .06, 48, 8) : new THREE.DodecahedronGeometry(.24), goldMat);
      s.position.y = 1.25; g.add(b, gl, ed, s); scene.add(g); spinners.push(s);
      solidWalls.push({ x1: x - .35, z1: z, x2: x + .35, z2: z, th: .45 });
    }
    glassCase(-3.6, -6.2, 'knot'); glassCase(3.6, -6.2, 'dode');

    // ---- elevator (right side of the lobby, against the partition)
    const EVX = 5.8, EVZ = 7;
    const ev = new THREE.Group(); ev.position.set(EVX, 0, EVZ); ev.rotation.y = -Math.PI / 2; scene.add(ev);
    const evShell = new THREE.MeshLambertMaterial({ color: 0x4a4038 }), evDoorMat = new THREE.MeshLambertMaterial({ color: 0xb9b2a4 });
    const evBack = new THREE.MeshBasicMaterial({ color: 0xb39a6b }), evSide = new THREE.MeshBasicMaterial({ color: 0x8c7650 });
    const evLight = new THREE.MeshBasicMaterial({ color: 0xfff1d6 }), evFloor = new THREE.MeshBasicMaterial({ color: 0x3b3128 });
    const evBox = (w, h, d, x, y, z, m) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); ev.add(o) };
    const evPlane = (w, h, x, y, z, rx, ry, m) => { const o = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); o.position.set(x, y, z); o.rotation.set(rx, ry, 0); ev.add(o); return o };
    evBox(.2, H, 1.6, -1, H / 2, 0, evShell); evBox(.2, H, 1.6, 1, H / 2, 0, evShell);
    evBox(2.2, H, .2, 0, H / 2, -.9, evShell);
    evBox(2.2, .4, 1.8, 0, 3.3, 0, evShell);
    evBox(1.8, .6, .2, 0, 2.8, .7, evShell); evBox(1.9, .06, .12, 0, 2.5, .79, goldMat);
    evBox(2.2, H - 3.1, .2, 0, (3.1 + H) / 2, .75, evShell);   // wall above the doors up to the ceiling
    evPlane(1.8, 2.6, 0, 1.3, -.78, 0, 0, evBack);
    evPlane(1.6, 2.6, -.89, 1.3, 0, 0, Math.PI / 2, evSide); evPlane(1.6, 2.6, .89, 1.3, 0, 0, -Math.PI / 2, evSide);
    evPlane(1.2, 1.0, 0, 3.08, 0, Math.PI / 2, 0, evLight); evPlane(1.8, 1.6, 0, .02, 0, -Math.PI / 2, 0, evFloor);
    const evSign = new THREE.Mesh(new THREE.PlaneGeometry(1.5, .38), plate('ELEVATOR', 256, 64, 34)); evSign.position.set(0, 2.8, .81); ev.add(evSign);
    const evDoorL = new THREE.Group(), evDoorR = new THREE.Group(), evDoorGeo = new THREE.BoxGeometry(.9, 2.5, .06);
    evDoorL.position.set(-.9, 0, .75); evDoorR.position.set(.9, 0, .75);
    const dl = new THREE.Mesh(evDoorGeo, evDoorMat); dl.position.set(.45, 1.25, 0); evDoorL.add(dl);
    const dr = new THREE.Mesh(evDoorGeo, evDoorMat); dr.position.set(-.45, 1.25, 0); evDoorR.add(dr);
    ev.add(evDoorL, evDoorR);
    solidWalls.push(
      { x1: EVX - .8, z1: EVZ - 1, x2: EVX + .8, z2: EVZ - 1, th: .12 },
      { x1: EVX - .8, z1: EVZ + 1, x2: EVX + .8, z2: EVZ + 1, th: .12 },
      { x1: EVX + .9, z1: EVZ - 1.1, x2: EVX + .9, z2: EVZ + 1.1, th: .12 });

    const inCab = () => Math.abs(px - EVX) < .75 && Math.abs(pz - EVZ) < .88;
    const nearEv = () => px > EVX - 2.25 && px < EVX + .75 && Math.abs(pz - EVZ) < 2.4;

    // floor buttons on the cab's back wall (real meshes: click or tap them)
    const evPanel3 = new THREE.Group(); evPanel3.position.set(.88, 1.25, .38); evPanel3.rotation.y = -Math.PI / 2; ev.add(evPanel3);   // right wall, beside the door, faces into the cab
    const btnGeo = new THREE.CircleGeometry(.04, 24); let evBtns = [], evKey = '';
    function btnMat(n, active) {
      const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
      x.fillStyle = active ? '#ffc94d' : '#d8d2c4'; x.beginPath(); x.arc(64, 64, 60, 0, 7); x.fill(); x.lineWidth = 8; x.strokeStyle = '#3a2a08'; x.stroke();
      x.fillStyle = '#1d1a17'; x.font = '700 68px system-ui,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(n, 64, 68);
      const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return new THREE.MeshBasicMaterial({ map: t });
    }

    function evRender() {
      const k = rooms + ':' + myRoom; if (k === evKey) return; evKey = k;
      for (const o of [...evPanel3.children]) { evPanel3.remove(o); o.material.map?.dispose(); o.material.dispose(); if (o.userData.plate) o.geometry.dispose() }
      const rows = Math.min(4, rooms), cols = Math.ceil(rooms / 4), S = .105;
      const plateM = new THREE.Mesh(new THREE.BoxGeometry(cols * S + .06, rows * S + .06, .02), new THREE.MeshLambertMaterial({ color: 0x1d1a17 }));
      evBtns = [];
      for (let i = 0; i < rooms; i++) {
        const m = new THREE.Mesh(btnGeo, btnMat(i + 1, i === myRoom));
        m.position.set((Math.floor(i / 4) - (cols - 1) / 2) * S, (i % 4 - (rows - 1) / 2) * S, .014); m.userData.floor = i;
        evPanel3.add(m); evBtns.push(m);
      }
    }

    renderer.domElement.addEventListener('pointerdown', e => {
      if (!started || evBusy || !inCab()) return;
      const nd = locked ? { x: 0, y: 0 } : { x: e.clientX / innerWidth * 2 - 1, y: -(e.clientY / innerHeight) * 2 + 1 };
      ray.setFromCamera(nd, cam); ray.far = 4;
      const h = ray.intersectObjects(evBtns)[0]; if (h) ride(h.object.userData.floor);
    });

    // hanging direction signs
    function rods(x, z, ry, yTop, ceilY, half) {
      for (const s of [-1, 1]) {
        const L = ceilY - yTop, r = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, L, 6), darkMat);
        r.position.set(x + Math.cos(ry) * half * s, yTop + L / 2, z - Math.sin(ry) * half * s); scene.add(r);
      }
    }
    function dirSign(x, z, ry, ceilY) {
      const tx = EVX - 1.5, tz = EVZ;
      for (const off of [0, Math.PI]) {
        const r = ry + off, nx = Math.sin(r), nz = Math.cos(r), dx = tx - x, dz = tz - z;
        const ang = Math.atan2(Math.cos(r) * dx - Math.sin(r) * dz, -(nx * dx + nz * dz));
        const c = document.createElement('canvas'); c.width = 512; c.height = 160; const g = c.getContext('2d');
        g.fillStyle = '#1d1a17'; g.fillRect(0, 0, 512, 160); g.strokeStyle = '#c9a45c'; g.lineWidth = 6; g.strokeRect(6, 6, 500, 148);
        g.save(); g.translate(86, 80); g.rotate(ang); g.fillStyle = '#ffc94d'; g.beginPath();
        g.moveTo(0, -48); g.lineTo(42, -2); g.lineTo(16, -2); g.lineTo(16, 46); g.lineTo(-16, 46); g.lineTo(-16, -2); g.lineTo(-42, -2); g.closePath(); g.fill(); g.restore();
        g.fillStyle = '#c9a45c'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.font = '700 56px Georgia, serif'; g.fillText('ELEVATOR', 150, 62);
        g.fillStyle = '#f3ead8'; g.font = '28px system-ui, sans-serif'; g.fillText('~' + Math.round(Math.hypot(dx, dz)) + ' m', 152, 118);
        const tex = new THREE.CanvasTexture(c); tex.encoding = THREE.sRGBEncoding;
        const m = new THREE.Mesh(new THREE.PlaneGeometry(2.2, .69), new THREE.MeshBasicMaterial({ map: tex }));
        m.position.set(x + nx * .03, 4.7, z + nz * .03); m.rotation.y = r; scene.add(m);
      }
      rods(x, z, ry, 5.05, ceilY, .9);
    }
    dirSign(0, 3, 0, 6.4); dirSign(0, -4, 0, 6.4); dirSign(-10.5, 0, Math.PI / 2, 5.6); dirSign(10.5, 0, Math.PI / 2, 5.6);
    // ---- stairs: right flight = UP, left flight = DOWN (each floor is a room)
    const SX0 = 1.5, SRUN = .52, SRISE = .3, SN = 8, SZ = 9.4, SW = 1.0, TOP = SN * SRISE, LAND = 1.5, SXE = SX0 + SRUN * SN + LAND;
    const stepMat = new THREE.MeshLambertMaterial({ color: 0xb9b2a4 }), landMat = new THREE.MeshLambertMaterial({ color: 0xe8e3da });
    const portalMat = new THREE.MeshBasicMaterial({ color: 0xfff1d6, transparent: true, opacity: .45, side: THREE.DoubleSide, depthWrite: false });
    const ANG = Math.atan2(SRISE, SRUN), RLEN = SN * Math.hypot(SRUN, SRISE);
    const postGeo = new THREE.BoxGeometry(.06, .9, .06);
    // ---- escalator materials
    const steelEnv = (() => { try { const c = document.createElement('canvas'); c.width = 256; c.height = 128; const x = c.getContext('2d'); const g = x.createLinearGradient(0, 0, 0, 128); g.addColorStop(0, '#f6f2ea'); g.addColorStop(.5, '#a39d93'); g.addColorStop(1, '#3a342d'); x.fillStyle = g; x.fillRect(0, 0, 256, 128); x.fillStyle = '#fff'; x.fillRect(24, 18, 70, 12); x.fillRect(150, 24, 90, 10); const t = new THREE.CanvasTexture(c); t.mapping = THREE.EquirectangularReflectionMapping; t.encoding = THREE.sRGBEncoding; const pm = new THREE.PMREMGenerator(renderer); const r = pm.fromEquirectangular(t).texture; pm.dispose(); return r } catch (e) { return null } })();
    const steelM = new THREE.MeshStandardMaterial({ color: 0xd8dce0, metalness: 1, roughness: .25, envMap: steelEnv, envMapIntensity: 1.2 });
    const steelD = new THREE.MeshStandardMaterial({ color: 0x9a9fa5, metalness: 1, roughness: .38, envMap: steelEnv });
    const rubberM = new THREE.MeshStandardMaterial({ color: 0x0a0a0b, roughness: .5, metalness: .1 });
    const tcv = document.createElement('canvas'); tcv.width = 128; tcv.height = 64;
    { const x = tcv.getContext('2d'); x.fillStyle = '#26282b'; x.fillRect(0, 0, 128, 64); x.fillStyle = '#4b4f55'; for (let i = 2; i < 62; i += 4) x.fillRect(0, i, 128, 2); x.fillStyle = '#f2c500'; x.fillRect(0, 0, 16, 64); x.fillRect(0, 0, 128, 3); x.fillRect(0, 61, 128, 3); }
    const treadTex = new THREE.CanvasTexture(tcv); treadTex.encoding = THREE.sRGBEncoding; treadTex.anisotropy = 4;
    const treadMats = [steelD, steelD, new THREE.MeshStandardMaterial({ map: treadTex, roughness: .55, metalness: .3 }), steelD, steelD, steelD];
    const ccv = document.createElement('canvas'); ccv.width = 128; ccv.height = 64;
    { const x = ccv.getContext('2d'); x.fillStyle = '#8f9499'; x.fillRect(0, 0, 128, 64); x.fillStyle = '#5d6166'; for (let i = 14; i < 114; i += 5) x.fillRect(i, 0, 2, 64); x.fillStyle = '#f2c500'; x.fillRect(0, 0, 12, 64); x.fillRect(116, 0, 12, 64); }
    const combTex = new THREE.CanvasTexture(ccv); combTex.encoding = THREE.sRGBEncoding;
    const combMats = [steelD, steelD, new THREE.MeshStandardMaterial({ map: combTex, roughness: .5, metalness: .4 }), steelD, steelD, steelD];
    const treadGeo = new THREE.BoxGeometry(.346, .035, .98), riserGeo = new THREE.BoxGeometry(.02, .2, .98), combGeo = new THREE.BoxGeometry(.6, .04, 1.0);
    const escs = []; let escT = 0;
    function buildEscalator(ox, oy, up) {
      const RUNX = SRUN * SN, E = new THREE.Group(); E.position.set(ox, oy, SZ); scene.add(E);
      const inc = new THREE.Group(); inc.rotation.z = ANG; E.add(inc);
      const truss = new THREE.Mesh(new THREE.BoxGeometry(RLEN + .1, .5, 1.3), steelD); truss.position.set(RLEN / 2, -.5, 0); inc.add(truss);
      for (const sz of [-1, 1]) { const sk = new THREE.Mesh(new THREE.BoxGeometry(RLEN, .12, .03), rubberM); sk.position.set(RLEN / 2, .02, sz * .51); inc.add(sk) }
      const st = [], n = Math.floor(RLEN / .4);
      for (let i = 0; i < n; i++) {
        const g = new THREE.Group(); g.rotation.z = -ANG;
        const tr = new THREE.Mesh(treadGeo, treadMats); tr.position.set(0, -.0175, 0);
        const ri = new THREE.Mesh(riserGeo, steelD); ri.position.set(-.163, -.1, 0);
        g.add(tr, ri); inc.add(g); st.push(g);
      }
      escs.push({ st, up });
      // stainless side panels (balustrades)
      const H1 = 1.0, sh = new THREE.Shape();
      sh.moveTo(-.55, -.3); sh.lineTo(-.55, H1); sh.lineTo(0, H1); sh.lineTo(RUNX, TOP + H1); sh.lineTo(RUNX + .55, TOP + H1); sh.lineTo(RUNX + .55, TOP - .3); sh.lineTo(RUNX, TOP - .3); sh.lineTo(0, -.3); sh.closePath();
      const pg = new THREE.ExtrudeGeometry(sh, { depth: .05, bevelEnabled: false });
      const hp = [[-.55, H1 + .04], [-.2, H1 + .04], [.17, H1 + .14], [RUNX / 2, TOP / 2 + H1 + .04], [RUNX - .17, TOP + H1 - .06], [RUNX + .2, TOP + H1 + .04], [RUNX + .55, TOP + H1 + .04]].map(p => new THREE.Vector3(p[0], p[1], 0));
      const hg = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(hp, false, 'centripetal'), 48, .04, 8, false);
      for (const sz of [-1, 1]) {
        const pm = new THREE.Mesh(pg, steelM); pm.position.z = sz * .56 - .025; E.add(pm);
        const hm = new THREE.Mesh(hg, rubberM); hm.position.z = sz * .56; E.add(hm);
      }
      // comb plates with safety markings
      const lp = new THREE.Mesh(combGeo, combMats); lp.position.set(-.2, .02, 0); E.add(lp);
      if (up === false) { const upl = new THREE.Mesh(combGeo, combMats); upl.position.set(RUNX + .2, TOP + .02, 0); E.add(upl) }
    }
    function escTick(dt) {
      escT += dt * .635;
      for (const e of escs) e.st.forEach((g, i) => { let a = (i * .4 + (e.up ? escT : -escT)) % RLEN; if (a < 0) a += RLEN; g.position.set(a, 0, 0); g.visible = a > .15 && a < RLEN - .15 });
    }
    for (const dir of [1]) {
      buildEscalator(SX0, 0, true);

      // landing = the floor above
      const lb = new THREE.Mesh(new THREE.BoxGeometry(LAND, TOP, SW * 2), stepMat); lb.position.set(dir * (SX0 + SRUN * SN + LAND / 2), TOP / 2, SZ); scene.add(lb);
      const ls = new THREE.Mesh(new THREE.BoxGeometry(LAND + .1, .08, SW * 2 + .1), landMat); ls.position.set(dir * (SX0 + SRUN * SN + LAND / 2), TOP + .04, SZ); scene.add(ls);
      // old rails removed
      // old gold rails removed

      // up passage open (no glowing panel)
      const ps = new THREE.Mesh(new THREE.PlaneGeometry(2.2, .5), plate(dir > 0 ? '▲ NEXT FLOOR' : '▼ LOWER FLOOR', 384, 96, 40));
      ps.position.set(dir * (SXE - .08), TOP + 2.7, SZ); ps.rotation.y = -dir * Math.PI / 2; scene.add(ps);
      // hall sign
      const s = new THREE.Mesh(new THREE.PlaneGeometry(2.2, .6), plate(dir > 0 ? '▲ UPSTAIRS' : '▼ DOWNSTAIRS', 384, 96, 40));
      s.position.set(dir * 2.4, 4.4, 10.93); s.rotation.y = Math.PI; scene.add(s);
      // collision: front rail and the end of the landing (open from the hall side only)
      solidWalls.push({ x1: SX0 - .55, z1: SZ - SW, x2: SXE, z2: SZ - SW, th: .1 }, { x1: SX0 - .55, z1: SZ + SW, x2: SXE, z2: SZ + SW, th: .1 });   // side rail: stairs are entered from the lobby end only
    }
    // ---- DOWN stairs: a pit cut into the floor, steps descend as you walk left
    {
      buildEscalator(-(SX0 + SRUN * SN), -TOP, false);
      // old pit steps removed

      const pf = new THREE.Mesh(new THREE.BoxGeometry(SXE - SX0, .1, SW * 2), landMat); pf.position.set(-(SX0 + SXE) / 2, -TOP - .05, SZ); scene.add(pf);
      for (const sz of [-1, 1]) {
        const w = new THREE.Mesh(new THREE.BoxGeometry(SXE - SX0, TOP, .1), wallM); w.position.set(-(SX0 + SXE) / 2, -TOP / 2, SZ + sz * SW); scene.add(w);
        // pit rail removed
        // pit posts removed
        solidWalls.push({ x1: -SX0 + .55, z1: SZ + sz * SW, x2: -SXE, z2: SZ + sz * SW, th: .1 });
      }

      const ps = new THREE.Mesh(new THREE.PlaneGeometry(2.2, .5), plate('▼ LOWER FLOOR', 384, 96, 40)); ps.position.set(-(SXE - .1), -TOP + 2.7, SZ); ps.rotation.y = Math.PI / 2; scene.add(ps);
      const hs = new THREE.Mesh(new THREE.PlaneGeometry(2.2, .6), plate('▼ DOWNSTAIRS', 384, 96, 40)); hs.position.set(-2.4, 4.4, 10.93); hs.rotation.y = Math.PI; scene.add(hs);
    }
    const stairY = (x, z) => {
      if (Math.abs(z - SZ) > SW) return 0;
      const u = Math.abs(x) - SX0; if (u < 0 || u > SRUN * SN + LAND) return 0;
      const s = x < 0 ? -1 : 1;
      if (u >= SRUN * SN) return s * TOP;
      return s * u * SRISE / SRUN;
    };
    let sy = 0;
    async function climb(dir) {
      const n = myRoom + dir;
      if (n < 0) { addChat('Gallery', 'You are on the ground floor.'); px = dir * .4; return }
      const isNew = n >= rooms;
      if (isNew) { minRooms = Math.max(minRooms, n + 1); if (room) room.emit('react', { e: 'floor', n }).catch(() => { }) }
      evBusy = true; sfxClick(); fade.style.opacity = '1'; await wait(450);
      myRoom = n; px = dir > 0 ? -.5 : .5; pz = SZ; yaw = 0; pitch = 0; sy = 0; looking = null; lpx = null;
      layout(); setPresence(true); renderPeers();
      addChat('Gallery', isNew ? 'A new floor opened: Room ' + (n + 1) : 'Room ' + (n + 1));
      await wait(250); fade.style.opacity = '0'; sfxDing(); await wait(300); evBusy = false;
    }
    function stairTick() {
      if (!started || evBusy || sitting || Math.abs(pz - SZ) > SW || Math.abs(sy) < TOP - .6) return;
      if (Math.abs(px) > SX0 + SRUN * SN - .35) climb(px > 0 ? 1 : -1);   // on the last step
    }

    rods(0, 7.5, 0, 5.0, 6.0, 1.5);   // hangs the lobby sign

    // ---- slots
    const gc = document.createElement('canvas'); gc.width = gc.height = 128; const gx = gc.getContext('2d'), gr = gx.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, 'rgba(255,240,210,.9)'); gr.addColorStop(1, 'rgba(255,240,210,0)'); gx.fillStyle = gr; gx.fillRect(0, 0, 128, 128); const glowTex = new THREE.CanvasTexture(gc);
    const slots = [];
    for (let x = -15; x <= 15; x += 5) { slots.push({ x, z: -D / 2 + .05, ry: 0 }); if (Math.abs(x) > 6.5) slots.push({ x, z: D / 2 - .05, ry: Math.PI }) }
    for (let z = -8; z <= 8; z += 4) { slots.push({ x: -W / 2 + .05, z, ry: Math.PI / 2 }); slots.push({ x: W / 2 - .05, z, ry: -Math.PI / 2 }) }
    PER = slots.length;
    const canvases = [];
    const frameGeo = new THREE.BoxGeometry(1, 1, .08), cvGeo = new THREE.PlaneGeometry(1, 1);
    const frameMat = new THREE.MeshLambertMaterial({ color: 0x1d1a17 });
    const glowGeo = new THREE.PlaneGeometry(LOW ? 5.5 : 8, LOW ? 5 : 7);
    const glowMat = new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: LOW ? .3 : .18 });
    const fixGeo = new THREE.CylinderGeometry(.08, .14, .3, 8), fixMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const plaqueGeo = new THREE.PlaneGeometry(1.5, .47);
    slots.forEach((s, i) => {
      const g = new THREE.Group(); g.position.set(s.x, 2.8, s.z); g.rotation.y = s.ry;
      const frame = new THREE.Mesh(frameGeo, frameMat); frame.position.z = .04;
      const cv = new THREE.Mesh(cvGeo, new THREE.MeshBasicMaterial({ color: 0xdcd8d0 })); cv.position.z = .09; cv.userData.slot = i;
      const glow = new THREE.Mesh(glowGeo, glowMat); glow.position.z = .02;
      const fix = new THREE.Mesh(fixGeo, fixMat); fix.position.set(0, 2.4, .6); fix.rotation.x = .5;
      const pc = document.createElement('canvas'); pc.width = 512; pc.height = 160;
      const ptex = new THREE.CanvasTexture(pc); ptex.encoding = THREE.sRGBEncoding; ptex.generateMipmaps = false; ptex.minFilter = THREE.LinearFilter;
      const plaque = new THREE.Mesh(plaqueGeo, new THREE.MeshBasicMaterial({ map: ptex })); plaque.position.z = .05; plaque.visible = false;
      g.add(glow, frame, cv, fix, plaque);
      if (!LOW && i % 2 === 0) {
        const spot = new THREE.SpotLight(0xfff0d8, 0.8, 14, 0.75, 0.9, 1.2);
        spot.position.set(0, 2.4, 0.6); spot.target.position.set(0, 0, 0.05);
        g.add(spot, spot.target);
      }
      scene.add(g); canvases.push({ g, frame, cv, url: null, plaque, pctx: pc.getContext('2d'), ptex, pkey: '' }); sizeSlot(i, 4, 2.8);
    });
    function sizeSlot(i, w, h) { const c = canvases[i]; c.cv.scale.set(w, h, 1); c.frame.scale.set(w + .25, h + .25, 1); c.plaque.position.y = -(h / 2 + .46) }
    function setPlaque(c, p) {
      if (!p) { c.plaque.visible = false; c.pkey = ''; return }
      c.plaque.visible = true;
      const key = (p.title || '') + '|' + (p.artist || ''); if (c.pkey === key) return; c.pkey = key;   // redraw only when the painting changes
      const x = c.pctx; x.setTransform(2, 0, 0, 2, 0, 0); x.fillStyle = '#1d1a17'; x.fillRect(0, 0, 256, 80); x.strokeStyle = '#c9a45c'; x.lineWidth = 2; x.strokeRect(3, 3, 250, 74);
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillStyle = '#f3ead8'; x.font = '600 24px Georgia, serif'; x.fillText(p.title || 'Untitled', 128, 28, 230);
      x.fillStyle = '#c9a45c'; x.font = 'italic 18px Georgia, serif'; x.fillText(p.artist ? 'by ' + p.artist : '', 128, 58, 230);
      c.ptex.needsUpdate = true;
    }
    const loader = new THREE.TextureLoader();
    function goRoom(d) { myRoom = (myRoom + d + rooms) % rooms; px = 0; pz = D / 2 - 4; yaw = 0; looking = null; layout(); setPresence(true); renderPeers() }
    function layout() {
      const list = [...paintings].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)); rooms = Math.max(Math.floor(list.length / PER) + 1, minRooms); if (myRoom >= rooms) myRoom = rooms - 1; $('rn').textContent = 'Room ' + (myRoom + 1) + ' / ' + rooms;
      canvases.forEach((c, i) => {
        const p = list[myRoom * PER + i]; c.painting = p || null; setPlaque(c, p);
        if (!p) { if (c.url) { c.cv.material.map = null; c.cv.material.color.set(0xdcd8d0); c.cv.material.needsUpdate = true; c.url = null; sizeSlot(i, 4, 2.8) } return }
        const ar = (p.w && p.h) ? p.w / p.h : 1.4, mw = 4.6, mh = 3.6; let w = mw, h = w / ar; if (h > mh) { h = mh; w = h * ar } sizeSlot(i, w, h);
        if (c.url !== p.url) { c.url = p.url; loader.load(p.url, t => { if (c.url !== p.url) { t.dispose(); return } t.encoding = THREE.sRGBEncoding; t.anisotropy = LOW ? 4 : renderer.capabilities.getMaxAnisotropy(); if (c.cv.material.map) c.cv.material.map.dispose(); c.cv.material.map = t; c.cv.material.color.set(0xffffff); c.cv.material.needsUpdate = true }) }
      });
    }

    const tvs = [], tvFrameMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    function tv(x, z, ry, y = 2.4, w = 3.2) {
      const h = w * 9 / 16, g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry;
      const bez = new THREE.Mesh(new THREE.BoxGeometry(w + .2, h + .2, .1), tvFrameMat); bez.position.z = .05;
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: 0x000000 })); scr.position.z = .105;
      g.add(bez, scr); scene.add(g); tvs.push({ m: scr, w, h, t: 99, i: tvs.length * 3, b: 1, loading: false, tex: null });
    }
    tv(-6.74, -6, Math.PI / 2); tv(6.74, -6, -Math.PI / 2); tv(-6.74, 6, Math.PI / 2); tv(6.74, 3.9, -Math.PI / 2, 2.4, 2.6);
    const leds = [], ledCache = new Map();
    let ledIdx = 0;
    let ledStackOrder = 0; const LEDK = LOW ? 9 : 14;
    function ledTex(url, cb) {
      let p = ledCache.get(url);
      if (!p) {
        p = new Promise(res => {
          const im = new Image(); im.crossOrigin = 'anonymous';
          im.onload = () => { const s = Math.min(1, 384 / Math.max(im.width, im.height)), cv = document.createElement('canvas'); cv.width = Math.max(1, Math.round(im.width * s)); cv.height = Math.max(1, Math.round(im.height * s)); cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; res({ t, ar: cv.width / cv.height }) };
          im.onerror = () => res(null); im.src = url;
        });
        ledCache.set(url, p);
      }
      p.then(cb);
    }
    function ledWall(x, z, ry, w = 5.6, h = 3.15) {
      const g = new THREE.Group();
      g.position.set(x, 3.2, z);
      g.rotation.y = ry;

      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(w + .2, h + .2, .12),
        tvFrameMat
      );
      frame.position.z = .06;

      const bg = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: 0x000000 })
      );
      bg.position.z = .125;

      g.add(frame, bg);
      scene.add(g);

      const v = {
        w,
        h,
        items: [],
        cursor: 0,
        spawnTimer: .3 + Math.random() * .8,
        spawnInterval: 1.2
      };

      for (let k = 0; k < LEDK; k++) {
        const depth = .135;

        // Soft shadow underneath the printed photo
        const shadow = new THREE.Mesh(
          new THREE.PlaneGeometry(1, 1),
          new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: .28,
            depthWrite: false,
            toneMapped: false
          })
        );

        // White paper backing / photo border
        const backing = new THREE.Mesh(
          new THREE.PlaneGeometry(1, 1),
          new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            depthTest: true,
            depthWrite: true,
            toneMapped: false
          })
        );

        // Actual photograph
        const im = new THREE.Mesh(
          new THREE.PlaneGeometry(1, 1),
          new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            depthTest: true,
            depthWrite: true,
            toneMapped: false
          })
        );

        shadow.position.z = depth;
        backing.position.z = depth + .001;
        im.position.z = depth + .002;

        shadow.visible = false;
        backing.visible = false;
        im.visible = false;

        g.add(shadow, backing, im);

        v.items.push({
          im,
          backing,
          shadow,
          depth,

          x: 0,
          y: 0,

          startX: 0,
          startY: 0,
          targetX: 0,
          targetY: 0,

          iw: 1,
          ih: 1,

          elapsed: 0,
          duration: 1,

          startRotation: 0,
          endRotation: 0,

          loading: false,
          active: false,
          has: false,
          settled: false,
          order: 0
        });
      }

      leds.push(v);
    }
    ledWall(-7.27, -5.5, -Math.PI / 2); ledWall(-7.27, 5.5, -Math.PI / 2);
    ledWall(7.27, -5.5, Math.PI / 2); ledWall(7.27, 5.5, Math.PI / 2);
    function ledSet(v, it) {
      if (!paintings.length || it.loading) return;

      it.loading = true;
      it.active = false;
      it.settled = false;
      it.has = false;

      it.im.visible = false;
      it.backing.visible = false;
      it.shadow.visible = false;

      const p = paintings[(ledIdx++) % paintings.length];

      ledTex(p.url, r => {
        it.loading = false;

        if (!r) return;

        it.im.material.map = r.t;
        it.im.material.needsUpdate = true;

        // Random printed photograph size
        it.ih = v.h * (.24 + Math.random() * .15);
        it.iw = it.ih * r.ar;

        if (it.iw > v.w * .38) {
          it.iw = v.w * .38;
          it.ih = it.iw / r.ar;
        }

        // Image size
        it.im.scale.set(it.iw, it.ih, 1);

        // Thin printed-photo border
        const border = .018;

        it.backing.scale.set(
          it.iw + border * 2,
          it.ih + border * 2,
          1
        );

        it.shadow.scale.set(
          it.iw + border * 2 + .055,
          it.ih + border * 2 + .055,
          1
        );

        // Landing rotation
        it.startRotation = (Math.random() - .5) * 1.8;
        it.endRotation = (Math.random() - .5) * .20;

        // Calculate safe landing area, including rotated photo corners
        const c = Math.abs(Math.cos(it.endRotation));
        const s = Math.abs(Math.sin(it.endRotation));

        const halfW = (
          it.iw * c + it.ih * s
        ) / 2 + border;

        const halfH = (
          it.iw * s + it.ih * c
        ) / 2 + border;

        const safeX = Math.max(0, v.w / 2 - halfW - .06);
        const safeY = Math.max(0, v.h / 2 - halfH - .06);

        // Final landing position
        it.targetX = (Math.random() * 2 - 1) * safeX;
        it.targetY = (Math.random() * 2 - 1) * safeY;

        // Choose an edge outside the TV screen
        const side = Math.floor(Math.random() * 4);
        const outside = .35;

        if (side === 0) {
          // Left edge
          it.startX = -(v.w / 2 + it.iw / 2 + outside);
          it.startY = (Math.random() * 2 - 1) * safeY;
        } else if (side === 1) {
          // Right edge
          it.startX = v.w / 2 + it.iw / 2 + outside;
          it.startY = (Math.random() * 2 - 1) * safeY;
        } else if (side === 2) {
          // Top edge
          it.startX = (Math.random() * 2 - 1) * safeX;
          it.startY = v.h / 2 + it.ih / 2 + outside;
        } else {
          // Bottom edge
          it.startX = (Math.random() * 2 - 1) * safeX;
          it.startY = -(v.h / 2 + it.ih / 2 + outside);
        }

        it.x = it.startX; const rotation = it.startRotation, inside = false;
        it.y = it.startY;

        it.elapsed = 0;
        it.duration = .85 + Math.random() * .3;

        it.im.rotation.z = it.startRotation;
        it.backing.rotation.z = it.startRotation;
        it.shadow.rotation.z = it.startRotation;

        it.active = true;
        it.has = true;
        it.settled = false;
        // Newest photo gets the highest stacking order
        it.order = ++ledStackOrder;

        // Keep every photo close to the TV screen
        it.depth = .14 + it.order * .0001;

        it.shadow.position.z = it.depth;
        it.backing.position.z = it.depth + .001;
        it.im.position.z = it.depth + .002;

        // Position all three layers together
        it.shadow.position.x = it.x + .045;
        it.shadow.position.y = it.y - .045;

        it.backing.position.x = it.x;
        it.backing.position.y = it.y;

        it.im.position.x = it.x;
        it.im.position.y = it.y;

        for (const mesh of [it.shadow, it.backing, it.im]) {
          mesh.rotation.z = rotation;
          mesh.visible = inside;
        }

        // Slight shadow offset for a raised-paper appearance
        it.shadow.position.x += .045;
        it.shadow.position.y -= .045;
      });
    }
    function ledTick(dt) {
      dt = Math.min(dt, .04);

      for (const v of leds) {
        v.spawnTimer -= dt;

        if (v.spawnTimer <= 0 && paintings.length) {
          v.spawnTimer = v.spawnInterval;

          const it = v.items[v.cursor];
          v.cursor = (v.cursor + 1) % v.items.length;

          if (!it.loading) {
            ledSet(v, it);
          }
        }

        for (const it of v.items) {
          if (!it.active || !it.has || it.loading) continue;

          it.elapsed += dt;

          const raw = Math.min(1, it.elapsed / it.duration);

          // Smooth flying motion
          const t = raw * raw * (3 - 2 * raw);

          it.x = it.startX + (it.targetX - it.startX) * t;
          it.y = it.startY + (it.targetY - it.startY) * t;

          // Tossing arc
          const arc = Math.sin(raw * Math.PI) * .08;

          const dx = it.targetX - it.startX;
          const dy = it.targetY - it.startY;
          const distance = Math.max(.001, Math.sqrt(dx * dx + dy * dy));

          it.x += (-dy / distance) * arc;
          it.y += (dx / distance) * arc;

          const spin = Math.sin(raw * Math.PI) * .22;

          const rotation =
            it.startRotation +
            (it.endRotation - it.startRotation) * t +
            spin;

          // Keep the photo completely inside the TV while entering.
          // Hide it until its entire rotated rectangle has crossed the edge.
          const c = Math.abs(Math.cos(rotation));
          const s = Math.abs(Math.sin(rotation));

          const halfW = (it.iw * c + it.ih * s) / 2 + .025;
          const halfH = (it.iw * s + it.ih * c) / 2 + .025;

          const inside =
            Math.abs(it.x) + halfW <= v.w / 2 &&
            Math.abs(it.y) + halfH <= v.h / 2;

          for (const mesh of [it.shadow, it.backing, it.im]) {
            mesh.position.x = it.x;
            mesh.position.y = it.y;
            mesh.rotation.z = rotation;
            mesh.visible = inside;
          }

          // Maintain subtle shadow offset
          it.shadow.position.x += 0;
          it.shadow.position.y += 0;

          if (raw >= 1) {
            it.x = it.targetX;
            it.y = it.targetY;

            it.im.position.x = it.x;
            it.im.position.y = it.y;

            it.backing.position.x = it.x;
            it.backing.position.y = it.y;

            it.shadow.position.x = it.x + .045;
            it.shadow.position.y = it.y - .045;

            it.im.rotation.z = it.endRotation;
            it.backing.rotation.z = it.endRotation;
            it.shadow.rotation.z = it.endRotation;

            it.active = false;
            it.settled = true;
          }
        }
      }
    }

    function tvTick(dt) {
      let list = null;
      for (const v of tvs) {
        v.t += dt;
        if (!v.loading && v.t > 7) {
          list = list || [...paintings].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)); if (!list.length) continue;
          v.t = 0; v.loading = true; v.i = (v.i + 1) % list.length;
          loader.load(list[v.i].url, tx => {
            tx.encoding = THREE.sRGBEncoding; tx.anisotropy = 4; if (v.tex) v.tex.dispose(); v.tex = tx;
            const ar = tx.image.width / tx.image.height, w1 = Math.min(v.w, v.h * ar);
            v.m.scale.set(w1 / v.w, (w1 / ar) / v.h, 1);
            v.m.material.map = tx; v.m.material.needsUpdate = true; v.b = 0; v.loading = false;
          }, undefined, () => { v.loading = false });
        }
        if (v.b < 1) { v.b = Math.min(1, v.b + dt * 1.6); v.m.material.color.setScalar(v.b) }
      }
    }

    // ---- player
    let yaw = 0, pitch = 0, px = 0, pz = 9.5; const keys = {}; let started = false, locked = false, mv = { x: 0, y: 0 };
    const touch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    addEventListener('keydown', e => { if (!started || document.activeElement.tagName === 'INPUT') return; keys[e.code] = true; if (e.code === 'KeyX') removeMine(); if (e.code === 'KeyF') wave(); if (e.code === 'KeyG') setEmote('dance'); if (e.code === 'KeyE') setEmote('sit'); if (e.code === 'KeyC') setEmote('clap'); if (e.code === 'KeyV') setEmote('laugh'); if (e.code === 'KeyB') setEmote('point'); if (e.code === 'KeyN') setEmote('thumb'); if (e.code === 'KeyP') togglePhoto(); if (e.code === 'Space' && photoOn) shoot(); if (e.code === 'KeyM') toggleMic(); if (e.code === 'KeyZ') punch(); if (e.code === 'KeyQ' && !e.repeat) bowStart() });
    addEventListener('keydown', e => { if (started && e.key === 'Enter' && document.activeElement.tagName !== 'INPUT' && $('panel').style.display !== 'flex') { e.preventDefault(); document.exitPointerLock?.(); $('cin').focus() } });
    addEventListener('keyup', e => { keys[e.code] = false; if (e.code === 'KeyQ') bowRelease() });
    const cvs = renderer.domElement;
    $('go').onclick = () => {
      if (!me) { registerFromCard(); return }
      if (touch) stick.style.display = 'block';
      myName = ($('nm').value.trim() || 'Guest ' + myId.slice(-3)); try { localStorage.setItem('gname', myName); localStorage.setItem('ggen', myGen); localStorage.setItem('glook', JSON.stringify(myLook)) } catch (e) { }
      if (me) api('/api/profile', { method: 'POST', body: JSON.stringify({ look: lookObj() }) }).catch(() => { });
      $('start').style.display = 'none'; document.body.classList.remove('menu'); started = true; $('chat').style.display = 'block'; $('emo').style.display = 'flex'; $('act').style.display = 'flex'; if (touch) $('cross').style.display = 'block'; try { ctxA() } catch (e) { } setPresence(true); if (!touch) cvs.requestPointerLock?.()
    };
    cvs.addEventListener('click', () => { if (started && !touch && !locked) cvs.requestPointerLock?.() });
    document.addEventListener('pointerlockchange', () => locked = document.pointerLockElement === cvs);
    document.addEventListener('mousemove', e => { if (!locked) return; yaw -= e.movementX * .0025; pitch = Math.max(-1.2, Math.min(1.2, pitch - e.movementY * .0025)) });


    const stick = document.createElement('div');
    stick.style.cssText = 'position:fixed;left:22px;bottom:calc(120px + env(safe-area-inset-bottom));width:130px;height:130px;border-radius:50%;background:rgba(255,255,255,.1);border:2px solid rgba(255,255,255,.35);z-index:18;display:none;pointer-events:none;color:#fff;font:12px sans-serif';
    stick.innerHTML = '<span style="position:absolute;top:4px;left:50%;transform:translateX(-50%);opacity:.6">▲</span><span style="position:absolute;bottom:4px;left:50%;transform:translateX(-50%);opacity:.6">▼</span><span style="position:absolute;left:6px;top:50%;transform:translateY(-50%);opacity:.6">◀</span><span style="position:absolute;right:6px;top:50%;transform:translateY(-50%);opacity:.6">▶</span>';
    const knob = document.createElement('div');
    knob.style.cssText = 'position:absolute;left:50%;top:50%;width:54px;height:54px;border-radius:50%;background:rgba(255,255,255,.55);border:2px solid #fff;transform:translate(-50%,-50%);box-shadow:0 2px 8px #0006';
    stick.append(knob); document.body.append(stick);
    const JR = 50, joyV = { x: 0, y: 0 }; let joyId = null;
    const inStick = (x, y) => { const r = stick.getBoundingClientRect(); return Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2)) < r.width * .85 };
    function joyMove(t) {
      const r = stick.getBoundingClientRect(); let dx = t.clientX - (r.left + r.width / 2), dy = t.clientY - (r.top + r.height / 2); const d = Math.hypot(dx, dy);
      if (d > JR) { dx *= JR / d; dy *= JR / d } joyV.x = dx / JR; joyV.y = dy / JR;
      knob.style.transform = `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px))`;
    }
    function joyEnd() { joyId = null; joyV.x = joyV.y = 0; knob.style.transform = 'translate(-50%,-50%)' }
    const tp = {};
    cvs.addEventListener('touchstart', e => {
      for (const t of e.changedTouches) {
        if (started && joyId === null && inStick(t.clientX, t.clientY)) { joyId = t.identifier; joyMove(t) }
        else tp[t.identifier] = { x: t.clientX, y: t.clientY }
      }
    }, { passive: true });
    cvs.addEventListener('touchmove', e => {
      for (const t of e.changedTouches) {
        if (t.identifier === joyId) { joyMove(t); continue }
        const p = tp[t.identifier]; if (!p) continue;
        yaw -= (t.clientX - p.x) * .005; pitch = Math.max(-1.2, Math.min(1.2, pitch - (t.clientY - p.y) * .005)); p.x = t.clientX; p.y = t.clientY
      }
    }, { passive: true });
    const endT = e => { for (const t of e.changedTouches) { if (t.identifier === joyId) joyEnd(); delete tp[t.identifier] } };
    cvs.addEventListener('touchend', endT); cvs.addEventListener('touchcancel', endT);

    // ---- teleport to another player

    function teleportToPlayer(player) {
      if (!player || player.peer === myId) return;

      const target = player.presence;

      if (
        !target ||
        !Number.isFinite(Number(target.x)) ||
        !Number.isFinite(Number(target.z))
      ) {
        console.warn("Player position is unavailable.");
        return;
      }

      const tx = Number(target.x);
      const tz = Number(target.z);
      const targetYaw = Number(target.ry) || 0;

      // Try several positions behind or beside the player.
      const distance = 1.8;

      const positions = [
        {
          x: tx + Math.sin(targetYaw) * distance,
          z: tz + Math.cos(targetYaw) * distance
        },
        {
          x: tx - Math.sin(targetYaw) * distance,
          z: tz - Math.cos(targetYaw) * distance
        },
        {
          x: tx + Math.cos(targetYaw) * distance,
          z: tz - Math.sin(targetYaw) * distance
        },
        {
          x: tx - Math.cos(targetYaw) * distance,
          z: tz + Math.sin(targetYaw) * distance
        }
      ];

      // Find a safe landing position.
      const destination = positions.find(pos =>
        pos.x > -W / 2 + 1 &&
        pos.x < W / 2 - 1 &&
        pos.z > -D / 2 + 1 &&
        pos.z < D / 2 - 1 &&
        !collidesWithWall(pos.x, pos.z, 0.65)
      );

      if (!destination) {
        console.warn("No safe teleport position available.");
        return;
      }

      // Stop sitting before teleporting.
      if (sitting) standUp();

      // Update player position.
      px = destination.x;
      pz = destination.z;

      // Face the player.
      yaw = Math.atan2(
        -(tx - px),
        -(tz - pz)
      );

      // Reset vertical camera angle.
      pitch = 0;

      sy = stairY(px, pz);
      cam.position.set(px, EYE + sy, pz);
      cam.rotation.set(pitch, yaw, 0, 'YXZ');

      // Synchronize the new position with other visitors.
      setPresence(true);
    }

    function step(dt) {
      if (boothBusy) return;
      if (photoOn && !evBusy) { photoCam(dt); return }
      if (evBusy) return;
      let f =
        (keys.KeyW || keys.ArrowUp ? 1 : 0) -
        (keys.KeyS || keys.ArrowDown ? 1 : 0);

      let r =
        (keys.KeyD ? 1 : 0) -
        (keys.KeyA ? 1 : 0);

      if (keys.ArrowLeft) yaw += dt * 1.8;
      if (keys.ArrowRight) yaw -= dt * 1.8;

      f += -joyV.y; r += joyV.x;

      if (sitting && Math.abs(f) + Math.abs(r) > .3) {
        standUp();
      }

      if (sitting) {
        sy += (stairY(px, pz) - sy) * Math.min(1, dt * 14);
        cam.position.set(px, EYE + sy + Math.sin(performance.now() / 260) * (Math.abs(f) + Math.abs(r) > 0 ? .015 : 0), pz);
        cam.rotation.set(pitch, yaw, 0, 'YXZ');
        return;
      }

      if (emote === 'dance' && Math.abs(f) + Math.abs(r) > .3) {
        emote = null;
        $('dn').className = 'g';
        setPresence(true);
      }

      const len = Math.hypot(f, r) || 1;
      const sp = 3.6 * (bowT ? .55 : 1) * dt / Math.max(1, len);

      const moveX =
        (-Math.sin(yaw) * f + Math.cos(yaw) * r) * sp;

      const moveZ =
        (-Math.cos(yaw) * f - Math.sin(yaw) * r) * sp;

      // Test horizontal movement independently.
      // This allows the player to slide along walls.
      const nextX = px + moveX;
      const nextZ = pz + moveZ;

      if (!collidesWithWall(nextX, pz)) {
        px = nextX;
      }

      if (!collidesWithWall(px, nextZ)) {
        pz = nextZ;
      }

      { const cu = Math.abs(px) - SX0; if (Math.abs(pz - SZ) < SW && cu > 0 && cu < SRUN * SN) { const cx = px + (px < 0 ? -1 : 1) * .55 * dt; if (!collidesWithWall(cx, pz)) px = cx } }
      // Knockback: slide away from the attacker, stopped by walls, fading out
      if (Math.abs(kbx) + Math.abs(kbz) > .05) {
        const nx = px + kbx * dt, nz = pz + kbz * dt;
        if (!collidesWithWall(nx, pz)) px = nx; else kbx = 0;
        if (!collidesWithWall(px, nz)) pz = nz; else kbz = 0;
        const dec = Math.exp(-dt * 7); kbx *= dec; kbz *= dec;
      }
      // Keep the player inside the outer room.
      px = Math.max(-W / 2 + .9, Math.min(W / 2 - .9, px));
      pz = Math.max(-D / 2 + .9, Math.min(D / 2 - .9, pz));
      if (lpx !== null) { const dd = Math.hypot(px - lpx, pz - lpz); if (dd < 1) { stepAcc += dd; if (stepAcc > 1.2) { stepAcc = 0; sfxStep() } } } lpx = px; lpz = pz;

      sy += (stairY(px, pz) - sy) * Math.min(1, dt * 14);
      cam.position.set(
        px,
        EYE + sy + Math.sin(performance.now() / 260) *
        (Math.abs(f) + Math.abs(r) > 0 ? .015 : 0),
        pz
      );

      cam.rotation.set(pitch, yaw, 0, 'YXZ');
    }

    // ---- avatars
    const avatars = new Map();
    function label(text) {
      const c = document.createElement('canvas'); c.width = 320; c.height = 64;
      const tex = new THREE.CanvasTexture(c); tex.generateMipmaps = false; tex.minFilter = THREE.LinearFilter;
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
      s.scale.set(1.75, .35, 1); s.position.y = 2.15; s.userData = { c, tex, text, st: -1 }; drawLabel(s, 0); return s
    }

    function drawLabel(s, st) {
      const u = s.userData;

      if (u.st === st && !u.chatText) return;
      u.st = st;

      const x = u.c.getContext('2d');
      x.clearRect(0, 0, 320, 64);

      const text = u.chatText || u.text;

      x.font = '600 25px system-ui,sans-serif';
      x.textAlign = 'center';
      x.textBaseline = 'middle';

      const maxWidth = 290;
      const paddingX = 14;
      const paddingY = 9;
      const words = String(text).split(/\s+/);
      const lines = [];
      let line = '';

      for (const word of words) {
        const test = line ? line + ' ' + word : word;

        if (x.measureText(test).width > maxWidth && line) {
          lines.push(line);
          line = word;
        } else {
          line = test;
        }
      }

      if (line) lines.push(line);

      const visible = lines.slice(0, 2);
      const lineHeight = 22;
      const boxHeight = visible.length * lineHeight + paddingY * 2;

      const textWidth = Math.max(
        ...visible.map(line => x.measureText(line).width)
      );

      const boxWidth = Math.min(310, textWidth + paddingX * 2);
      const left = (320 - boxWidth) / 2;
      const top = (64 - boxHeight) / 2;

      x.fillStyle = u.chatText
        ? 'rgba(20,20,24,.95)'
        : st === 2
          ? 'rgba(24,120,64,.95)'
          : 'rgba(20,20,22,.75)';

      x.beginPath();
      x.roundRect(left, top, boxWidth, boxHeight, 9);
      x.fill();

      if (st === 2 && !u.chatText) {
        x.strokeStyle = '#6dff8c';
        x.lineWidth = 2;
        x.stroke();
      }

      x.fillStyle = '#fff';

      visible.forEach((line, i) => {
        x.fillText(
          line,
          left + paddingX + (boxWidth - paddingX * 2) / 2,
          top + paddingY + i * lineHeight + lineHeight / 2,
          boxWidth - paddingX * 2
        );
      });

      u.tex.needsUpdate = true;
    }

    function chatBubble(text) {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 160;

      const ctx = c.getContext('2d');
      const maxWidth = 460;
      const message = String(text).slice(0, 100);

      ctx.font = '600 27px system-ui, sans-serif';

      const words = message.split(' ');
      const lines = [];
      let line = '';

      for (const word of words) {
        const test = line ? line + ' ' + word : word;

        if (ctx.measureText(test).width > maxWidth && line) {
          lines.push(line);
          line = word;
        } else {
          line = test;
        }
      }

      if (line) lines.push(line);

      const visible = lines.slice(0, 3);
      const lineHeight = 34;
      const boxHeight = visible.length * lineHeight + 38;
      const top = (160 - boxHeight) / 2;

      ctx.fillStyle = 'rgba(20, 20, 24, 0.92)';
      ctx.beginPath();
      ctx.roundRect(16, top, 480, boxHeight, 20);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(240, top + boxHeight);
      ctx.lineTo(256, top + boxHeight + 14);
      ctx.lineTo(272, top + boxHeight);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      visible.forEach((line, i) => {
        ctx.fillText(
          line,
          256,
          top + 19 + i * lineHeight + lineHeight / 2,
          maxWidth
        );
      });

      const texture = new THREE.CanvasTexture(c);
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          depthTest: false
        })
      );

      sprite.scale.set(2.5, 0.78, 1);
      sprite.position.y = 2.65;

      return sprite;
    }
    const SKIN = [0xf1c9a5, 0xd9a37c, 0xb67b55, 0x8a5a3c, 0x5e3b27], HAIR = [0x2a1d15, 0x5a3a22, 0xb98a4e, 0x1a1a1a, 0x8b3a2b, 0x9aa0a6, 0xd9701f];
    const ok = (v, n) => Number.isInteger(v) && v >= 0 && v < n;
    const seedOf = s => { let h = 7; for (const c of s) h = (h * 131 + c.charCodeAt(0)) >>> 0; return h };
    const matCache = new Map(), geoCache = new Map();   // shared by every avatar, so extra players cost almost nothing
    const MT = (c, r = .85) => { const k = new THREE.Color(c).getHex() + ':' + r; let m = matCache.get(k); if (!m) { m = new THREE.MeshStandardMaterial({ color: c, roughness: r }); matCache.set(k, m) } return m };
    const HLM = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const geoOf = (k, f) => { let g = geoCache.get(k); if (!g) { g = f(); geoCache.set(k, g) } return g };
    const sphG = (r, w = 14, h = 10) => geoOf('s' + r + ',' + w + ',' + h, () => new THREE.SphereGeometry(r, w, h));
    const capG = (r, len) => geoOf('c' + r + ',' + len, () => {   // capsule (r128 has no CapsuleGeometry)
      const pts = [], half = len / 2, n = 5;
      for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + Math.PI / 2 * i / n; pts.push(new THREE.Vector2(Math.cos(a) * r, -half + Math.sin(a) * r)) }
      for (let i = 0; i <= n; i++) { const a = Math.PI / 2 * i / n; pts.push(new THREE.Vector2(Math.cos(a) * r, half + Math.sin(a) * r)) }
      return new THREE.LatheGeometry(pts, 12);
    });
    const mk = (geo, mat, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.scale.set(sx, sy, sz); return o };
    const prof = (key, pts, seg = 18, n = 36) => geoOf(key, () => {   // smooth lathe from a profile (bottom to top)
      const c = new THREE.SplineCurve(pts.map(p => new THREE.Vector2(p[0], p[1])));
      return new THREE.LatheGeometry(c.getPoints(n).map(v => new THREE.Vector2(Math.max(0, v.x), v.y)), seg);
    });
    const tubeG = (len, rt, rb, bu = 0) => prof('t' + [len, rt, rb, bu], [[0, -len], [rb * .72, -len + rb * .28], [rb, -len + rb], [(rt + rb) / 2 + bu, -len / 2], [rt, -rt], [rt * .72, -rt * .28], [0, 0]], 16, 30);
    const openG = (len, rt, rb) => prof('o' + [len, rt, rb], [[rb, -len], [(rt + rb) / 2, -len / 2], [rt, 0]], 16, 12);   // open sleeve / shorts leg
    function limb(len, rt, rb, bu, mat) { const p = new THREE.Group(); p.add(mk(tubeG(len, rt, rb, bu), mat)); return p }
    function addExtras(head, torso, look, hair, hue) {
      const n = k => { const v = look && +look[k]; return Number.isInteger(v) && v > 0 && v < 5 ? v : 0 };
      const hs = n('hs'), ht = n('ht'), gl = n('gl'), bg = n('bg');
      const A = (p, geo, mat, x, y, z, sx, sy, sz) => p.add(mk(geo, mat, x, y, z, sx, sy, sz));
      const hat = MT(new THREE.Color(`hsl(${(hue + 40) % 360},60%,46%)`), .4), gold = MT(0xe3b53c, .3), dark = MT(0x1d1a17, .3), bagM = MT(new THREE.Color(`hsl(${(hue + 90) % 360},45%,42%)`), .6);
      // hair styles
      if (hs === 1) { A(head, sphG(.07, 12, 10), hair, 0, .02, .31); A(head, capG(.05, .2), hair, 0, -.2, .36) }                 // ponytail
      else if (hs === 2) for (const s of [-1, 1]) A(head, sphG(.1, 14, 10), hair, s * .2, .26, .08);                          // buns
      else if (hs === 3) { A(head, sphG(.13, 14, 10), hair, 0, .28, .03); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; A(head, sphG(.1, 12, 10), hair, Math.cos(a) * .22, .2, Math.sin(a) * .2 + .04) } }   // curls
      else if (hs === 4) { A(head, sphG(.11, 14, 10), hair, 0, .37, .02); A(head, sphG(.06, 10, 8), hair, 0, .46, .02) }       // top knot
      // hats
      if (ht === 1) { A(head, geoOf('hatDome', () => new THREE.SphereGeometry(.31, 24, 14, 0, Math.PI * 2, 0, Math.PI * .5)), hat, 0, .06, .03, 1, 1, 1.05); A(head, sphG(.18, 14, 8), hat, 0, .1, -.3, 1.1, .12, 1) }   // cap
      else if (ht === 2) { A(head, geoOf('beanie', () => new THREE.SphereGeometry(.318, 24, 14, 0, Math.PI * 2, 0, Math.PI * .55)), hat, 0, .04, .03, 1, 1, 1.05); A(head, geoOf('cuff', () => new THREE.CylinderGeometry(.322, .322, .08, 24)), gold, 0, .075, .03, 1, 1, 1.05); A(head, sphG(.065, 12, 10), gold, 0, .36, .03) }   // beanie
      else if (ht === 3) { A(head, geoOf('topH', () => new THREE.CylinderGeometry(.17, .18, .3, 20)), dark, 0, .46, .02); A(head, geoOf('topB', () => new THREE.CylinderGeometry(.3, .3, .03, 24)), dark, 0, .31, .02); A(head, geoOf('topR', () => new THREE.CylinderGeometry(.182, .182, .05, 20)), hat, 0, .36, .02) }   // top hat
      else if (ht === 4) { A(head, geoOf('crnR', () => new THREE.CylinderGeometry(.2, .2, .07, 20)), gold, 0, .33, .03); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; A(head, geoOf('crnC', () => new THREE.ConeGeometry(.04, .12, 6)), gold, Math.cos(a) * .2, .43, Math.sin(a) * .2 + .03) } }   // crown
      // glasses
      if (gl) {
        const fm = gl === 3 ? gold : dark;
        if (gl === 2) for (const s of [-1, 1]) A(head, geoOf('shade', () => new THREE.BoxGeometry(.12, .075, .012)), dark, s * .085, 0, -.268);
        else for (const s of [-1, 1]) A(head, geoOf('ring', () => new THREE.TorusGeometry(.05, .009, 8, 20)), fm, s * .085, 0, -.268);
        A(head, geoOf('bridge', () => new THREE.CylinderGeometry(.006, .006, .06, 6)), fm, 0, .01, -.268, 1, 1, 1).rotation.z = Math.PI / 2;
      }

      // bags (back of the avatar is +z)
      if (bg === 1) { A(torso, geoOf('bpk', () => new THREE.BoxGeometry(.28, .34, .14)), bagM, 0, .07, .21); for (const s of [-1, 1]) A(torso, geoOf('bst', () => new THREE.BoxGeometry(.03, .3, .02)), dark, s * .09, .12, -.16) }
      else if (bg === 2) { A(torso, geoOf('sat', () => new THREE.BoxGeometry(.2, .15, .08)), bagM, .2, -.12, 0); const st = A(torso, geoOf('sstr', () => new THREE.BoxGeometry(.018, .55, .012)), dark, 0, .06, -.168); st.rotation.z = .75 }
      else if (bg === 3) { A(torso, geoOf('tote', () => new THREE.BoxGeometry(.22, .2, .06)), bagM, .2, -.15, -.02); A(torso, geoOf('hand', () => new THREE.TorusGeometry(.07, .01, 6, 14, Math.PI)), dark, .2, -.05, -.02) }
    }
    function makeAvatar(name, hue, gen, sd, look) {
      const g = new THREE.Group(), P = {}, f = gen === 'f', m = gen === 'm';

      // ---- one soft stylized material set shared by every character
      const hi = ok(look && look.hr, HAIR.length) ? look.hr : (sd >>> 4) % 5;
      const skin = MT(SKIN[ok(look && look.sk, 5) ? look.sk : sd % 5], .6);
      const hair = MT(HAIR[hi], .45), hairHi = MT(new THREE.Color(HAIR[hi]).offsetHSL(0, .02, .1), .4);
      const shirt = MT(new THREE.Color(`hsl(${hue},80%,60%)`), .7);
      const pants = MT(0x7fa8d6, .8);                       // light denim blue like the reference
      const shoe = MT(0xf6f3ec, .55), sole = MT(new THREE.Color(`hsl(${hue},40%,48%)`), .6);
      const eyeM = MT(0x241a17, .3), cheek = MT(0xff9e92, 1), lip = MT(0x9a4a42, .5);
      const w = f ? .94 : m ? 1.06 : 1;

      // ---- body: hips + fitted tee
      const body = new THREE.Group(); g.add(body); P.body = body;
      body.add(mk(sphG(.18, 20, 14), pants, 0, .8, 0, w, .85, .85));

      const torso = new THREE.Group(); torso.position.y = 1.12; body.add(torso); P.torso = torso;
      torso.add(mk(prof('tee-v4', [[0, -.25], [.15, -.24], [.165, -.2], [.15, -.06], [.158, .06], [.175, .19], [.16, .26], [.08, .3], [0, .31]], 24, 36), shirt, 0, 0, 0, w, 1, .8));
      torso.add(mk(geoOf('neckC', () => new THREE.CylinderGeometry(.045, .05, .1, 14)), skin, 0, .33, 0));

      // ---- head: large, smooth, friendly
      const head = new THREE.Group(); head.position.y = .6; torso.add(head); P.head = head;
      head.add(mk(sphG(.27, 32, 24), skin, 0, 0, 0, 1, .97, .97));
      head.add(mk(sphG(.028, 10, 8), skin, 0, -.045, -.262, 1, .8, .8));                       // small nose
      P.eyes = [];
      for (const s of [-1, 1]) {
        const eye = mk(sphG(.04, 14, 12), eyeM, s * .088, -.005, -.246, 1, 1.3, .45); head.add(eye); P.eyes.push(eye);   // large dark oval eyes (they blink)
        head.add(mk(sphG(.009, 8, 6), HLM, s * .088 + .012, .02, -.268));                      // eye highlight
        const brow = mk(capG(.006, .042), hair, s * .088, .088, -.243); brow.rotation.z = Math.PI / 2 + s * .14; head.add(brow);
        head.add(mk(sphG(.035, 10, 8), cheek, s * .15, -.07, -.205, 1, .6, .3));               // blush
        head.add(mk(sphG(.034, 10, 8), skin, s * .262, -.01, .01, .45, 1, .75));               // ears
      }
      const mouth = mk(geoOf('smileC', () => new THREE.TorusGeometry(.03, .007, 6, 14, Math.PI)), lip, 0, -.085, -.25); mouth.rotation.z = Math.PI; head.add(mouth);

      // ---- hair: scalp cap + back/side shell + layered strand locks
      const hairD = geoOf('hmatD' + hi, () => { const mm = hair.clone(); mm.side = THREE.DoubleSide; return mm });
      const HP = (geo, mat, x, y, z, sx, sy, sz, rx = 0, rz = 0) => { const o = mk(geo, mat, x, y, z, sx, sy, sz); o.rotation.set(rx, 0, rz); head.add(o); return o };
      const lock = (x, y, z, len, r, rx, rz, mat = hair) => HP(capG(r, len), mat, x, y - len / 2 - r, z, 1, 1, .62, rx, rz);
      HP(geoOf('hTop', () => new THREE.SphereGeometry(.289, 32, 20, 0, Math.PI * 2, 0, 1.02)), hairD, 0, 0, .02, 1, 1, 1);          // scalp
      const H0 = m ? 1.4 : 2.2, T1 = m ? 1.0 : f ? 1.95 : 1.5;                                                                        // how far the hair wraps round / down
      HP(geoOf('hBack' + gen, () => new THREE.SphereGeometry(.286, 32, 20, Math.PI / 2 - H0, H0 * 2, .5, T1)), hairD, 0, 0, .025, 1, 1, 1);
      if (m) {
        HP(sphG(.14, 16, 12), hair, .02, .255, -.02, 1.2, .55, 1.1);                                                                  // top volume
        HP(sphG(.09, 14, 10), hairHi, -.04, .285, -.06, 1.5, .3, 1.1);                                                                // sheen
        for (const x of [-.13, -.04, .05, .13]) HP(sphG(.07, 10, 8), hair, x, .165, -.21, 1.3, .5, .7, 0, x * 2);                     // short fringe tufts
        for (const s of [-1, 1]) lock(s * .262, .02, -.02, .07, .02, 0, 0);                                                           // sideburns
      } else {
        HP(sphG(.12, 16, 12), hair, .08, .15, -.2, 1.7, .45, .7, 0, -.35);                                                            // side-swept fringe
        HP(sphG(.11, 16, 12), hair, -.1, .165, -.19, 1.4, .45, .7, 0, .4);
        HP(sphG(.09, 14, 10), hairHi, 0, .2, -.21, 1.6, .3, .6);
        const n = f ? 11 : 7, L = f ? .62 : .3;
        for (let i = 0; i < n; i++) {                                                                                                 // layered strands around the back
          const a = (i / (n - 1) - .5) * 2.5, len = L - Math.abs(a) * (f ? .12 : .05) + ((i * 37) % 5) * .012;
          lock(Math.sin(a) * .215, -.06, Math.cos(a) * .19 + .02, len, .055, 0, Math.sin(a) * .1, i % 3 === 0 ? hairHi : hair);
        }
        for (const s of [-1, 1]) {                                                                                                    // locks framing the face
          lock(s * .225, .07, -.09, f ? .36 : .22, .055, .05, s * .06);
          lock(s * .255, .0, .03, f ? .3 : .18, .05, 0, s * .05, hairHi);
        }
      }
      addExtras(head, torso, look, hair, hue);          // hairstyles, hats, glasses, bags (unchanged)

      // ---- arms: tapered, short sleeve, hand with fingers and thumb
      const arm = s => {
        const a = limb(.27, .05, .042, .004, skin); a.position.set(s * (.17 * w + .055), .235, 0);
        a.add(mk(sphG(.062, 14, 12), shirt, 0, -.01, 0));
        a.add(mk(openG(.12, .066, .06), shirt));
        a.add(mk(sphG(.043, 12, 10), skin, 0, -.27, 0));
        const fo = limb(.26, .042, .031, .004, skin); fo.position.y = -.27; a.add(fo);
        const hd = new THREE.Group(); hd.position.y = -.26; fo.add(hd);
        hd.add(mk(sphG(.04, 12, 10), skin, 0, -.04, 0, 1.05, 1.1, .6));
        for (let i = 0; i < 4; i++) {
          const fx = (i - 1.5) * .02, fl = i === 1 || i === 2 ? .04 : .033;
          const fg = mk(capG(.011, fl), skin, fx, -.095 - fl / 2, 0); fg.rotation.x = -.15; hd.add(fg);
        }
        const th = mk(capG(.013, .03), skin, -s * .044, -.06, -.008); th.rotation.z = -s * .6; hd.add(th);
        torso.add(a); return [a, fo, hd];
      };
      [P.lArm, P.lFore, P.lHand] = arm(-1);[P.rArm, P.rFore, P.rHand] = arm(1);

      // ---- legs: long denim trousers, rounded sneakers (same joint lengths as before)
      const leg = s => {
        const l = limb(.42, .082, .058, .006, skin); l.position.set(s * .105 * w, .82, 0);
        l.add(mk(openG(.42, .098, .078), pants));
        const sh = limb(.4, .058, .04, .007, skin); sh.position.y = -.42; l.add(sh);
        sh.add(mk(openG(.3, .076, .066), pants));
        sh.add(mk(sphG(.07, 16, 12), shoe, 0, -.365, -.04, .95, .65, 1.8));
        sh.add(mk(geoOf('soleC', () => new THREE.BoxGeometry(.13, .03, .27)), sole, 0, -.4, -.04));
        g.add(l); return [l, sh];
      };
      [P.lLeg, P.lShin] = leg(-1);[P.rLeg, P.rShin] = leg(1);

      // ---- bow (unchanged)
      const bow = new THREE.Group(); bow.visible = false;
      const arc = mk(geoOf('bowArc', () => new THREE.TorusGeometry(.35, .012, 6, 18, Math.PI)), MT(0x6b4a2a, .6)); arc.rotation.set(0, Math.PI / 2, -Math.PI / 2);
      const str = mk(geoOf('bowStr', () => new THREE.CylinderGeometry(.003, .003, .7, 4)), MT(0xeeeeee, .5));
      bow.add(arc, str); bow.rotation.x = -Math.PI / 2; bow.position.set(0, -.06, 0); P.lHand.add(bow); g.userData.bow = bow;

      const lb = label(name); lb.position.y = 2.2; g.add(lb); g.userData.pr = P; g.userData.lb = lb; scene.add(g);
      g.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true });
      return g;
    }
    function makeAvatarOld(name, hue) {
      const g = new THREE.Group(), col = new THREE.Color(`hsl(${hue},60%,50%)`);
      const b = new THREE.Mesh(new THREE.CylinderGeometry(.28, .34, 1.1, 16), new THREE.MeshStandardMaterial({ color: col })); b.position.y = .65;
      const h = new THREE.Mesh(new THREE.SphereGeometry(.22, 16, 12), new THREE.MeshStandardMaterial({ color: 0xf0d9c0 })); h.position.y = 1.5;
      const n = new THREE.Mesh(new THREE.BoxGeometry(.1, .1, .14), new THREE.MeshStandardMaterial({ color: 0x222222 })); n.position.set(0, 1.5, -.22);
      g.add(b, h, n, label(name)); scene.add(g); return g
    }
    const hueOf = s => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360; return h };

    const rec = { g: makeAvatar('Mira', 50, 'f', 11, { sk: 0, hr: 6, hu: 50 }), k: 0, ph: 0, tp: 0, em: null, wt: 0, greeted: false, hip: 1, raise: 0 };
    rec.g.position.set(MX, 0, MZ + .55); rec.g.rotation.y = RFACE + Math.PI;
    rec.g.position.set(MX, 0, MZ); rec.g.rotation.y = RFACE + Math.PI;
    const recDist = () => Math.hypot(px - MX, pz - MZ);

    const talkBtn = document.createElement('button'); talkBtn.type = 'button'; talkBtn.textContent = touch ? '💬 Talk to Mira' : '💬 Talk to Mira (T)';
    talkBtn.style.cssText = 'position:fixed;left:50%;bottom:90px;transform:translateX(-50%);z-index:22;display:none;padding:10px 16px;border:0;border-radius:20px;background:#8b78e6;color:#fff;font:600 14px system-ui,sans-serif;cursor:pointer';
    const talk = document.createElement('div');
    talk.style.cssText = 'position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:40;display:none;width:min(440px,94vw);padding:14px;border-radius:16px;background:rgba(20,20,24,.94);color:#fff;font:14px/1.4 system-ui,sans-serif';
    talk.innerHTML = '<div style="display:flex;justify-content:space-between;font-weight:700;margin-bottom:8px"><span>Mira · Receptionist</span><button id="tkx" style="background:none;border:0;color:#fff;font-size:18px;cursor:pointer">✕</button></div><div id="tklog" style="max-height:170px;overflow:auto;display:flex;flex-direction:column;gap:6px;margin-bottom:8px"></div><div id="tkq" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px"></div><input id="tkin" maxlength="160" placeholder="Ask Mira anything…" style="width:100%;box-sizing:border-box;padding:10px;border-radius:10px;border:0;background:#2a2830;color:#fff;font:14px system-ui,sans-serif">';
    document.body.append(talkBtn, talk);
    const tkLog = $('tklog'), tkIn = $('tkin'); let talkOpen = false, talkHist = [], miraAI = true;

    function say(me, text) {
      const d = document.createElement('div'); d.textContent = text;
      d.style.cssText = 'padding:7px 10px;border-radius:10px;max-width:85%;' + (me ? 'align-self:flex-end;background:#8b78e6' : 'background:#33303a');
      tkLog.append(d); tkLog.scrollTop = tkLog.scrollHeight; return d;
    }
    function miraLocal(q) {
      const s = q.toLowerCase();
      if (/upload|add (a )?paint|submit|my art/.test(s)) return 'Press "Add painting", pick one or many images, and add a title and artist. Each room holds 24 paintings, then a new floor opens.';
      if (/elev|floor|upstairs|room/.test(s)) return 'The elevator is the tower to my right. Step inside and press a floor button, or press L and I\'ll point you there.';
      if (/control|move|walk|wasd|how do i/.test(s)) return 'WASD or arrows to move, mouse to look. F waves, G dances, Enter chats, M toggles your mic, X removes your own painting. On phones, left thumb moves and right thumb looks.';
      if (/voice|mic|speak/.test(s)) return 'Press M to open your mic. You\'ll hear people in your room, louder when they\'re close.';
      if (/tv|screen|slide/.test(s)) return 'The TVs on the side walls play a slideshow of everything visitors have uploaded.';
      if (/teleport|visitor|friend|who.*here/.test(s)) return 'Open the Visitors list and tap Teleport to jump next to someone in your room.';
      if (/who|made|creat|kyle/.test(s)) return 'The Gallery was created by Kyle Calites.';
      if (/^(hi|hello|hey)/.test(s)) return 'Hello! Ask me about uploading art, the elevator, the controls, or voice chat.';
      if (/thank/.test(s)) return 'Any time! Enjoy the art.';
      return 'I\'m not sure about that one. Try asking about uploading, the elevator, controls, voice chat or the TVs.';
    }
    async function miraReply(q) {
      if (miraAI) try {
        const r = await fetch(API + '/api/receptionist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: q, history: talkHist }), signal: AbortSignal.timeout(7000) });
        if (r.status === 501) miraAI = false; else if (r.ok) { const j = await r.json(); if (j.reply) return j.reply }
      } catch (e) { }
      return miraLocal(q);
    }
    async function ask(q) {
      q = q.trim(); if (!q) return; say(true, q); const d = say(false, '…');
      const a = await miraReply(q); d.textContent = a; talkHist = [...talkHist, { role: 'user', content: q }, { role: 'assistant', content: a }].slice(-6);
      tkLog.scrollTop = tkLog.scrollHeight; rec.wt = performance.now();
    }
    ['How do I upload art?', 'Where is the elevator?', 'Controls', 'Voice chat'].forEach(t => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = t;
      b.style.cssText = 'padding:6px 10px;border:0;border-radius:14px;background:#3a3740;color:#fff;font:12px system-ui,sans-serif;cursor:pointer'; b.onclick = () => ask(t); $('tkq').append(b);
    });
    function openTalk() {
      if (talkOpen) return; talkOpen = true; document.exitPointerLock?.(); for (const k in keys) keys[k] = false;
      talk.style.display = 'block'; talkBtn.style.display = 'none'; rec.wt = performance.now();
      if (!tkLog.children.length) say(false, 'Welcome to The Gallery! I\'m Mira. What can I help you with?');
      setTimeout(() => tkIn.focus(), 50);
    }
    function closeTalk() { talkOpen = false; talk.style.display = 'none'; tkIn.blur(); if (!touch) cvs.requestPointerLock?.() }
    talkBtn.onclick = openTalk; $('tkx').onclick = closeTalk;
    tkIn.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') { const v = tkIn.value; tkIn.value = ''; ask(v) } else if (e.key === 'Escape') closeTalk() });
    tkIn.addEventListener('keyup', e => e.stopPropagation());
    addEventListener('keydown', e => { if (started && e.code === 'KeyT' && !talkOpen && document.activeElement.tagName !== 'INPUT' && recDist() < 3.4) { e.preventDefault(); openTalk() } });

    function receptionTick(dt) {
      const d = recDist(), near = started && d < 7, g = rec.g;
      const a = Math.atan2(-(px - MX), -(pz - MZ)), B = RFACE + Math.PI, off = Math.atan2(Math.sin(a - B), Math.cos(a - B));
      const want = B + (near ? Math.max(-1.1, Math.min(1.1, off)) : 0);
      g.rotation.y += Math.atan2(Math.sin(want - g.rotation.y), Math.cos(want - g.rotation.y)) * Math.min(1, dt * 4);
      if (near && d < 6 && !rec.greeted) { rec.greeted = true; rec.wt = performance.now() }
      if (d > 9) rec.greeted = false;
      rec.raise = near && d < 6 ? 1 : 0;
      animate(rec, dt);
      talkBtn.style.display = started && !talkOpen && d < 3.4 ? 'block' : 'none';
      if (talkOpen && d > 6) closeTalk();
    }


    function applyPeers(ch) {
      lastPeers = ch.peers;

      for (const p of ch.peers) {
        if (!p.isMe) {
          checkPeerElevator(p.peer, p.presence || {});
        }
      }

      renderPeers();
    }
    // ---- visitor list

    const visitorPanel = $('visitor-panel');
    const visitorList = $('visitor-list');

    $('visitors-toggle').onclick = () => {
      const opening = visitorPanel.style.display !== 'block';

      visitorPanel.style.display = opening ? 'block' : 'none';
      $('visitors-toggle').setAttribute('aria-expanded', String(opening));
    };

    $('visitor-close').onclick = () => {
      visitorPanel.style.display = 'none';
      $('visitors-toggle').setAttribute('aria-expanded', 'false');
    };

    function renderVisitorList() {
      if (!visitorList) return;

      visitorList.innerHTML = '';

      const visitors = lastPeers.filter(p =>
        !p.sameTab &&
        p.presence &&
        p.presence.x != null &&
        p.presence.z != null &&
        Number(p.presence.r || 0) === myRoom
      );

      if (!visitors.length) {
        const empty = document.createElement('div');
        empty.textContent = 'No other visitors in this room yet.';
        empty.style.cssText = 'font-size:13px;opacity:.65;padding:12px 2px;';
        visitorList.appendChild(empty);
        return;
      }

      visitors.forEach(p => {
        const name = String(p.presence.name || 'Guest').slice(0, 18);

        const row = document.createElement('div');
        row.style.cssText = `
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:12px;
      padding:11px 0;
      border-bottom:1px solid rgba(255,255,255,.09);
    `;

        const info = document.createElement('div');
        info.style.cssText = 'min-width:0;display:flex;flex-direction:column;gap:4px;';

        const playerName = document.createElement('strong');
        playerName.textContent = name;
        playerName.style.cssText = 'font-size:14px;overflow:hidden;text-overflow:ellipsis;';

        const status = document.createElement('span');
        status.textContent = 'In this room';
        status.style.cssText = 'font-size:11px;opacity:.55;';

        info.append(playerName, status);

        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = 'Teleport';
        button.style.cssText = `
      flex-shrink:0;
      border:0;
      border-radius:9px;
      padding:9px 13px;
      background:#8b78e6;
      color:white;
      font-size:12px;
      font-weight:600;
      cursor:pointer;
    `;

        button.onclick = () => {
          teleportToPlayer(p);
          visitorPanel.style.display = 'none';
          $('visitors-toggle').setAttribute('aria-expanded', 'false');
        };

        row.append(info, button);
        visitorList.appendChild(row);
      });
    }
    function renderPeers() {
      const seen = new Set(); let n = 0, tot = 0;
      for (const p of lastPeers) {
        if (p.sameTab) continue; const d = p.presence; if (d.x == null) continue; tot++;

        if ((d.r || 0) !== myRoom) continue; n++; seen.add(p.peer);
        let a = avatars.get(p.peer); const nm = String(d.name || 'Guest').slice(0, 18);
        const gn = ['m', 'f'].includes(d.g) ? d.g : 'n'; const sig = [gn, d.sk, d.hr, d.hu, d.hs, d.ht, d.gl, d.bg].join(); if (!a || a.name !== nm || a.sig !== sig) { if (a) scene.remove(a.g); const hu = (d.hu != null && Number.isFinite(+d.hu)) ? ((+d.hu % 360) + 360) % 360 : hueOf(p.peer); a = { g: makeAvatar(nm, hu, gn, seedOf(p.peer), d), name: nm, gn, sig, ph: 0, k: 0, wv: d.w || 0, wt: 0, tx: d.x, tz: d.z, try: d.ry || 0, buf: [] }; a.g.position.set(d.x, 0, d.z); avatars.set(p.peer, a) }
        a.tx = d.x; a.tz = d.z; a.try = d.ry || 0;
        const ls = a.buf[a.buf.length - 1];
        if (!ls || ls.x !== d.x || ls.z !== d.z || ls.y !== (d.y || 0) || ls.r !== a.try) {
          if (ls && Math.hypot(d.x - ls.x, d.z - ls.z) > 4) a.buf.length = 0;   // teleport or elevator: jump, don't slide
          a.buf.push({ t: performance.now(), x: d.x, z: d.z, y: d.y || 0, r: a.try }); if (a.buf.length > 8) a.buf.shift();
        }
        a.mic = !!d.mic; setSpeaking(a, !!a.spk && a.mic);
        const headPitch = Number(d.pit ?? d.rp ?? 0);
        a.tp = THREE.MathUtils.clamp(headPitch * 1.5, -1.2, 1.2); a.em = ['dance', 'sit', 'clap', 'laugh', 'point', 'thumb', 'punch', 'bow', 'draw'].includes(d.em) ? d.em : null; if ((d.w || 0) !== a.wv) { a.wv = d.w || 0; a.wt = performance.now() }
      }
      for (const [k, a] of avatars) if (!seen.has(k)) { scene.remove(a.g); avatars.delete(k) }
      syncRtc();
      $('count').innerHTML = tot
        ? (LOW
          ? `${n + 1} <span style="color: black;">here</span>`
          : `${n + 1} <span style="color: black;">here</span> · ${tot + 1} online`)
        : '<span style="color: black;">You are alone</span>';
      $('count').style.color = 'black';
      renderVisitorList();
    }
    function smoothAvatars(dt) {
      const rt = performance.now() - 140;
      for (const a of avatars.values()) {
        const b = a.buf, g = a.g;
        if (b && b.length) {
          let i = b.length - 1; while (i > 0 && b[i].t > rt) i--;
          const p = b[i], q = b[i + 1];
          if (q && q.t > p.t) {
            const f = Math.max(0, Math.min(1, (rt - p.t) / (q.t - p.t)));
            g.position.x = p.x + (q.x - p.x) * f; g.position.z = p.z + (q.z - p.z) * f; a.by = (p.y || 0) + ((q.y || 0) - (p.y || 0)) * f;
            let dr = q.r - p.r; dr = Math.atan2(Math.sin(dr), Math.cos(dr)); g.rotation.y = p.r + dr * f;
          } else { g.position.x = p.x; g.position.z = p.z; a.by = p.y || 0; g.rotation.y = p.r }
        }
        {
          const ux = Math.abs(g.position.x) - SX0, sgn = g.position.x < 0 ? -1 : 1;
          a.by = stairY(g.position.x, g.position.z);
        }
        if (a.kvx || a.kvz || a.ox || a.oz) {   // predicted knockback offset, fades out as the real position arrives
          a.ox += a.kvx * dt; a.oz += a.kvz * dt;
          const kd = Math.exp(-dt * 14); a.kvx *= kd; a.kvz *= kd;
          const od = Math.exp(-dt * 4); a.ox *= od; a.oz *= od;
          if (Math.abs(a.ox) + Math.abs(a.oz) + Math.abs(a.kvx) + Math.abs(a.kvz) < .01) a.ox = a.oz = a.kvx = a.kvz = 0;
          g.position.x += a.ox; g.position.z += a.oz;
        }
        animate(a, dt);
      }
    }

    function animate(a, dt) {
      const g = a.g, P = g.userData.pr;
      if (!P) return;

      const sp = a.lx == null ? 0 : Math.hypot(g.position.x - a.lx, g.position.z - a.lz) / Math.max(dt, .001);
      a.lx = g.position.x;
      a.lz = g.position.z;

      a.k += (Math.min(1, sp / 2.2) - a.k) * Math.min(1, dt * 8);
      a.ph += sp * dt * 3;

      const s = Math.sin(a.ph), k = a.k, t = performance.now() / 1000, idle = 1 - k;

      // Smooth head movement following camera look direction
      if (P.head) {
        const targetPitch = a.tp || 0;

        P.head.rotation.x += (targetPitch - P.head.rotation.x) * Math.min(1, dt * 12);
      }

      P.lLeg.rotation.x = s * .7 * k;
      P.rLeg.rotation.x = -s * .7 * k;

      P.lShin.rotation.x = -Math.max(0, Math.sin(a.ph + 1.3)) * .9 * k;
      P.rShin.rotation.x = -Math.max(0, Math.sin(a.ph + 1.3 + Math.PI)) * .9 * k;

      P.lArm.rotation.x = -s * .6 * k + Math.sin(t * 1.5) * .03 * idle;
      P.rArm.rotation.x = s * .6 * k - Math.sin(t * 1.5) * .03 * idle;

      P.lFore.rotation.x = .2 + .35 * k * Math.max(0, s);
      P.rFore.rotation.x = .2 + .35 * k * Math.max(0, -s);
      P.lFore.rotation.z = 0;
      P.rHand.rotation.set(0, 0, 0);

      P.body.position.y = Math.abs(Math.cos(a.ph)) * .035 * k + Math.sin(t * 1.8) * .006 * idle;
      P.body.position.z = 0;
      P.torso.rotation.y = s * .12 * k;

      const D = a.dw = (a.dw || 0) + ((a.em === 'dance' ? 1 : 0) - (a.dw || 0)) * Math.min(1, dt * 6);
      const S = a.sw = (a.sw || 0) + ((a.em === 'sit' ? 1 : 0) - (a.sw || 0)) * Math.min(1, dt * 6);
      const u1 = 1 - D, u2 = 1 - S;

      if (D > .01) {
        const b = t * 8;

        P.lArm.rotation.z = -(2.3 + Math.sin(b) * .35) * D;
        P.rArm.rotation.z = (2.3 - Math.sin(b) * .35) * D;

        for (const o of [P.lArm, P.rArm, P.lFore, P.rFore]) o.rotation.x *= u1;

        P.lLeg.rotation.x = P.lLeg.rotation.x * u1 + Math.sin(b) * .3 * D;
        P.rLeg.rotation.x = P.rLeg.rotation.x * u1 - Math.sin(b) * .3 * D;

        P.lLeg.rotation.z = -.12 * D;
        P.rLeg.rotation.z = .12 * D;

        P.body.position.y += Math.abs(Math.sin(b)) * .07 * D;
        P.torso.rotation.y += Math.sin(b) * .35 * D;
      } else {
        P.lArm.rotation.z = 0;
        P.rArm.rotation.z = 0;
        P.lLeg.rotation.z = 0;
        P.rLeg.rotation.z = 0;
      }

      if (S > .01) {
        P.lLeg.rotation.x = P.lLeg.rotation.x * u2 + 1.45 * S;
        P.rLeg.rotation.x = P.rLeg.rotation.x * u2 + 1.45 * S;

        P.lShin.rotation.x = P.lShin.rotation.x * u2 - 1.45 * S;
        P.rShin.rotation.x = P.rShin.rotation.x * u2 - 1.45 * S;

        g.position.y = (a.by || 0) - .32 * S;
      } else {
        g.position.y = a.by || 0;
      }


      const EW = a.ew = a.ew || {};
      for (const n of ['clap', 'laugh', 'point', 'thumb', 'punch', 'bow', 'draw']) EW[n] = (EW[n] || 0) + ((a.em === n ? 1 : 0) - (EW[n] || 0)) * Math.min(1, dt * 8);
      const mixR = (o, ax, v, w) => { if (w > .01) o.rotation[ax] = o.rotation[ax] * (1 - w) + v * w };
      if (EW.clap > .01) { const w = EW.clap, b = Math.sin(t * 16) * .5 + .5; mixR(P.lArm, 'x', 1.25, w); mixR(P.rArm, 'x', 1.25, w); mixR(P.lFore, 'x', 1.1, w); mixR(P.rFore, 'x', 1.1, w); mixR(P.lArm, 'z', .12 + b * .28, w); mixR(P.rArm, 'z', -(.12 + b * .28), w) }
      if (EW.laugh > .01) { const w = EW.laugh, sh = Math.sin(t * 24); mixR(P.torso, 'x', .12 + sh * .05, w); mixR(P.lArm, 'x', .6, w); mixR(P.rArm, 'x', .6, w); mixR(P.lFore, 'x', 1.3, w); mixR(P.rFore, 'x', 1.3, w); P.body.position.y += Math.abs(sh) * .035 * w; P.head.rotation.x += .3 * w }
      if (EW.point > .01) { const w = EW.point; mixR(P.rArm, 'x', 1.55, w); mixR(P.rFore, 'x', .1, w) }
      if (EW.thumb > .01) { const w = EW.thumb; mixR(P.rArm, 'x', .9, w); mixR(P.rFore, 'x', 1.7, w); mixR(P.rArm, 'z', .15, w); P.rHand.rotation.z = Math.sin(t * 10) * .15 * w }
      if (a.em === 'punch' && a.pe !== 'punch') a.pt = performance.now();
      a.pe = a.em;
      if (EW.punch > .01) {
        // wind-up (0 to .32), snap forward (.32 to .5), recover (.5 to 1)
        const w = EW.punch, e = Math.min(1, (performance.now() - (a.pt || 0)) / 480);
        const wind = e < .32 ? e / .32 : 1 - Math.min(1, (e - .32) / .08);
        const hit = e < .32 ? 0 : e < .5 ? (e - .32) / .18 : 1 - (e - .5) / .5;
        mixR(P.rArm, 'x', -.7 * wind + 1.6 * hit, w);
        mixR(P.rFore, 'x', 2 * wind + .1 * hit, w);
        mixR(P.lArm, 'x', 1, w); mixR(P.lFore, 'x', 1.7, w);          // guard hand
        mixR(P.torso, 'y', .5 * wind - .6 * hit, w);                  // body twist
        P.body.position.z = -.2 * hit * w;                            // lunge forward
        P.lLeg.rotation.x += -.35 * hit * w; P.rLeg.rotation.x += .35 * hit * w;
      }
      if (EW.draw > .01) {
        // bow stance: left arm straight out holding the bow, right hand pulled back to the cheek
        const w = EW.draw;
        const pa = (a.tp || 0) / 1.5;
        mixR(P.lArm, 'x', 1.5 + pa, w); mixR(P.lFore, 'x', .05, w);
        mixR(P.rArm, 'x', 1.35 + pa, w); mixR(P.rArm, 'z', .3, w); mixR(P.rFore, 'x', 2.3 + Math.sin(t * 40) * .03, w);
        mixR(P.torso, 'y', -.5, w);
      }
      P.head.rotation.y = .5 * (EW.draw || 0) + Math.sin(t * .7 + (g.id % 7)) * .07 * idle;
      P.head.rotation.z = Math.sin(t * .5 + (g.id % 5)) * .03 * idle;
      if (P.eyes) {                                            // occasional blink
        if (a.nb == null) a.nb = t + 1 + (g.id % 4);
        if (t > a.nb) { a.bs = t; a.nb = t + 2.5 + Math.random() * 3.5 }
        const be = t - (a.bs || -9), lid = be < .18 ? Math.max(.12, Math.abs(be - .09) / .09) : 1;
        for (const e of P.eyes) e.scale.y = 1.3 * lid;
      }
      const br = Math.sin(t * 1.7) * idle; P.torso.scale.set(1 + br * .006, 1 + br * .012, 1 + br * .006);   // breathing
      if (a.hip) {                                             // guide pose: left hand on hip, right arm raised when greeting
        const hw = a.hw = (a.hw || 0) + (1 - (a.hw || 0)) * Math.min(1, dt * 4);
        const rw = a.rw = (a.rw || 0) + ((a.raise || 0) - (a.rw || 0)) * Math.min(1, dt * 4);
        mixR(P.lArm, 'z', -.55, hw); mixR(P.lFore, 'z', 1.3, hw); mixR(P.lFore, 'x', .1, hw);
        if (rw > .01) { mixR(P.rArm, 'z', 1.45 + Math.sin(t * 3) * .06, rw); mixR(P.rArm, 'x', .25, rw); mixR(P.rFore, 'z', 1.45, rw); mixR(P.rFore, 'x', 0, rw) }
      }
      if (EW.bow > .01) { const w = EW.bow; mixR(P.lArm, 'x', 1.55, w); mixR(P.lFore, 'x', .05, w); mixR(P.rArm, 'x', 1.4, w); mixR(P.rArm, 'z', .35, w); mixR(P.rFore, 'x', 1.9, w) }
      if (g.userData.bow) g.userData.bow.visible = ((EW.bow || 0) + (EW.draw || 0)) > .3;
      // WAVE: upper arm out to the side, elbow bent so the forearm points up, forearm swings side to side
      const el = a.wt ? performance.now() - a.wt : 9999;
      const r = Math.max(0, Math.min(1, el / 250, (2200 - el) / 250));

      if (r > 0) {
        const wob = Math.sin(t * 11);
        P.rArm.rotation.z = 1.5 * r;                                  // upper arm out to the side
        P.rArm.rotation.x = P.rArm.rotation.x * (1 - r) - 0.3 * r;    // tilt slightly forward so the hand is visible from the front
        P.rFore.rotation.x *= 1 - r;                                  // no idle elbow bend while waving
        P.rFore.rotation.z = (1.64 + wob * 0.4) * r;                  // elbow bent so the forearm points up, then swings side to side
        P.rHand.rotation.z = Math.sin(t * 11 - 0.9) * 0.25 * r;       // hand follows a beat behind
        P.rHand.rotation.y = Math.PI * r;                             // twist the hand so the thumb ends up on the body side
      }

    }

    let lastSent = 0, lastKey = '', evSeq = 0, evTo = 0; const evSeen = new Map();
    function setPresence(force) {
      if (!room || !started) return; const now = performance.now(); if (!force && now - lastSent < 70) return;
      const k = [px.toFixed(2), pz.toFixed(2), sy.toFixed(2), yaw.toFixed(2), pitch.toFixed(2), myRoom, myWave, emote, micOn, evSeq].join(); if (!force && k === lastKey) return; lastKey = k; lastSent = now;
      room.presence({ x: +px.toFixed(2), z: +pz.toFixed(2), y: +sy.toFixed(2), ry: +yaw.toFixed(2), pit: +pitch.toFixed(2), rp: +pitch.toFixed(2), r: myRoom, g: myGen, sk: myLook.sk, hr: myLook.hr, hu: myLook.hu, w: myWave, em: emote, mic: micOn, eq: evSeq, et: evTo, name: myName, hs: myLook.hs, ht: myLook.ht, gl: myLook.gl, bg: myLook.bg, st: myStudio, ss: mySeat }).catch(() => { });
    }

    // ---- captions + removal
    const ray = new THREE.Raycaster(); let looking = null;
    const cvMeshes = canvases.map(c => c.cv); let lookT = 0;
    function look() {
      const n = performance.now(); if (n - lookT < (LOW ? 200 : 66)) return; lookT = n;
      ray.setFromCamera({ x: 0, y: 0 }, cam); ray.far = 7; const hit = ray.intersectObjects(cvMeshes)[0];
      const p = hit ? canvases[hit.object.userData.slot].painting : null; if (p === looking) return; looking = p; const cp = $('cap');
      if (!p) { cp.style.display = 'none'; return }
      cp.innerHTML = ''; const b = document.createElement('b'); b.textContent = p.title || 'Untitled'; const s = document.createElement('small'); s.textContent = p.artist ? 'by ' + p.artist : ''; cp.append(b, s);
      if (p.owner === myId) { const r = document.createElement('small'); r.textContent = 'Press X to remove your painting'; cp.append(r) } cp.style.display = 'block';
    }
    async function removeMine() {
      const p = looking; if (!p || p.owner !== myId) return;
      try { if (local) paintings = paintings.filter(q => q.id !== p.id), layout(); else { await db.collection('paintings').doc(p.id).delete(); if (assets && p.assetId) await assets.delete(p.assetId).catch(() => { }) } } catch (e) { console.error(e) }
      looking = null;
    }

    // ---- chat
    function addChat(name, text) {
      const d = document.createElement('div');
      const b = document.createElement('b');
      const lg = $('log');

      b.textContent = name + ': ';
      d.append(b, document.createTextNode(text));

      lg.append(d);

      while (lg.children.length > 6) {
        lg.firstChild.remove();
      }

      setTimeout(() => {
        d.style.opacity = '.4';
      }, 12000);
    }
    $('cin').addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') { const t = $('cin').value.trim(); $('cin').value = ''; if (t) { addChat(myName, t); if (room) room.emit('chat', { name: myName, text: t.slice(0, 200) }).catch(() => { }) } $('cin').blur(); if (!touch) cvs.requestPointerLock?.() } });
    $('cin').addEventListener('keyup', e => e.stopPropagation());
    // ---- upload
    $('add').onclick = () => { if (document.pointerLockElement) document.exitPointerLock(); for (const k in keys) keys[k] = false; $('panel').style.display = 'flex'; $('msg').textContent = '' };
    $('cancel').onclick = () => $('panel').style.display = 'none';
    async function shrink(file) {
      const bmp = await createImageBitmap(file); const s = Math.min(1, 1600 / Math.max(bmp.width, bmp.height)); const c = document.createElement('canvas'); c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s); c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
      const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', .88)); return { blob, w: c.width, h: c.height }
    }
    $('file').multiple = true;
    $('file').accept = 'image/*';
    let prevUrls = [];
    function renderFilePreview() {
      prevUrls.forEach(u => URL.revokeObjectURL(u)); prevUrls = [];
      const box = $('fprev'); box.innerHTML = '';
      const files = Array.from($('file').files);
      const area = document.querySelector('.upload-area');
      if (area) {
        area.querySelector('strong').textContent = files.length ? files.length + ' image' + (files.length > 1 ? 's' : '') + ' selected ✓' : 'Choose an image';
        area.style.borderColor = files.length ? '#6dff8c' : '';
      }
      files.forEach((f, i) => {
        const u = URL.createObjectURL(f); prevUrls.push(u);
        const w = document.createElement('div');
        w.style.cssText = 'position:relative;width:72px;height:72px;border-radius:10px;overflow:hidden;border:2px solid #6dff8c';
        const im = document.createElement('img'); im.src = u; im.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block';
        const ck = document.createElement('span'); ck.textContent = '✓';
        ck.style.cssText = 'position:absolute;right:3px;top:3px;width:18px;height:18px;border-radius:50%;background:#6dff8c;color:#111;font:700 12px/18px system-ui;text-align:center';
        const nm = document.createElement('small'); nm.textContent = i + 1;
        nm.style.cssText = 'position:absolute;left:4px;bottom:2px;color:#fff;font:700 11px system-ui;text-shadow:0 1px 3px #000';
        w.append(im, ck, nm); box.append(w);
      });
    }
    $('file').addEventListener('change', renderFilePreview);

    $('save').onclick = async () => {
      const files = Array.from($('file').files);
      const msg = $('msg');

      if (!files.length) {
        msg.textContent = 'Choose at least one image.';
        return;
      }

      const title = $('ttl').value.trim();
      const artist = $('art').value.trim() || myName;

      let uploaded = 0;
      let failed = 0;

      $('save').disabled = true;

      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];

          if (!file.type.startsWith('image/')) {
            failed++;
            continue;
          }

          msg.textContent = `Uploading ${i + 1} of ${files.length}: ${file.name}`;

          try {
            const { blob, w, h } = await shrink(file);

            const id = 'p' + Date.now().toString(36) +
              Math.random().toString(36).slice(2, 7);

            const rec = {
              title: title || file.name.replace(/\.[^/.]+$/, ''),
              artist,
              w,
              h,
              createdAt: Date.now()
            };

            if (assets && db) {
              const up = await assets.upload(blob);
              rec.assetId = up.id;
              rec.url = up.url;

              await db.collection('paintings').doc(id).set(rec);
            } else {
              rec.url = URL.createObjectURL(blob);
              rec.id = id;
              paintings.push(rec);
            }

            uploaded++;
            stat('up');
          } catch (err) {
            console.error('Failed to upload:', file.name, err);
            failed++;
          }
        }

        await loadPaintings();

        if (uploaded > 0 && failed === 0) {
          msg.textContent = `Successfully uploaded ${uploaded} paintings!`;
          $('panel').style.display = 'none';
        } else if (uploaded > 0) {
          msg.textContent = `${uploaded} uploaded, ${failed} failed.`;
        } else {
          msg.textContent = 'No images were uploaded successfully.';
        }

        if (uploaded > 0) {
          $('file').value = '';
          $('ttl').value = '';
          renderFilePreview();
        }

      } finally {
        $('save').disabled = false;
      }
    };


    // ---- network (own Node server)
    const API = (import.meta.env.VITE_API || '').replace(/\/$/, '');
    let csrfToken = '';
    const csrf = () => csrfToken || (document.cookie.match(/csrftoken=([^;]+)/) || [])[1] || '';

    const api = async (path, o = {}) => {
      const response = await fetch(API + path, {
        credentials: 'include',
        ...o,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrf(),
          ...(o.headers || {})
        }
      });

      // Read fresh CSRF tokens returned by Django.
      if (response.headers.get('content-type')?.includes('application/json')) {
        try {
          const data = await response.clone().json();
          if (data.csrfToken) csrfToken = data.csrfToken;
        } catch (e) { }
      }

      return response;
    };
    const assetUrl = u => {
      if (!u) return u;
      try {
        const x = new URL(u, location.href);
        if (x.hostname !== location.hostname && /^(localhost|127\.|10\.|192\.168\.)/.test(x.hostname)) return API + x.pathname + x.search;
      } catch (e) { }
      return u.startsWith('http') ? u : API + u;
    };
    const wsUrl = import.meta.env.VITE_WS || ((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws');
    let ws = null, wsId = null, lastState = {}, peersCb = null, snapCb = null; const handlers = { chat: [], react: [], rtc: [], act: [] };
    const wsend = o => { if (ws && ws.readyState === 1) ws.send(JSON.stringify(o)) };
    const roomS = {
      presence(p) { lastState = { ...lastState, ...p }; wsend({ t: 'state', s: p }); return Promise.resolve() },
      onPeers(cb) { peersCb = cb },
      on(t, cb) { handlers[t].push(cb) },
      emit(t, data) { wsend({ t, data }); return Promise.resolve() }
    };
    async function loadPaintings() {
      try {
        const r = await fetch(API + '/api/paintings', { cache: 'no-store' });
        if (!r.ok) throw new Error(`Failed to load paintings (${r.status})`);

        const list = await r.json();

        if (snapCb) {
          snapCb({
            docs: list.map(p => {
              const item = { ...p, url: assetUrl(p.url) };
              return {
                id: item.id,
                data: () => item
              };
            })
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
    const dbS = {
      collection: () => ({
        onSnapshot(cb) { snapCb = cb; loadPaintings() }, doc: id => ({
          set: async rec => { const r = await api('/api/paintings/' + id, { method: 'PUT', body: JSON.stringify(rec) }); if (!r.ok) throw new Error('Save failed (' + r.status + ')') },
          delete: async () => { await api('/api/paintings/' + id, { method: 'DELETE' }) }
        })
      })
    };
    const assetsS = {
      upload: async blob => {
        const r = await api('/api/assets', {
          method: 'POST',
          headers: { 'Content-Type': 'image/jpeg' },
          body: blob
        });

        if (!r.ok) {
          throw new Error('Upload failed (' + r.status + ')');
        }

        const data = await r.json(); return data;
      },
      delete: async () => { }
    };
    let hb = null, retry = 0;
    function connect() {
      if (ws && ws.readyState <= 1) return;
      ws = new WebSocket(wsUrl);
      ws.onopen = () => { retry = 0; if (Object.keys(lastState).length) wsend({ t: 'state', s: lastState }); clearInterval(hb); hb = setInterval(() => wsend({ t: 'ping' }), 20000), loadPaintings(); };
      ws.onmessage = e => {
        let m; try { m = JSON.parse(e.data) } catch { return }
        if (m.t === 'hello') wsId = m.id;
        else if (m.t === 'peers' && peersCb) peersCb({ peers: m.peers.map(p => ({ peer: p.id, isMe: p.id === wsId, sameTab: p.id === wsId, presence: p.s || {} })) });
        else if (m.t === 'paintings') loadPaintings();
        else if (handlers[m.t]) handlers[m.t].forEach(h => h({ peer: m.id, isMe: m.id === wsId, sameTab: m.id === wsId, data: m.data }))
      };
      ws.onclose = () => { clearInterval(hb); wsId = null; for (const id of [...pcs.keys()]) closeCall(id); lastPeers = []; renderPeers(); setTimeout(connect, Math.min(10000, 1000 * 2 ** retry++)) };
      ws.onerror = () => ws.close();
    }
    setInterval(() => { if (!document.hidden) loadPaintings() }, 20000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) { connect(); loadPaintings() } }); addEventListener('online', () => { connect(); loadPaintings() });
    const resetToken = new URLSearchParams(location.search).get('reset');
    function authView(m) {
      $('au-title').textContent = { login: 'Log in', reg: 'Create account', forgot: 'Reset password', reset: 'New password' }[m];
      $('au-user').placeholder = m === 'login' ? 'Username or email' : 'Username';
      $('au-user').style.display = m === 'login' || m === 'reg' ? '' : 'none';
      $('au-email').style.display = m === 'reg' || m === 'forgot' ? '' : 'none';
      $('au-disp').style.display = m === 'reg' ? '' : 'none';
      $('au-pass').style.display = m === 'forgot' ? 'none' : '';
      $('au-submit').textContent = { login: 'Log in', reg: 'Register', forgot: 'Send reset link', reset: 'Save password' }[m];
      $('au-submit').dataset.mode = m; $('au-msg').textContent = '';
    }
    $('au-tab-login').onclick = () => authView('login');
    $('au-tab-reg').onclick = () => { $('auth').style.display = 'none' };
    $('rg-login').onclick = () => { $('auth').style.display = 'flex'; authView('login') };
    async function registerFromCard() {
      const msg = $('rg-msg'), v = id => $(id).value.trim(), name = v('nm'), user = v('rg-user');
      const say = (t, bad = true) => { msg.style.color = bad ? '#ffb4b4' : '#e8c27a'; msg.textContent = t; msg.scrollIntoView({ block: 'nearest' }) };
      if (!user || !v('rg-email') || !$('rg-pass').value) { say('Fill in username, email and password.'); return }
      say('Creating account…', false);
      try {
        await api('/api/me').catch(() => { });   // makes sure the CSRF cookie exists
        const r = await api('/api/register', { method: 'POST', body: JSON.stringify({ username: user, email: v('rg-email'), displayName: name || user, password: $('rg-pass').value, look: { g: myGen, sk: myLook.sk, hr: myLook.hr, hu: myLook.hu } }) });
        let j = {}; try { j = await r.json() } catch (e) { }
        if (!r.ok) { say(j.error || ('Server error ' + r.status + (r.status === 403 ? ' (CSRF: your page and Django are on different origins, proxy /api through Vite)' : ''))); return }
        me = j.user; applyMe(); layout();
        if (ws) ws.close();   // reconnects with the new session so your name is correct
        $('go').click();      // now enters the gallery as a logged-in player
      } catch (e) { say('Cannot reach the server. Is Django running, and is /api proxied?') }
    }
    $('au-tab-forgot').onclick = () => authView('forgot');
    $('au-submit').onclick = async () => {
      const mode = $('au-submit').dataset.mode, msg = $('au-msg'), v = id => $(id).value.trim(), pw = $('au-pass').value;
      const req = {
        login: ['/api/login', { username: v('au-user'), password: pw }],
        reg: ['/api/register', { username: v('au-user'), email: v('au-email'), displayName: v('au-disp') || v('au-user'), password: pw, look: { g: myGen, sk: myLook.sk, hr: myLook.hr, hu: myLook.hu } }],
        forgot: ['/api/reset', { email: v('au-email') }],
        reset: ['/api/reset/confirm', { token: resetToken, password: pw }]
      }[mode];
      try {
        const r = await api(req[0], { method: 'POST', body: JSON.stringify(req[1]) });
        if (mode === 'forgot') { msg.textContent = 'If that email exists, a reset link was sent.'; return }
        if (mode === 'reset') {
          if (r.ok) { history.replaceState(null, '', location.pathname); authView('login'); $('au-msg').textContent = 'Password changed. Log in now.' }
          else msg.textContent = (await r.json()).error || 'Failed';
          return;
        }
        const j = await r.json();
        if (!r.ok) { msg.textContent = j.error || 'Failed'; return }
        location.reload();   // reload so the websocket reconnects with your session
      } catch (e) { msg.textContent = 'Network error' }
    };
    $('acct-out').onclick = async () => { try { await api('/api/logout', { method: 'POST' }) } catch (e) { } location.reload() };
    async function uploadAvatar(f, input) {
      if (!f) return;
      const msg = $('pf-msg'); msg.textContent = 'Uploading…';
      try {
        const { blob } = await shrink(f), up = await assetsS.upload(blob);
        const r = await api('/api/profile', { method: 'POST', body: JSON.stringify({ avatarId: up.id }) }), j = await r.json();
        if (!r.ok || !j.user) throw new Error(j.error || r.status);
        me = j.user; $('acct-img').src = assetUrl(me.avatarUrl); fillProfile(); msg.textContent = 'Picture updated ✓';
      } catch (err) { console.error(err); msg.textContent = 'Upload failed. Try a smaller image.' }
      if (input) input.value = '';
    }
    $('acct-file').onchange = e => uploadAvatar(e.target.files[0], e.target);
    let me = null;
    const applyMe = () => {
      if (me) {
        myId = String(me.id); myName = me.displayName; $('nm').value = myName; $('nm').readOnly = true;
        if (me.look && me.look.g) {
          myGen = me.look.g; if (me.look.sk != null) myLook.sk = me.look.sk; if (me.look.hr != null) myLook.hr = me.look.hr; if (me.look.hu != null) myLook.hu = me.look.hu;
          for (const k of ['hs', 'ht', 'gl', 'bg']) if (me.look[k] != null) myLook[k] = me.look[k];
          paintGen(); for (const id of ['skin', 'hair', 'hue']) $(id).innerHTML = '';
          sw('skin', SKc, 'sk'); sw('hair', HRc, 'hr'); sw('hue', HUc, 'hu', true);
        }
        $('acct').style.display = 'flex'; $('acct-name').textContent = me.displayName;
        $('regbox').style.display = 'none'; $('go').textContent = 'Enter gallery';
        if (me.avatarUrl) $('acct-img').src = assetUrl(me.avatarUrl);
      } else {
        $('regbox').style.display = 'flex'; $('go').textContent = 'Create account & enter';
        if (resetToken) { $('auth').style.display = 'flex'; authView('reset') } else authView('login');
      }
    };
    api('/api/me').then(r => r.json()).then(j => { me = j.user }).catch(() => { }).then(() => { applyMe(); layout() });
    // ---- profile sheet
    const profEl = $('profile');
    function fillProfile() {
      if (!me) return;
      $('pf-name').textContent = me.displayName; $('pf-user').textContent = '@' + me.username;
      $('pf-ini').textContent = (me.displayName || '?')[0].toUpperCase();
      const im = $('pf-img'); im.style.display = me.avatarUrl ? 'block' : 'none'; if (me.avatarUrl) im.src = assetUrl(me.avatarUrl);
      $('pf-msg').textContent = '';
    }
    $('prof').onclick = () => { if (!me) return; document.exitPointerLock?.(); for (const k in keys) keys[k] = false; fillProfile(); profEl.style.display = 'flex' };
    $('pf-close').onclick = () => { profEl.style.display = 'none' };
    profEl.addEventListener('pointerdown', e => { if (e.target === profEl) profEl.style.display = 'none' });
    $('pf-looks').onclick = () => { profEl.style.display = 'none'; $('look').click() };
    $('pf-out').onclick = () => $('acct-out').click();
    $('pf-file').onchange = e => uploadAvatar(e.target.files[0], e.target);
    room = roomS; db = dbS; assets = assetsS; local = false;
    db.collection('paintings').onSnapshot(s => { paintings = s.docs.map(x => ({ id: x.id, ...x.data() })); layout(); notifyNew() });
    room.onPeers(applyPeers);

    room.on('chat', m => {
      if (m.sameTab) return;

      const d = m.data || {};
      const name = String(d.name || 'Guest').slice(0, 18);
      const message = String(d.text || '').slice(0, 200);

      addChat(name, message);

      const a = avatars.get(m.peer);

      if (a && message && a.g && a.g.userData.lb) {
        const label = a.g.userData.lb;
        const u = label.userData;

        clearTimeout(a.chatLabelTimer);

        u.chatText = message;
        u.st = -1;
        drawLabel(label, 0);

        a.chatLabelTimer = setTimeout(() => {
          u.chatText = '';
          u.st = -1;
          drawLabel(label, 0);
        }, 4500);
      }
    });

    function onPeerRide(peer, n, from) {
      if (!Number.isInteger(n) || !inCab() || Number(from) !== myRoom) return;
      const d = lastPeers.find(q => q.peer === peer)?.presence;
      if (d && d.x != null && Math.hypot(d.x - EVX, d.z - EVZ) > 4) return;   // sender must be near the elevator
      ride(n, true);
    }
    room.on('react', m => {
      if (m.sameTab) return; const d = m.data || {}; if (d.e === 'floor') { const n = +d.n; if (Number.isInteger(n) && n > 0 && n < 50) { minRooms = Math.max(minRooms, n + 1); layout() } return }
      if (d.e === 'ride') { onPeerRide(m.peer, +d.n, d.from); return }
      const a = avatars.get(m.peer), e = String(d.e || ''); if (a && EMO.includes(e)) spawnFloat(a.g, e);
    });
    connect();

    // ---- open mic (proximity voice chat over WebRTC)
    let micOn = false, micStream = null, actx = null, localAn = null;
    const pcs = new Map();
    const ICE = {
      iceServers: [
        { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
        { urls: ['turn:openrelay.metered.ca:80', 'turn:openrelay.metered.ca:443', 'turn:openrelay.metered.ca:443?transport=tcp', 'turns:openrelay.metered.ca:443?transport=tcp'], username: 'openrelayproject', credential: 'openrelayproject' },
        ...(import.meta.env.VITE_TURN_URL ? [{ urls: import.meta.env.VITE_TURN_URL.split(','), username: import.meta.env.VITE_TURN_USER, credential: import.meta.env.VITE_TURN_PASS }] : [])
      ]
    };
    function ctxA() { if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); return actx }
    function level(an) { if (!an) return 0; const d = an.buf || (an.buf = new Uint8Array(an.frequencyBinCount)); an.getByteFrequencyData(d); let s = 0; for (let i = 0; i < d.length; i++) s += d[i]; return s / d.length / 255 }
    const setP = (p, x, y, z) => { if (p.positionX) { p.positionX.value = x; p.positionY.value = y; p.positionZ.value = z } else p.setPosition(x, y, z) };
    function emojiSprite(e) { const c = document.createElement('canvas'); c.width = c.height = 96; const x = c.getContext('2d'); x.font = '64px serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(e, 48, 52); return new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true })) }
    function setSpeaking(a, on) { a.spk = on; const lb = a.g.userData.lb; if (lb) drawLabel(lb, on ? 2 : a.mic ? 1 : 0) }

    // ---- group photo mode
    var photoOn = false; let meAv = null, photoFace = 0, photoBusy = false, photoDist = 3.6; const PT = [0, 3, 5, 10]; let pti = 2;
    talkBtn.id = 'talkBtn';
    const pst = document.createElement('style');
    pst.textContent = 'body.photo #chat,body.photo #cross,body.photo #count,body.photo #visitors-toggle,body.photo #visitor-panel,body.photo #look,body.photo #add,body.photo #rn,body.photo #cap,body.photo #guide,body.photo #talkBtn,body.photo #vhud{display:none!important}';
    document.head.append(pst);
    const pbtn = 'padding:10px 14px;border:0;border-radius:20px;background:rgba(20,20,24,.85);color:#fff;font:600 14px system-ui,sans-serif;cursor:pointer';
    const photoUI = document.createElement('div');
    photoUI.style.cssText = 'position:fixed;inset:0;z-index:35;display:none;pointer-events:none;color:#fff;font:600 14px system-ui,sans-serif';
    photoUI.innerHTML = '<div style="position:absolute;inset:14px;border:3px solid rgba(255,255,255,.7);border-radius:10px"></div><div id="pcd" style="position:absolute;inset:0;display:none;align-items:center;justify-content:center;font-size:110px;text-shadow:0 4px 20px #000"></div><div style="position:absolute;left:0;right:0;bottom:calc(84px + env(safe-area-inset-bottom));display:flex;gap:8px;justify-content:center;flex-wrap:wrap;pointer-events:auto"><button id="pshot" style="' + pbtn + '">📸 Take photo</button><button id="ptm" style="' + pbtn + '">⏱ 5s</button><button id="pcall" style="' + pbtn + '">📣 Call group</button><button id="pend" style="' + pbtn + '">✕ Exit</button></div>';
    document.body.append(photoUI);
    const ringGeo = new THREE.RingGeometry(.42, .5, 32);
    function voiceRing(a, on, lv) {
      if (!a.ring) { a.ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0x6dff8c, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); a.ring.rotation.x = -Math.PI / 2; a.ring.position.y = .03; a.g.add(a.ring) }
      const m = a.ring.material, tgt = on ? Math.min(1, .35 + lv * 4) * .85 : 0;
      m.opacity += (tgt - m.opacity) * .25;
      const s = 1 + (on ? Math.sin(performance.now() / 120) * .08 + lv * 1.5 : 0); a.ring.scale.set(s, s, 1); a.ring.visible = m.opacity > .02;
    }
    const vhud = document.createElement('div'); vhud.id = 'vhud';
    vhud.style.cssText = 'position:fixed;right:10px;top:96px;z-index:19;display:none;flex-direction:column;gap:4px;min-width:140px;font:600 12px system-ui,sans-serif;color:#fff;pointer-events:none';
    document.body.append(vhud);
    let vhT = 0, vhKey = '';
    function voiceHud(rows) {
      const n = performance.now(); if (n - vhT < 150) return; vhT = n;
      rows = rows.sort((p, q) => q.vol - p.vol).slice(0, 6);
      const key = rows.map(r => r.name + Math.round(r.vol * 10) + r.spk).join('|'); if (key === vhKey) return; vhKey = key;
      vhud.style.display = rows.length && started ? 'flex' : 'none'; vhud.innerHTML = '';
      for (const r of rows) {
        const d = document.createElement('div'); d.style.cssText = 'background:rgba(20,20,24,.75);border-radius:8px;padding:5px 8px;border:1px solid ' + (r.spk ? '#6dff8c' : 'transparent');
        const nm = document.createElement('div'); nm.textContent = (r.spk ? '🔊 ' : '🎤 ') + r.name;
        const bar = document.createElement('div'); bar.style.cssText = 'height:4px;border-radius:2px;margin-top:4px;background:rgba(255,255,255,.2);overflow:hidden';
        const f = document.createElement('div'); f.style.cssText = 'height:100%;background:#6dff8c;width:' + Math.round(r.vol * 100) + '%';
        bar.append(f); d.append(nm, bar); vhud.append(d);
      }
    }
    photoUI.querySelector('#pshot').onclick = () => shoot();
    photoUI.querySelector('#ptm').onclick = e => { pti = (pti + 1) % PT.length; e.target.textContent = '⏱ ' + (PT[pti] ? PT[pti] + 's' : 'now') };
    photoUI.querySelector('#pcall').onclick = () => { const t = '📸 Group photo here, come pose with me!'; addChat(myName, t); if (room) room.emit('chat', { name: myName, text: t }).catch(() => { }) };
    photoUI.querySelector('#pend').onclick = () => togglePhoto();
    addEventListener('wheel', e => { if (photoOn) photoDist = Math.max(1.6, Math.min(8, photoDist + e.deltaY * .004)) }, { passive: true });
    function togglePhoto() {
      if (!started || evBusy) return;
      photoOn = !photoOn;
      document.body.classList.toggle('photo', photoOn);
      photoUI.style.display = photoOn ? 'block' : 'none';
      if (photoOn) {
        if (meAv) scene.remove(meAv);
        meAv = makeAvatar(myName, myLook.hu, myGen, seedOf(myId), myLook);
        meA = { g: meAv, k: 0, ph: 0, tp: 0, em: null, wt: 0 };
        photoFace = yaw; yaw = photoFace + Math.PI; pitch = -.1; stick.style.display = 'none';
      } else {
        if (meAv) meAv.visible = false;
        yaw = photoFace; pitch = 0; if (touch) stick.style.display = 'block';
      }
    }
    function photoCam(dt) {
      if (!meA) return;
      pitch = Math.max(-.7, Math.min(.5, pitch));
      const ty = sy + (emote === 'sit' ? .8 : 1.2);
      const cx = Math.max(-W / 2 + .4, Math.min(W / 2 - .4, px + Math.sin(yaw) * photoDist));
      const cz = Math.max(-D / 2 + .4, Math.min(D / 2 - .4, pz + Math.cos(yaw) * photoDist));
      cam.position.set(cx, ty + .3 - pitch * 2, cz); cam.lookAt(px, ty, pz);
      meAv.position.x = px; meAv.position.z = pz; meAv.rotation.y = photoFace; meA.by = sy; meA.em = emote;
      animate(meA, dt);
    }
    async function shoot() {
      if (!photoOn || photoBusy) return; photoBusy = true;
      const cd = photoUI.querySelector('#pcd');
      for (let i = PT[pti]; i > 0; i--) { cd.style.display = 'flex'; cd.textContent = i; sfxClick(); await wait(1000); if (!photoOn) { cd.style.display = 'none'; photoBusy = false; return } }
      cd.style.display = 'none'; await wait(60);
      renderer.render(scene, cam);
      const src = renderer.domElement, c = document.createElement('canvas'); c.width = src.width; c.height = src.height;
      const x = c.getContext('2d'); x.drawImage(src, 0, 0);
      const fs = Math.round(c.height * .028), by = c.height - fs * .95;
      x.fillStyle = 'rgba(0,0,0,.5)'; x.fillRect(0, c.height - fs * 1.9, c.width, fs * 1.9);
      x.fillStyle = '#fff'; x.font = '600 ' + fs + 'px Georgia, serif'; x.textBaseline = 'middle'; x.textAlign = 'left';
      x.fillText('The Gallery · Room ' + (myRoom + 1) + ' · ' + new Date().toLocaleDateString(), fs, by);
      x.textAlign = 'right'; x.fillText([myName, ...Array.from(avatars.values()).map(a => a.name)].slice(0, 6).join(', '), c.width - fs, by, c.width * .5);
      const url = c.toDataURL('image/jpeg', .92);
      sfxTone(2200, 600, .12, .5, 'square');
      const fl = document.createElement('div'); fl.style.cssText = 'position:fixed;inset:0;background:#fff;opacity:.9;z-index:36;transition:opacity .5s;pointer-events:none';
      document.body.append(fl); requestAnimationFrame(() => fl.style.opacity = '0'); setTimeout(() => fl.remove(), 600);
      photoUI.querySelector('#pprev')?.remove();
      const a = document.createElement('a'); a.id = 'pprev'; a.href = url; a.download = 'gallery-photo-' + Date.now() + '.jpg';
      a.style.cssText = 'position:absolute;right:16px;top:16px;pointer-events:auto;background:#fff;padding:6px;border-radius:8px;width:150px;color:#111;text-decoration:none;font:600 12px system-ui,sans-serif;text-align:center';
      a.innerHTML = '<img style="width:100%;border-radius:4px;display:block" src="' + url + '"><div style="margin-top:4px">⬇ Save photo</div>';
      photoUI.append(a); setTimeout(() => a.remove(), 12000);
      photoBusy = false;
    }

    async function toggleMic() {
      if (micOn) {
        micOn = false; micStream?.getTracks().forEach(t => t.stop()); micStream = null; localAn = null;
        pcs.forEach(v => v.sender?.replaceTrack(null).catch(() => { }));
      } else {
        if (!navigator.mediaDevices?.getUserMedia) { alert('The microphone needs HTTPS (or localhost) and a supported browser.'); return }
        try { micStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }) }
        catch (e) { alert('Microphone permission was blocked.'); return }
        micOn = true; const c = ctxA(); localAn = c.createAnalyser(); localAn.fftSize = 256; c.createMediaStreamSource(micStream).connect(localAn);
        const tr = micStream.getAudioTracks()[0]; pcs.forEach(v => v.sender?.replaceTrack(tr).catch(() => { }));
      }
      $('mic').classList.toggle('active', micOn); $('mic').setAttribute('aria-pressed', String(micOn)); setPresence(true); syncRtc();
    }
    $('mic').onclick = toggleMic;

    function makePc(id) {
      const pc = new RTCPeerConnection(ICE), v = { pc, sender: null, pending: [], remote: false, out: null }; pcs.set(id, v);
      pc.onicecandidate = e => { if (e.candidate) wsend({ t: 'rtc', to: id, data: { cand: e.candidate } }) };
      pc.ontrack = e => attachRemote(v, e.streams[0] || new MediaStream([e.track]));
      pc.onconnectionstatechange = () => { if (['failed', 'closed'].includes(pc.connectionState)) { closeCall(id); setTimeout(syncRtc, 1500) } };
      return v;
    }
    function useSender(v, tr) { tr.direction = 'sendrecv'; v.sender = tr.sender; if (micStream) tr.sender.replaceTrack(micStream.getAudioTracks()[0]).catch(() => { }) }
    function attachRemote(v, stream) {
      if (v.out) return; const c = ctxA(); if (c.state !== 'running') c.resume();
      const el = new Audio(); el.srcObject = stream; el.muted = true; el.play().catch(() => { });   // Chrome needs the stream on an element
      const src = c.createMediaStreamSource(stream), gain = c.createGain(), an = c.createAnalyser();
      const pan = c.createStereoPanner ? c.createStereoPanner() : null;
      an.fftSize = 256; gain.gain.value = 1; src.connect(an); src.connect(gain);
      if (pan) { gain.connect(pan); pan.connect(c.destination) } else gain.connect(c.destination);
      v.out = { el, src, gain, pan, an };
    }
    addEventListener('pointerdown', () => { if (actx && actx.state !== 'running') actx.resume() });
    function closeCall(id) {
      const v = pcs.get(id); if (!v) return; pcs.delete(id);
      try { v.pc.close() } catch (e) { }
      if (v.out) { try { v.out.src.disconnect(); v.out.gain.disconnect(); v.out.pan?.disconnect() } catch (e) { } v.out.el.srcObject = null }
      const a = avatars.get(id); if (a) setSpeaking(a, false);
    }
    async function startCall(id) {
      const v = makePc(id); useSender(v, v.pc.addTransceiver('audio', { direction: 'sendrecv' }));
      try { await v.pc.setLocalDescription(await v.pc.createOffer()); wsend({ t: 'rtc', to: id, data: { desc: v.pc.localDescription } }) } catch (e) { console.error(e); closeCall(id) }
    }
    // Connect to people in my room when either of us has the mic on. The lower id places the call.
    function syncRtc() {
      const live = new Set();
      for (const p of lastPeers) {
        if (p.sameTab) continue; const d = p.presence || {}, id = p.peer;
        const want = (d.r || 0) === myRoom && d.x != null && (micOn || d.mic);
        if (want) live.add(id);
        if (want && !pcs.has(id) && wsId && wsId < id) startCall(id);
      }
      for (const id of [...pcs.keys()]) if (!live.has(id)) closeCall(id);
    }
    handlers.rtc.push(async m => {
      const id = m.peer, d = m.data || {};
      try {
        let v = pcs.get(id);
        if (d.desc && d.desc.type === 'offer') {
          if (v) closeCall(id);
          v = makePc(id); await v.pc.setRemoteDescription(d.desc); v.remote = true; useSender(v, v.pc.getTransceivers()[0]);
          await v.pc.setLocalDescription(await v.pc.createAnswer()); wsend({ t: 'rtc', to: id, data: { desc: v.pc.localDescription } });
          for (const c of v.pending.splice(0)) await v.pc.addIceCandidate(c).catch(() => { });
        } else if (d.desc && d.desc.type === 'answer' && v) {
          await v.pc.setRemoteDescription(d.desc); v.remote = true;
          for (const c of v.pending.splice(0)) await v.pc.addIceCandidate(c).catch(() => { });
        } else if (d.cand && v) {
          if (v.remote) await v.pc.addIceCandidate(d.cand).catch(() => { }); else v.pending.push(d.cand);
        }
      } catch (e) { console.error(e) }
    });
    let lastGl = false;
    function voiceTick() {
      const rows = [];
      if (!actx) return;
      const L = actx.listener, fx = -Math.sin(yaw), fz = -Math.cos(yaw);
      if (L.positionX) { L.positionX.value = px; L.positionY.value = EYE; L.positionZ.value = pz; L.forwardX.value = fx; L.forwardY.value = 0; L.forwardZ.value = fz; L.upX.value = 0; L.upY.value = 1; L.upZ.value = 0 }
      else { L.setPosition(px, EYE, pz); L.setOrientation(fx, 0, fz, 0, 1, 0) }
      for (const [id, v] of pcs) {
        if (!v.out) continue; const a = avatars.get(id);
        if (!a) { v.out.gain.gain.value = 0; continue }
        const dx = a.g.position.x - px, dz = a.g.position.z - pz, d = Math.hypot(dx, dz), now = performance.now();
        v.out.gain.gain.value = Math.max(0, Math.min(1, 1.15 - d / 18)) * 1.4;   // louder when close
        if (v.out.pan) v.out.pan.pan.value = Math.max(-1, Math.min(1, (dx * Math.cos(yaw) - dz * Math.sin(yaw)) / Math.max(d, 1)));
        if (level(v.out.an) > .06) a.spkT = now;
        setSpeaking(a, now - (a.spkT || 0) < 300);   // short hold so the icon doesn't flicker
        voiceRing(a, now - (a.spkT || 0) < 300, level(v.out.an)); rows.push({ name: a.name, vol: Math.max(0, Math.min(1, 1.15 - d / 18)), spk: now - (a.spkT || 0) < 300 });
      }
      voiceHud(rows); const gl = micOn && level(localAn) > .06; if (gl !== lastGl) { lastGl = gl; $('mic').style.boxShadow = gl ? '0 0 0 3px #6dff8c' : '' }
    }

    // ---- elevator control (floors = rooms)
    let evBusy = false, evO = 0, evWas = false;
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const fade = document.createElement('div');
    fade.style.cssText = 'position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;transition:opacity .4s;z-index:30';
    document.body.append(fade);

    async function ride(n, fromPeer = false) {
      if (evBusy || !inCab() || n === myRoom || n < 0 || n >= rooms) return;

      evBusy = true;
      sfxClick();

      if (!fromPeer && room) room.emit('react', { e: 'ride', n, from: myRoom }).catch(() => { });   // tells everyone else in the cab

      await wait(600);
      fade.style.opacity = '1';
      sfxHum();
      await wait(450);

      myRoom = n;
      px = EVX + .2; pz = EVZ + (fromPeer ? (Math.random() - .5) * .8 : 0); yaw = Math.PI / 2;
      pitch = 0;
      looking = null;
      lpx = null;

      layout();
      setPresence(true);
      renderPeers();

      await wait(300);
      fade.style.opacity = '0';
      sfxDing();
      await wait(400);

      evBusy = false;
    }
    const peerElevatorSeq = new Map();

    function checkPeerElevator(peerId, peer) {
      if (!peer) return;

      const seq = Number(peer.eq) || 0;
      const previous = peerElevatorSeq.get(peerId);

      // Initialize without replaying an old elevator event.
      if (previous === undefined) {
        peerElevatorSeq.set(peerId, seq);
        return;
      }

      if (seq === previous) return;

      peerElevatorSeq.set(peerId, seq);

      const destination = Number(peer.et);

      // Only synchronize players inside the same elevator and room.
      if (
        !inCab() ||
        Number(peer.r) !== myRoom ||
        !Number.isInteger(destination) ||
        destination < 0 ||
        destination >= rooms ||
        destination === myRoom
      ) return;

      ride(destination, true);
    }
    function elevTick(dt) {
      evRender();
      const tgt = started && !evBusy && nearEv() ? 1 : 0, d = tgt - evO;
      if (tgt !== evTgt) { evTgt = tgt; if (started) sfxDoor() }
      if (Math.abs(d) > .002) { evO += d * Math.min(1, dt * 5); const sc = 1 - evO * .92; evDoorL.scale.x = sc; evDoorR.scale.x = sc }
    }
    addEventListener('keydown', e => { if (started && !evBusy && inCab() && /^Digit[1-9]$/.test(e.code) && document.activeElement.tagName !== 'INPUT') ride(+e.code.slice(5) - 1) });

    // ---- sound effects (synthesized, no files to download)
    let sfxOut = null, noiseBuf = null, lpx = null, lpz = 0, stepAcc = 0, stepSide = 0, evTgt = 0;
    function sfxReady() {
      if (!actx || actx.state !== 'running') return false;
      if (!sfxOut) {
        sfxOut = actx.createGain(); sfxOut.gain.value = 1.6;   // master volume
        const comp = actx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 6;
        sfxOut.connect(comp); comp.connect(actx.destination);
        const n = actx.sampleRate >> 1; noiseBuf = actx.createBuffer(1, n, actx.sampleRate);
        const d = noiseBuf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      }
      return true;
    }
    function sfxTone(f1, f2, dur, vol, type, delay) {
      if (!sfxReady()) return;
      const t = actx.currentTime + (delay || 0), o = actx.createOscillator(), g = actx.createGain();
      o.type = type || 'sine'; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(Math.max(1, f2), t + dur);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g); g.connect(sfxOut); o.start(t); o.stop(t + dur + .05);
    }
    function sfxNoise(f1, f2, q, dur, vol, type) {
      if (!sfxReady()) return;
      const t = actx.currentTime, s = actx.createBufferSource(), f = actx.createBiquadFilter(), g = actx.createGain();
      s.buffer = noiseBuf; f.type = type || 'bandpass'; f.Q.value = q;
      f.frequency.setValueAtTime(f1, t); f.frequency.exponentialRampToValueAtTime(f2, t + dur);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(sfxOut); s.start(t); s.stop(t + dur + .05);
    }

    function sfxRing(t, f, q, vol, len) {   // short noise burst through a resonant filter = a ringing board
      if (!sfxReady()) return;
      const s = actx.createBufferSource(), fl = actx.createBiquadFilter(), g = actx.createGain();
      s.buffer = noiseBuf; s.playbackRate.value = 1; fl.type = 'bandpass'; fl.frequency.value = f; fl.Q.value = q;
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + len);
      s.connect(fl); fl.connect(g); g.connect(sfxOut); s.start(t, Math.random() * .3); s.stop(t + .03);
    }
    function woodHit(t, vol, p, len) {
      const o = actx.createOscillator(), g = actx.createGain();   // heel thud
      o.type = 'sine'; o.frequency.setValueAtTime(150 * p, t); o.frequency.exponentialRampToValueAtTime(55 * p, t + .1);
      g.gain.setValueAtTime(vol * .9, t); g.gain.exponentialRampToValueAtTime(.0001, t + .11);
      o.connect(g); g.connect(sfxOut); o.start(t); o.stop(t + .14);
      sfxRing(t, 210 * p, 7, vol * 5, .2 * len);    // hollow floorboard body
      sfxRing(t, 430 * p, 9, vol * 3.2, .13 * len); // wood "knock"
      sfxRing(t, 1100 * p, 5, vol * 1.6, .06 * len);
      sfxRing(t, 2600 * p, 1.5, vol * 1.2, .02);    // sharp edge click of the sole
    }

    function sfxStep() {
      if (!sfxReady()) return; stepSide ^= 1;
      const t = actx.currentTime, p = (.92 + Math.random() * .16) * (stepSide ? 1.06 : 1), v = .9 + Math.random() * .25;
      woodHit(t, v, p, 1);                       // heel strike
      woodHit(t + .075, v * .42, p * 1.18, .55); // toe tap right after
    }
    function sfxClick() { sfxTone(1500, 900, .08, .5, 'sine') }
    function sfxDoor() { sfxNoise(500, 1800, 1.2, .6, .4); sfxTone(140, 90, .5, .25, 'triangle') }
    function sfxHum() { sfxTone(60, 85, 1.1, .4, 'triangle'); sfxNoise(260, 120, .7, 1.1, .25, 'lowpass') }
    function sfxDing() { sfxTone(988, 988, .9, .6, 'sine'); sfxTone(1319, 1319, 1.1, .5, 'sine', .18) }

    function sfxBeep(final) { sfxTone(final ? 1320 : 880, final ? 1320 : 880, final ? .3 : .12, .4, 'sine') }
    function sfxPop() { sfxTone(700, 1100, .07, .3, 'sine') }
    function sfxCancel() { sfxTone(520, 180, .22, .4, 'triangle') }
    function sfxWhoosh() { sfxNoise(300, 3200, .8, .4, .35) }
    function sfxWelcome() { sfxTone(784, 784, .4, .3, 'sine'); sfxTone(1047, 1047, .55, .28, 'sine', .12) }
    function sfxStage() { sfxTone(660, 660, .25, .25, 'sine'); sfxTone(990, 990, .35, .22, 'sine', .08) }
    function sfxSuccess() { [660, 880, 1320].forEach((f, i) => sfxTone(f, f, .3, .3, 'sine', i * .1)) }
    function sfxShutter() {                       // camera click: two mechanical clicks plus a flash zap
      sfxNoise(5000, 1800, 1, .05, .7, 'highpass'); sfxTone(180, 60, .06, .5, 'square');
      setTimeout(() => { sfxNoise(3500, 1200, 1.5, .06, .55, 'bandpass'); sfxTone(140, 50, .06, .4, 'square') }, 80);
      sfxTone(3200, 500, .25, .18, 'sawtooth', .02);
    }

    function sfxTwang(p) { sfxTone(500 + p * 500, 140, .14, .5, 'triangle'); sfxNoise(3500, 900, 2, .1, .35) }
    // Minecraft-style "oof": short low grunt, pitch dropping, muffled
    function sfxHurt(v = 1, gen = 'n') {
      if (!sfxReady()) return;
      const fem = gen === 'f', mal = gen === 'm';
      const t = actx.currentTime, r = .94 + Math.random() * .12;
      // pitch contour (start, peak, end) and "oh" vowel formants per voice
      const P = fem ? [300, 360, 235] : mal ? [150, 175, 88] : [215, 245, 125];
      const F = fem ? [[640, 540], [1150, 980], [2900, 2700]] : mal ? [[480, 400], [850, 720], [2300, 2100]] : [[560, 470], [1000, 850], [2600, 2400]];
      const dur = fem ? .3 : .27;
      const src = actx.createOscillator(); src.type = 'sawtooth';
      src.frequency.setValueAtTime(P[0] * r, t);
      src.frequency.linearRampToValueAtTime(P[1] * r, t + .035);          // sharp "hh-OH" onset
      src.frequency.exponentialRampToValueAtTime(P[2] * r, t + dur);      // falling tail
      if (fem) {                                                          // light vibrato for a softer voice
        const lfo = actx.createOscillator(), lg = actx.createGain(); lfo.frequency.value = 24; lg.gain.value = 5;
        lfo.connect(lg); lg.connect(src.frequency); lfo.start(t); lfo.stop(t + dur + .05);
      }
      const out = actx.createGain();
      out.gain.setValueAtTime(.0001, t);
      out.gain.exponentialRampToValueAtTime((mal ? 2.8 : 2.3) * v, t + .01);
      out.gain.setValueAtTime((mal ? 2.8 : 2.3) * v, t + .07);
      out.gain.exponentialRampToValueAtTime(.0001, t + dur + .04);
      [[F[0], 1, 6], [F[1], .65, 7], [F[2], .22, 6]].forEach(([f, gn, q]) => {
        const bp = actx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = q;
        bp.frequency.setValueAtTime(f[0], t); bp.frequency.exponentialRampToValueAtTime(f[1], t + dur);
        const fg = actx.createGain(); fg.gain.value = gn;
        src.connect(bp); bp.connect(fg); fg.connect(out);
      });
      out.connect(sfxOut);
      src.start(t); src.stop(t + dur + .06);
      sfxNoise(mal ? 1100 : 1900, 450, .7, .07, (mal ? .45 : .3) * v);   // breathy "hh" at the start
      if (!fem) sfxTone(mal ? 100 : 120, 42, .13, .6 * v, 'sine');        // chest thump
    }

    // ---- elevator finder (small 3D arrow + ELEVATOR label)
    const guide = document.createElement('button'); guide.type = 'button';
    guide.style.cssText = 'position:fixed;left:50%;top:10px;transform:translateX(-50%);z-index:20;display:none;align-items:center;gap:8px;padding:7px 14px;border:0;border-radius:20px;background:rgba(20,20,24,.82);color:#fff;font:600 13px system-ui,sans-serif;cursor:pointer';
    guide.id = 'guide'; const guideTxt = document.createElement('span'); guide.append(guideTxt); document.body.append(guide);

    function goElevator() {
      if (!started || evBusy) return; if (sitting) standUp();
      px = EVX - 1.6; pz = EVZ; yaw = -Math.PI / 2; pitch = 0; sy = 0; lpx = null; looking = null; setPresence(true);
    }
    guide.onclick = goElevator;
    addEventListener('keydown', e => { if (e.code === 'KeyL' && started && document.activeElement.tagName !== 'INPUT') goElevator() });
    let gT = 0, gKey = -1;
    function guideTick() {
      const n = performance.now(); if (n - gT < 150) return; gT = n;
      const dist = Math.hypot(EVX - .65 - px, EVZ - pz);
      const show = started && !evBusy && !inCab() && dist > 2.6;
      if (!show) { if (guide.style.display !== 'none') guide.style.display = 'none'; return }
      if (guide.style.display === 'none') guide.style.display = 'flex';
      const key = Math.round(dist); if (key === gKey) return; gKey = key;
      guideTxt.textContent = 'Elevator · ' + key + ' m · ' + (touch ? 'tap to go' : 'press L');
    }

    const _b = new THREE.Box3();
    function enableShadows(root = scene) {
      root.traverse(o => {
        if (!o.isMesh || !o.material) return;
        const m = o.material, basic = m.isMeshBasicMaterial;
        if (!basic) o.receiveShadow = true;
        if (m.transparent || basic || o.geometry.type === 'PlaneGeometry') return;
        _b.setFromObject(o); if (_b.min.y > 2.4) return;
        o.castShadow = true;
      });
    }
    enableShadows();

    // ---- live 3D avatar preview (start / customize window)
    {
      const pc = $('lookprev');
      if (pc) {
        const pr = new THREE.WebGLRenderer({ canvas: pc, antialias: true, alpha: true });
        pr.setPixelRatio(Math.min(devicePixelRatio, 2)); pr.outputEncoding = THREE.sRGBEncoding;
        const ps = new THREE.Scene();
        const pcam = new THREE.PerspectiveCamera(32, 1, .1, 20);
        pcam.position.set(0, 1.05, 4.6); pcam.lookAt(0, .95, 0);
        ps.add(new THREE.HemisphereLight(0xfff1dc, 0x3a342d, 1));
        const dl = new THREE.DirectionalLight(0xffffff, .8); dl.position.set(2, 4, 3); ps.add(dl);
        let pav = null, psig = '', spin = 0, drag = false, lx = 0, pw = 0, ph = 0;
        pc.addEventListener('pointerdown', e => { drag = true; lx = e.clientX; pc.setPointerCapture(e.pointerId) });
        pc.addEventListener('pointermove', e => { if (drag) { spin += (e.clientX - lx) * .012; lx = e.clientX } });
        pc.addEventListener('pointerup', () => drag = false);
        (function ploop() {
          requestAnimationFrame(ploop);
          if ($('start').style.display === 'none') return;
          const w = pc.clientWidth, h = pc.clientHeight; if (!w || !h) return;
          if (w !== pw || h !== ph) { pw = w; ph = h; pr.setSize(w, h, false); pcam.aspect = w / h; pcam.updateProjectionMatrix() }
          const sig = [myGen, myLook.sk, myLook.hr, myLook.hu, myLook.hs, myLook.ht, myLook.gl, myLook.bg].join();
          if (sig !== psig) {
            psig = sig; if (pav) ps.remove(pav);
            const g = makeAvatar('', myLook.hu, myGen, seedOf(myId), myLook);
            scene.remove(g); g.userData.lb.visible = false; ps.add(g); pav = g;
          }
          if (!drag) spin += .008;
          pav.rotation.y = Math.PI + spin;
          pr.render(ps, pcam);
        })();
      }
    }

    // ---- combat: punch + bow
    const cst = document.createElement('style');
    cst.textContent = 'body.menu #act,body.photo #act{display:none!important}#act button:active{transform:scale(.9)}';
    document.head.append(cst);
    const hurtEl = document.createElement('div');
    hurtEl.style.cssText = 'position:fixed;inset:0;pointer-events:none;background:radial-gradient(transparent 20%,rgba(255,0,0,.75)),rgba(255,0,0,.22);opacity:0;transition:opacity .5s;z-index:31';
    document.body.append(hurtEl);
    const actBox = document.createElement('div'); actBox.id = 'act';
    actBox.style.cssText = 'position:fixed;right:max(14px,env(safe-area-inset-right));bottom:calc(max(18px,env(safe-area-inset-bottom)) + 66px);z-index:19;display:none;flex-direction:column;gap:10px';
    const cd = { punch: 0, bow: 0 };
    function mkAct(icon, label, fn, up, drag) {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = icon; b.title = label; b.setAttribute('aria-label', label);
      b.style.cssText = 'width:62px;height:62px;min-height:0;padding:0;border-radius:50%;font-size:30px;line-height:1;background:rgba(28,28,32,.94);border:1px solid rgba(255,255,255,.18);color:#fff;box-shadow:0 8px 25px #0006;touch-action:none;transition:opacity .15s';
      let lx = 0, ly = 0, sx = 0, sy2 = 0, on = false;
      b.addEventListener('pointerdown', e => { e.preventDefault(); try { b.setPointerCapture(e.pointerId) } catch (_) { } lx = sx = e.clientX; ly = sy2 = e.clientY; on = true; fn() });
      if (drag) b.addEventListener('pointermove', e => {
        if (!on) return;
        drag(e.clientX - lx, e.clientY - ly); lx = e.clientX; ly = e.clientY;
        let dx = e.clientX - sx, dy = e.clientY - sy2; const m = Math.hypot(dx, dy) || 1, k = Math.min(1, 40 / m);
        b.style.transform = `translate(${dx * k}px,${dy * k}px)`;   // button follows the thumb
      });
      if (up) for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) b.addEventListener(ev, () => { if (!on) return; on = false; b.style.transform = ''; up() });
      actBox.append(b); return b;
    }
    const bPunch = mkAct('👊', 'Punch (Z)', () => punch()), bBow = mkAct('🏹', 'Bow (hold Q)', () => bowStart(), () => bowRelease(), (dx, dy) => {
      yaw -= dx * .007; pitch = Math.max(-1.2, Math.min(1.2, pitch - dy * .007));
    });
    document.body.append(actBox);
    function ready(k, ms) {
      const n = performance.now(); if (n < cd[k]) return false; cd[k] = n + ms;
      const b = k === 'punch' ? bPunch : bBow; b.style.opacity = '.35'; setTimeout(() => b.style.opacity = '1', ms); return true;
    }
    const canAct = () => started && !evBusy && !photoOn && !talkOpen && !boothBusy;

    // ---- hit effects
    const HURTM = new THREE.MeshBasicMaterial({ color: 0xff2a2a });
    let kbx = 0, kbz = 0, shake = 0;
    function flashAvatar(g) {            // whole body turns red for a moment (Minecraft style)
      if (g.userData.fl) return; g.userData.fl = true;
      const sv = []; g.traverse(o => { if (o.isMesh && o.material) { sv.push([o, o.material]); o.material = HURTM } });
      setTimeout(() => { for (const [o, m] of sv) o.material = m; g.userData.fl = false }, 220);
    }
    function hitFx(a, ax = px, az = pz, kind = 'punch') {
      spawnFloat(a.g, '💥'); flashAvatar(a.g);
      const dx = a.g.position.x - ax, dz = a.g.position.z - az, dd = Math.hypot(dx, dz) || 1, s = kind === 'punch' ? 9 : 6;
      a.kvx = dx / dd * s; a.kvz = dz / dd * s; a.ox = a.ox || 0; a.oz = a.oz || 0;   // instant predicted shove
      const d = Math.hypot(a.g.position.x - px, a.g.position.z - pz); sfxHurt(Math.max(.25, 1 - d / 20), a.gn);
    }

    // ---- punch
    function punch() {
      if (!canAct() || !ready('punch', 650)) return;
      setEmote('punch'); sfxTone(260, 90, .14, .5, 'triangle'); sfxNoise(1200, 300, 1, .12, .3);
      setTimeout(() => {                 // the hit lands on the strike frame, not at the key press
        const fx = -Math.sin(yaw), fz = -Math.cos(yaw); let best = null, bd = 1.8;
        for (const [id, a] of avatars) {
          const dx = a.g.position.x - px, dz = a.g.position.z - pz, d = Math.hypot(dx, dz);
          if (d > bd || d < .01 || (dx * fx + dz * fz) / d < .45) continue;
          best = id; bd = d;
        }
        shake = Math.max(shake, .25);
        if (room) room.emit('act', { k: 'punch', to: best }).catch(() => { });
        if (best) { const a = avatars.get(best); if (a) hitFx(a, px, pz, 'punch') }
      }, 160);
    }

    // ---- bow (hold to draw, release to fire)
    const arrows = [], arrowShaft = new THREE.CylinderGeometry(.012, .012, .8, 6).rotateX(Math.PI / 2), arrowTip = new THREE.ConeGeometry(.035, .12, 6).rotateX(Math.PI / 2);
    const arrowMatA = new THREE.MeshBasicMaterial({ color: 0xd8c7a0 }), arrowMatB = new THREE.MeshBasicMaterial({ color: 0xbfc3c8 });
    function spawnArrow(o, d, len, v = 30) {
      if (arrows.length > 20) return;
      const g = new THREE.Group(), tip = new THREE.Mesh(arrowTip, arrowMatB); tip.position.z = .45;
      g.add(new THREE.Mesh(arrowShaft, arrowMatA), tip);
      g.position.set(o[0], o[1], o[2]); g.lookAt(o[0] + d[0], o[1] + d[1], o[2] + d[2]); scene.add(g);
      arrows.push({ g, o, d, len, s: 0, v });
    }
    function arrowTick(dt) {
      for (let i = arrows.length - 1; i >= 0; i--) {
        const a = arrows[i]; a.s += a.v * dt; const s = Math.min(a.s, a.len);
        a.g.position.set(a.o[0] + a.d[0] * s, a.o[1] + a.d[1] * s, a.o[2] + a.d[2] * s);
        if (a.s >= a.len + a.v * .4) { scene.remove(a.g); arrows.splice(i, 1) }
      }
    }
    let bowT = 0;
    const bowBar = document.createElement('div');
    bowBar.style.cssText = 'position:fixed;left:50%;top:58%;transform:translateX(-50%);width:120px;height:8px;border-radius:5px;background:rgba(0,0,0,.5);border:1px solid #fff8;z-index:19;display:none;overflow:hidden';
    const bowFill = document.createElement('div'); bowFill.style.cssText = 'height:100%;width:0;background:#6dff8c';
    bowBar.append(bowFill); document.body.append(bowBar);
    function bowStart() {
      if (bowT || !canAct() || performance.now() < cd.bow) return;
      if (sitting) standUp();
      clearTimeout(emoTimer); bowT = performance.now(); emote = 'draw'; $('dn').className = 'g'; setPresence(true);
      sfxTone(110, 260, .6, .18, 'triangle'); bowBar.style.display = 'block';
    }
    function bowRelease() {
      if (!bowT) return;
      const c = Math.min(1, (performance.now() - bowT) / 900); bowT = 0; bowBar.style.display = 'none';
      if (emote === 'draw') { emote = null; setPresence(true) }
      if (c < .12 || !canAct()) return;          // too weak = cancelled, like Minecraft
      fireArrow(c);
    }
    function bowTick() {
      if (!bowT) return;
      const c = Math.min(1, (performance.now() - bowT) / 900);
      bowFill.style.width = (c * 100) + '%'; bowFill.style.background = c >= 1 ? '#ffc94d' : '#6dff8c';
      if (!canAct()) bowRelease();
    }
    function fireArrow(c) {
      if (!ready('bow', 450)) return;
      sfxTwang(c);
      const cp = Math.cos(pitch), D3 = [-Math.sin(yaw) * cp, Math.sin(pitch), -Math.cos(yaw) * cp], O = [px, EYE + sy - .1, pz];
      let len = 8 + 22 * c, to = null;           // more charge = longer range and faster arrow
      for (let s = .5; s < len; s += .5) {
        const x = O[0] + D3[0] * s, y = O[1] + D3[1] * s, z = O[2] + D3[2] * s;
        if (collidesWithWall(x, z, .02) || y < 0 || y > H) { len = s; break }
      }
      for (const [id, a] of avatars) {
        const v = [a.g.position.x - O[0], a.g.position.y + 1.1 - O[1], a.g.position.z - O[2]];
        const t = v[0] * D3[0] + v[1] * D3[1] + v[2] * D3[2]; if (t < .5 || t > len) continue;
        if (v[0] * v[0] + v[1] * v[1] + v[2] * v[2] - t * t < .22) { len = t; to = id }
      }
      const r2 = n => +n.toFixed(2), o = O.map(r2), d = D3.map(r2), l = +len.toFixed(1), p = +c.toFixed(2);
      spawnArrow(o, d, l, 16 + 26 * c);
      if (room) room.emit('act', { k: 'arrow', o, d, l, p, to }).catch(() => { });
      if (to) { const a = avatars.get(to); if (a) { hitFx(a, px, pz, 'arrow'); sfxTone(300, 100, .08, .5, 'square') } }
    }

    // ---- getting hit: red flash, camera shake, sound, knockback
    function hurt(from, kind, pw) {
      if (!started || evBusy || photoOn) return;
      if (sitting) standUp();
      hurtEl.style.transition = 'none'; hurtEl.style.opacity = '1'; void hurtEl.offsetWidth;
      hurtEl.style.transition = 'opacity .5s'; hurtEl.style.opacity = '0';
      sfxHurt(1, myGen); shake = 1;
      const p = lastPeers.find(q => q.peer === from)?.presence;
      if (p && p.x != null && (p.r || 0) === myRoom) {
        const dx = px - p.x, dz = pz - p.z, d = Math.hypot(dx, dz) || 1;
        const sp = kind === 'punch' ? 8 : 4 + 5 * (pw || 0);
        kbx = dx / d * sp; kbz = dz / d * sp;
      }
      setPresence(true);
    }
    const ok3 = v => Array.isArray(v) && v.length === 3 && v.every(Number.isFinite);
    room.on('act', m => {
      if (m.sameTab) return;
      const d = m.data || {}, sp = lastPeers.find(q => q.peer === m.peer)?.presence;
      if (!sp || (sp.r || 0) !== myRoom) return;
      const pw = Math.min(1, Math.max(0, +d.p || 0));
      if (d.k === 'arrow' && ok3(d.o) && ok3(d.d) && Number.isFinite(+d.l) && +d.l > 0 && +d.l <= 31) spawnArrow(d.o, d.d, +d.l, 16 + 26 * pw);
      if ((d.k === 'arrow' || d.k === 'punch') && d.to) {
        const t = avatars.get(d.to), at = avatars.get(m.peer);
        if (t) hitFx(t, at ? at.g.position.x : sp.x, at ? at.g.position.z : sp.z, d.k === 'punch' ? 'punch' : 'arrow');
        if (d.to === wsId) hurt(m.peer, d.k, pw);
      }
    });

    // ---- photobooth: stage, photographer (Leo), timer and preview
    let boothWas = false, boothBusy = false, boothView = false, boothOpen = false, boothCancel = false, bgi = 0, bti = 1, bni = 0, bT = 0;
    const LEOX = -13.4, LEOZ = 1.5, BT = [3, 5, 10], BN = [1, 3], BGN = ['Gold curtain', 'Night sky', 'Sunset', 'Studio'];
    const onStage = (x, z) => x > -15.6 && x < -9.4 && z > 5.2 && z < 8.8;
    const boothNear = () => onStage(px, pz) || Math.hypot(px - LEOX, pz - LEOZ) < 4.5;
    function stageList() {
      const l = []; if (onStage(px, pz)) l.push(myName || 'You');
      for (const p of lastPeers) {
        if (p.sameTab) continue; const d = p.presence || {};
        if (d.x == null || (d.r || 0) !== myRoom) continue;
        if (onStage(d.x, d.z)) l.push(String(d.name || 'Guest').slice(0, 18));
      }
      return l;
    }

    // backdrop (texture can be switched live)
    const bgc = document.createElement('canvas'); bgc.width = 512; bgc.height = 236; const bgx = bgc.getContext('2d');
    const bgTex = new THREE.CanvasTexture(bgc); bgTex.encoding = THREE.sRGBEncoding;
    function paintBackdrop(i) {
      const g = bgx.createLinearGradient(0, 0, 0, 236);
      if (i === 0) {
        g.addColorStop(0, '#5a0f1b'); g.addColorStop(1, '#8e1c2b'); bgx.fillStyle = g; bgx.fillRect(0, 0, 512, 236);
        for (let x = 0; x < 512; x += 32) { bgx.fillStyle = 'rgba(255,210,120,.18)'; bgx.fillRect(x, 0, 14, 236); bgx.fillStyle = 'rgba(0,0,0,.18)'; bgx.fillRect(x + 14, 0, 6, 236) }
      } else if (i === 1) {
        g.addColorStop(0, '#0b1030'); g.addColorStop(1, '#3a2470'); bgx.fillStyle = g; bgx.fillRect(0, 0, 512, 236);
        for (let k = 0; k < 90; k++) { bgx.fillStyle = 'rgba(255,255,255,' + (.4 + Math.random() * .6) + ')'; bgx.fillRect(Math.random() * 512, Math.random() * 236, 2, 2) }
      } else if (i === 2) {
        g.addColorStop(0, '#ffb36b'); g.addColorStop(.55, '#ff5e62'); g.addColorStop(1, '#5b247a'); bgx.fillStyle = g; bgx.fillRect(0, 0, 512, 236);
      } else {
        g.addColorStop(0, '#f4f4f4'); g.addColorStop(1, '#c9c9c9'); bgx.fillStyle = g; bgx.fillRect(0, 0, 512, 236);
      }
      bgTex.needsUpdate = true;
    }
    paintBackdrop(0);
    const bdrop = new THREE.Mesh(new THREE.PlaneGeometry(7.4, 3.4), new THREE.MeshBasicMaterial({ map: bgTex })); bdrop.position.set(-12.5, 1.7, 9.18); bdrop.rotation.y = Math.PI; scene.add(bdrop);
    const bfr = new THREE.Mesh(new THREE.BoxGeometry(7.6, 3.6, .12), frameMat); bfr.position.set(-12.5, 1.8, 9.26); scene.add(bfr);
    const bsign = new THREE.Mesh(new THREE.PlaneGeometry(3.2, .8), plate('PHOTOBOOTH', 384, 96, 44)); bsign.position.set(-12.5, 4.15, 9.18); bsign.rotation.y = Math.PI; scene.add(bsign);
    solidWalls.push({ x1: -16.2, z1: 9.2, x2: -8.8, z2: 9.2, th: .12 });

    // stage floor with 5 marked spots
    rug(-12.5, 7.0, 6.6, 3.8, 0x24242b, 0xc9a45c);
    const spotGeo = new THREE.RingGeometry(.26, .33, 24), spotMat = new THREE.MeshBasicMaterial({ color: 0xc9a45c });
    [[-14.4, 7.9], [-12.5, 7.9], [-10.6, 7.9], [-13.4, 6.2], [-11.6, 6.2]].forEach(([x, z]) => { const m = new THREE.Mesh(spotGeo, spotMat); m.rotation.x = -Math.PI / 2; m.position.set(x, .04, z); scene.add(m) });

    // softbox lights
    function softbox(x, z, ry) {
      const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry;
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, 2.2, 6), darkMat); pole.position.y = 1.1;
      const pan = new THREE.Mesh(new THREE.BoxGeometry(.9, .9, .08), new THREE.MeshBasicMaterial({ color: 0xfff6e0 })); pan.position.y = 2.1;
      const rim = new THREE.Mesh(new THREE.BoxGeometry(1, 1, .06), darkMat); rim.position.set(0, 2.1, -.05);
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, .03, 12), darkMat); foot.position.y = .015;
      g.add(pole, pan, rim, foot); scene.add(g); solidWalls.push({ x1: x, z1: z, x2: x, z2: z, th: .3 });
    }
    softbox(-16.2, 4.4, .96); softbox(-8.8, 4.4, -.96);

    // tripod + camera
    {
      const g = new THREE.Group(); g.position.set(-12.5, 0, 1.5);
      for (let i = 0; i < 3; i++) {
        const a = i * Math.PI * 2 / 3, l = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, 1.3, 6), darkMat);
        l.position.set(Math.cos(a) * .1, .65, Math.sin(a) * .1); l.rotation.set(-Math.sin(a) * .3, 0, Math.cos(a) * .3); g.add(l);
      }
      const body = new THREE.Mesh(new THREE.BoxGeometry(.28, .2, .2), darkMat); body.position.y = 1.42;
      const lens = new THREE.Mesh(new THREE.CylinderGeometry(.06, .07, .16, 12), new THREE.MeshLambertMaterial({ color: 0x333338 })); lens.rotation.x = Math.PI / 2; lens.position.set(0, 1.42, .17);
      const fl = new THREE.Mesh(new THREE.BoxGeometry(.08, .04, .06), new THREE.MeshBasicMaterial({ color: 0xfff1d6 })); fl.position.set(0, 1.55, 0);
      g.add(body, lens, fl); scene.add(g);
      solidWalls.push({ x1: -12.5, z1: 1.3, x2: -12.5, z2: 1.7, th: .45 }, { x1: LEOX, z1: LEOZ, x2: LEOX, z2: LEOZ, th: .35 });
    }

    // photographer NPC
    const leo = { g: makeAvatar('Leo · Photographer', 200, 'm', 7, { sk: 2, hr: 3, hu: 200 }), k: 0, ph: 0, tp: 0, em: null, wt: 0, greeted: false };
    leo.g.position.set(LEOX, 0, LEOZ); leo.g.rotation.y = Math.PI;

    // the fixed camera that takes the picture (about 80 degrees wide at any screen shape)
    const boothCam = new THREE.PerspectiveCamera(50, 1, .1, 60);
    boothCam.position.set(-12.5, 1.5, 2.0); boothCam.lookAt(-12.5, 1.15, 7.2);

    // my own avatar is only visible while the booth camera is active
    function showSelf(on) {
      if (on) {
        if (meAv) scene.remove(meAv);
        meAv = makeAvatar(myName, myLook.hu, myGen, seedOf(myId), myLook);
        meA = { g: meAv, k: 0, ph: 0, tp: 0, em: null, wt: 0, by: sy };
        meAv.position.set(px, 0, pz); meAv.rotation.y = 0;
      } else if (meAv) meAv.visible = false;
    }

    // ---- booth UI
    const chipCss = 'padding:7px 12px;border:0;border-radius:14px;font:600 12px system-ui,sans-serif;cursor:pointer;color:#fff;';
    const boothBtn = document.createElement('button'); boothBtn.type = 'button'; boothBtn.textContent = touch ? '📷 Photographer' : '📷 Photographer (Y)';
    boothBtn.style.cssText = 'position:fixed;left:50%;bottom:90px;transform:translateX(-50%);z-index:22;display:none;padding:10px 16px;border:0;border-radius:20px;background:#2e9e5b;color:#fff;font:600 14px system-ui,sans-serif;cursor:pointer';
    const bth = document.createElement('div');
    bth.style.cssText = 'position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:40;display:none;width:min(440px,94vw);max-height:80vh;overflow:auto;padding:14px;border-radius:16px;background:rgba(20,20,24,.95);color:#fff;font:14px/1.4 system-ui,sans-serif';
    bth.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;font-weight:700;margin-bottom:8px"><span>📷 Leo · Photographer</span><button id="bx" type="button" style="background:none;border:0;color:#fff;font-size:18px;cursor:pointer">✕</button></div>'
      + '<div id="bsay" style="padding:8px 10px;border-radius:10px;background:#33303a;margin-bottom:8px"></div><div id="bcnt" style="font-size:12px;margin-bottom:6px"></div>'
      + [['Timer', 'btm'], ['Photos', 'bsh'], ['Backdrop', 'bbg']].map(([l, id]) => '<div style="font-size:11px;opacity:.6;margin:6px 0 4px">' + l + '</div><div id="' + id + '" style="display:flex;flex-wrap:wrap;gap:6px"></div>').join('')
      + '<div style="display:flex;gap:8px;margin-top:12px"><button id="bcall" type="button" style="' + chipCss + 'background:#3a3740;flex:1;padding:10px">📣 Call group</button><button id="bgo" type="button" style="' + chipCss + 'background:#2e9e5b;flex:2;padding:10px;font-size:14px">📸 Start photo shoot</button></div>';
    const bcd = document.createElement('div');
    bcd.style.cssText = 'position:fixed;inset:0;z-index:38;display:none;align-items:center;justify-content:center;font:700 140px system-ui,sans-serif;color:#fff;text-shadow:0 4px 24px #000;pointer-events:none';
    const bcancel = document.createElement('button'); bcancel.type = 'button'; bcancel.textContent = '✕ Cancel';
    bcancel.style.cssText = 'position:fixed;top:16px;right:16px;z-index:39;display:none;padding:10px 16px;border:0;border-radius:20px;background:rgba(20,20,24,.85);color:#fff;font:600 14px system-ui,sans-serif;cursor:pointer';
    const bpv = document.createElement('div');
    bpv.style.cssText = 'position:fixed;inset:0;z-index:45;display:none;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,.85);padding:12px';
    bpv.innerHTML = '<img id="bpi" alt="Your photo" style="max-width:92vw;max-height:72vh;border-radius:8px;box-shadow:0 10px 40px #000"><div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;justify-content:center"><a id="bps" style="' + chipCss + 'background:#2e9e5b;text-decoration:none;padding:10px 16px;font-size:14px">⬇ Save</a><button id="bpr" type="button" style="' + chipCss + 'background:#3a3740;padding:10px 16px;font-size:14px">🔁 Retake</button><button id="bpc" type="button" style="' + chipCss + 'background:#3a3740;padding:10px 16px;font-size:14px">✕ Close</button></div>';
    document.body.append(boothBtn, bth, bcd, bcancel, bpv);
    const q = id => bth.querySelector('#' + id), qp = id => bpv.querySelector('#' + id);

    function chipRow(el, labels, get, set) {
      const bs = [], paint = () => bs.forEach((b, i) => b.style.background = i === get() ? '#8b78e6' : '#3a3740');
      labels.forEach((t, i) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.style.cssText = chipCss; b.onclick = () => { set(i); paint(); sfxPop() }; el.append(b); bs.push(b) });
      paint(); return paint;
    }
    chipRow(q('btm'), BT.map(s => s + 's'), () => bti, i => { bti = i });
    chipRow(q('bsh'), ['1 photo', '3-photo strip'], () => bni, i => { bni = i });
    const repBg = chipRow(q('bbg'), BGN, () => bgi, i => { bgi = i; paintBackdrop(i); if (room) room.emit('act', { k: 'bg', i }).catch(() => { }) });

    function openBooth() { if (boothOpen) return; boothOpen = true; document.exitPointerLock?.(); bth.style.display = 'block'; boothBtn.style.display = 'none'; leo.wt = performance.now(); sfxWelcome() }
    function closeBooth(relock = true) { boothOpen = false; bth.style.display = 'none'; sfxPop(); if (relock && !touch) cvs.requestPointerLock?.() }
    boothBtn.onclick = openBooth; q('bx').onclick = () => closeBooth();
    q('bcall').onclick = () => { const t = '📸 Photobooth time! Stand on the gold stage in the left wing, up to 5 fit.'; addChat(myName, t); if (room) room.emit('chat', { name: myName, text: t }).catch(() => { }) };
    q('bgo').onclick = () => boothGo();
    bcancel.onclick = () => { boothCancel = true; sfxCancel() };
    qp('bpc').onclick = () => { bpv.style.display = 'none'; sfxPop(); if (!touch) cvs.requestPointerLock?.() };
    qp('bpr').onclick = () => { bpv.style.display = 'none'; boothGo() };
    addEventListener('keydown', e => { if (started && e.code === 'KeyY' && !boothOpen && !boothBusy && !photoOn && document.activeElement.tagName !== 'INPUT' && boothNear()) { e.preventDefault(); openBooth() } });

    function showPreview(url) {
      qp('bpi').src = url; const a = qp('bps'); a.href = url; a.download = 'gallery-photobooth-' + Date.now() + '.jpg';
      sfxSuccess(); document.exitPointerLock?.(); bpv.style.display = 'flex';
    }

    // ---- shoot flow
    function boothGo() {
      if (boothBusy || !onStage(px, pz) || stageList().length > 5) return;
      if (room) room.emit('act', { k: 'shoot', t: BT[bti], n: BN[bni] }).catch(() => { });
      runBoothShoot(BT[bti], BN[bni]);
    }
    function capBooth() {
      renderer.render(scene, boothCam);
      const src = renderer.domElement, s = Math.min(1, 1280 / src.width), c = document.createElement('canvas');
      c.width = Math.round(src.width * s); c.height = Math.round(src.height * s);
      c.getContext('2d').drawImage(src, 0, 0, c.width, c.height); return c;
    }
    function composeBooth(fr) {
      const n = fr.length, pad = 28, w = n === 1 ? 1100 : 620, h = Math.round(w * fr[0].height / fr[0].width), cap = 96;
      const c = document.createElement('canvas'); c.width = w + pad * 2; c.height = n * h + (n + 1) * pad + cap;
      const x = c.getContext('2d'); x.fillStyle = '#f7f3ea'; x.fillRect(0, 0, c.width, c.height);
      fr.forEach((f, i) => x.drawImage(f, pad, pad + i * (h + pad), w, h));
      x.fillStyle = '#1d1a17'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.font = '600 ' + (n === 1 ? 34 : 26) + 'px Georgia, serif'; x.fillText('The Gallery · Photobooth · ' + new Date().toLocaleDateString(), c.width / 2, c.height - cap * .64);
      x.font = 'italic ' + (n === 1 ? 26 : 20) + 'px Georgia, serif'; x.fillText(stageList().slice(0, 5).join(', '), c.width / 2, c.height - cap * .26, c.width - pad * 2);
      return c.toDataURL('image/jpeg', .92);
    }
    function endBooth() {
      boothBusy = false; boothView = false; if (meAv) meAv.visible = false;
      document.body.classList.remove('photo'); if (touch) stick.style.display = 'block';
      bcd.style.display = 'none'; bcancel.style.display = 'none';
    }
    async function runBoothShoot(t, shots) {
      if (boothBusy || !started || evBusy || photoOn) return;
      boothBusy = true; boothCancel = false; closeBooth(false); bpv.style.display = 'none';
      document.exitPointerLock?.(); for (const k in keys) keys[k] = false;
      sitting = false; if (emote === 'sit') emote = null;
      yaw = 0; pitch = 0; setPresence(true);                       // everyone faces the camera
      sfxWhoosh(); showSelf(true); boothView = true; leo.wt = performance.now();
      document.body.classList.add('photo'); stick.style.display = 'none'; bcancel.style.display = 'block';
      const frames = [];
      for (let s = 0; s < shots && !boothCancel; s++) {
        for (let i = s ? 2 : t; i > 0 && !boothCancel; i--) { bcd.style.display = 'flex'; bcd.textContent = i; sfxBeep(i === 1); await wait(1000) }
        if (boothCancel) break;
        bcd.style.display = 'none'; await wait(60);
        frames.push(capBooth()); sfxShutter();
        const fl = document.createElement('div'); fl.style.cssText = 'position:fixed;inset:0;background:#fff;opacity:.9;z-index:41;transition:opacity .5s;pointer-events:none';
        document.body.append(fl); requestAnimationFrame(() => fl.style.opacity = '0'); setTimeout(() => fl.remove(), 600);
        await wait(500);
      }
      const url = !boothCancel && frames.length ? composeBooth(frames) : null;
      endBooth(); if (url) showPreview(url);
    }

    // photo events from other players
    room.on('act', m => {
      if (m.sameTab) return;
      const d = m.data || {}, sp = lastPeers.find(p => p.peer === m.peer)?.presence;
      if (!sp || (sp.r || 0) !== myRoom) return;
      if (d.k === 'bg') { const i = +d.i; if (Number.isInteger(i) && i >= 0 && i < BGN.length && i !== bgi) { bgi = i; paintBackdrop(i); repBg() } }
      if (d.k === 'shoot' && onStage(sp.x, sp.z) && onStage(px, pz)) runBoothShoot(BT.includes(+d.t) ? +d.t : 5, BN.includes(+d.n) ? +d.n : 1);
    });

    function boothTick(dt) {
      const dl = Math.hypot(px - LEOX, pz - LEOZ);
      const os = started && onStage(px, pz); if (os !== boothWas) { boothWas = os; if (os) sfxStage() }
      if (dl < 30) {
        const a = Math.atan2(-(px - LEOX), -(pz - LEOZ)), off = Math.atan2(Math.sin(a - Math.PI), Math.cos(a - Math.PI));
        const want = Math.PI + (dl < 7 && !boothBusy ? Math.max(-1, Math.min(1, off)) : 0);
        leo.g.rotation.y += Math.atan2(Math.sin(want - leo.g.rotation.y), Math.cos(want - leo.g.rotation.y)) * Math.min(1, dt * 4);
        animate(leo, dt);
      }
      if (started && dl < 6 && !leo.greeted) { leo.greeted = true; leo.wt = performance.now() }
      if (dl > 10) leo.greeted = false;
      boothBtn.style.display = started && !boothOpen && !boothBusy && !photoOn && boothNear() ? 'block' : 'none';
      if (boothOpen) {
        if (!boothNear()) closeBooth(false);
        bT += dt;
        if (bT > .3) {
          bT = 0; const n = stageList().length, me = onStage(px, pz);
          q('bcnt').textContent = 'On stage: ' + n + ' / 5'; q('bcnt').style.color = n > 5 ? '#ff8a8a' : '#c9f5d4';
          q('bsay').textContent = !me ? 'Step onto the gold stage, up to 5 can fit!' : n > 5 ? 'That is a crowd! Only 5 fit in the frame, please step off.' : n === 1 ? 'Shoot solo, or use "Call group" to invite friends.' : 'Looking great, ' + n + ' of you! Pick a timer and press start.';
        }
      }
      if (boothBusy && meAv) {
        yaw = 0; pitch = 0; meAv.position.x = px; meAv.position.z = pz; meAv.rotation.y = 0; meA.by = sy; meA.em = emote; animate(meA, dt);
      }
      if (boothView) {
        const as = innerWidth / innerHeight;
        if (Math.abs(boothCam.aspect - as) > .001) { boothCam.aspect = as; boothCam.fov = Math.min(100, 2 * Math.atan(Math.tan(40 * Math.PI / 180) / as) * 180 / Math.PI); boothCam.updateProjectionMatrix() }
      }
    }

    // ================= HUB: items, friends, DMs, artists, paint contest =================
    const lsGet = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v } catch (e) { return d } };
    const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) { } };
    function lookObj() { return { g: myGen, sk: myLook.sk, hr: myLook.hr, hu: myLook.hu, hs: myLook.hs, ht: myLook.ht, gl: myLook.gl, bg: myLook.bg } }
    function stats() { return lsGet('gstats', {}) }
    function stat(k, n = 1) { const s = stats(); s[k] = (s[k] || 0) + n; lsSet('gstats', s) }
    function statSet(k, v) { const s = stats(); s[k] = Math.max(s[k] || 0, v); lsSet('gstats', s) }
    const STL = { vis: 'visits', emo: 'reactions', up: 'uploads', st: 'contests', fr: 'friends' };
    // [key, label, [name, unlockStat, unlockCount]...]
    const CAT = [
      ['hs', 'Hair style', [['Classic'], ['Ponytail'], ['Buns', 'vis', 3], ['Curls', 'emo', 10], ['Top knot', 'up', 2]]],
      ['ht', 'Hat', [['None'], ['Cap', 'vis', 2], ['Beanie', 'emo', 5], ['Top hat', 'up', 3], ['Crown', 'st', 2]]],
      ['gl', 'Glasses', [['None'], ['Round'], ['Shades', 'vis', 4], ['Gold', 'fr', 1]]],
      ['bg', 'Bag', [['None'], ['Backpack'], ['Satchel', 'up', 1], ['Tote', 'emo', 20]]]
    ];
    const have = it => !it[1] || (stats()[it[1]] || 0) >= it[2];

    const mkb = (t, css, fn) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.style.cssText = 'border:0;border-radius:12px;padding:7px 11px;font:600 12px system-ui,sans-serif;cursor:pointer;color:#fff;background:#3a3740;' + (css || ''); if (fn) b.onclick = fn; return b };
    const mke = (tag, css, t) => { const e = document.createElement(tag); if (css) e.style.cssText = css; if (t != null) e.textContent = t; return e };
    const hcss = document.createElement('style'); hcss.textContent = 'body.menu #hubB,body.photo #hubB{display:none!important}'; document.head.append(hcss);
    const hubB = mkb('☰ Hub', 'position:fixed;left:10px;top:56px;z-index:21;display:none;background:rgba(20,20,24,.85);padding:9px 13px;border-radius:18px;font-size:13px', () => openHub()); hubB.id = 'hubB';
    const hubP = mke('div', 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:41;display:none;width:min(430px,94vw);max-height:82vh;overflow:auto;padding:14px;border-radius:16px;background:rgba(20,20,24,.97);color:#fff;font:14px/1.4 system-ui,sans-serif');
    let hubTab = 'avatar', hubOn = false, dmWith = null; const dms = {}, unread = {};
    function hubClose() { hubOn = false; hubP.style.display = 'none'; if (!touch && started && !stOpen) cvs.requestPointerLock?.() }
    function openHub(t) { if (t) hubTab = t; if (!hubOn) { document.exitPointerLock?.(); for (const k in keys) keys[k] = false } hubOn = true; hubP.style.display = 'block'; renderHub() }
    function saveLook() { lsSet('glook', myLook); if (me) api('/api/profile', { method: 'POST', body: JSON.stringify({ look: lookObj() }) }).catch(() => { }); setPresence(true) }
    function renderHub() {
      hubP.innerHTML = '';
      const bar = mke('div', 'display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px'), nUn = Object.values(unread).reduce((a, b) => a + b, 0);
      [['avatar', '🧍 Avatar'], ['people', '👥 People'], ['msg', '✉ Messages' + (nUn ? ' (' + nUn + ')' : '')], ['artists', '🎨 Artists'], ['studio', '🖌 Contest']]
        .forEach(([k, l]) => bar.append(mkb(l, 'background:' + (hubTab === k ? '#8b78e6' : '#3a3740'), () => { hubTab = k; if (k !== 'msg') dmWith = null; renderHub() })));
      bar.append(mkb('✕', 'background:none;margin-left:auto;font-size:16px', hubClose)); hubP.append(bar);
      const body = mke('div'); hubP.append(body);
      ({ avatar: hubAvatar, people: hubPeople, msg: hubMsg, artists: hubArtists, studio: hubStudio })[hubTab](body);
    }
    function hubAvatar(b) {
      const s = stats(); b.append(mke('div', 'font-size:12px;opacity:.7;margin-bottom:4px', Object.keys(STL).map(k => STL[k] + ': ' + (s[k] || 0)).join(' · ')));
      for (const [k, lab, items] of CAT) {
        b.append(mke('div', 'font-size:11px;opacity:.6;margin:10px 0 4px', lab));
        const row = mke('div', 'display:flex;flex-wrap:wrap;gap:6px');
        items.forEach((it, i) => { const can = have(it); row.append(mkb((can ? '' : '🔒 ') + it[0] + (can ? '' : ' · ' + it[2] + ' ' + STL[it[1]]), 'background:' + (myLook[k] === i ? '#8b78e6' : '#3a3740') + (can ? '' : ';opacity:.55'), () => { if (!can) return; myLook[k] = i; saveLook(); renderHub() })) });
        b.append(row);
      }
      b.append(mke('div', 'font-size:11px;opacity:.6;margin-top:10px', 'Items unlock as you visit, react, upload art, finish contests and add friends. Others see your look live.'));
    }
    function onlinePeers() { return lastPeers.filter(p => !p.sameTab && p.presence && p.presence.x != null).map(p => ({ id: p.peer, name: String(p.presence.name || 'Guest').slice(0, 18), room: (p.presence.r || 0) + 1, st: !!p.presence.st })) }
    function toggleFriend(n) { const l = lsGet('gfriends', []), i = l.indexOf(n); if (i >= 0) l.splice(i, 1); else l.push(n); lsSet('gfriends', l); statSet('fr', l.length) }
    function hubPeople(b) {
      const fr = lsGet('gfriends', []), on = onlinePeers();
      const row = (name, sub, btns) => { const r = mke('div', 'display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #fff1'), i = mke('div', 'flex:1;min-width:0'); i.append(mke('div', 'font-weight:700', name), mke('div', 'font-size:11px;opacity:.6', sub)); r.append(i, ...btns); return r };
      const dm = n => mkb('💬', '', () => { dmWith = n; hubTab = 'msg'; renderHub() });
      b.append(mke('div', 'font-size:11px;opacity:.6;margin-bottom:4px', 'FRIENDS'));
      if (!fr.length) b.append(mke('div', 'opacity:.6;font-size:13px', 'Press ☆ next to someone to add them.'));
      for (const n of fr) { const o = on.find(p => p.name === n); b.append(row(n, o ? '🟢 online · Room ' + o.room + (o.st ? ' · 🎨 in contest' : '') : '⚪ offline', [dm(n), mkb('★', 'background:#c9a45c', () => { toggleFriend(n); renderHub() })])) }
      b.append(mke('div', 'font-size:11px;opacity:.6;margin:12px 0 4px', 'ONLINE NOW (' + on.length + ')'));
      if (!on.length) b.append(mke('div', 'opacity:.6;font-size:13px', 'Nobody else is here yet.'));
      for (const o of on) b.append(row(o.name, 'Room ' + o.room + (o.st ? ' · 🎨 in contest' : ''), [dm(o.name), mkb(fr.includes(o.name) ? '★' : '☆', '', () => { toggleFriend(o.name); renderHub() })]));
    }
    function sendDm(name, text) {
      (dms[name] = dms[name] || []).push({ me: true, text });
      const p = lastPeers.find(q => !q.sameTab && q.presence && String(q.presence.name || '').slice(0, 18) === name);
      if (!p) { dms[name].push({ me: false, text: '⚠ ' + name + ' is offline, message not delivered.' }); return }
      wsend({ t: 'rtc', to: p.peer, data: { dm: { name: myName, text: text.slice(0, 300) } } });   // rides the existing private "to:" relay
    }
    handlers.rtc.push(m => {
      const d = m.data && m.data.dm; if (!d || m.sameTab) return;
      const name = String(d.name || 'Guest').slice(0, 18), text = String(d.text || '').slice(0, 300); if (!text) return;
      (dms[name] = dms[name] || []).push({ me: false, text }); if (!(hubOn && hubTab === 'msg' && dmWith === name)) unread[name] = (unread[name] || 0) + 1;
      sfxPop(); addChat('✉ ' + name, text); if (hubOn && hubTab === 'msg') renderHub();
    });
    function hubMsg(b) {
      if (!dmWith) {
        const names = Object.keys(dms); if (!names.length) b.append(mke('div', 'opacity:.7', 'No conversations yet. Open People and press 💬.'));
        for (const n of names) b.append(mkb(n + (unread[n] ? ' (' + unread[n] + ' new)' : ''), 'display:block;width:100%;text-align:left;margin-bottom:6px', () => { dmWith = n; renderHub() })); return;
      }
      unread[dmWith] = 0;
      b.append(mkb('← Back', 'margin-bottom:8px', () => { dmWith = null; renderHub() }), mke('div', 'font-weight:700;margin:4px 0', dmWith));
      const log = mke('div', 'display:flex;flex-direction:column;gap:6px;max-height:36vh;overflow:auto;margin-bottom:8px');
      for (const m of dms[dmWith] || []) log.append(mke('div', 'padding:7px 10px;border-radius:10px;max-width:85%;' + (m.me ? 'align-self:flex-end;background:#8b78e6' : 'background:#33303a'), m.text));
      const inp = mke('input', 'width:100%;box-sizing:border-box;padding:10px;border-radius:10px;border:0;background:#2a2830;color:#fff;font:14px system-ui'); inp.placeholder = 'Message ' + dmWith + '…'; inp.maxLength = 300;
      inp.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter' && inp.value.trim()) { sendDm(dmWith, inp.value.trim()); renderHub(); hubP.querySelector('input')?.focus() } });
      inp.addEventListener('keyup', e => e.stopPropagation());
      b.append(log, inp); log.scrollTop = log.scrollHeight;
    }
    // ---- follow artists
    function toggleFollow(a) { const f = lsGet('gfollow', []), i = f.indexOf(a); if (i >= 0) f.splice(i, 1); else f.push(a); lsSet('gfollow', f); addChat('Gallery', (i >= 0 ? 'Unfollowed ' : '⭐ Following ') + a) }
    addEventListener('keydown', e => { if (started && e.code === 'KeyK' && looking && looking.artist && document.activeElement.tagName !== 'INPUT') toggleFollow(looking.artist) });
    let seenIds = null;
    function notifyNew() {
      const f = lsGet('gfollow', []);
      if (seenIds) for (const p of paintings) if (!seenIds.has(p.id) && p.artist && f.includes(p.artist) && p.owner !== myId) { addChat('Gallery', '🎨 New work by ' + p.artist + ': ' + (p.title || 'Untitled')); sfxDing() }
      seenIds = new Set(paintings.map(p => p.id));
    }
    function hubArtists(b) {
      const f = lsGet('gfollow', []), cnt = {}; for (const p of paintings) if (p.artist) cnt[p.artist] = (cnt[p.artist] || 0) + 1;
      const names = Object.keys(cnt).sort((a, c) => (f.includes(c) - f.includes(a)) || cnt[c] - cnt[a]);
      b.append(mke('div', 'font-size:12px;opacity:.7;margin-bottom:6px', 'Look at a painting and press K to follow its artist. You get a notice when they add new work.'));
      if (!names.length) b.append(mke('div', 'opacity:.6', 'No artists yet.'));
      for (const n of names) {
        const r = mke('div', 'display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #fff1'), i = mke('div', 'flex:1'); i.append(mke('div', 'font-weight:700', n), mke('div', 'font-size:11px;opacity:.6', cnt[n] + ' painting' + (cnt[n] > 1 ? 's' : '')));
        r.append(i, mkb(f.includes(n) ? 'Following ✓' : 'Follow', f.includes(n) ? 'background:#c9a45c' : '', () => { toggleFollow(n); renderHub() })); b.append(r);
      }
    }
    // friends coming online
    let frSeen = new Set();
    setInterval(() => { const fr = lsGet('gfriends', []), now = new Set(onlinePeers().map(p => p.name).filter(n => fr.includes(n))); if (started) for (const n of now) if (!frSeen.has(n)) addChat('Gallery', '⭐ ' + n + ' is online'); frSeen = now }, 2500);
    setInterval(() => { hubB.style.display = started && !stOpen ? 'block' : 'none'; hubB.textContent = '☰ Hub' + (Object.values(unread).some(v => v) ? ' •' : '') }, 500);

    // ================= PAINT CONTEST STUDIO (up to 4 players, 2x2 grid, timer, optional upload) =================
    const ST_ID = 'contest1', STW = 640, STH = 480, STT = 120;
    let stOpen = false, stIds = [], stRun = false, stEnd = 0, stBuf = [], stDraw = false, stColor = '#222222', stSize = 12, stResOpen = false, stTool = 'brush', stFillOn = false, stLaid = -2;
    const stView = { s: 1, x: 0, y: 0 };
    const stCv = [], stCx = [], stNm = [], stCell = [], stPan = [];
    const stEl = mke('div', 'position:fixed;inset:0;z-index:50;display:none;flex-direction:column;align-items:center;gap:6px;padding:8px;background:rgba(15,14,18,.97);color:#fff;font:600 14px system-ui,sans-serif;overflow:auto');
    const stInfo = mke('div', 'font-size:13px;text-align:center;min-height:18px');
    const stStart = mkb('▶ Start round (2:00)', 'background:#2e9e5b;padding:9px 14px;font-size:13px', null);
    const stTop = mke('div', 'display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:center'); stTop.append(mke('b', 'font-size:16px', '🎨 Paint Contest'), stStart, mkb('✕ Leave', '', () => closeStudio()));
    const stW = 'min(96vw,calc(100vh - 240px))';
    const stMain = mke('div', 'position:relative;width:' + stW + ';aspect-ratio:4/3;overflow:hidden;border-radius:8px;flex-shrink:0');
    const stRow = mke('div', 'display:grid;grid-template-columns:repeat(3,1fr);gap:6px;width:' + stW + ';flex-shrink:0');
    for (let i = 0; i < 4; i++) {
      const cell = mke('div', 'position:relative;background:#fff;border-radius:8px;overflow:hidden;width:100%;aspect-ratio:4/3;touch-action:none');
      const pan = mke('div', 'position:absolute;left:0;top:0;width:100%;height:100%;transform-origin:0 0');
      const c = document.createElement('canvas'); c.width = STW; c.height = STH; c.style.cssText = 'width:100%;height:100%;display:block;touch-action:none;cursor:crosshair';
      const x = c.getContext('2d'); x.lineCap = x.lineJoin = 'round'; x.fillStyle = '#fff'; x.fillRect(0, 0, STW, STH);
      const nm = mke('div', 'position:absolute;left:6px;top:4px;font:700 11px system-ui;color:#fff;background:rgba(0,0,0,.55);padding:2px 7px;border-radius:8px;pointer-events:none', 'Slot ' + (i + 1));
      pan.append(c); cell.append(pan, nm); stCv.push(c); stCx.push(x); stNm.push(nm); stCell.push(cell); stPan.push(pan);
    }
    // toolbar
    const stBtns = {}, stTools = mke('div', 'display:flex;flex-wrap:wrap;gap:5px;align-items:center;justify-content:center;max-width:min(96vw,900px)');
    [['brush', '🖌 Brush'], ['pencil', '✏️ Pencil'], ['marker', '🖍 Marker'], ['spray', '💨 Spray'], ['eraser', '🧽 Eraser'], ['line', '╱ Line'], ['rect', '▭ Rect'], ['ellipse', '◯ Circle'], ['fill', '🪣 Fill'], ['pick', '💧 Pick'], ['pan', '✋ Pan']]
      .forEach(([k, l]) => { const b = mkb(l, 'padding:6px 9px', () => { stTool = k; stSyncUI() }); stBtns[k] = b; stTools.append(b) });
    const stFillB = mkb('', 'padding:6px 9px', () => { stFillOn = !stFillOn; stSyncUI() });
    const stCol = mke('input', 'width:34px;height:30px;border:0;padding:0;background:none;cursor:pointer'); stCol.type = 'color'; stCol.oninput = () => { stColor = stCol.value };
    const stSz = mke('input', 'width:100px'); stSz.type = 'range'; stSz.min = 1; stSz.max = 60; stSz.value = stSize; stSz.oninput = () => { stSize = +stSz.value; stSyncUI() };
    const stSzL = mke('span', 'font-size:12px;min-width:22px'), stZl = mke('span', 'font-size:12px;min-width:40px;text-align:center', '100%');
    const stSw = mke('div', 'display:flex;gap:4px;align-items:center');
    ['#222222', '#ffffff', '#e63946', '#f4a261', '#f1c40f', '#2a9d8f', '#3a86ff', '#8b78e6', '#ff77a8', '#8d5a3c'].forEach(c => { const b = mke('button', 'width:24px;height:24px;border-radius:50%;border:2px solid #fff6;background:' + c + ';cursor:pointer;padding:0'); b.type = 'button'; b.onclick = () => { stColor = c; if (stTool === 'eraser' || stTool === 'pick' || stTool === 'pan') stTool = 'brush'; stSyncUI() }; stSw.append(b) });
    const stMid = mke('div', 'display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:center');
    stMid.append(stSw, stCol, mke('span', 'font-size:12px;opacity:.7', 'Size'), stSz, stSzL, stFillB,
      mkb('−', 'padding:6px 11px', () => stZoomAt(1 / 1.3, stMain.clientWidth / 2, stMain.clientHeight / 2)), stZl,
      mkb('+', 'padding:6px 11px', () => stZoomAt(1.3, stMain.clientWidth / 2, stMain.clientHeight / 2)),
      mkb('Fit', 'padding:6px 9px', () => { stView.s = 1; stView.x = stView.y = 0; stApplyView() }),
      mkb('Clear mine', 'padding:6px 9px', () => { const i = stMySlot(); if (stRun && i >= 0) { stWipe(i); if (room) room.emit('act', { k: 'sx' }).catch(() => { }) } }));
    stTools.append(stMid);
    function stSyncUI() { for (const k in stBtns) stBtns[k].style.background = k === stTool ? '#8b78e6' : '#3a3740'; stCol.value = stColor; stSzL.textContent = stSize; stFillB.textContent = stFillOn ? 'Shapes: filled' : 'Shapes: outline'; stMain.style.cursor = stTool === 'pan' ? 'grab' : '' }
    // zoom + pan (my canvas only)
    function stClampView() { const W = stMain.clientWidth, Hh = stMain.clientHeight; stView.s = Math.min(8, Math.max(1, stView.s)); stView.x = Math.min(0, Math.max(W * (1 - stView.s), stView.x)); stView.y = Math.min(0, Math.max(Hh * (1 - stView.s), stView.y)) }
    function stApplyView() { stClampView(); const m = mySeat >= 0 ? mySeat : 0; stPan.forEach((p, i) => { p.style.transform = i === m ? `translate(${stView.x}px,${stView.y}px) scale(${stView.s})` : 'none' }); stZl.textContent = Math.round(stView.s * 100) + '%' }
    function stZoomAt(f, cx, cy) { const o = stView.s, n = Math.min(8, Math.max(1, o * f)); stView.x = cx - (cx - stView.x) * (n / o); stView.y = cy - (cy - stView.y) * (n / o); stView.s = n; stApplyView() }
    stMain.addEventListener('wheel', e => { e.preventDefault(); const r = stMain.getBoundingClientRect(); stZoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - r.left, e.clientY - r.top) }, { passive: false });
    stMain.addEventListener('contextmenu', e => e.preventDefault());
    let stPn = null;
    stMain.addEventListener('pointerdown', e => { if (stTool === 'pan' || e.button === 1 || e.button === 2) { e.preventDefault(); stPn = { x: e.clientX, y: e.clientY }; stMain.setPointerCapture(e.pointerId) } });
    stMain.addEventListener('pointermove', e => { if (!stPn) return; stView.x += e.clientX - stPn.x; stView.y += e.clientY - stPn.y; stPn = { x: e.clientX, y: e.clientY }; stApplyView() });
    for (const ev of ['pointerup', 'pointercancel']) stMain.addEventListener(ev, () => { stPn = null });
    function stLayout() {        // my canvas large on top, the others small below
      const m = mySeat >= 0 ? mySeat : 0; if (m === stLaid) return; stLaid = m;
      stMain.innerHTML = ''; stRow.innerHTML = '';
      stCell.forEach((c, i) => (i === m ? stMain : stRow).append(c));
      stView.s = 1; stView.x = stView.y = 0; stApplyView();
    }
    const stRes = mke('div', 'position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:rgba(0,0,0,.92);padding:12px;z-index:2');
    stEl.append(stTop, stInfo, stTools, stMain, stRow, stRes); document.body.append(hubB, hubP, stEl); stSyncUI();

    function stSlots() { const a = [null, null, null, null], now = performance.now(); if (mySeat >= 0) a[mySeat] = wsId; for (const [id, s] of seatReg) { if (now - s.t > 3500) { seatReg.delete(id); continue } if (s.r === myRoom && id !== wsId && !a[s.i]) a[s.i] = id } return a }
    function stMembers() { return stSlots().filter(Boolean).sort() }
    function nameOf(id) { if (id === wsId) return myName; const p = lastPeers.find(q => q.peer === id); return String(p && p.presence && p.presence.name || (seatReg.get(id) || {}).n || 'Guest').slice(0, 18) }
    function stMySlot() { return stIds.indexOf(wsId) }
    function stWipe(i) { stCx[i].fillStyle = '#fff'; stCx[i].fillRect(0, 0, STW, STH) }
    // ---- drawing engine: every action is one small array so it syncs to the other players
    const COL = /^#[0-9a-f]{6}$/i, num = v => Number.isFinite(v);
    function stFloodFill(i, sx, sy, col) {
      sx |= 0; sy |= 0; if (sx < 0 || sy < 0 || sx >= STW || sy >= STH) return;
      const c = stCx[i], img = c.getImageData(0, 0, STW, STH), d = img.data, r = parseInt(col.slice(1, 3), 16), g = parseInt(col.slice(3, 5), 16), b = parseInt(col.slice(5, 7), 16);
      const k = (sy * STW + sx) * 4, tr = d[k], tg = d[k + 1], tb = d[k + 2], tol = 40;
      if (Math.abs(tr - r) + Math.abs(tg - g) + Math.abs(tb - b) < tol) return;
      const match = j => Math.abs(d[j] - tr) + Math.abs(d[j + 1] - tg) + Math.abs(d[j + 2] - tb) < tol, st = [sx, sy];
      while (st.length) {
        let y = st.pop(), x = st.pop(), j = (y * STW + x) * 4, up = false, dn = false;
        while (x >= 0 && match(j)) { x--; j -= 4 } x++; j += 4;
        while (x < STW && match(j)) {
          d[j] = r; d[j + 1] = g; d[j + 2] = b; d[j + 3] = 255;
          if (y > 0) { const m = match(j - STW * 4); if (m && !up) { st.push(x, y - 1); up = true } else if (!m) up = false }
          if (y < STH - 1) { const m = match(j + STW * 4); if (m && !dn) { st.push(x, y + 1); dn = true } else if (!m) dn = false }
          x++; j += 4;
        }
      }
      c.putImageData(img, 0, 0);
    }
    function stApply(i, it) {
      const x = stCx[i]; if (!x || !Array.isArray(it) || it.length > 10) return; const o = it[0];
      if (o === 's' || o === 'r' || o === 'o') {          // segment, rectangle, ellipse
        const [, a, b, c, d, col, w, al, fl] = it; if (![a, b, c, d, w, al].every(num) || !COL.test(col)) return;
        x.save(); x.globalAlpha = Math.min(1, Math.max(.05, al)); x.lineWidth = Math.min(80, Math.max(1, w)); x.strokeStyle = x.fillStyle = col; x.lineCap = x.lineJoin = 'round'; x.beginPath();
        if (o === 's') { x.moveTo(a, b); x.lineTo(c, d); x.stroke() }
        else if (o === 'r') { const rx = Math.min(a, c), ry = Math.min(b, d), rw = Math.abs(c - a), rh = Math.abs(d - b); fl ? x.fillRect(rx, ry, rw, rh) : x.strokeRect(rx, ry, rw, rh) }
        else { x.ellipse((a + c) / 2, (b + d) / 2, Math.abs(c - a) / 2 + .01, Math.abs(d - b) / 2 + .01, 0, 0, 7); fl ? x.fill() : x.stroke() }
        x.restore();
      } else if (o === 'y') {                            // spray
        const [, a, b, col, w, seed] = it; if (![a, b, w, seed].every(num) || !COL.test(col)) return;
        let sd = (seed | 0) || 1; const rnd = () => (sd = (Math.imul(sd, 1664525) + 1013904223) >>> 0) / 4294967296, rr = Math.min(80, Math.max(2, w));
        x.save(); x.fillStyle = col; x.globalAlpha = .85; for (let k = 0; k < 22; k++) { const an = rnd() * 6.283, r = Math.sqrt(rnd()) * rr; x.fillRect(a + Math.cos(an) * r, b + Math.sin(an) * r, 2, 2) } x.restore();
      } else if (o === 'f') { const [, a, b, col] = it; if (num(a) && num(b) && COL.test(col)) stFloodFill(i, a, b, col) }
    }
    function stDo(i, it) { stApply(i, it); stBuf.push(it) }
    const SHAPES = ['line', 'rect', 'ellipse'];
    function stFree(i, a, b) {
      const t = stTool, S = stSize;
      if (t === 'brush') stDo(i, ['s', a[0], a[1], b[0], b[1], stColor, S, 1]);
      else if (t === 'pencil') stDo(i, ['s', a[0], a[1], b[0], b[1], stColor, Math.max(1, S / 4), 1]);
      else if (t === 'marker') stDo(i, ['s', a[0], a[1], b[0], b[1], stColor, S * 1.6, .35]);
      else if (t === 'eraser') stDo(i, ['s', a[0], a[1], b[0], b[1], '#ffffff', S * 1.5, 1]);
      else if (t === 'spray') stDo(i, ['y', b[0], b[1], stColor, S * 2, (Math.random() * 1e9) | 0]);
    }
    const stShape = (a, b) => stTool === 'line' ? ['s', a[0], a[1], b[0], b[1], stColor, stSize, 1] : [stTool === 'rect' ? 'r' : 'o', a[0], a[1], b[0], b[1], stColor, stSize, 1, stFillOn ? 1 : 0];
    stCv.forEach((c, i) => {
      let last = null, start = null, snap = null; const pos = e => { const r = c.getBoundingClientRect(); return [Math.round((e.clientX - r.left) / r.width * STW), Math.round((e.clientY - r.top) / r.height * STH)] };
      c.addEventListener('pointerdown', e => {
        if (!stRun || i !== stMySlot() || e.button !== 0 || stTool === 'pan') return; e.preventDefault(); const p = pos(e); last = start = p;
        if (stTool === 'pick') { const d = stCx[i].getImageData(Math.max(0, Math.min(STW - 1, p[0])), Math.max(0, Math.min(STH - 1, p[1])), 1, 1).data; stColor = '#' + [d[0], d[1], d[2]].map(v => v.toString(16).padStart(2, '0')).join(''); stTool = 'brush'; stSyncUI(); return }
        if (stTool === 'fill') { stDo(i, ['f', p[0], p[1], stColor]); return }
        c.setPointerCapture(e.pointerId); stDraw = true;
        if (SHAPES.includes(stTool)) snap = stCx[i].getImageData(0, 0, STW, STH); else stFree(i, p, p);
      });
      c.addEventListener('pointermove', e => {
        if (!stDraw || !stRun || i !== stMySlot()) return; const p = pos(e);
        if (snap) { stCx[i].putImageData(snap, 0, 0); stApply(i, stShape(start, p)) } else stFree(i, last, p);   // shapes preview locally, sent on release
        last = p;
      });
      const up = () => { if (stDraw && snap) { stCx[i].putImageData(snap, 0, 0); stDo(i, stShape(start, last)) } stDraw = false; snap = null };
      for (const ev of ['pointerup', 'pointercancel']) c.addEventListener(ev, up);
    });
    setInterval(() => { if (stBuf.length && room) room.emit('act', { k: 'sd', g: stBuf.splice(0, 60) }).catch(() => { }) }, 70);
    addEventListener('keydown', e => { if (stOpen && e.target.tagName !== 'INPUT') e.stopImmediatePropagation() }, true);
    addEventListener('keyup', e => { if (stOpen && e.target.tagName !== 'INPUT') e.stopImmediatePropagation() }, true);

    function openStudio() {
      if (!started || !wsId) { addChat('Gallery', 'Still connecting, try again in a moment.'); return } if (stOpen) return;
      hubClose(); document.exitPointerLock?.(); for (const k in keys) keys[k] = false;
      myStudio = ST_ID; stOpen = true; stRun = false; stIds = []; stResOpen = false; stRes.style.display = 'none';
      for (let i = 0; i < 4; i++) { stWipe(i); stNm[i].textContent = 'Slot ' + (i + 1) } stEl.style.display = 'flex'; setPresence(true); stLayout();
    }
    function closeStudio() { if (mySeat >= 0) { standUp(); return } stOpen = false; stRun = false; stDraw = false; myStudio = ''; stEl.style.display = 'none'; stRes.style.display = 'none'; setPresence(true); if (!touch) cvs.requestPointerLock?.() }
    function stBegin(ids, t) {
      stIds = ids; stRun = true; stResOpen = false; stRes.style.display = 'none'; stEnd = performance.now() + t * 1000;
      for (let i = 0; i < 4; i++) { stWipe(i); stNm[i].textContent = ids[i] ? nameOf(ids[i]) : '(empty)' } stStart.style.display = 'none'; sfxWelcome();
    }
    stStart.onclick = () => { const ids = stSlots(), mem = ids.filter(Boolean).sort(); if (!mem.length || mem[0] !== wsId) return; if (room) room.emit('act', { k: 'sgo', ids }).catch(() => { }); stBegin(ids, STT) };
    const seatReg = new Map();   // peerId -> { i, r, n, t }
    function seatBeat() { if (room && mySeat >= 0) room.emit('act', { k: 'seat', i: mySeat, r: myRoom, n: myName }).catch(() => { }) }
    setInterval(seatBeat, 1000);
    room.on('act', m => {
      if (m.sameTab) return; const d = m.data || {};
      if (d.k === 'seat') { if (ok(+d.i, 4)) seatReg.set(m.peer, { i: +d.i, r: +d.r || 0, n: String(d.n || 'Guest').slice(0, 18), t: performance.now() }); else seatReg.delete(m.peer); return }
      if (!stOpen || !seatReg.has(m.peer)) return;
      if (d.k === 'sgo') { if (stRun || !Array.isArray(d.ids)) return; const ids = d.ids.slice(0, 4).map(x => typeof x === 'string' ? x : null); if (ids.filter(Boolean).sort()[0] === m.peer) stBegin(ids, STT) }   // only the host (lowest id) can start
      else if (d.k === 'sd' && stRun) {
        const i = stIds.indexOf(m.peer); if (i < 0 || !Array.isArray(d.g)) return;
        for (const s of d.g.slice(0, 60)) stApply(i, s);
      } else if (d.k === 'sx') { const i = stIds.indexOf(m.peer); if (i >= 0) stWipe(i) }
    });
    setInterval(() => {
      if (!stOpen) return; stLayout(); const mem = stMembers(), host = mem[0] === wsId;
      if (stRun) {
        const s = Math.max(0, Math.ceil((stEnd - performance.now()) / 1000));
        stInfo.textContent = '⏱ ' + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0') + (stMySlot() < 0 ? ' · spectating' : ' · draw in your green square');
        if (s <= 0) stFinish();
      } else if (!stResOpen) {
        stInfo.textContent = 'Players (' + Math.min(4, mem.length) + '/4): ' + mem.slice(0, 4).map(nameOf).join(', ') + (host ? ' · you are the host' : ' · waiting for the host to start');
        stStart.style.display = host ? '' : 'none';
      }
      stCell.forEach((c, i) => { c.style.outline = stRun && i === stMySlot() ? '3px solid #6dff8c' : 'none' });
    }, 400);
    function stCompose() {
      const pad = 16, W2 = STW * 2 + pad * 3, H2 = STH * 2 + pad * 3 + 70, c = document.createElement('canvas'); c.width = W2; c.height = H2;
      const x = c.getContext('2d'); x.fillStyle = '#f7f3ea'; x.fillRect(0, 0, W2, H2);
      for (let i = 0; i < 4; i++) { const tx = pad + (i % 2) * (STW + pad), ty = pad + Math.floor(i / 2) * (STH + pad); x.drawImage(stCv[i], tx, ty, STW, STH); if (stIds[i]) { x.fillStyle = 'rgba(0,0,0,.55)'; x.fillRect(tx, ty + STH - 30, 150, 30); x.fillStyle = '#fff'; x.font = '600 18px system-ui,sans-serif'; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText(nameOf(stIds[i]).slice(0, 14), tx + 10, ty + STH - 15) } }
      x.fillStyle = '#1d1a17'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.font = '600 24px Georgia, serif'; x.fillText('The Gallery · Paint Contest · ' + new Date().toLocaleDateString(), W2 / 2, H2 - 46);
      x.font = 'italic 18px Georgia, serif'; x.fillText(stIds.filter(Boolean).map(nameOf).join(', '), W2 / 2, H2 - 18, W2 - 40); return c;
    }
    function stFinish() {
      stRun = false; stDraw = false; stat('st'); sfxSuccess();
      const c = stCompose(), url = c.toDataURL('image/jpeg', .9), names = stIds.filter(Boolean).map(nameOf).join(' & ').slice(0, 60);
      stResOpen = true; stRes.innerHTML = '';
      const im = mke('img', 'max-width:92vw;max-height:60vh;border-radius:8px;box-shadow:0 10px 40px #000'); im.src = url;
      const ti = mke('input', 'width:min(420px,90vw);box-sizing:border-box;padding:10px;border-radius:10px;border:0;background:#2a2830;color:#fff;font:14px system-ui'); ti.value = 'Contest: ' + names; ti.maxLength = 60;
      ti.addEventListener('keydown', e => e.stopPropagation()); ti.addEventListener('keyup', e => e.stopPropagation());
      const msg = mke('div', 'font-size:12px;min-height:16px;opacity:.8', 'Time is up! Upload this 4-painting grid to the gallery?');
      const up = mkb('⬆ Upload to gallery', 'background:#2e9e5b;padding:10px 16px;font-size:14px', async () => {
        up.disabled = true; msg.textContent = 'Uploading…';
        try {
          const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', .9)), id = 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
          const rec2 = { title: ti.value.trim() || 'Paint Contest', artist: names || myName, w: c.width, h: c.height, createdAt: Date.now() };
          const u = await assets.upload(blob); rec2.assetId = u.id; rec2.url = u.url; await db.collection('paintings').doc(id).set(rec2); await loadPaintings(); stat('up');
          msg.textContent = 'Uploaded ✓ it will appear in the gallery.'; up.style.display = 'none';
        } catch (e) { console.error(e); msg.textContent = 'Upload failed, try again.'; up.disabled = false }
      });
      const sv = mke('a', 'text-decoration:none;border-radius:12px;padding:10px 16px;font:600 14px system-ui;color:#fff;background:#3a3740'); sv.textContent = '⬇ Save'; sv.href = url; sv.download = 'gallery-contest-' + Date.now() + '.jpg';
      const bt = mke('div', 'display:flex;gap:8px;flex-wrap:wrap;justify-content:center'); bt.append(up, sv, mkb('Discard', 'padding:10px 16px;font-size:14px', () => { stResOpen = false; stRes.style.display = 'none' }), mkb('Leave room', 'padding:10px 16px;font-size:14px', () => closeStudio()));
      stRes.append(im, ti, msg, bt); stRes.style.display = 'flex';
    }
    function hubStudio(b) {
      const n = lastPeers.filter(p => !p.sameTab && p.presence && p.presence.st === ST_ID && (p.presence.r || 0) === myRoom).length + (mySeat >= 0 ? 1 : 0);
      b.append(mke('div', 'margin-bottom:8px', 'The contest room is at the back of the right wing. Sit in one of the 4 seats to play. Each seated player gets one square of a 2x2 grid, the host starts a 2:00 round, and afterwards you choose whether to upload the finished grid.'),
        mke('div', 'font-size:12px;opacity:.7;margin-bottom:8px', n + ' / 4 seats taken'),
        mkb('📍 Take me there', 'background:#2e9e5b;padding:10px 16px;font-size:14px', () => { if (sitting) standUp(); px = 12.5; pz = 5.9; yaw = Math.PI; pitch = 0; sy = 0; lpx = null; setPresence(true); hubClose() }));
    }
    stat('vis');

    // ================= PAINT CONTEST ROOM (right wing, back): 4 seats, sit to play =================
    const SEATS = [[11.5, 7.2], [14.5, 7.2], [11.5, 9.2], [14.5, 9.2]].map(([x, z], i) => {
      const dx = 13 - x, dz = 8.2 - z;
      return { x, z, yaw: Math.atan2(-dx, -dz), ex: z < 8 ? x : (x < 13 ? 9.6 : 16.4), ez: z < 8 ? 5.8 : 9.2, c: [0xe63946, 0x3a86ff, 0xf1c40f, 0x2a9d8f][i] };
    });
    // walls with a 3 m door at x = 12.5
    wall(3.75, 9.125, 4.4, 0); wall(4, 16, 4.4, 0);
    {
      const hd = new THREE.Mesh(new THREE.BoxGeometry(3, H - 3.1, .5), wallM); hd.position.set(12.5, 3.1 + (H - 3.1) / 2, 4.4); scene.add(hd);
      const sg = new THREE.Mesh(new THREE.PlaneGeometry(3.4, .85), plate('PAINT CONTEST', 512, 128, 50)); sg.position.set(12.5, 4.3, 4.13); sg.rotation.y = Math.PI; scene.add(sg);
    }
    rug(13, 7.9, 7.8, 5.2, 0x2a2a33, 0xe3b53c);
    strip(13, 8, 7, .35, 6.0);
    // table
    {
      const tb = new THREE.Mesh(new THREE.BoxGeometry(1.8, .08, 1), deskMat); tb.position.set(13, .78, 8.2); scene.add(tb);
      const lg = new THREE.Mesh(new THREE.CylinderGeometry(.12, .2, .74, 12), darkMat); lg.position.set(13, .37, 8.2); scene.add(lg);
      solidWalls.push({ x1: 12.2, z1: 8.2, x2: 13.8, z2: 8.2, th: .55 });
    }
    // chairs, seat markers and drawing boards
    SEATS.forEach((s, i) => {
      const g = new THREE.Group(); g.position.set(s.x, 0, s.z); g.rotation.y = s.yaw;
      const col = new THREE.MeshLambertMaterial({ color: s.c });
      const st = new THREE.Mesh(new THREE.BoxGeometry(.55, .08, .55), col); st.position.y = .45;
      const bk = new THREE.Mesh(new THREE.BoxGeometry(.55, .55, .07), col); bk.position.set(0, .75, .25);
      g.add(st, bk);
      for (const [lx, lz] of [[-.22, -.22], [.22, -.22], [-.22, .22], [.22, .22]]) { const l = new THREE.Mesh(new THREE.BoxGeometry(.05, .45, .05), darkMat); l.position.set(lx, .22, lz); g.add(l) }
      scene.add(g);
      const rg = new THREE.Mesh(new THREE.RingGeometry(.42, .5, 28), new THREE.MeshBasicMaterial({ color: s.c, side: THREE.DoubleSide })); rg.rotation.x = -Math.PI / 2; rg.position.set(s.x, .04, s.z); scene.add(rg);
      const bd = new THREE.Mesh(new THREE.BoxGeometry(.6, .02, .45), new THREE.MeshLambertMaterial({ color: 0xffffff }));
      bd.position.set(13 + (s.x - 13) * .3, .83, 8.2 + (s.z - 8.2) * .3); bd.rotation.y = s.yaw; scene.add(bd);
    });
    // live seat board on the back wall
    const sbC = document.createElement('canvas'); sbC.width = 768; sbC.height = 192; const sbX = sbC.getContext('2d'), sbT = new THREE.CanvasTexture(sbC); sbT.encoding = THREE.sRGBEncoding;
    const sbM = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.5), new THREE.MeshBasicMaterial({ map: sbT })); sbM.position.set(13, 3.4, 10.95); sbM.rotation.y = Math.PI; scene.add(sbM);
    let sbKey = '';
    function paintBoard() {
      const sl = stSlots(), key = sl.map(v => v || '-').join() + stRun + myName; if (key === sbKey) return; sbKey = key;
      sbX.fillStyle = '#1d1a17'; sbX.fillRect(0, 0, 768, 192); sbX.strokeStyle = '#c9a45c'; sbX.lineWidth = 4; sbX.strokeRect(5, 5, 758, 182);
      sbX.textAlign = 'center'; sbX.textBaseline = 'middle'; sbX.fillStyle = '#c9a45c'; sbX.font = '600 34px Georgia, serif';
      sbX.fillText(stRun ? 'ROUND IN PROGRESS' : 'PAINT CONTEST · sit to play', 384, 36);
      sl.forEach((id, i) => {
        const x0 = 24 + i * 180; sbX.fillStyle = id ? '#' + SEATS[i].c.toString(16).padStart(6, '0') : '#3a3740'; sbX.fillRect(x0, 70, 164, 90);
        sbX.fillStyle = id ? '#111' : '#aaa'; sbX.font = '700 24px system-ui,sans-serif'; sbX.fillText(id ? nameOf(id).slice(0, 10) : 'Free', x0 + 82, 115);
      });
      sbT.needsUpdate = true;
    }
    // sit logic
    function seatTaken(i) { const v = stSlots()[i]; return !!v && v !== wsId }
    function nearSeat() { if (!started || mySeat >= 0) return -1; let b = -1, bd = 1.6; SEATS.forEach((s, i) => { const d = Math.hypot(px - s.x, pz - s.z); if (d < bd && !seatTaken(i)) { bd = d; b = i } }); return b }
    function sitSeat(i) {
      if (!wsId) { addChat('Gallery', 'Still connecting, try again in a moment.'); return }
      if (seatTaken(i)) return; if (sitting) standUp();
      const s = SEATS[i]; px = s.x; pz = s.z; yaw = s.yaw; pitch = 0; lpx = null; emote = 'sit'; sitting = true; mySeat = i; $('dn').className = 'g';
      seatBeat();
      openStudio();
    }
    const sitBtn = mkb(touch ? '🪑 Sit & paint' : '🪑 Sit & paint (E)', 'position:fixed;left:50%;bottom:90px;transform:translateX(-50%);z-index:22;display:none;padding:10px 16px;border-radius:20px;background:#e3a53c;color:#111;font-size:14px', () => { const i = nearSeat(); if (i >= 0) sitSeat(i) });
    document.body.append(sitBtn);
    setInterval(() => { sitBtn.style.display = started && !stOpen && !hubOn && nearSeat() >= 0 ? 'block' : 'none'; paintBoard() }, 300);

    // ---- loop
    let last = performance.now();
    (function loop(t) {
      requestAnimationFrame(loop); const dt = Math.min(.05, (t - last) / 1000); last = t;
      if (started) {
        step(dt); setPresence(false); look(); bowTick();
        { // scope zoom while the bow is drawn
          const bf = cam.aspect < 1 ? Math.min(100, 70 + (1 - cam.aspect) * 45) : 70;
          const tf = bowT ? bf - 16 * Math.min(1, (performance.now() - bowT) / 900) : bf;
          if (Math.abs(cam.fov - tf) > .05) { cam.fov += (tf - cam.fov) * Math.min(1, dt * 10); cam.updateProjectionMatrix() }
        }
        if (shake > 0 && !photoOn) {
          cam.rotation.z = Math.sin(performance.now() / 25) * shake * .06 + shake * .1;   // tilt + rattle
          cam.position.y += (Math.random() - .5) * shake * .06;
          shake = Math.max(0, shake - dt * 3.5);
        }
      } else { cam.position.set(0, EYE, 6); cam.rotation.set(0, Math.sin(t / 4000) * .5, 0) }
      for (const m of spinners) m.rotation.y += dt * .5;
      elevTick(dt); stairTick(); guideTick(); smoothAvatars(dt); receptionTick(dt); monTick(dt); ledTick(dt); escTick(dt); tvTick(dt); tickFloaters(); arrowTick(dt); voiceTick(); boothTick(dt); renderer.render(scene, boothView ? boothCam : cam)
    })(last);

  })();

}
