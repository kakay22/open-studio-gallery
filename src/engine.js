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
    let myWave = 0, emote = null, sitting = false; const EMO = ['👍', '❤️', '😂', '👏', '😮']; const HUc = [0, 25, 50, 120, 175, 215, 265, 320]; let myLook = { sk: 0, hr: 0, hu: HUc[Math.floor(Math.random() * HUc.length)] }; try { Object.assign(myLook, JSON.parse(localStorage.getItem('glook') || '{}')) } catch (e) { }
    const SKc = ['#f1c9a5', '#d9a37c', '#b67b55', '#8a5a3c', '#5e3b27'], HRc = ['#2a1d15', '#5a3a22', '#b98a4e', '#1a1a1a', '#8b3a2b', '#9aa0a6'];
    function sw(id, arr, key, hue) { const el = $(id); arr.forEach((c, i) => { const b = document.createElement('i'), val = hue ? c : i; b.style.background = hue ? `hsl(${c},55%,48%)` : c; if (myLook[key] === val) b.className = 'on'; b.onclick = () => { myLook[key] = val;[...el.children].forEach(x => x.className = ''); b.className = 'on' }; el.append(b) }) }
    sw('skin', SKc, 'sk'); sw('hair', HRc, 'hr'); sw('hue', HUc, 'hu', true);
    function wave() { myWave++; setPresence(true) } $('wv').onclick = wave;
    const floaters = [];
    function floatDom(e) { const d = document.createElement('div'); d.className = 'fl'; d.textContent = e; d.style.left = (40 + Math.random() * 20) + '%'; document.body.append(d); setTimeout(() => d.remove(), 2200) }
    function spawnFloat(grp, e) { const c = document.createElement('canvas'); c.width = c.height = 96; const x = c.getContext('2d'); x.font = '64px serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(e, 48, 52); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true })); sp.scale.set(.6, .6, 1); sp.position.y = 2.45; grp.add(sp); floaters.push({ sp, grp, t: performance.now() }) }
    function tickFloaters() { const n = performance.now(); for (let i = floaters.length - 1; i >= 0; i--) { const f = floaters[i], a = (n - f.t) / 2400; if (a >= 1) { f.grp.remove(f.sp); f.sp.material.map.dispose(); f.sp.material.dispose(); floaters.splice(i, 1); continue } f.sp.position.y = 2.45 + a * .9; f.sp.material.opacity = a < .7 ? 1 : (1 - a) / .3 } }
    function react(e) { floatDom(e); if (room) room.emit('react', { e }).catch(() => { }) }
    EMO.forEach(e => { const b = document.createElement('button'); b.className = 'g e'; b.textContent = e; b.onclick = () => react(e); $('emo').append(b) });
    function standUp() { sitting = false; if (emote === 'sit') emote = null; pz = Math.min(pz + 1.4, D / 2 - 1); setPresence(true) }
    function toggleDance() { if (sitting) standUp(); emote = emote === 'dance' ? null : 'dance'; $('dn').className = emote ? '' : 'g'; setPresence(true) }
    function trySit() { }
    $('dn').onclick = toggleDance;
    $('look').onclick = () => { document.exitPointerLock?.(); $('start').style.display = 'flex'; $('go').textContent = 'Save look'; const p = document.querySelector('#start p'); if (p) p.style.display = 'none' };

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
    const leds = [], ledCache = new Map(); let ledIdx = 0; const LEDK = LOW ? 9 : 14;
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
        const depth = .15 + k * .025;

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
          new THREE.BoxGeometry(1, 1, .018),
          new THREE.MeshBasicMaterial({
            color: 0xffffff,
            toneMapped: false
          })
        );

        // Actual photograph
        const im = new THREE.Mesh(
          new THREE.PlaneGeometry(1, 1),
          new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: false,
            depthWrite: false,
            toneMapped: false
          })
        );

        shadow.position.z = depth;
        backing.position.z = depth + .006;
        im.position.z = depth + .018;

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

        it.x = it.startX;
        it.y = it.startY;

        it.elapsed = 0;
        it.duration = .85 + Math.random() * .3;

        it.im.rotation.z = it.startRotation;
        it.backing.rotation.z = it.startRotation;
        it.shadow.rotation.z = it.startRotation;

        it.active = true;
        it.has = true;
        it.settled = false;
        it.order = Date.now() + Math.random();

        // Position all three layers together
        for (const mesh of [it.shadow, it.backing, it.im]) {
          mesh.position.x = it.x;
          mesh.position.y = it.y;
          mesh.visible = true;
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
    addEventListener('keydown', e => { if (!started || document.activeElement.tagName === 'INPUT') return; keys[e.code] = true; if (e.code === 'KeyX') removeMine(); if (e.code === 'KeyF') wave(); if (e.code === 'KeyG') toggleDance(); if (e.code === 'KeyE') trySit(); if (e.code === 'KeyM') toggleMic() });
    addEventListener('keydown', e => { if (started && e.key === 'Enter' && document.activeElement.tagName !== 'INPUT' && $('panel').style.display !== 'flex') { e.preventDefault(); document.exitPointerLock?.(); $('cin').focus() } });
    addEventListener('keyup', e => keys[e.code] = false);
    const cvs = renderer.domElement;
    $('go').onclick = () => {
      if (touch) stick.style.display = 'block';
      myName = ($('nm').value.trim() || 'Guest ' + myId.slice(-3)); try { localStorage.setItem('gname', myName); localStorage.setItem('ggen', myGen); localStorage.setItem('glook', JSON.stringify(myLook)) } catch (e) { }
      $('start').style.display = 'none'; started = true; $('chat').style.display = 'block'; $('emo').style.display = 'flex'; if (touch) $('cross').style.display = 'block'; try { ctxA() } catch (e) { } setPresence(true); if (!touch) cvs.requestPointerLock?.()
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
      const sp = 3.6 * dt / Math.max(1, len);

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
    function drawLabel(s, st) {   // st: 0 = no mic, 1 = mic on, 2 = speaking
      const u = s.userData; if (u.st === st) return; u.st = st;
      const x = u.c.getContext('2d'); x.clearRect(0, 0, 320, 64);
      x.font = '600 30px system-ui,sans-serif'; x.textAlign = 'left'; x.textBaseline = 'middle';
      const tw = Math.min(238, x.measureText(u.text).width), w = tw + 24 + (st ? 38 : 0), l = 160 - w / 2;
      x.fillStyle = st === 2 ? 'rgba(24,120,64,.95)' : 'rgba(20,20,22,.75)'; x.fillRect(l, 8, w, 48);
      if (st === 2) { x.strokeStyle = '#6dff8c'; x.lineWidth = 3; x.strokeRect(l, 8, w, 48) }
      x.fillStyle = '#fff'; x.fillText(u.text, l + 12, 33, 238);
      if (st) {
        const mx = l + 12 + tw + 21, col = st === 2 ? '#b6ffc9' : '#c9c5bb';
        x.fillStyle = x.strokeStyle = col; x.lineWidth = 3; x.lineCap = 'round';
        x.beginPath(); x.roundRect(mx - 5, 15, 10, 20, 5); x.fill();
        x.beginPath(); x.arc(mx, 26, 10, 0, Math.PI); x.stroke();
        x.beginPath(); x.moveTo(mx, 36); x.lineTo(mx, 43); x.stroke();
      }
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
    const SKIN = [0xf1c9a5, 0xd9a37c, 0xb67b55, 0x8a5a3c, 0x5e3b27], HAIR = [0x2a1d15, 0x5a3a22, 0xb98a4e, 0x1a1a1a, 0x8b3a2b, 0x9aa0a6];
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
    function makeAvatar(name, hue, gen, sd, look) {
      const g = new THREE.Group(), P = {}, f = gen === 'f', m = gen === 'm';
      const skin = MT(SKIN[ok(look && look.sk, 5) ? look.sk : sd % 5], .75), hair = MT(HAIR[ok(look && look.hr, 6) ? look.hr : (sd >>> 4) % 5], .6);
      const shirt = MT(new THREE.Color(`hsl(${hue},55%,52%)`), .9), collar = MT(new THREE.Color(`hsl(${hue},55%,38%)`), .9);
      const shorts = MT(new THREE.Color(`hsl(${(hue + 180) % 360},20%,28%)`), .9), shoe = MT(0xf4f1ea, .55), sole = MT(new THREE.Color(`hsl(${hue},40%,40%)`), .7);
      const eyeW = MT(0xffffff, .25), iris = MT(0x3a2a1c, .3), pupil = MT(0x0c0c0c, .3), lip = MT(0x8a4a42, .6), cheek = MT(0xff9a8a, 1);
      const w = f ? .9 : m ? 1.1 : 1, kw = f ? .88 : m ? 1 : .94, kc = f ? .98 : 1.04, h = f ? .96 : m ? .92 : .94;
      const armX = .168 * kc * w + .045;

      // pelvis + shorts
      const body = new THREE.Group(); g.add(body); P.body = body;
      body.add(mk(prof('pelv', [[0, .74], [.1, .745], [.16, .775], [.176, .83], [.178, .88], [.17, .93]], 20, 24), shorts, 0, 0, 0, h, 1, .82));

      // torso: one smooth shirt shape (hips, waist, chest, shoulders)
      const torso = new THREE.Group(); torso.position.y = 1.12; body.add(torso); P.torso = torso;
      torso.add(mk(prof('shirt' + gen, [[.21, -.24], [.203, -.2], [.18, -.13], [.152 * kw, -.05], [.155 * kw, 0], [.17 * kc, .07], [.18 * kc, .13], [.185 * kc, .19], [.17 * kc, .245], [.12, .28], [.075, .298], [.06, .3]], 24, 40), shirt, 0, 0, 0, w, 1, .74));
      const col = mk(geoOf('col2', () => new THREE.TorusGeometry(.068, .013, 8, 20)), collar, 0, .296, 0, 1, 1, .9); col.rotation.x = Math.PI / 2; torso.add(col);
      if (f) for (const s of [-1, 1]) torso.add(mk(sphG(.055, 12, 10), shirt, s * .06, .08, -.115, 1, .9, .6));   // subtle bust shaping
      torso.add(mk(geoOf('neck2', () => new THREE.CylinderGeometry(.047, .053, .14, 14)), skin, 0, .345, 0));

      // head
      const head = new THREE.Group(); head.position.y = .56; torso.add(head); P.head = head;
      head.add(mk(prof('head', [[0, -.205], [.07, -.198], [.12, -.17], [.158, -.11], [.175, -.03], [.18, .05], [.168, .12], [.135, .18], [.08, .213], [0, .225]], 28, 40), skin, 0, 0, 0, .92, 1, .96));
      head.add(mk(sphG(.028, 12, 10), skin, 0, -.028, -.165, .8, 1, .7));                       // nose
      for (const s of [-1, 1]) {
        head.add(mk(sphG(.034, 14, 10), eyeW, s * .07, .02, -.148, 1, .85, .5));               // eye white
        head.add(mk(sphG(.021, 12, 8), iris, s * .07, .02, -.158, 1, 1, .35));                 // iris
        head.add(mk(sphG(.011, 8, 6), pupil, s * .07, .02, -.1625, 1, 1, .5));                 // pupil
        head.add(mk(sphG(.007, 6, 5), HLM, s * .07 + .008, .029, -.166));                      // highlight
        const brow = mk(capG(.007, .04), hair, s * .07, .066, -.148); brow.rotation.z = Math.PI / 2 + s * .12; head.add(brow);
        head.add(mk(sphG(.03, 8, 6), cheek, s * .1, -.04, -.125, 1, .7, .3));                  // soft cheeks
        head.add(mk(sphG(.032, 10, 8), skin, s * .168, 0, .005, .45, 1, .65));                 // ears
      }
      const mouth = mk(geoOf('mouth2', () => new THREE.TorusGeometry(.03, .006, 5, 14, Math.PI)), lip, 0, -.062, -.158); mouth.rotation.z = Math.PI; head.add(mouth);   // smile
      head.add(mk(geoOf('hairTop', () => new THREE.LatheGeometry(new THREE.SplineCurve([[.2, .082], [.192, .12], [.17, .15], [.152, .18], [.092, .216], [0, .232]].map(p => new THREE.Vector2(p[0], p[1]))).getPoints(30).map(v => new THREE.Vector2(Math.max(0, v.x), v.y)), 28)), hair, 0, 0, 0, .92, 1, .96));   // full cap, hairline above the brows
      head.add(mk(geoOf('hairNape', () => new THREE.LatheGeometry(new THREE.SplineCurve([[.14, -.1], [.19, -.03], [.2, .05], [.196, .1]].map(p => new THREE.Vector2(p[0], p[1]))).getPoints(24).map(v => new THREE.Vector2(Math.max(0, v.x), v.y)), 20, -1.25, 2.5)), hair, 0, 0, 0, .92, 1, .96));   // back and sides down to the nape, leaves the ears and face clear
      if (f) {
        head.add(mk(sphG(.15, 14, 12), hair, 0, -.12, .09, 1, 1.7, .75));                      // long hair at the back
        for (const s of [-1, 1]) head.add(mk(sphG(.1, 10, 8), hair, s * .15, -.07, .03, .35, 1.2, .6));   // side locks
      }

      // arms: smooth taper, t-shirt sleeve, mitten hand
      const arm = s => {
        const a = limb(.3, .05, .042, 0, skin); a.position.set(s * armX, .225, 0);
        a.add(mk(sphG(.06, 12, 10), shirt, 0, -.01, 0));                                       // shoulder cap
        a.add(mk(openG(.13, .062, .057), shirt));                                              // sleeve
        const fo = limb(.28, .042, .033, .004, skin); fo.position.y = -.3; a.add(fo);
        const hd = new THREE.Group(); hd.position.y = -.28; fo.add(hd);
        hd.add(mk(sphG(.05, 12, 10), skin, 0, -.05, 0, .85, 1.2, .55));                        // palm
        const th = mk(sphG(.022, 8, 6), skin, -s * .045, -.035, -.01, .7, 1.5, .7); th.rotation.z = -s * .5; hd.add(th);   // thumb
        torso.add(a); return [a, fo, hd];
      };
      [P.lArm, P.lFore, P.lHand] = arm(-1);[P.rArm, P.rFore, P.rHand] = arm(1);

      // legs: tapered thigh and calf, shorts hem, sneaker
      const leg = s => {
        const l = limb(.42, .086, .058, .006, skin); l.position.set(s * .115, .82, 0);
        l.add(mk(openG(.26, .103, .108), shorts));                                             // shorts leg
        const sh = limb(.4, .058, .04, .007, skin); sh.position.y = -.42; l.add(sh);
        sh.add(mk(sphG(.06, 14, 10), shoe, 0, -.372, -.05, .88, .65, 1.9));                    // sneaker
        sh.add(mk(geoOf('sole2', () => new THREE.BoxGeometry(.12, .026, .26)), sole, 0, -.4, -.05));
        g.add(l); return [l, sh];
      };
      [P.lLeg, P.lShin] = leg(-1);[P.rLeg, P.rShin] = leg(1);

      const lb = label(name); lb.position.y = 2.1; g.add(lb); g.userData.pr = P; g.userData.lb = lb; scene.add(g); g.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true }); return g
    }
    function makeAvatarOld(name, hue) {
      const g = new THREE.Group(), col = new THREE.Color(`hsl(${hue},60%,50%)`);
      const b = new THREE.Mesh(new THREE.CylinderGeometry(.28, .34, 1.1, 16), new THREE.MeshStandardMaterial({ color: col })); b.position.y = .65;
      const h = new THREE.Mesh(new THREE.SphereGeometry(.22, 16, 12), new THREE.MeshStandardMaterial({ color: 0xf0d9c0 })); h.position.y = 1.5;
      const n = new THREE.Mesh(new THREE.BoxGeometry(.1, .1, .14), new THREE.MeshStandardMaterial({ color: 0x222222 })); n.position.set(0, 1.5, -.22);
      g.add(b, h, n, label(name)); scene.add(g); return g
    }
    const hueOf = s => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360; return h };

    const rec = { g: makeAvatar('Mira', 330, 'f', 11, { sk: 1, hr: 1, hu: 330 }), k: 0, ph: 0, tp: 0, em: 'sit', wt: 0, greeted: false };
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
        const gn = ['m', 'f'].includes(d.g) ? d.g : 'n'; const sig = [gn, d.sk, d.hr, d.hu].join(); if (!a || a.name !== nm || a.sig !== sig) { if (a) scene.remove(a.g); const hu = (d.hu != null && Number.isFinite(+d.hu)) ? ((+d.hu % 360) + 360) % 360 : hueOf(p.peer); a = { g: makeAvatar(nm, hu, gn, seedOf(p.peer), d), name: nm, sig, ph: 0, k: 0, wv: d.w || 0, wt: 0, tx: d.x, tz: d.z, try: d.ry || 0, buf: [] }; a.g.position.set(d.x, 0, d.z); avatars.set(p.peer, a) }
        a.tx = d.x; a.tz = d.z; a.try = d.ry || 0;
        const ls = a.buf[a.buf.length - 1];
        if (!ls || ls.x !== d.x || ls.z !== d.z || ls.y !== (d.y || 0) || ls.r !== a.try) {
          if (ls && Math.hypot(d.x - ls.x, d.z - ls.z) > 4) a.buf.length = 0;   // teleport or elevator: jump, don't slide
          a.buf.push({ t: performance.now(), x: d.x, z: d.z, y: d.y || 0, r: a.try }); if (a.buf.length > 8) a.buf.shift();
        }
        a.mic = !!d.mic; setSpeaking(a, !!a.spk && a.mic);
        const headPitch = Number(d.pit ?? d.rp ?? 0);
        a.tp = THREE.MathUtils.clamp(headPitch * 1.5, -1.2, 1.2); a.em = d.em === 'dance' || d.em === 'sit' ? d.em : null; if ((d.w || 0) !== a.wv) { a.wv = d.w || 0; a.wt = performance.now() }
      }
      for (const [k, a] of avatars) if (!seen.has(k)) { scene.remove(a.g); avatars.delete(k) }
      syncRtc();
      $('count').textContent = tot ? (LOW ? `${n + 1} here` : `${n + 1} here · ${tot + 1} online`) : 'Just you';
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

        P.head.rotation.x = THREE.MathUtils.damp(
          P.head.rotation.x,
          targetPitch,
          12,
          dt
        );
      }

      P.lLeg.rotation.x = s * .7 * k;
      P.rLeg.rotation.x = -s * .7 * k;

      P.lShin.rotation.x = -Math.max(0, Math.sin(a.ph + 1.3)) * .9 * k;
      P.rShin.rotation.x = -Math.max(0, Math.sin(a.ph + 1.3 + Math.PI)) * .9 * k;

      P.lArm.rotation.x = -s * .6 * k + Math.sin(t * 1.5) * .03 * idle;
      P.rArm.rotation.x = s * .6 * k - Math.sin(t * 1.5) * .03 * idle;

      P.lFore.rotation.x = .2 + .35 * k * Math.max(0, s);
      P.rFore.rotation.x = .2 + .35 * k * Math.max(0, -s);
      P.rFore.rotation.z = 0;
      P.rHand.rotation.set(0, 0, 0);

      P.body.position.y = Math.abs(Math.cos(a.ph)) * .035 * k + Math.sin(t * 1.8) * .006 * idle;
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
      room.presence({ x: +px.toFixed(2), z: +pz.toFixed(2), y: +sy.toFixed(2), ry: +yaw.toFixed(2), pit: +pitch.toFixed(2), rp: +pitch.toFixed(2), r: myRoom, g: myGen, sk: myLook.sk, hr: myLook.hr, hu: myLook.hu, w: myWave, em: emote, mic: micOn, eq: evSeq, et: evTo, name: myName }).catch(() => { });
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
              owner: myId,
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
        }

      } finally {
        $('save').disabled = false;
      }
    };


    // ---- network (own Node server)
    const API = (import.meta.env.VITE_API || '').replace(/\/$/, '');
    const assetUrl = u => {
      if (!u) return u;
      try {
        const x = new URL(u, location.href);
        if (x.hostname !== location.hostname && /^(localhost|127\.|10\.|192\.168\.)/.test(x.hostname)) return API + x.pathname + x.search;
      } catch (e) { }
      return u.startsWith('http') ? u : API + u;
    };
    const wsUrl = import.meta.env.VITE_WS || ((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws');
    let ws = null, wsId = null, lastState = {}, peersCb = null, snapCb = null; const handlers = { chat: [], react: [], rtc: [] };
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
          set: async rec => { const r = await fetch(API + '/api/paintings/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rec) }); if (!r.ok) throw new Error('Save failed (' + r.status + ')') },
          delete: async () => { await fetch(API + '/api/paintings/' + id + '?owner=' + encodeURIComponent(myId), { method: 'DELETE' }) }
        })
      })
    };
    const assetsS = {
      upload: async blob => {
        const r = await fetch(API + '/api/assets', {
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
    room = roomS; db = dbS; assets = assetsS; local = false;
    db.collection('paintings').onSnapshot(s => { paintings = s.docs.map(x => ({ id: x.id, ...x.data() })); layout() });
    room.onPeers(applyPeers);
    room.on('chat', m => {
      if (m.sameTab) return;

      const d = m.data || {};
      const name = String(d.name || 'Guest').slice(0, 18);
      const message = String(d.text || '').slice(0, 200);

      addChat(name, message);

      const a = avatars.get(m.peer);

      if (a && message) {
        if (a.bubble) {
          a.g.remove(a.bubble);
          a.bubble.material.map?.dispose();
          a.bubble.material.dispose();
        }

        a.bubble = chatBubble(message);
        a.g.add(a.bubble);

        clearTimeout(a.bubbleTimer);

        a.bubbleTimer = setTimeout(() => {
          if (a.bubble) {
            a.g.remove(a.bubble);
            a.bubble.material.map?.dispose();
            a.bubble.material.dispose();
            a.bubble = null;
          }
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
      }
      const gl = micOn && level(localAn) > .06; if (gl !== lastGl) { lastGl = gl; $('mic').style.boxShadow = gl ? '0 0 0 3px #6dff8c' : '' }
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

    // ---- loop
    let last = performance.now();
    (function loop(t) {
      requestAnimationFrame(loop); const dt = Math.min(.05, (t - last) / 1000); last = t;
      if (started) { step(dt); setPresence(false); look() } else { cam.position.set(0, EYE, 6); cam.rotation.set(0, Math.sin(t / 4000) * .5, 0) }
      for (const m of spinners) m.rotation.y += dt * .5;
      elevTick(dt); stairTick(); guideTick(); smoothAvatars(dt); receptionTick(dt); monTick(dt); ledTick(dt); escTick(dt); tvTick(dt); tickFloaters(); voiceTick(); renderer.render(scene, cam)
    })(last);

  })();

}
